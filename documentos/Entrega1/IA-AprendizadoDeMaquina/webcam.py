import sys
import time

import cv2
import torch

from config import CATEGORIES, DEVICE
from dataset import val_transforms
from model import load_saved_model
from preprocessing import preprocess_frame, detect_object_present


def classify_frame(frame_bgr, model):
    """Classifica o objeto principal no frame. Retorna (label, confiança, probabilidades)."""
    model.eval()
    img_pil = preprocess_frame(frame_bgr)
    img_tensor = val_transforms(img_pil).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs, dim=1)[0].cpu().numpy()

    pred_idx = probs.argmax()
    return CATEGORIES[pred_idx], probs[pred_idx], probs


def run_webcam_inference(model, confidence_threshold=0.6, cooldown_seconds=2.0):
    """Inferência em tempo real via webcam com contagem de objetos únicos.

    - Detecta presença de objeto via contornos
    - Classifica quando objeto está presente
    - Conta objeto como novo quando: objeto aparece após ausência (ou após cooldown)
    - cooldown_seconds: tempo mínimo entre contagens para evitar duplicatas
    """
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Webcam nao disponivel.")
        print("Para testar inferencia sem webcam, use:")
        print("  python predict.py caminho/para/imagem.jpg")
        return

    print("Webcam aberta. Pressione 'q' para encerrar.")
    print(f"Limiar de confianca para contagem: {confidence_threshold:.0%}")
    print(f"Cooldown entre contagens: {cooldown_seconds}s")
    print()

    counts = {cat: 0 for cat in CATEGORIES}
    total_count = 0
    object_was_present = False
    last_count_time = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Erro ao capturar frame.")
            break

        obj_present, bbox = detect_object_present(frame)

        if obj_present:
            label, confidence, probs = classify_frame(frame, model)

            now = time.time()
            is_new_object = (not object_was_present) or (now - last_count_time > cooldown_seconds)

            if is_new_object and confidence >= confidence_threshold:
                counts[label] += 1
                total_count += 1
                last_count_time = now
                print(f"  [{total_count}] {label} (confianca: {confidence:.1%})")

            if bbox is not None:
                x, y, w, h = bbox
                color = (0, 255, 0) if confidence >= confidence_threshold else (0, 165, 255)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

            text = f"{label}: {confidence:.1%}"
            cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)

            object_was_present = True
        else:
            object_was_present = False
            cv2.putText(frame, "Sem objeto detectado", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (128, 128, 128), 2)

        y_offset = frame.shape[0] - 20
        count_text = f"Total: {total_count} | " + " | ".join(f"{cat}: {counts[cat]}" for cat in CATEGORIES)
        cv2.putText(frame, count_text, (10, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        cv2.imshow("Classificador de Alimentos", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    print(f"\n--- Resumo da Sessao ---")
    print(f"Total de objetos contados: {total_count}")
    for cat in CATEGORIES:
        print(f"  {cat}: {counts[cat]}")


def main():
    model = load_saved_model()
    if model is None:
        sys.exit(1)

    run_webcam_inference(model)


if __name__ == "__main__":
    main()
