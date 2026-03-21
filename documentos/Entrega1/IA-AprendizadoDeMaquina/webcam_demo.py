"""
Demo visual da camera com deteccao YOLOv8 e contagem por estabilidade.

Uso:
    python3 webcam_demo.py          # camera padrao (indice 0)
    python3 webcam_demo.py 1        # webcam externa (indice 1)

Pressione 'q' para encerrar.
"""

import sys
import time
from pathlib import Path

import cv2
from ultralytics import YOLO

_BASE = Path(__file__).resolve().parent
# Busca o modelo: primeiro em models/ (backend), depois em runs/ (treino)
_CANDIDATES = [
    _BASE / "models" / "best.pt",
    _BASE / "runs" / "detect" / "treino_alimentos" / "weights" / "best.pt",
]
MODEL_PATH = next((p for p in _CANDIDATES if p.exists()), _CANDIDATES[0])
CAMERA_INDEX = 0
CONFIDENCE_THRESHOLD = 0.75
REQUIRED_STABLE_FRAMES = 10
COOLDOWN_SECONDS = 3.0


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

    # Contagem por estabilidade (mesmo approach do Projeto2)
    stable_label = None
    stable_count = 0
    last_saved_label = None
    last_saved_time = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Falha ao capturar frame.")
            break

        results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
        annotated = results[0].plot()

        current_label = None
        current_conf = 0.0

        if results[0].boxes is not None and len(results[0].boxes) > 0:
            best_box = max(results[0].boxes, key=lambda b: float(b.conf[0].item()))
            cls_id = int(best_box.cls[0].item())
            current_conf = float(best_box.conf[0].item())
            current_label = model.names[cls_id]

            if stable_label == current_label:
                stable_count += 1
            else:
                stable_label = current_label
                stable_count = 1

            if stable_count >= REQUIRED_STABLE_FRAMES:
                now = time.time()
                if (
                    current_label != last_saved_label
                    or (now - last_saved_time) > COOLDOWN_SECONDS
                ):
                    cat = current_label if current_label in counts else "outros"
                    counts[cat] += 1
                    counts["total"] += 1
                    last_saved_label = current_label
                    last_saved_time = now
                    stable_count = 0
                    print(
                        f"[CONTADO] {current_label}  "
                        f"conf={current_conf:.2f}  "
                        f"total={counts['total']}"
                    )
        else:
            stable_label = None
            stable_count = 0

        # --- Painel de contagens ---
        panel_lines = [
            f"Arroz:  {counts['arroz']}",
            f"Feijao: {counts['feijao']}",
            f"Outros: {counts['outros']}",
            f"Total:  {counts['total']}",
        ]

        # Deteccao atual
        if current_label:
            status_text = f"Detectando: {current_label} ({current_conf:.0%})"
            status_color = (0, 255, 0)
        else:
            status_text = "Nenhum objeto detectado"
            status_color = (0, 0, 255)

        # Barra de estabilidade
        if stable_label and stable_count < REQUIRED_STABLE_FRAMES:
            progress = stable_count / REQUIRED_STABLE_FRAMES
            bar_text = f"Estabilizando: {stable_count}/{REQUIRED_STABLE_FRAMES}"
        else:
            progress = 0
            bar_text = ""

        # Desenha painel
        cv2.rectangle(annotated, (5, 5), (280, 155), (30, 30, 30), -1)

        for i, line in enumerate(panel_lines):
            color = (0, 255, 0) if i == 3 else (255, 255, 255)
            cv2.putText(annotated, line, (10, 30 + i * 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        cv2.putText(annotated, status_text, (10, 135),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, status_color, 1)

        # Barra de progresso
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


if __name__ == "__main__":
    main()
