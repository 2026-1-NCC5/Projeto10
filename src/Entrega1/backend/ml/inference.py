from config import CONFIDENCE_THRESHOLD


def detect_frame(frame_bgr, model, confidence_threshold=None):
    """Executa YOLO em um frame BGR.

    Retorna lista de dicts com label, confidence, bbox [x1,y1,x2,y2] e centroid (cx, cy).
    """
    if confidence_threshold is None:
        confidence_threshold = CONFIDENCE_THRESHOLD

    results = model(frame_bgr, conf=confidence_threshold, verbose=False)

    detections = []
    if results and results[0].boxes is not None:
        for box in results[0].boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].cpu().numpy()
            label = model.names[cls_id]

            cx = float((xyxy[0] + xyxy[2]) / 2)
            cy = float((xyxy[1] + xyxy[3]) / 2)

            detections.append({
                "label": label,
                "confidence": conf,
                "bbox": [float(v) for v in xyxy],
                "centroid": (cx, cy),
            })

    return detections
