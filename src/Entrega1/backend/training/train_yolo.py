from ultralytics import YOLO

from config import BATCH_SIZE, DATA_YAML, EPOCHS, IMG_SIZE, TRAIN_NAME, YOLO_BASE_MODEL


def main():
    model = YOLO(YOLO_BASE_MODEL)

    model.train(
        data=str(DATA_YAML),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name=TRAIN_NAME,
    )

    print("Treinamento concluido. Modelo salvo em runs/detect/{}/weights/".format(TRAIN_NAME))


if __name__ == "__main__":
    main()
