import numpy as np
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

from config import (
    CATEGORIES, DATASET_DIR, IMG_SIZE, BATCH_SIZE,
    VALIDATION_SPLIT, SEED, SUPPORTED_EXTENSIONS,
    IMAGENET_MEAN, IMAGENET_STD,
)
from preprocessing import preprocess_image

train_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])

val_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


class FoodDataset(Dataset):
    """Dataset de embalagens de alimentos com extração de ROI integrada."""

    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img = preprocess_image(self.image_paths[idx])
        if img is None:
            img = Image.new("RGB", (IMG_SIZE, IMG_SIZE))
        if self.transform:
            img = self.transform(img)
        return img, self.labels[idx]


def load_dataset():
    """Carrega imagens do disco, divide em treino/validação e retorna DataLoaders.

    Retorna (train_loader, val_loader) ou (None, None) se o dataset estiver vazio.
    """
    all_paths = []
    all_labels = []

    for label_idx, cat in enumerate(CATEGORIES):
        cat_dir = DATASET_DIR / cat
        cat_dir.mkdir(parents=True, exist_ok=True)
        files = sorted([f for f in cat_dir.iterdir() if f.suffix.lower() in SUPPORTED_EXTENSIONS])
        all_paths.extend(files)
        all_labels.extend([label_idx] * len(files))
        print(f"  {cat}: {len(files)} imagens")

    total = len(all_paths)
    print(f"\nTotal de imagens: {total}")

    if total == 0:
        print("\nDataset vazio. Coloque imagens nas subpastas de dataset/ e execute novamente.")
        for cat in CATEGORIES:
            print(f"  dataset/{cat}/  <- imagens de {cat}")
        return None, None

    rng = np.random.RandomState(SEED)
    indices = rng.permutation(total)

    split = int(total * (1 - VALIDATION_SPLIT))
    train_idx = indices[:split]
    val_idx = indices[split:]

    train_paths = [all_paths[i] for i in train_idx]
    train_labels = [all_labels[i] for i in train_idx]
    val_paths = [all_paths[i] for i in val_idx]
    val_labels = [all_labels[i] for i in val_idx]

    train_dataset = FoodDataset(train_paths, train_labels, transform=train_transforms)
    val_dataset = FoodDataset(val_paths, val_labels, transform=val_transforms)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    print(f"Treino:     {len(train_dataset)} imagens")
    print(f"Validacao:  {len(val_dataset)} imagens")

    return train_loader, val_loader
