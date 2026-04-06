from sentence_transformers import SentenceTransformer
import numpy as np

MODEL_NAME = "all-MiniLM-L6-v2"
_model = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def embed_texto(texto: str) -> list[float]:
    model = get_model()
    vector = model.encode(texto, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(textos: list[str]) -> list[list[float]]:
    model = get_model()
    vectores = model.encode(textos, normalize_embeddings=True, show_progress_bar=True)
    return vectores.tolist()


def similitud_coseno(vec1: list[float], vec2: list[float]) -> float:
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))