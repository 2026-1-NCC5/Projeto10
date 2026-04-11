import time
import threading
from typing import Callable, Optional
from uuid import UUID

import cv2

from config import (
    CAMERA_INDEX,
    CATEGORIES,
    CLASS_TO_CATEGORY,
    CONFIDENCE_THRESHOLD,
    SUB_ITEM_DEFAULT,
    CATEGORY_WEIGHTS_G,
)
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


def run_capture_loop(
    model,
    team_id: UUID,
    operator_name: Optional[str],
    on_detection: Callable[[dict, bytes], None],
    stop_event: threading.Event,
    camera_index: Optional[int] = None,
):
    index = camera_index if camera_index is not None else CAMERA_INDEX
    cap = cv2.VideoCapture(index)

    if not cap.isOpened():
        print(f"[ERRO] Nao foi possivel abrir a camera (index={index})")
        return

    counts = {cat: 0 for cat in CATEGORIES}
    counts["total"] = 0
    sub_item_counts: dict[str, int] = {}

    stable_raw_label = None
    stable_count = 0
    last_saved_raw_label = None
    last_saved_time = 0.0

    print("[INFO] Camera iniciada. Pressione Ctrl+C para encerrar.\n")

    try:
        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                break

            raw_detections = detect_frame(frame, model, CONFIDENCE_THRESHOLD)

            current_label = None
            current_sub_item = None
            current_raw_label = None
            current_conf = 0.0

            if raw_detections:
                best = max(raw_detections, key=lambda d: d["confidence"])
                current_label = best["label"]
                current_sub_item = best.get("sub_item", SUB_ITEM_DEFAULT)
                current_raw_label = best.get("raw_label", current_label)
                current_conf = best["confidence"]

                if stable_raw_label == current_raw_label:
                    stable_count += 1
                else:
                    stable_raw_label = current_raw_label
                    stable_count = 1

                if stable_count >= REQUIRED_STABLE_FRAMES:
                    now = time.time()
                    if (
                        current_raw_label != last_saved_raw_label
                        or (now - last_saved_time) > COOLDOWN_SECONDS
                    ):
                        cat = current_label if current_label in counts else "outros"
                        counts[cat] += 1
                        counts["total"] += 1

                        if current_sub_item and current_sub_item != cat:
                            sub_item_counts[current_sub_item] = (
                                sub_item_counts.get(current_sub_item, 0) + 1
                            )

                        last_saved_raw_label = current_raw_label
                        last_saved_time = now
                        stable_count = 0

                        weight_g = CATEGORY_WEIGHTS_G.get(current_raw_label, None)

                        record = {
                            "item_name": current_raw_label,
                            "category": cat,
                            "sub_item": current_sub_item,
                            "confidence": current_conf,
                            "estimated_weight_g": weight_g,
                            "team_id": team_id,
                            "operator_name": operator_name,
                        }

                        evidence_frame = _annotate_frame(
                            frame, raw_detections, counts, sub_item_counts, None, 0
                        )
                        _, jpeg_buf = cv2.imencode(
                            ".jpg", evidence_frame, [cv2.IMWRITE_JPEG_QUALITY, 90]
                        )
                        frame_bytes = jpeg_buf.tobytes()

                        print(
                            f"[CONTADO] {current_raw_label} ({cat}) "
                            f"conf={current_conf:.0%} "
                            f"peso={weight_g}g | total={counts['total']}"
                        )

                        on_detection(record, frame_bytes)
            else:
                stable_raw_label = None
                stable_count = 0

            annotated = _annotate_frame(
                frame, raw_detections, counts, sub_item_counts,
                stable_raw_label, stable_count,
            )
            cv2.imshow("Camera AI", annotated)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print(f"\n[INFO] Sessao encerrada. Total detectado: {counts['total']}")
        for cat in CATEGORIES:
            print(f"  {cat}: {counts[cat]}")
