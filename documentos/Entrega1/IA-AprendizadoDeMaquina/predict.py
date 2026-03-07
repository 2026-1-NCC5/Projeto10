import sys

import torch
import matplotlib.pyplot as plt

from config import CATEGORIES, DEVICE
from dataset import val_transforms
from model import load_saved_model
from preprocessing import preprocess_image


def predict_image(image_path, model):
    """Classifica uma imagem e retorna (label, confiança, probabilidades)."""
    model.eval()

    img_pil = preprocess_image(image_path)
    if img_pil is None:
        print(f"Erro: nao foi possivel carregar {image_path}")
        return None, 0.0, []

    img_tensor = val_transforms(img_pil).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs, dim=1)[0].cpu().numpy()

    pred_idx = probs.argmax()
    pred_label = CATEGORIES[pred_idx]
    confidence = probs[pred_idx]

    return pred_label, confidence, probs


def main():
    if len(sys.argv) < 2:
        print("Uso: python predict.py <caminho_da_imagem>")
        print("Exemplo: python predict.py dataset/arroz/foto1.jpg")
        sys.exit(1)

    image_path = sys.argv[1]

    model = load_saved_model()
    if model is None:
        sys.exit(1)

    label, confidence, probs = predict_image(image_path, model)
    if label is None:
        sys.exit(1)

    print(f"\nPredicao: {label} ({confidence:.1%})")
    print("\nProbabilidades:")
    for cat, prob in zip(CATEGORIES, probs):
        bar = "#" * int(prob * 40)
        print(f"  {cat:>8s}: {prob:.1%} {bar}")

    # Mostrar visualização
    img_pil = preprocess_image(image_path)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    ax1.imshow(img_pil)
    ax1.set_title(f"Predicao: {label} ({confidence:.1%})", fontsize=14)
    ax1.axis("off")

    pred_idx = probs.argmax()
    colors = ["#4CAF50" if i == pred_idx else "#90CAF9" for i in range(len(CATEGORIES))]
    bars = ax2.barh(CATEGORIES, probs, color=colors)
    ax2.set_xlim(0, 1)
    ax2.set_xlabel("Probabilidade")
    ax2.set_title("Confianca por Categoria")
    for bar, prob in zip(bars, probs):
        ax2.text(bar.get_width() + 0.02, bar.get_y() + bar.get_height() / 2,
                 f"{prob:.1%}", va="center", fontsize=11)

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
