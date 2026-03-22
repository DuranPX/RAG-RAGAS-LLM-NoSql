# image_embedder.py — Generación de embeddings con OpenCLIP

import torch
import open_clip
from PIL import Image
import requests
from io import BytesIO

# Se carga una sola vez (singleton)
_model = None
_preprocess = None

def get_clip_model():
    """
    Carga el modelo OpenCLIP (ViT-B-32 preentrenado en LAION).
    Esto es un proceso pesado, así que se hace lazy.
    Los embeddings generados serán de 512 dimensiones.
    """
    global _model, _preprocess
    if _model is None or _preprocess is None:
        print("[image_embedder] Cargando modelo OpenCLIP ViT-B-32-laion2b_s34b_b79k...")
        _model, _, _preprocess = open_clip.create_model_and_transforms(
            "ViT-B-32", pretrained="laion2b_s34b_b79k"
        )
        _model.eval()
        print("[image_embedder] Modelo cargado correctamente.")
    
    return _model, _preprocess


def get_image_embedding(image_url: str) -> list[float]:
    """
    Descarga una imagen y genera su embedding (512-dim).
    Si hay error, lanzará la excepción.
    """
    model, preprocess = get_clip_model()

    response = requests.get(image_url, timeout=15)
    response.raise_for_status()

    image = Image.open(BytesIO(response.content)).convert("RGB")
    image_input = preprocess(image).unsqueeze(0)

    with torch.no_grad():
        image_features = model.encode_image(image_input)

    # Normalizar dimensiones vectoriales
    image_features /= image_features.norm(dim=-1, keepdim=True)

    return image_features[0].cpu().tolist()