import queue
import time
import threading

import cv2

from config import CATEGORIES, CONFIDENCE_THRESHOLD, COOLDOWN_SECONDS
from ml.inference import classify_frame
from ml.preprocessing import detect_object_present


class WebcamService:
    def __init__(
        self,
        model,
        device,
        stop_event: threading.Event,
        result_queue: queue.Queue,
        cooldown: float = COOLDOWN_SECONDS,
        confidence_threshold: float = CONFIDENCE_THRESHOLD,
    ):
        self.model = model
        self.device = device
        self.stop_event = stop_event
        self.result_queue = result_queue
        self.cooldown = cooldown
        self.confidence_threshold = confidence_threshold

        self.counts = {cat: 0 for cat in CATEGORIES}
        self.counts["total"] = 0
        self.detections: list[dict] = []
        self.current_label: str | None = None
        self.current_confidence: float | None = None

    def run(self):
        """Blocking capture loop — meant to be called inside a threading.Thread."""
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            self.result_queue.put({
                "type": "stopped",
                "results": {
                    "counts": self.counts,
                    "detections": self.detections,
                    "error": "Webcam não disponível (cv2.VideoCapture(0) falhou)",
                },
            })
            return

        object_was_present = False
        last_count_time = 0.0

        try:
            while not self.stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    break

                obj_present, _ = detect_object_present(frame)

                if obj_present:
                    label, confidence, _ = classify_frame(frame, self.model)
                    now = time.time()
                    is_new = (not object_was_present) or (now - last_count_time > self.cooldown)

                    if is_new and confidence >= self.confidence_threshold:
                        self.counts[label] += 1
                        self.counts["total"] += 1
                        last_count_time = now
                        record = {"label": label, "confidence": confidence, "timestamp": now}
                        self.detections.append(record)

                    object_was_present = True
                    self.current_label = label
                    self.current_confidence = confidence

                    self.result_queue.put({
                        "type": "update",
                        "label": label,
                        "confidence": confidence,
                        "counts": dict(self.counts),
                    })
                else:
                    object_was_present = False
                    self.current_label = None
                    self.current_confidence = None
        finally:
            cap.release()
            self.result_queue.put({
                "type": "stopped",
                "results": {
                    "counts": dict(self.counts),
                    "detections": list(self.detections),
                },
            })
