import sys
import time
from pathlib import Path

import cv2
from ultralytics import YOLO

MODEL_PATH = Path(__file__).resolve().parent / "models" / "best.pt"
CAMERA_INDEX = 0
CONFIDENCE_THRESHOLD = 0.75
REQUIRED_STABLE_FRAMES = 10
COOLDOWN_SECONDS = 3.0

CLASS_TO_CATEGORY = {
    "arroz": ("arroz", "arroz"),
    "feijao": ("feijao", "feijao"),
    "acucar": ("outros", "acucar"),
    "cafe": ("outros", "cafe"),
    "macarrao": ("outros", "macarrao"),
}
SUB_ITEM_DEFAULT = "desconhecido"


def main():
    camera_index = int(sys.argv[1]) if len(sys.argv) > 1 else CAMERA_INDEX

    if not MODEL_PATH.exists():
        print(f"Modelo nao encontrado em: {MODEL_PATH}")
        print("Certifique-se de que best.pt esta em models/")
        sys.exit(1)

    model = YOLO(str(MODEL_PATH))
    print("Modelo carregado.")

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"Nao foi possivel abrir a camera (indice {camera_index}).")
        sys.exit(1)

    print("Camera iniciada. Pressione 'q' para sair.\n")

    counts = {"arroz": 0, "feijao": 0, "outros": 0, "total": 0}
    sub_item_counts: dict[str, int] = {}

    stable_raw_label = None
    stable_count = 0
    last_saved_raw_label = None
    last_saved_time = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Falha ao capturar frame.")
            break

        results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
        annotated = results[0].plot()

        current_label = None
        current_sub_item = None
        current_raw_label = None
        current_conf = 0.0

        if results[0].boxes is not None and len(results[0].boxes) > 0:
            best_box = max(results[0].boxes, key=lambda b: float(b.conf[0].item()))
            cls_id = int(best_box.cls[0].item())
            current_conf = float(best_box.conf[0].item())
            current_raw_label = model.names[cls_id]

            category, sub_item = CLASS_TO_CATEGORY.get(
                current_raw_label, ("outros", SUB_ITEM_DEFAULT)
            )
            current_label = category
            current_sub_item = sub_item

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
                    counts[current_label] += 1
                    counts["total"] += 1

                    if current_sub_item != current_label:
                        sub_item_counts[current_sub_item] = (
                            sub_item_counts.get(current_sub_item, 0) + 1
                        )

                    last_saved_raw_label = current_raw_label
                    last_saved_time = now
                    stable_count = 0

                    if current_sub_item and current_sub_item != current_label:
                        print(
                            f"[CONTADO] {current_label} ({current_sub_item})  "
                            f"conf={current_conf:.2f}  "
                            f"total={counts['total']}"
                        )
                    else:
                        print(
                            f"[CONTADO] {current_label}  "
                            f"conf={current_conf:.2f}  "
                            f"total={counts['total']}"
                        )
        else:
            stable_raw_label = None
            stable_count = 0

        panel_lines = [
            f"Arroz:  {counts['arroz']}",
            f"Feijao: {counts['feijao']}",
            f"Outros: {counts['outros']}",
            f"Total:  {counts['total']}",
        ]

        if current_label:
            if current_sub_item and current_sub_item != current_label:
                status_text = f"Detectando: {current_sub_item} -> {current_label} ({current_conf:.0%})"
            else:
                status_text = f"Detectando: {current_label} ({current_conf:.0%})"
            status_color = (0, 255, 0)
        else:
            status_text = "Nenhum objeto detectado"
            status_color = (0, 0, 255)

        if stable_raw_label and stable_count < REQUIRED_STABLE_FRAMES:
            progress = stable_count / REQUIRED_STABLE_FRAMES
            bar_text = f"Estabilizando: {stable_count}/{REQUIRED_STABLE_FRAMES}"
        else:
            progress = 0
            bar_text = ""

        cv2.rectangle(annotated, (5, 5), (280, 155), (30, 30, 30), -1)

        for i, line in enumerate(panel_lines):
            color = (0, 255, 0) if i == 3 else (255, 255, 255)
            cv2.putText(annotated, line, (10, 30 + i * 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        cv2.putText(annotated, status_text, (10, 135),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, status_color, 1)

        if bar_text:
            h_frame = annotated.shape[0]
            bar_y = h_frame - 30
            bar_w = int(annotated.shape[1] * progress)
            cv2.rectangle(annotated, (0, bar_y), (annotated.shape[1], h_frame), (30, 30, 30), -1)
            cv2.rectangle(annotated, (0, bar_y), (bar_w, h_frame), (0, 200, 255), -1)
            cv2.putText(annotated, bar_text, (10, h_frame - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

        cv2.imshow("YOLOv8 - Contagem de Alimentos  (q para sair)", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    print("\n=== Resumo da sessao ===")
    for k, v in counts.items():
        print(f"  {k}: {v}")
    if sub_item_counts:
        print("\n=== Detalhamento sub-itens (outros) ===")
        for k, v in sub_item_counts.items():
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
