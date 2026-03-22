import re

def _dividir_oraciones(texto):
    oraciones = re.split(r'(?<=[.!?])\s+', texto.strip())
    return [o.strip() for o in oraciones if o.strip()]

def chunk_fixed_size(texto, chunk_size=100, overlap=20):
    palabras = texto.split()
    chunks = []
    idx = 0
    paso = chunk_size - overlap
    while idx < len(palabras):
        fragmento = palabras[idx: idx + chunk_size]
        chunks.append({
            "chunk_index": len(chunks),
            "estrategia_chunking": "fixed-size",
            "chunk_texto": " ".join(fragmento),
            "metadata": {"chunk_size": chunk_size, "overlap": overlap, "n_palabras": len(fragmento)}
        })
        idx += paso
    return chunks

def chunk_sentence_aware(texto, max_palabras=80, overlap_oraciones=1):
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
            "chunk_index": len(chunks),
            "estrategia_chunking": "sentence-aware",
            "chunk_texto": " ".join(grupo),
            "metadata": {"max_palabras": max_palabras, "n_oraciones": len(grupo), "n_palabras": n_palabras}
        })
        i -= overlap_oraciones
    return chunks

letra = "Es de noche y te pienso. Las estrellas me recuerdan tu mirada. El viento trae tu nombre. Mañana sera otro dia sin ti. El sol saldra pero tu no estaras. La vida sigue aunque duela."

chunks_fixed = chunk_fixed_size(letra, chunk_size=10)
print("=== FIXED-SIZE ===")
print("Total chunks:", len(chunks_fixed))
for c in chunks_fixed:
    print(c)

chunks_sentence = chunk_sentence_aware(letra, max_palabras=15)
print("\n=== SENTENCE-AWARE ===")
print("Total chunks:", len(chunks_sentence))
for c in chunks_sentence:
    print(c)