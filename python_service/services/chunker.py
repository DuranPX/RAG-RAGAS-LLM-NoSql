# ================================================================
# chunker.py — Fragmentación de texto con 3 estrategias
# Genera chunks para el pipeline RAG
#
# Estrategias implementadas:
#   1. fixed-size     — bloques de N palabras fijo
#   2. sentence-aware — respeta oraciones completas
#   3. semantic       — agrupa oraciones por similitud semántica
#
# NOTA: el import de embedder está dentro de chunk_semantic()
# para que fixed-size y sentence-aware no carguen el modelo de IA
# y sean instantáneas.
# ================================================================

import re
import numpy as np


# ----------------------------------------------------------------
# Utilidades comunes
# ----------------------------------------------------------------

def _dividir_oraciones(texto: str) -> list:
    """
    Divide un texto en oraciones usando signos de puntuación.
    Ejemplo: "Hola mundo. Adiós." → ["Hola mundo.", "Adiós."]
    """
    oraciones = re.split(r'(?<=[.!?])\s+', texto.strip())
    return [o.strip() for o in oraciones if o.strip()]


def _similitud_coseno(v1: list, v2: list) -> float:
    """
    Calcula similitud coseno entre dos vectores.
    Devuelve un número entre 0 y 1.
    1 = idénticos, 0 = sin relación semántica.
    Equivalente al operador <=> de pgvector en el SQL original.
    """
    a = np.array(v1)
    b = np.array(v2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# ----------------------------------------------------------------
# Estrategia 1: fixed-size
# Corta el texto en bloques de N palabras fijo con overlap opcional.
# Es la estrategia más simple y predecible.
# Útil para textos uniformes donde no importa el contexto.
# ----------------------------------------------------------------

def chunk_fixed_size(texto: str, chunk_size: int = 100, overlap: int = 20) -> list:
    """
    Fragmenta texto en bloques de tamaño fijo por palabras.

    Args:
        texto:      texto a fragmentar (letra de canción, descripción)
        chunk_size: número de palabras por chunk (default: 100)
        overlap:    palabras compartidas entre chunks consecutivos (default: 20)
                    el overlap evita perder contexto en los cortes
    Returns:
        lista de dicts listos para insertar en la colección chunks de MongoDB
    """
    palabras = texto.split()
    chunks = []
    idx = 0
    paso = max(1, chunk_size - overlap)  # evitar paso 0 o negativo

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


# ----------------------------------------------------------------
# Estrategia 2: sentence-aware
# Agrupa oraciones completas hasta alcanzar un límite de palabras.
# Respeta el sentido de cada oración, no corta a la mitad.
# Mejor que fixed-size para textos con estructura narrativa.
# ----------------------------------------------------------------

def chunk_sentence_aware(texto: str, max_palabras: int = 80, overlap_oraciones: int = 1) -> list:
    """
    Fragmenta texto respetando límites de oraciones completas.

    Args:
        texto:              texto a fragmentar
        max_palabras:       máximo de palabras por chunk (default: 80)
        overlap_oraciones:  oraciones compartidas entre chunks (default: 1)
                            ayuda a mantener contexto entre fragmentos
    Returns:
        lista de dicts listos para insertar en la colección chunks de MongoDB
    """
    oraciones = _dividir_oraciones(texto)
    chunks = []
    i = 0

    while i < len(oraciones):
        grupo = []
        n_palabras = 0
        inicio = i  # guardar posición inicial para calcular avance real

        # Agregar oraciones al grupo mientras no se supere el límite
        while i < len(oraciones):
            palabras_oracion = len(oraciones[i].split())
            # Si agregar esta oración supera el límite y ya hay contenido, parar
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

        # Calcular retroceso para el overlap evitando bucle infinito
        # Si no avanzamos nada, forzar avance de al menos 1
        retroceso = max(1, i - inicio - overlap_oraciones)
        i = inicio + retroceso

    return chunks


# ----------------------------------------------------------------
# Estrategia 3: semantic
# Agrupa oraciones por similitud semántica usando embeddings.
# Es la estrategia más inteligente: detecta cambios de tema.
# Requiere cargar el modelo all-MiniLM-L6-v2 (más lenta).
# ----------------------------------------------------------------

def chunk_semantic(texto: str, umbral_similitud: float = 0.75, max_oraciones: int = 8) -> list:
    """
    Fragmenta texto agrupando oraciones semánticamente similares.
    Cuando detecta un cambio de tema, cierra el chunk actual y abre uno nuevo.

    Args:
        texto:             texto a fragmentar
        umbral_similitud:  similitud coseno mínima para seguir en el mismo chunk
                           (0-1, default: 0.75)
        max_oraciones:     máximo de oraciones por chunk
    Returns:
        lista de dicts listos para insertar en la colección chunks de MongoDB
    """
    # Import aquí adentro para no cargar el modelo cuando no se usa esta estrategia
    from services.embedder import embed_batch

    oraciones = _dividir_oraciones(texto)

    if not oraciones:
        return []

    # Generar embeddings de todas las oraciones de una sola vez (más eficiente)
    embeddings = embed_batch(oraciones)

    chunks = []
    grupo = [oraciones[0]]
    emb_grupo = [embeddings[0]]

    for i in range(1, len(oraciones)):
        # Calcular el centroide semántico del grupo actual
        centroide = np.mean(emb_grupo, axis=0).tolist()
        # Medir similitud de la oración actual con el centroide del grupo
        sim = _similitud_coseno(embeddings[i], centroide)

        if sim >= umbral_similitud and len(grupo) < max_oraciones:
            # La oración es semánticamente similar al grupo, agregarla
            grupo.append(oraciones[i])
            emb_grupo.append(embeddings[i])
        else:
            # Ruptura semántica detectada, cerrar chunk y empezar uno nuevo
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

    # Guardar el último grupo pendiente
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
# Punto de entrada único para todas las estrategias.
# ----------------------------------------------------------------

def chunkear_texto(texto: str, estrategia: str = "sentence-aware", **kwargs) -> list:
    """
    Selecciona y ejecuta la estrategia de chunking indicada.

    Args:
        texto:      texto a fragmentar (letra de canción, descripción, etc.)
        estrategia: 'fixed-size' | 'sentence-aware' | 'semantic'
        **kwargs:   parámetros opcionales específicos de cada estrategia
                    fixed-size:     chunk_size=100, overlap=20
                    sentence-aware: max_palabras=80, overlap_oraciones=1
                    semantic:       umbral_similitud=0.75, max_oraciones=8
    Returns:
        lista de chunks listos para insertar en MongoDB colección chunks
    Raises:
        ValueError: si la estrategia no es válida
    """
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