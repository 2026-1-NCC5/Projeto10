from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image


def reconstruct_from_csv(csv_path):
    df = pd.read_csv(csv_path)
    df = df.astype(int)
    height = df["Y"].max() + 1
    width = df["X"].max() + 1
    pixels = np.zeros((height, width, 3), dtype=np.uint8)
    for _, row in df.iterrows():
        pixels[row["Y"], row["X"]] = [row["R"], row["G"], row["B"]]
    return Image.fromarray(pixels)


def save_image(image, output_path):
    output_path = Path(output_path)
    image.save(output_path)
    return output_path
