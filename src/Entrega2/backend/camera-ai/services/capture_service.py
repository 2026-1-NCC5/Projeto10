import threading
import time
from collections import Counter, deque
from typing import Callable, Optional
from uuid import UUID

import cv2

from config import (
    CAMERA_INDEX,
    CATEGORIES,
    CLASS_TO_CATEGORY,
    CONFIDENCE_THRESHOLD,
    SUB_ITEM_DEFAULT,
    CATEGORY_PRICES_BRL_PER_KG,
    STABILITY_WINDOW,
    STABILITY_MAJORITY,
    STABILITY_MEAN_CONFIDENCE,
    STRICT_CONFIDENCE_NO_OCR,
    RECOUNT_COOLDOWN_S,
    estimate_weight_g,
)
from ml.inference import detect_frame
from ml import ocr as ocr_module
from tracking.tracker import CentroidTracker

_COLORS = {
    "arroz": (0, 255, 0),
    "feijao": (0, 165, 255),
    "outros": (255, 0, 0),
}
_DEFAULT_COLOR = (200, 200, 200)


_HISTORY_MAX = 7


def _annotate_frame(frame, raw_detections, counts, sub_item_counts, line_y, detection_history=None):
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

        lookup = d.get("raw_label") or (sub_item if sub_item else label)
        bbox_area = max(0, (x2 - x1)) * max(0, (y2 - y1))
        area_ratio = bbox_area / float(h * w) if h and w else 0.0
        weight_g = estimate_weight_g(lookup, area_ratio)
        if weight_g is not None:
            price = round((weight_g / 1000.0) * CATEGORY_PRICES_BRL_PER_KG.get(lookup, 0.0), 2)
            info = f"{weight_g:.0f}g  R${price:.2f}  a={area_ratio:.2f}"
            (iw, ih), _ = cv2.getTextSize(info, cv2.FONT_HERSHEY_SIMPLEX, 0.52, 1)
            cv2.rectangle(annotated, (x1, y2 + 1), (x1 + iw + 6, y2 + ih + 10), color, -1)
            cv2.putText(annotated, info, (x1 + 3, y2 + ih + 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.52, (255, 255, 255), 1)

    if line_y is not None:
        cv2.line(annotated, (0, line_y), (w, line_y), (0, 255, 255), 2)
        cv2.putText(annotated, "CONTAGEM", (w - 110, line_y - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

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

    if detection_history:
        panel_w = 250
        row_h = 26
        padding = 8
        panel_h = 28 + len(detection_history) * row_h + 36
        px = w - panel_w - padding
        py = padding

        overlay = annotated.copy()
        cv2.rectangle(overlay, (px - padding, py), (w - padding, py + panel_h), (0, 18, 28), -1)
        cv2.addWeighted(overlay, 0.78, annotated, 0.22, 0, annotated)

        cv2.putText(annotated, "Historico de deteccoes", (px - 4, py + 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 200, 210), 1)

        for i, entry in enumerate(detection_history):
            ry = py + 28 + i * row_h + row_h - 6
            name = entry["item_name"]
            wg = entry.get("estimated_weight_g")
            pr = entry.get("estimated_price_brl")
            cat = entry.get("category", "outros")
            rank = entry["rank"]
            col = _COLORS.get(cat, _DEFAULT_COLOR)
            wstr = f"{wg:.0f}g" if wg is not None else "  —  "
            pstr = f"R${pr:.2f}" if pr is not None else "—"
            row_text = f"#{rank:<2}  {name:<10}  {wstr:<6}  {pstr}"
            cv2.putText(annotated, row_text, (px - 4, ry),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.48, col, 1)

        total_w = sum(e.get("estimated_weight_g") or 0 for e in detection_history)
        total_p = sum(e.get("estimated_price_brl") or 0 for e in detection_history)
        footer_y = py + 28 + len(detection_history) * row_h + 26
        cv2.putText(annotated, f"Acum: {total_w:.0f}g  R${total_p:.2f}",
                    (px - 4, footer_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

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
    detection_history: list[dict] = []

    tracker = CentroidTracker()
    track_window: dict[int, deque] = {}
    counted_track_ids: set[int] = set()
    last_count_ts = 0.0
    ocr_fallback_counter = 0
    OCR_FALLBACK_FRAMES = 15
    ocr_fallback_window: deque = deque(maxlen=2)

    print("[INFO] Camera iniciada. Pressione Ctrl+C para encerrar.\n")

    try:
        while not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                break

            raw_detections = detect_frame(frame, model, CONFIDENCE_THRESHOLD)

            fh, fw = frame.shape[:2]
            frame_area = float(fh * fw) if fh and fw else 1.0
            centroid_to_area_ratio: dict[tuple, float] = {}
            centroid_to_bbox: dict[tuple, list] = {}
            for d in raw_detections:
                x1, y1, x2, y2 = d["bbox"]
                area = max(0.0, (x2 - x1)) * max(0.0, (y2 - y1))
                centroid_to_area_ratio[d["centroid"]] = area / frame_area
                centroid_to_bbox[d["centroid"]] = d["bbox"]

            tracked = tracker.update(raw_detections)

            active_ids = {obj["id"] for obj in tracked}
            for tid in list(track_window.keys()):
                if tid not in active_ids:
                    del track_window[tid]
            counted_track_ids.intersection_update(active_ids)

            for obj in tracked:
                tid = obj["id"]
                raw_label = obj.get("raw_label", obj["label"])
                area_ratio = centroid_to_area_ratio.get(obj["centroid"], 0.0)
                window = track_window.setdefault(
                    tid, deque(maxlen=STABILITY_WINDOW)
                )
                window.append((raw_label, float(obj["confidence"]), area_ratio))

            newly_counted = []
            now = time.time()
            for obj in tracked:
                tid = obj["id"]
                if tid in counted_track_ids:
                    continue
                window = track_window.get(tid)
                if window is None or len(window) < STABILITY_WINDOW:
                    continue
                label_counts = Counter(lbl for lbl, _, _ in window)
                top_label, top_votes = label_counts.most_common(1)[0]
                if top_votes < STABILITY_MAJORITY:
                    continue
                top_entries = [(c, a) for lbl, c, a in window if lbl == top_label]
                mean_conf = sum(c for c, _ in top_entries) / len(top_entries)
                if mean_conf < STABILITY_MEAN_CONFIDENCE:
                    continue
                if now - last_count_ts < RECOUNT_COOLDOWN_S:
                    continue
                areas_sorted = sorted(a for _, a in top_entries if a > 0)
                if areas_sorted:
                    mid = len(areas_sorted) // 2
                    median_area = (
                        areas_sorted[mid]
                        if len(areas_sorted) % 2
                        else (areas_sorted[mid - 1] + areas_sorted[mid]) / 2
                    )
                else:
                    median_area = 0.0
                counted_track_ids.add(tid)
                last_count_ts = now
                newly_counted.append({
                    "raw_label": top_label,
                    "confidence": mean_conf,
                    "area_ratio": median_area,
                    "bbox": centroid_to_bbox.get(obj["centroid"]),
                })

            if not raw_detections and not newly_counted:
                ocr_fallback_counter += 1
                if (
                    ocr_fallback_counter >= OCR_FALLBACK_FRAMES
                    and now - last_count_ts >= RECOUNT_COOLDOWN_S
                    and ocr_module.is_available()
                ):
                    ocr_fallback_counter = 0
                    print("[OCR-FALLBACK] YOLO silencioso, rodando OCR...")
                    fb_product, fb_weight, fb_text = ocr_module.read_label(frame)
                    snippet = (fb_text[:80] + "...") if len(fb_text) > 80 else fb_text
                    print(f"   texto: {snippet!r}")
                    print(f"   produto={fb_product}  peso={fb_weight}")
                    if fb_product:
                        ocr_fallback_window.append((fb_product, fb_weight))
                        if (
                            len(ocr_fallback_window) == ocr_fallback_window.maxlen
                            and len({p for p, _ in ocr_fallback_window}) == 1
                        ):
                            confirmed_weight = next(
                                (w for _, w in ocr_fallback_window if w is not None),
                                fb_weight,
                            )
                            print(f"[OCR-FALLBACK] CONFIRMADO: {fb_product} ({confirmed_weight}g)")
                            newly_counted.append({
                                "raw_label": fb_product,
                                "confidence": 1.0,
                                "area_ratio": 0.0,
                                "bbox": None,
                                "ocr_weight_override": confirmed_weight,
                            })
                            ocr_fallback_window.clear()
                            last_count_ts = now
                    else:
                        ocr_fallback_window.clear()
            else:
                ocr_fallback_counter = 0
                ocr_fallback_window.clear()

            for event in newly_counted:
                raw_label = event["raw_label"]
                ocr_label = None
                ocr_weight = event.get("ocr_weight_override")
                ocr_text = ""
                bbox = event.get("bbox")
                if bbox is not None:
                    x1, y1, x2, y2 = [int(v) for v in bbox]
                    pad = 12
                    x1 = max(0, x1 - pad)
                    y1 = max(0, y1 - pad)
                    x2 = min(fw, x2 + pad)
                    y2 = min(fh, y2 + pad)
                    if x2 > x1 and y2 > y1:
                        crop = frame[y1:y2, x1:x2]
                        ocr_label, ocr_weight, ocr_text = ocr_module.read_label(crop)

                if ocr_label:
                    if ocr_label != raw_label:
                        print(
                            f"[OCR] override label: YOLO='{raw_label}' -> OCR='{ocr_label}'"
                        )
                    raw_label = ocr_label
                else:
                    is_ocr_fallback = event.get("bbox") is None
                    if (
                        not is_ocr_fallback
                        and event["confidence"] < STRICT_CONFIDENCE_NO_OCR
                    ):
                        print(
                            f"[SAFETY] descartado: YOLO='{raw_label}' conf={event['confidence']:.0%} "
                            f"< {STRICT_CONFIDENCE_NO_OCR:.0%} e OCR nao confirmou"
                        )
                        continue

                category, sub_item = CLASS_TO_CATEGORY.get(raw_label, ("outros", SUB_ITEM_DEFAULT))

                cat = category if category in counts else "outros"
                counts[cat] += 1
                counts["total"] += 1

                if sub_item and sub_item != cat:
                    sub_item_counts[sub_item] = sub_item_counts.get(sub_item, 0) + 1

                area_ratio = event.get("area_ratio", 0.0)
                if ocr_weight is not None:
                    weight_g = ocr_weight
                    print(f"[OCR] peso lido do rótulo: {weight_g:.0f}g")
                else:
                    weight_g = estimate_weight_g(raw_label, area_ratio)
                price_brl = None
                if weight_g is not None:
                    price_brl = round(
                        (weight_g / 1000.0) * CATEGORY_PRICES_BRL_PER_KG.get(raw_label, 0.0), 2
                    )

                record = {
                    "item_name": raw_label,
                    "category": cat,
                    "sub_item": sub_item,
                    "confidence": event["confidence"],
                    "estimated_weight_g": weight_g,
                    "estimated_price_brl": price_brl,
                    "team_id": team_id,
                    "operator_name": operator_name,
                }

                detection_history.append({
                    "rank": counts["total"],
                    "item_name": raw_label,
                    "category": cat,
                    "estimated_weight_g": weight_g,
                    "estimated_price_brl": price_brl,
                })
                if len(detection_history) > _HISTORY_MAX:
                    detection_history.pop(0)

                evidence_frame = _annotate_frame(
                    frame, raw_detections, counts, sub_item_counts, None
                )
                _, jpeg_buf = cv2.imencode(
                    ".jpg", evidence_frame, [cv2.IMWRITE_JPEG_QUALITY, 90]
                )
                frame_bytes = jpeg_buf.tobytes()

                price_str = f"R${price_brl:.2f}" if price_brl is not None else "—"
                print(
                    f"[CONTADO] {raw_label} ({cat}) "
                    f"conf={event['confidence']:.0%} "
                    f"area={area_ratio:.3f} "
                    f"peso={weight_g}g preco={price_str} | total={counts['total']}"
                )

                on_detection(record, frame_bytes)

            annotated = _annotate_frame(
                frame, raw_detections, counts, sub_item_counts, None,
                detection_history=detection_history if detection_history else None,
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
