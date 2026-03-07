import torch
import torch.nn as nn
from torchvision import models

from config import CATEGORIES, DEVICE, BEST_MODEL_PATH


def create_model(num_classes=len(CATEGORIES)):
    """Cria MobileNetV2 com classificador customizado para num_classes."""
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

    # Congelar backbone
    for param in model.features.parameters():
        param.requires_grad = False

    # Substituir classificador
    last_channel = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(last_channel, num_classes),
    )

    model = model.to(DEVICE)
    return model


def load_saved_model(path=None):
    """Carrega um modelo salvo para inferência sem retreinamento."""
    if path is None:
        path = BEST_MODEL_PATH

    if not path.exists():
        print(f"Arquivo nao encontrado: {path}")
        print("Treine o modelo primeiro (python train.py).")
        return None

    model = create_model()
    model.load_state_dict(torch.load(path, weights_only=True, map_location=DEVICE))
    model.eval()
    print(f"Modelo carregado de: {path}")
    return model
