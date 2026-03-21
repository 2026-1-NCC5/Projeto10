from pathlib import Path

from ultralytics import YOLO

from config import DATA_YAML, IMG_SIZE, RUNS_DIR, TRAIN_NAME


def main():
    weights_path = RUNS_DIR / "detect" / TRAIN_NAME / "weights" / "best.pt"

    if not weights_path.exists():
        print(f"Modelo nao encontrado em {weights_path}")
        print("Execute train_yolo.py primeiro.")
        return

    model = YOLO(str(weights_path))

    results = model.val(data=str(DATA_YAML), imgsz=IMG_SIZE)

    print("\n=== Resultados da Avaliacao ===")
    print(f"mAP50:    {results.box.map50:.4f}")
    print(f"mAP50-95: {results.box.map:.4f}")

    class_names = model.names
    for i, (p, r, ap50) in enumerate(
        zip(results.box.p, results.box.r, results.box.ap50)
    ):
        name = class_names.get(i, f"classe_{i}")
        print(f"  {name}: Precision={p:.4f}  Recall={r:.4f}  AP50={ap50:.4f}")


if __name__ == "__main__":
    main()
