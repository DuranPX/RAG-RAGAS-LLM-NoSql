# ================================================================
# embedder.py — Generación de embeddings con all-MiniLM-L6-v2
# Convierte texto en vectores de 384 dimensiones
# ================================================================

from sentence_transformers import SentenceTransformer
import numpy as np

# Modelo del proyecto (384 dimensiones)
MODEL_NAME = "all-MiniLM-L6-v2"

# Se carga una sola vez al importar el módulo (singleton)
_model = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"[embedder] Cargando modelo {MODEL_NAME}...")
        _model = SentenceTransformer(MODEL_NAME)
        print(f"[embedder] Modelo cargado correctamente")
    return _model


def embed_texto(texto: str) -> list[float]:
    """
    Genera el embedding de un texto.
    Equivalente a emb_letra vector(384) del SQL original.
    
    Args:
        texto: texto a vectorizar (letra, descripcion, chunk)
    Returns:
        lista de 384 floats
    """
    model = get_model()
    vector = model.encode(texto, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(textos: list[str]) -> list[list[float]]:
    """
    Genera embeddings para una lista de textos de una sola vez.
    Más eficiente que llamar embed_texto() en un loop.
    
    Args:
        textos: lista de textos a vectorizar
    Returns:
        lista de vectores, cada uno de 384 floats
    """
    model = get_model()
    vectores = model.encode(textos, normalize_embeddings=True, show_progress_bar=True)
    return vectores.tolist()


def similitud_coseno(vec1: list[float], vec2: list[float]) -> float:
    """
    Calcula similitud coseno entre dos vectores.
    Equivalente al operador <=> de pgvector en el SQL original.
    
    Args:
        vec1, vec2: vectores de 384 dimensiones
    Returns:
        float entre 0 y 1 (1 = identicos, 0 = sin relacion)
    """
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))