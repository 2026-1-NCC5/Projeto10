import pandas as pd


def extract_pixels(image):
    width, height = image.size
    rows = []
    for y in range(height):
        for x in range(width):
            r, g, b = image.getpixel((x, y))
            rows.append({"Y": y, "X": x, "R": r, "G": g, "B": b})
    return pd.DataFrame(rows)
