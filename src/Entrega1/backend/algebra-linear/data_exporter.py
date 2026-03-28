from pathlib import Path


def export_to_csv(dataframe, output_path):
    output_path = Path(output_path)
    dataframe.to_csv(output_path, index=False)
    return output_path
