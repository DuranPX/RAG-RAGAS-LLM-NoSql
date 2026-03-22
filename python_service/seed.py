import sys
import os

# Asegurar que el directorio de trabajo es parte del path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bson import ObjectId
import hashlib
from datetime import datetime

from services.db import get_db
from services.embedder import embed_texto
from services.image_embedder import get_image_embedding
from services.chunker import chunkear_texto
from services.itunes import obtener_portada_itunes

def make_oid(tipo: str, id_num: int) -> ObjectId:
    """Generador determinístico de ObjectId basado en strings estables."""
    hash_hex = hashlib.md5(f"{tipo}:{id_num}".encode('utf-8')).hexdigest()
    return ObjectId(hash_hex[:24])

USER_IDS = [make_oid("user", 1), make_oid("user", 2), make_oid("user", 3)]
ARTIST_IDS = [make_oid("artist", 1), make_oid("artist", 2), make_oid("artist", 3), make_oid("artist", 4)]
ALBUM_IDS = [make_oid("album", i) for i in range(1, 9)]
SONG_IDS = [make_oid("song", i) for i in range(1, 9)]
PLAYLIST_IDS = [make_oid("playlist", i) for i in range(1, 5)]

# Datos crudos para el seed
RAW_ARTISTS = [
    {"_id": ARTIST_IDS[0], "nombre": "The Velvet Underground", "pais": "USA", "generos": ["rock", "art rock"], "fecha_formacion": datetime(1964, 1, 1), "descripcion": "Banda influyente de Nueva York, pioneros del art rock con Lou Reed."},
    {"_id": ARTIST_IDS[1], "nombre": "Miles Davis", "pais": "USA", "generos": ["jazz", "bebop"], "fecha_formacion": datetime(1944, 1, 1), "descripcion": "Trompetista legendario, figura clave en la historia del jazz."},
    {"_id": ARTIST_IDS[2], "nombre": "Björk", "pais": "Iceland", "generos": ["electronic", "experimental"], "fecha_formacion": datetime(1977, 1, 1), "descripcion": "Cantante y productora islandesa conocida por su estilo ecléctico y vanguardista."},
    {"_id": ARTIST_IDS[3], "nombre": "Daft Punk", "pais": "France", "generos": ["electronic", "house"], "fecha_formacion": datetime(1993, 1, 1), "descripcion": "Dúo francés pionero del french house y la música electrónica."}
]

RAW_ALBUMS = [
    {"_id": ALBUM_IDS[0], "id_artista": ARTIST_IDS[0], "titulo": "The Velvet Underground & Nico", "anio_lanzamiento": 1967, "tipo": "album"},
    {"_id": ALBUM_IDS[1], "id_artista": ARTIST_IDS[0], "titulo": "White Light/White Heat", "anio_lanzamiento": 1968, "tipo": "album"},
    {"_id": ALBUM_IDS[2], "id_artista": ARTIST_IDS[1], "titulo": "Kind of Blue", "anio_lanzamiento": 1959, "tipo": "album"},
    {"_id": ALBUM_IDS[3], "id_artista": ARTIST_IDS[1], "titulo": "Bitches Brew", "anio_lanzamiento": 1970, "tipo": "album"},
    {"_id": ALBUM_IDS[4], "id_artista": ARTIST_IDS[2], "titulo": "Homogenic", "anio_lanzamiento": 1997, "tipo": "album"},
    {"_id": ALBUM_IDS[5], "id_artista": ARTIST_IDS[2], "titulo": "Vespertine", "anio_lanzamiento": 2001, "tipo": "album"},
    {"_id": ALBUM_IDS[6], "id_artista": ARTIST_IDS[3], "titulo": "Discovery", "anio_lanzamiento": 2001, "tipo": "album"},
    {"_id": ALBUM_IDS[7], "id_artista": ARTIST_IDS[3], "titulo": "Random Access Memories", "anio_lanzamiento": 2013, "tipo": "album"}
]

RAW_SONGS = [
    {"_id": SONG_IDS[0], "id_artista": ARTIST_IDS[0], "id_album": ALBUM_IDS[0], "titulo": "Sunday Morning", "duracion": 174, "genero": "rock", "idioma": "en", "es_explicita": False, "letra": "Sunday morning, praise the dawning It's just a restless feeling by my side Early dawning, Sunday morning It's just the wasted years so close behind"},
    {"_id": SONG_IDS[1], "id_artista": ARTIST_IDS[0], "id_album": ALBUM_IDS[1], "titulo": "White Light/White Heat", "duracion": 167, "genero": "rock", "idioma": "en", "es_explicita": False, "letra": "White light, White light goin' messin' up my mind White light, and don't you know its gonna make me go blind White heat, aww white heat it tickle me down to my toes"},
    {"_id": SONG_IDS[2], "id_artista": ARTIST_IDS[1], "id_album": ALBUM_IDS[2], "titulo": "So What", "duracion": 562, "genero": "jazz", "idioma": "en", "es_explicita": False, "letra": "[Instrumental]"},
    {"_id": SONG_IDS[3], "id_artista": ARTIST_IDS[1], "id_album": ALBUM_IDS[3], "titulo": "Miles Runs the Voodoo Down", "duracion": 843, "genero": "jazz", "idioma": "en", "es_explicita": False, "letra": "[Instrumental]"},
    {"_id": SONG_IDS[4], "id_artista": ARTIST_IDS[2], "id_album": ALBUM_IDS[4], "titulo": "Jóga", "duracion": 305, "genero": "electronic", "idioma": "en", "es_explicita": False, "letra": "All these accidents that happen Follow the dot Coincidence makes sense Only with you You don't have to speak I feel Emotional landscapes They puzzle me"},
    {"_id": SONG_IDS[5], "id_artista": ARTIST_IDS[2], "id_album": ALBUM_IDS[5], "titulo": "Hidden Place", "duracion": 328, "genero": "electronic", "idioma": "en", "es_explicita": False, "letra": "Through the warmst cord of care Your love was sent to me I'm not sure what to do with it Or where to put it I'm so close to tears"},
    {"_id": SONG_IDS[6], "id_artista": ARTIST_IDS[3], "id_album": ALBUM_IDS[6], "titulo": "One More Time", "duracion": 320, "genero": "electronic", "idioma": "en", "es_explicita": False, "letra": "One more time, we're gonna celebrate Oh yeah, all right, don't stop the dancing Music's got me feeling so free We're gonna celebrate"},
    {"_id": SONG_IDS[7], "id_artista": ARTIST_IDS[3], "id_album": ALBUM_IDS[7], "titulo": "Get Lucky", "duracion": 369, "genero": "electronic", "idioma": "en", "es_explicita": False, "letra": "Like the legend of the phoenix All ends with beginnings What keeps the planet spinning The force from the beginning We've come too far to give up who we are So let's raise the bar and our cups to the stars"}
]

RAW_USERS = [
    {"_id": USER_IDS[0], "nombre": "Juan Duran", "correo": "juan@example.com", "plan_suscripcion": "family"},
    {"_id": USER_IDS[1], "nombre": "Maria Perez", "correo": "maria@example.com", "plan_suscripcion": "free"},
    {"_id": USER_IDS[2], "nombre": "Alex Ostrer", "correo": "alex@example.com", "plan_suscripcion": "premium"}
]

def main():
    print("=" * 60)
    print("INICIANDO SEED SCRIPT (CON ITUNES Y EMBEDDINGS OBLIGATORIOS)")
    print("=" * 60)
    db = get_db()

    # Nos aseguramos de limpiar colecciones
    for coll in ["usuarios", "artistas", "albums", "canciones", "playlists", "events", "queries", "chunks"]:
        db[coll].delete_many({})

    # Usuarios
    db["usuarios"].insert_many([{**u, "tiempo_escucha": 0, "fecha_registro": datetime.now()} for u in RAW_USERS])
    print(f"1. Insertados {len(RAW_USERS)} Usuarios")

    # Artistas
    artistas_para_insertar = []
    artista_map = {} 
    
    for a in RAW_ARTISTS:
        emb = embed_texto(a["descripcion"])
        doc = {**a, "emb_descripcion": emb}
        artistas_para_insertar.append(doc)
        artista_map[a["_id"]] = a["nombre"]

    db["artistas"].insert_many(artistas_para_insertar)
    print(f"2. Insertados {len(artistas_para_insertar)} Artistas")

    # Albums
    albums_para_insertar = []
    album_cover_map = {} 
    
    for al in RAW_ALBUMS:
        nombre_artista = artista_map[al["id_artista"]]
        titulo_album = al["titulo"]
        
        print(f"   Buscando portada para: {titulo_album}...")
        portada_dict = obtener_portada_itunes(nombre_artista, titulo_album)
        
        doc = {**al}

        if portada_dict and portada_dict.get("url"):
            url = portada_dict["url"]
            doc["portada"] = portada_dict
            album_cover_map[al["_id"]] = url
            
            print(f"   Generando embedding CLIP para imagen: {url}...")
            emb_portada = get_image_embedding(url)
            doc["emb_portada"] = emb_portada
        else:
            print(f"   Aviso: No se encontro portada para {titulo_album}.")
            
        albums_para_insertar.append(doc)

    db["albums"].insert_many(albums_para_insertar)
    print(f"3. Insertados {len(albums_para_insertar)} Albums")

    # Canciones
    canciones_para_insertar = []
    cancion_map = {}

    for s in RAW_SONGS:
        print(f"   Generando embedding para: {s['titulo']}...")
        emb_letra = embed_texto(s["letra"])
        
        nombre_artista = artista_map[s["id_artista"]]
        portada = album_cover_map.get(s["id_album"], None)
        
        doc = {
            **s, 
            "emb_letra": emb_letra,
            "artista": {"_id": s["id_artista"], "nombre": nombre_artista},
            "album": {"_id": s["id_album"], "titulo": next(a["titulo"] for a in RAW_ALBUMS if a["_id"] == s["id_album"])},
            "fecha_ingreso": datetime.now()
        }
        if portada:
            doc["portada_url"] = portada
            
        canciones_para_insertar.append(doc)
        cancion_map[s["_id"]] = doc

    db["canciones"].insert_many(canciones_para_insertar)
    print(f"4. Insertadas {len(canciones_para_insertar)} Canciones")

    # Chunks
    chunks_para_insertar = []
    for c in canciones_para_insertar:
        fragmentos = chunkear_texto(c["letra"], estrategia="sentence-aware", max_palabras=40)
        for chunk in fragmentos:
            chunk["id_documento"] = c["_id"]
            chunk["tipo_documento"] = "cancion"
            chunk["embedding"] = embed_texto(chunk["chunk_texto"])
            chunks_para_insertar.append(chunk)

    if chunks_para_insertar:
        db["chunks"].insert_many(chunks_para_insertar)
        print(f"5. Insertados {len(chunks_para_insertar)} Chunks")

    # Playlists
    playlist_docs = [
        {"_id": PLAYLIST_IDS[0], "id_usuario": USER_IDS[0], "titulo": "Rock Clásico", "descripcion": "Mis favoritas de Velvet.", "visibilidad": "public", "fecha_creacion": datetime.now(), "canciones": [
            {"id_cancion": SONG_IDS[0], "titulo": cancion_map[SONG_IDS[0]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[0]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[0]].get("portada_url"), "duracion": cancion_map[SONG_IDS[0]]["duracion"]},
            {"id_cancion": SONG_IDS[1], "titulo": cancion_map[SONG_IDS[1]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[1]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[1]].get("portada_url"), "duracion": cancion_map[SONG_IDS[1]]["duracion"]}
        ]},
        {"_id": PLAYLIST_IDS[1], "id_usuario": USER_IDS[0], "titulo": "Jazz Masters", "descripcion": "Miles y más.", "visibilidad": "private", "fecha_creacion": datetime.now(), "canciones": [
            {"id_cancion": SONG_IDS[2], "titulo": cancion_map[SONG_IDS[2]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[2]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[2]].get("portada_url"), "duracion": cancion_map[SONG_IDS[2]]["duracion"]}
        ]},
        {"_id": PLAYLIST_IDS[2], "id_usuario": USER_IDS[1], "titulo": "Electrónica Cool", "descripcion": "", "visibilidad": "public", "fecha_creacion": datetime.now(), "canciones": [
            {"id_cancion": SONG_IDS[4], "titulo": cancion_map[SONG_IDS[4]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[4]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[4]].get("portada_url"), "duracion": cancion_map[SONG_IDS[4]]["duracion"]},
            {"id_cancion": SONG_IDS[6], "titulo": cancion_map[SONG_IDS[6]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[6]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[6]].get("portada_url"), "duracion": cancion_map[SONG_IDS[6]]["duracion"]}
        ]}
    ]
    db["playlists"].insert_many(playlist_docs)
    print(f"6. Insertadas {len(playlist_docs)} Playlists")

    # Queries
    query_docs = [
        {"id_usuario": USER_IDS[0], "texto_busqueda": "musica relajante", "filtros_aplicados": {"genero": "rock"}, "vector_embedding": embed_texto("musica relajante"), "fecha_busqueda": datetime.now()},
    ]
    db["queries"].insert_many(query_docs)
    print(f"7. Insertadas {len(query_docs)} Consultas")

    print("\n" + "=" * 60)
    print("SEED SCRIPT FINALIZADO")
    print("=" * 60)

if __name__ == "__main__":
    main()
