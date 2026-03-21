import sys
sys.path.insert(0, '.')

from services.chunker import chunk_fixed_size, chunk_sentence_aware

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