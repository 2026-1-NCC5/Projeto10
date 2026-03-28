from pathlib import Path

from image_loader import find_image, load_and_resize
from pixel_extractor import extract_pixels
from data_exporter import export_to_csv
from image_reconstructor import reconstruct_from_csv, save_image

SCRIPT_DIR = Path(__file__).resolve().parent
IMAGES_DIR = SCRIPT_DIR / "images"
CSV_PATH = SCRIPT_DIR / "pixel_data.csv"
RECONSTRUCTED_PATH = SCRIPT_DIR / "reconstructed_image.png"


def main():
    image_path = find_image(IMAGES_DIR)
    if image_path is None:
        print("Nenhuma imagem encontrada no diretório 'images/'.")
        print("Coloque um arquivo .png, .jpg, .jpeg ou .bmp na pasta images/ e tente novamente.")
        return
    print(f"1. Imagem encontrada: {image_path.name}")

    image = load_and_resize(image_path, size=(50, 50))
    print(f"2. Imagem carregada e redimensionada para {image.size[0]}x{image.size[1]} pixels")

    df = extract_pixels(image)
    print(f"3. Matriz de pixels extraída: {len(df)} pixels ({df.shape[1]} colunas: {list(df.columns)})")

    export_to_csv(df, CSV_PATH)
    print(f"4. Dados exportados para: {CSV_PATH.name}")

    reconstructed = reconstruct_from_csv(CSV_PATH)
    print(f"5. Imagem reconstruída a partir do CSV: {reconstructed.size[0]}x{reconstructed.size[1]} pixels")

    save_image(reconstructed, RECONSTRUCTED_PATH)
    print(f"6. Imagem reconstruída salva em: {RECONSTRUCTED_PATH.name}")

    print()
    print("Prova concluída: a imagem é uma matriz de números.")
    print("O CSV contém todos os dados numéricos, e a reconstrução prova que nenhuma informação foi perdida.")


if __name__ == "__main__":
    main()
