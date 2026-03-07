import torch
import torch.nn as nn
from torchvision import models

from config import CATEGORIES, DEVICE, MODEL_PATH


def create_model(num_classes=None):
    """Cria MobileNetV2 com classificador customizado."""
    if num_classes is None:
        num_classes = len(CATEGORIES)

    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)

    for param in model.features.parameters():
        param.requires_grad = False

    last_channel = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(last_channel, num_classes),
    )

    model = model.to(DEVICE)
    return model


def load_saved_model(path=None):
    """Carrega modelo salvo para inferência. Retorna None se o arquivo não existir."""
    if path is None:
        path = MODEL_PATH

    from pathlib import Path
    path = Path(path)

    if not path.exists():
        return None

    model = create_model()
    model.load_state_dict(torch.load(path, weights_only=True, map_location=DEVICE))
    model.eval()
    return model
