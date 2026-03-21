# ================================================================
# chunker.py — Fragmentación de texto con 3 estrategias
# Genera chunks para el pipeline RAG
#
# Estrategias implementadas:
#   1. fixed-size    — bloques de N palabras fijo
#   2. sentence-aware — respeta oraciones completas
#   3. semantic      — agrupa oraciones por similitud semántica
# ================================================================

import re
from embedder import embed_batch
import numpy as np


# ----------------------------------------------------------------
# Utilidades comunes
# ----------------------------------------------------------------

def _dividir_oraciones(texto: str) -> list[str]:
    """Divide un texto en oraciones usando puntuación."""
    oraciones = re.split(r'(?<=[.!?])\s+', texto.strip())
    return [o.strip() for o in oraciones if o.strip()]


def _similitud_coseno(v1: list[float], v2: list[float]) -> float:
    a = np.array(v1)
    b = np.array(v2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# ----------------------------------------------------------------
# Estrategia 1: fixed-size
# Corta el texto en bloques de N palabras con overlap opcional
# ----------------------------------------------------------------

def chunk_fixed_size(
    texto: str,
    chunk_size: int = 100,
    overlap: int = 20
) -> list[dict]:
    """
    Fragmenta texto en bloques de tamaño fijo por palabras.
    
    Args:
        texto:      texto a fragmentar
        chunk_size: palabras por chunk
        overlap:    palabras de solapamiento entre chunks
    Returns:
        lista de dicts con chunk_texto, chunk_index, metadata
    """
    palabras = texto.split()
    chunks = []
    idx = 0
    paso = chunk_size - overlap

    while idx < len(palabras):
        fragmento = palabras[idx: idx + chunk_size]
        chunks.append({
            "chunk_index":          len(chunks),
            "estrategia_chunking":  "fixed-size",
            "chunk_texto":          " ".join(fragmento),
            "metadata": {
                "chunk_size": chunk_size,
                "overlap":    overlap,
                "n_palabras": len(fragmento)
            }
        })
        idx += paso

    return chunks


# ----------------------------------------------------------------
# Estrategia 2: sentence-aware
# Agrupa oraciones hasta alcanzar un límite de palabras
# ----------------------------------------------------------------

def chunk_sentence_aware(
    texto: str,
    max_palabras: int = 80,
    overlap_oraciones: int = 1
) -> list[dict]:
    """
    Fragmenta texto respetando límites de oraciones.
    
    Args:
        texto:              texto a fragmentar
        max_palabras:       máximo de palabras por chunk
        overlap_oraciones:  oraciones de solapamiento entre chunks
    Returns:
        lista de dicts con chunk_texto, chunk_index, metadata
    """
    oraciones = _dividir_oraciones(texto)
    chunks = []
    i = 0

    while i < len(oraciones):
        grupo = []
        n_palabras = 0

        while i < len(oraciones):
            palabras_oracion = len(oraciones[i].split())
            if n_palabras + palabras_oracion > max_palabras and grupo:
                break
            grupo.append(oraciones[i])
            n_palabras += palabras_oracion
            i += 1

        chunks.append({
            "chunk_index":         len(chunks),
            "estrategia_chunking": "sentence-aware",
            "chunk_texto":         " ".join(grupo),
            "metadata": {
                "max_palabras":    max_palabras,
                "n_oraciones":     len(grupo),
                "n_palabras":      n_palabras
            }
        })

        # Overlap: retroceder overlap_oraciones para el siguiente chunk
        i -= overlap_oraciones

    return chunks


# ----------------------------------------------------------------
# Estrategia 3: semantic
# Agrupa oraciones por similitud semántica usando embeddings
# ----------------------------------------------------------------

def chunk_semantic(
    texto: str,
    umbral_similitud: float = 0.75,
    max_oraciones: int = 8
) -> list[dict]:
    """
    Fragmenta texto agrupando oraciones semánticamente similares.
    Usa embeddings de all-MiniLM-L6-v2 para medir similitud.
    
    Args:
        texto:             texto a fragmentar
        umbral_similitud:  similitud mínima coseno para agrupar (0-1)
        max_oraciones:     máximo de oraciones por chunk
    Returns:
        lista de dicts con chunk_texto, chunk_index, metadata
    """
    oraciones = _dividir_oraciones(texto)

    if not oraciones:
        return []

    # Generar embeddings de todas las oraciones de una vez
    embeddings = embed_batch(oraciones)

    chunks = []
    grupo = [oraciones[0]]
    emb_grupo = [embeddings[0]]

    for i in range(1, len(oraciones)):
        # Comparar la oracion actual con el centroide del grupo actual
        centroide = np.mean(emb_grupo, axis=0).tolist()
        sim = _similitud_coseno(embeddings[i], centroide)

        if sim >= umbral_similitud and len(grupo) < max_oraciones:
            # La oracion es semanticamente similar, se agrega al grupo
            grupo.append(oraciones[i])
            emb_grupo.append(embeddings[i])
        else:
            # Ruptura semantica — cerrar chunk actual y empezar uno nuevo
            chunks.append({
                "chunk_index":         len(chunks),
                "estrategia_chunking": "semantic",
                "chunk_texto":         " ".join(grupo),
                "metadata": {
                    "umbral_similitud": umbral_similitud,
                    "n_oraciones":      len(grupo),
                    "similitud_corte":  round(sim, 4)
                }
            })
            grupo = [oraciones[i]]
            emb_grupo = [embeddings[i]]

    # Ultimo grupo
    if grupo:
        chunks.append({
            "chunk_index":         len(chunks),
            "estrategia_chunking": "semantic",
            "chunk_texto":         " ".join(grupo),
            "metadata": {
                "umbral_similitud": umbral_similitud,
                "n_oraciones":      len(grupo),
                "similitud_corte":  1.0
            }
        })

    return chunks


# ----------------------------------------------------------------
# Función principal: chunker universal
# ----------------------------------------------------------------

def chunkear_texto(
    texto: str,
    estrategia: str = "sentence-aware",
    **kwargs
) -> list[dict]:
    """
    Punto de entrada único para chunking.
    Llama a la estrategia correcta según el parámetro.

    Args:
        texto:     texto a fragmentar
        estrategia: 'fixed-size' | 'sentence-aware' | 'semantic'
        **kwargs:  parámetros opcionales de cada estrategia
    Returns:
        lista de chunks listos para insertar en MongoDB
    """
    if estrategia == "fixed-size":
        return chunk_fixed_size(texto, **kwargs)
    elif estrategia == "sentence-aware":
        return chunk_sentence_aware(texto, **kwargs)
    elif estrategia == "semantic":
        return chunk_semantic(texto, **kwargs)
    else:
        raise ValueError(f"Estrategia desconocida: {estrategia}. Usa fixed-size, sentence-aware o semantic.")