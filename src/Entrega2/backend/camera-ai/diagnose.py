import os
import sys
import time

os.environ.setdefault("QT_QPA_PLATFORM", "xcb")
os.environ.setdefault("QT_LOGGING_RULES", "*.debug=false;qt.qpa.*=false;qt.text.*=false")

import cv2
from ultralytics import YOLO


CAMERA_INDEX = int(sys.argv[1]) if len(sys.argv) > 1 else 2
print(f"Abrindo camera index={CAMERA_INDEX}...")
cap = cv2.VideoCapture(CAMERA_INDEX)
if not cap.isOpened():
    print("Camera nao abriu")
    sys.exit(1)

print("Coloque o pacote na frente da camera. Capturando em 5s...")
for i in range(5, 0, -1):
    print(f"  {i}...")
    for _ in range(5):
        cap.read()
    time.sleep(1)

ret, frame = cap.read()
cap.release()
if not ret:
    print("Sem frame")
    sys.exit(1)

print(f"\nFrame capturado: {frame.shape}")
cv2.imwrite("diagnose_frame.jpg", frame)
print("Salvo em diagnose_frame.jpg")

m = YOLO("models/best.pt")
print("\n=== Inferencia em multiplos thresholds ===")
for thr in [0.01, 0.05, 0.10, 0.20, 0.30, 0.50]:
    res = m(frame, conf=thr, verbose=False)
    boxes = res[0].boxes
    n = 0 if boxes is None else len(boxes)
    print(f"thr={thr:.2f}: {n} deteccoes")
    if boxes is not None:
        for b in boxes:
            cls_name = m.names[int(b.cls[0])]
            conf = float(b.conf[0])
            xyxy = b.xyxy[0].cpu().numpy()
            print(f"   -> {cls_name}  conf={conf:.3f}  bbox={[int(v) for v in xyxy]}")

annotated = frame.copy()
res = m(frame, conf=0.01, verbose=False)
if res[0].boxes is not None:
    for b in res[0].boxes:
        x1, y1, x2, y2 = [int(v) for v in b.xyxy[0].cpu().numpy()]
        cls_name = m.names[int(b.cls[0])]
        conf = float(b.conf[0])
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(annotated, f"{cls_name} {conf:.2f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
cv2.imwrite("diagnose_annotated.jpg", annotated)
print("\nFrame anotado salvo em diagnose_annotated.jpg")
