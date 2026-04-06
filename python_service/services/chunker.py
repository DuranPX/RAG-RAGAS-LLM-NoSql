import re
import numpy as np


def _dividir_oraciones(texto: str) -> list:
    oraciones = re.split(r'(?<=[.!?])\s+', texto.strip())
    return [o.strip() for o in oraciones if o.strip()]


def _similitud_coseno(v1: list, v2: list) -> float:
    a = np.array(v1)
    b = np.array(v2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def chunk_fixed_size(texto: str, chunk_size: int = 100, overlap: int = 20) -> list:
    palabras = texto.split()
    chunks = []
    idx = 0
    paso = max(1, chunk_size - overlap)

    while idx < len(palabras):
        fragmento = palabras[idx: idx + chunk_size]
        chunks.append({
            "chunk_index":         len(chunks),
            "estrategia_chunking": "fixed-size",
            "chunk_texto":         " ".join(fragmento),
            "metadata": {
                "chunk_size": chunk_size,
                "overlap":    overlap,
                "n_palabras": len(fragmento)
            }
        })
        idx += paso

    return chunks


def chunk_sentence_aware(texto: str, max_palabras: int = 80, overlap_oraciones: int = 1) -> list:
    oraciones = _dividir_oraciones(texto)
    chunks = []
    i = 0

    while i < len(oraciones):
        grupo = []
        n_palabras = 0
        inicio = i

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
                "max_palabras": max_palabras,
                "n_oraciones":  len(grupo),
                "n_palabras":   n_palabras
            }
        })

        retroceso = max(1, i - inicio - overlap_oraciones)
        i = inicio + retroceso

    return chunks


def chunk_semantic(texto: str, umbral_similitud: float = 0.75, max_oraciones: int = 8) -> list:
    from services.embedder import embed_batch

    oraciones = _dividir_oraciones(texto)

    if not oraciones:
        return []

    embeddings = embed_batch(oraciones)

    chunks = []
    grupo = [oraciones[0]]
    emb_grupo = [embeddings[0]]

    for i in range(1, len(oraciones)):
        centroide = np.mean(emb_grupo, axis=0).tolist()
        sim = _similitud_coseno(embeddings[i], centroide)

        if sim >= umbral_similitud and len(grupo) < max_oraciones:
            grupo.append(oraciones[i])
            emb_grupo.append(embeddings[i])
        else:
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


def chunkear_texto(texto: str, estrategia: str = "sentence-aware", **kwargs) -> list:
    if estrategia == "fixed-size":
        return chunk_fixed_size(texto, **kwargs)
    elif estrategia == "sentence-aware":
        return chunk_sentence_aware(texto, **kwargs)
    elif estrategia == "semantic":
        return chunk_semantic(texto, **kwargs)
    else:
        raise ValueError(
            f"Estrategia desconocida: '{estrategia}'. "
            f"Usa 'fixed-size', 'sentence-aware' o 'semantic'."
        )