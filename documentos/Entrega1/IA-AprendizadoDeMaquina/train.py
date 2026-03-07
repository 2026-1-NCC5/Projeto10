import sys

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix

from config import CATEGORIES, DEVICE, EPOCHS, LR, MODELS_DIR, BEST_MODEL_PATH
from dataset import load_dataset
from model import create_model


def train_one_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    return running_loss / total, correct / total


def evaluate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    return running_loss / total, correct / total


def main():
    print("=== Classificador de Embalagens de Alimentos ===")
    print(f"Device: {DEVICE}\n")

    # Carregar dataset
    train_loader, val_loader = load_dataset()
    if train_loader is None:
        sys.exit(1)

    # Criar modelo
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model = create_model()
    optimizer = optim.Adam(model.classifier.parameters(), lr=LR)
    criterion = nn.CrossEntropyLoss()

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"\nParametros treinaveis: {trainable:,} / {total_params:,} ({100*trainable/total_params:.1f}%)")

    # Treinar
    best_val_acc = 0.0
    print(f"\nIniciando treinamento por {EPOCHS} epocas...\n")

    for epoch in range(1, EPOCHS + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer)
        val_loss, val_acc = evaluate(model, val_loader, criterion)

        improved = ""
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), BEST_MODEL_PATH)
            improved = " <- melhor modelo salvo"

        print(f"Epoca {epoch:2d}/{EPOCHS} | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f}{improved}")

    print(f"\nMelhor acuracia de validacao: {best_val_acc:.4f}")
    print(f"Modelo salvo em: {BEST_MODEL_PATH}")

    # Avaliação final
    model.load_state_dict(torch.load(BEST_MODEL_PATH, weights_only=True))
    model.eval()

    all_preds = []
    all_true = []

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(DEVICE)
            outputs = model(images)
            _, predicted = outputs.max(1)
            all_preds.extend(predicted.cpu().numpy())
            all_true.extend(labels.numpy())

    print("\n=== Relatorio de Classificacao (Validacao) ===\n")
    print(classification_report(all_true, all_preds, target_names=CATEGORIES, zero_division=0))

    print("Matriz de Confusao:")
    cm = confusion_matrix(all_true, all_preds)
    # Header
    print(f"{'':>12s}", end="")
    for cat in CATEGORIES:
        print(f"{cat:>10s}", end="")
    print()
    for i, cat in enumerate(CATEGORIES):
        print(f"{cat:>12s}", end="")
        for j in range(len(CATEGORIES)):
            print(f"{cm[i][j]:>10d}", end="")
        print()


if __name__ == "__main__":
    main()
