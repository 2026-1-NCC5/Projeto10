import queue
import time
import threading

import cv2
import numpy as np

from config import CAMERA_INDEX, CATEGORIES, CLASS_TO_CATEGORY, CONFIDENCE_THRESHOLD, SUB_ITEM_DEFAULT
from ml.inference import detect_frame

REQUIRED_STABLE_FRAMES = 10
COOLDOWN_SECONDS = 3.0

_COLORS = {
    "arroz": (0, 255, 0),
    "feijao": (0, 165, 255),
    "outros": (255, 0, 0),
}
_DEFAULT_COLOR = (200, 200, 200)


def _annotate_frame(frame, raw_detections, counts, sub_item_counts, stable_label, stable_count):
    annotated = frame.copy()
    h, w = annotated.shape[:2]

    for d in raw_detections:
        label = d["label"]
        sub_item = d.get("sub_item", "")
        conf = d["confidence"]
        x1, y1, x2, y2 = [int(v) for v in d["bbox"]]
        color = _COLORS.get(label, _DEFAULT_COLOR)

        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

        if sub_item and sub_item != label:
            text = f"{label} ({sub_item}) {conf:.0%}"
        else:
            text = f"{label} {conf:.0%}"
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(annotated, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
        cv2.putText(annotated, text, (x1 + 2, y1 - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    y_offset = 30
    cv2.putText(annotated, f"Total: {counts.get('total', 0)}", (10, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    for cat in CATEGORIES:
        y_offset += 28
        color = _COLORS.get(cat, _DEFAULT_COLOR)
        cat_text = f"{cat}: {counts.get(cat, 0)}"
        if cat == "outros" and sub_item_counts:
            details = ", ".join(f"{k}:{v}" for k, v in sub_item_counts.items())
            cat_text += f" [{details}]"
        cv2.putText(annotated, cat_text, (10, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    if stable_label and stable_count > 0:
        progress = min(stable_count / REQUIRED_STABLE_FRAMES, 1.0)
        bar_w = int(200 * progress)
        bar_y = h - 40
        cv2.rectangle(annotated, (10, bar_y), (210, bar_y + 20), (50, 50, 50), -1)
        bar_color = (0, 255, 0) if progress >= 1.0 else (0, 200, 255)
        cv2.rectangle(annotated, (10, bar_y), (10 + bar_w, bar_y + 20), bar_color, -1)
        cv2.putText(annotated, f"{stable_label} {stable_count}/{REQUIRED_STABLE_FRAMES}",
                    (10, bar_y - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    return annotated


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
        self.sub_item_counts: dict[str, int] = {}
        self.detections: list[dict] = []

        self._stable_raw_label = None
        self._stable_count = 0
        self._last_saved_raw_label = None
        self._last_saved_time = 0.0

        self._frame_lock = threading.Lock()
        self._latest_frame: bytes | None = None

    def get_jpeg_frame(self) -> bytes | None:
        with self._frame_lock:
            return self._latest_frame

    def run(self):
        cap = cv2.VideoCapture(CAMERA_INDEX)

        if not cap.isOpened():
            self.result_queue.put({
                "type": "stopped",
                "results": {
                    "counts": dict(self.counts),
                    "sub_items": dict(self.sub_item_counts),
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
                current_sub_item = None
                current_raw_label = None
                current_conf = 0.0
                newly_counted = []

                if raw_detections:
                    best = max(raw_detections, key=lambda d: d["confidence"])
                    current_label = best["label"]
                    current_sub_item = best.get("sub_item", SUB_ITEM_DEFAULT)
                    current_raw_label = best.get("raw_label", current_label)
                    current_conf = best["confidence"]

                    if self._stable_raw_label == current_raw_label:
                        self._stable_count += 1
                    else:
                        self._stable_raw_label = current_raw_label
                        self._stable_count = 1

                    if self._stable_count >= REQUIRED_STABLE_FRAMES:
                        now = time.time()
                        if (
                            current_raw_label != self._last_saved_raw_label
                            or (now - self._last_saved_time) > COOLDOWN_SECONDS
                        ):
                            cat = current_label if current_label in self.counts else "outros"
                            self.counts[cat] += 1
                            self.counts["total"] += 1

                            if current_sub_item and current_sub_item != cat:
                                self.sub_item_counts[current_sub_item] = (
                                    self.sub_item_counts.get(current_sub_item, 0) + 1
                                )

                            self._last_saved_raw_label = current_raw_label
                            self._last_saved_time = now
                            self._stable_count = 0

                            record = {
                                "label": current_label,
                                "sub_item": current_sub_item,
                                "confidence": current_conf,
                                "timestamp": now,
                            }
                            self.detections.append(record)
                            newly_counted.append(record)
                else:
                    self._stable_raw_label = None
                    self._stable_count = 0

                annotated = _annotate_frame(
                    frame, raw_detections, self.counts, self.sub_item_counts,
                    self._stable_raw_label, self._stable_count,
                )
                _, jpeg_buf = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 80])
                with self._frame_lock:
                    self._latest_frame = jpeg_buf.tobytes()

                self.result_queue.put({
                    "type": "update",
                    "detections": [
                        {
                            "label": d["label"],
                            "sub_item": d.get("sub_item", SUB_ITEM_DEFAULT),
                            "confidence": d["confidence"],
                            "bbox": d["bbox"],
                        }
                        for d in raw_detections
                    ],
                    "counts": dict(self.counts),
                    "sub_items": dict(self.sub_item_counts),
                    "newly_counted": newly_counted,
                    "current_detection": current_label,
                    "current_sub_item": current_sub_item,
                    "current_confidence": current_conf,
                    "stable_frames": self._stable_count,
                })
        finally:
            cap.release()
            with self._frame_lock:
                self._latest_frame = None
            self.result_queue.put({
                "type": "stopped",
                "results": {
                    "counts": dict(self.counts),
                    "sub_items": dict(self.sub_item_counts),
                    "detections": list(self.detections),
                },
            })
