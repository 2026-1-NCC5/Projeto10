from pathlib import Path

from ultralytics import YOLO

from config import BATCH_SIZE, DATA_YAML, IMG_SIZE


OLD_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "best_old.pt"
FINE_TUNE_NAME = "fine_tune"
FINE_TUNE_EPOCHS = 15
FINE_TUNE_LR0 = 0.001
FINE_TUNE_LRF = 0.01


def main():
    if not OLD_MODEL_PATH.exists():
        print(f"[ERRO] Modelo base nao encontrado em {OLD_MODEL_PATH}")
        print("       Esperado: models/best_old.pt (backup do modelo antigo)")
        return

    print(f"Carregando modelo base: {OLD_MODEL_PATH}")
    model = YOLO(str(OLD_MODEL_PATH))

    print(f"Iniciando fine-tuning com {FINE_TUNE_EPOCHS} epocas, lr0={FINE_TUNE_LR0}")
    print("Isso PRESERVA o conhecimento antigo e adiciona as imagens novas em cima.")

    model.train(
        data=str(DATA_YAML),
        epochs=FINE_TUNE_EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name=FINE_TUNE_NAME,
        lr0=FINE_TUNE_LR0,
        lrf=FINE_TUNE_LRF,
        patience=10,
        freeze=0,
    )

    print(f"\nFine-tuning concluido. Modelo salvo em runs/detect/{FINE_TUNE_NAME}/weights/best.pt")
    print("\nPara avaliar antes de promover para producao:")
    print(f"  python3 -c \"from ultralytics import YOLO; YOLO('runs/detect/{FINE_TUNE_NAME}/weights/best.pt').val(data='{DATA_YAML}')\"")
    print("\nSe os resultados forem bons, promova para producao:")
    print(f"  cp runs/detect/{FINE_TUNE_NAME}/weights/best.pt ../models/best.pt")


if __name__ == "__main__":
    main()
