import torch
from torchvision import transforms

from config import CATEGORIES, DEVICE, IMG_SIZE, IMAGENET_MEAN, IMAGENET_STD
from ml.preprocessing import preprocess_frame

val_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


def classify_frame(frame_bgr, model):
    """Classifica o objeto principal no frame.

    Returns (label: str, confidence: float, probs: np.ndarray)
    """
    model.eval()
    img_pil = preprocess_frame(frame_bgr)
    img_tensor = val_transforms(img_pil).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs, dim=1)[0].cpu().numpy()

    pred_idx = int(probs.argmax())
    return CATEGORIES[pred_idx], float(probs[pred_idx]), probs
