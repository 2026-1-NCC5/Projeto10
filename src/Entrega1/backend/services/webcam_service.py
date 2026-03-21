import queue
import time
import threading

import cv2

from config import CAMERA_INDEX, CATEGORIES, CONFIDENCE_THRESHOLD
from ml.inference import detect_frame

REQUIRED_STABLE_FRAMES = 10
COOLDOWN_SECONDS = 3.0


class WebcamService:
    def __init__(
        self,
        model,
        stop_event: threading.Event,
        result_queue: queue.Queue,
    ):
        self.model = model
        self.stop_event = stop_event
        self.result_queue = result_queue

        self.counts = {cat: 0 for cat in CATEGORIES}
        self.counts["total"] = 0
        self.detections: list[dict] = []

        self._stable_label = None
        self._stable_count = 0
        self._last_saved_label = None
        self._last_saved_time = 0.0

    def run(self):
        """Blocking capture loop — meant to be called inside a threading.Thread."""
        cap = cv2.VideoCapture(CAMERA_INDEX)

        if not cap.isOpened():
            self.result_queue.put({
                "type": "stopped",
                "results": {
                    "counts": dict(self.counts),
                    "detections": list(self.detections),
                    "error": "Webcam nao disponivel",
                },
            })
            return

        try:
            while not self.stop_event.is_set():
                ret, frame = cap.read()
                if not ret:
                    break

                raw_detections = detect_frame(frame, self.model, CONFIDENCE_THRESHOLD)

                current_label = None
                current_conf = 0.0
                newly_counted = []

                if raw_detections:
                    best = max(raw_detections, key=lambda d: d["confidence"])
                    current_label = best["label"]
                    current_conf = best["confidence"]

                    if self._stable_label == current_label:
                        self._stable_count += 1
                    else:
                        self._stable_label = current_label
                        self._stable_count = 1

                    if self._stable_count >= REQUIRED_STABLE_FRAMES:
                        now = time.time()
                        if (
                            current_label != self._last_saved_label
                            or (now - self._last_saved_time) > COOLDOWN_SECONDS
                        ):
                            cat = current_label if current_label in self.counts else "outros"
                            self.counts[cat] += 1
                            self.counts["total"] += 1
                            self._last_saved_label = current_label
                            self._last_saved_time = now
                            self._stable_count = 0

                            record = {
                                "label": current_label,
                                "confidence": current_conf,
                                "timestamp": now,
                            }
                            self.detections.append(record)
                            newly_counted.append(record)
                else:
                    self._stable_label = None
                    self._stable_count = 0

                self.result_queue.put({
                    "type": "update",
                    "detections": [
                        {
                            "label": d["label"],
                            "confidence": d["confidence"],
                            "bbox": d["bbox"],
                        }
                        for d in raw_detections
                    ],
                    "counts": dict(self.counts),
                    "newly_counted": newly_counted,
                    "current_detection": current_label,
                    "current_confidence": current_conf,
                    "stable_frames": self._stable_count,
                })
        finally:
            cap.release()
            self.result_queue.put({
                "type": "stopped",
                "results": {
                    "counts": dict(self.counts),
                    "detections": list(self.detections),
                },
            })
