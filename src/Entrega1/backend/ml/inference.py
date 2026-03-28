from config import CLASS_TO_CATEGORY, CONFIDENCE_THRESHOLD, SUB_ITEM_DEFAULT


def detect_frame(frame_bgr, model, confidence_threshold=None):
    if confidence_threshold is None:
        confidence_threshold = CONFIDENCE_THRESHOLD

    results = model(frame_bgr, conf=confidence_threshold, verbose=False)

    detections = []
    if results and results[0].boxes is not None:
        for box in results[0].boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].cpu().numpy()
            raw_label = model.names[cls_id]

            category, sub_item = CLASS_TO_CATEGORY.get(
                raw_label, ("outros", SUB_ITEM_DEFAULT)
            )

            cx = float((xyxy[0] + xyxy[2]) / 2)
            cy = float((xyxy[1] + xyxy[3]) / 2)

            detections.append({
                "label": category,
                "sub_item": sub_item,
                "raw_label": raw_label,
                "confidence": conf,
                "bbox": [float(v) for v in xyxy],
                "centroid": (cx, cy),
            })

    return detections
