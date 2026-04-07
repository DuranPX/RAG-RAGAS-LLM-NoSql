import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bson import ObjectId
import hashlib
from datetime import datetime, timedelta

from services.db import get_db
from services.embedder import embed_texto
from services.image_embedder import get_image_embedding
from services.chunker import chunkear_texto
from services.itunes import obtener_portada_itunes


def make_oid(tipo: str, id_num: int) -> ObjectId:
    hash_hex = hashlib.md5(f"{tipo}:{id_num}".encode('utf-8')).hexdigest()
    return ObjectId(hash_hex[:24])


USER_IDS = [make_oid("user", 1), make_oid("user", 2), make_oid("user", 3)]
<<<<<<< HEAD
ARTIST_IDS = [make_oid("artist", 1), make_oid("artist", 2), make_oid("artist", 3), make_oid("artist", 4)]
ALBUM_IDS = [make_oid("album", i) for i in range(1, 9)]
SONG_IDS = [make_oid("song", i) for i in range(1, 9)]
PLAYLIST_IDS = [make_oid("playlist", i) for i in range(1, 5)]
GENRE_IDS = [make_oid("genre", i) for i in range(1, 6)]
=======
ARTIST_IDS = [make_oid("artist", i) for i in range(1, 18)]
ALBUM_IDS = [make_oid("album", i) for i in range(1, 28)]
SONG_IDS = [make_oid("song", i) for i in range(1, 23)]
PLAYLIST_IDS = [make_oid("playlist", i) for i in range(1, 5)]
GENRE_IDS = [make_oid("genre", i) for i in range(1, 14)]
>>>>>>> d8b8bf90163fbb324cc4d24d65b7c89b4c058133
REVIEW_IDS = [make_oid("review", i) for i in range(1, 5)]
EVAL_IDS = [make_oid("eval", i) for i in range(1, 3)]

EMOCIONES_POR_CANCION = {
    0: ["nostalgia", "serenidad"],
    1: ["euforia", "agresividad"],
    2: ["calma", "introspección"],
    3: ["euforia", "intensidad"],
    4: ["melancolía", "asombro"],
    5: ["ternura", "melancolía"],
    6: ["euforia", "alegría"],
<<<<<<< HEAD
    7: ["alegría", "nostalgia", "esperanza"]
}

RAW_GENRES = [
    {"_id": GENRE_IDS[0], "nombre": "rock", "descripcion": "Género musical con raíces en el rock and roll de los años 50"},
    {"_id": GENRE_IDS[1], "nombre": "jazz", "descripcion": "Género musical originado en las comunidades afroamericanas de Nueva Orleans"},
    {"_id": GENRE_IDS[2], "nombre": "electronic", "descripcion": "Música producida con instrumentos electrónicos y tecnología digital"},
    {"_id": GENRE_IDS[3], "nombre": "art rock", "descripcion": "Subgénero del rock con influencias de la música experimental y vanguardista"},
    {"_id": GENRE_IDS[4], "nombre": "house", "descripcion": "Género de música electrónica bailable originado en Chicago"}
]

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
    {"_id": SONG_IDS[0], "id_artista": ARTIST_IDS[0], "id_album": ALBUM_IDS[0], "titulo": "Sunday Morning", "duracion": 174, "genero": "rock", "idioma": "en", "letra": "Sunday morning, praise the dawning It's just a restless feeling by my side Early dawning, Sunday morning It's just the wasted years so close behind"},
    {"_id": SONG_IDS[1], "id_artista": ARTIST_IDS[0], "id_album": ALBUM_IDS[1], "titulo": "White Light/White Heat", "duracion": 167, "genero": "rock", "idioma": "en", "letra": "White light, White light goin' messin' up my mind White light, and don't you know its gonna make me go blind White heat, aww white heat it tickle me down to my toes"},
    {"_id": SONG_IDS[2], "id_artista": ARTIST_IDS[1], "id_album": ALBUM_IDS[2], "titulo": "So What", "duracion": 562, "genero": "jazz", "idioma": "en", "letra": "[Instrumental]"},
    {"_id": SONG_IDS[3], "id_artista": ARTIST_IDS[1], "id_album": ALBUM_IDS[3], "titulo": "Miles Runs the Voodoo Down", "duracion": 843, "genero": "jazz", "idioma": "en", "letra": "[Instrumental]"},
    {"_id": SONG_IDS[4], "id_artista": ARTIST_IDS[2], "id_album": ALBUM_IDS[4], "titulo": "Jóga", "duracion": 305, "genero": "electronic", "idioma": "en", "letra": "All these accidents that happen Follow the dot Coincidence makes sense Only with you You don't have to speak I feel Emotional landscapes They puzzle me"},
    {"_id": SONG_IDS[5], "id_artista": ARTIST_IDS[2], "id_album": ALBUM_IDS[5], "titulo": "Hidden Place", "duracion": 328, "genero": "electronic", "idioma": "en", "letra": "Through the warmst cord of care Your love was sent to me I'm not sure what to do with it Or where to put it I'm so close to tears"},
    {"_id": SONG_IDS[6], "id_artista": ARTIST_IDS[3], "id_album": ALBUM_IDS[6], "titulo": "One More Time", "duracion": 320, "genero": "electronic", "idioma": "en", "letra": "One more time, we're gonna celebrate Oh yeah, all right, don't stop the dancing Music's got me feeling so free We're gonna celebrate"},
    {"_id": SONG_IDS[7], "id_artista": ARTIST_IDS[3], "id_album": ALBUM_IDS[7], "titulo": "Get Lucky", "duracion": 369, "genero": "electronic", "idioma": "en", "letra": "Like the legend of the phoenix All ends with beginnings What keeps the planet spinning The force from the beginning We've come too far to give up who we are So let's raise the bar and our cups to the stars"}
=======
    7: ["alegría", "nostalgia", "esperanza"],
    # Nuevas canciones
    8:  ["nostalgia", "melancolía"],        # Carlos Vives - La Bicicleta
    9:  ["alegría", "sensualidad"],         # Shakira - Hips Don't Lie
    10: ["tristeza", "introspección"],      # Juanes - A Dios le Pido
    11: ["euforia", "alegría"],             # ChocQuibTown - De Donde Vengo Yo
    12: ["nostalgia", "melancolía"],        # Gustavo Cerati - Fantasma
    13: ["intensidad", "pasión"],           # Soda Stereo - De Música Ligera
    14: ["melancolía", "ternura"],          # Mercedes Sosa - Todo Cambia
    15: ["euforia", "libertad"],            # Fito Páez - El Amor Después del Amor
    16: ["introspección", "serenidad"],     # Aterciopelados - Bolero Falaz
    17: ["tristeza", "esperanza"],          # Jorge Drexler - Al Otro Lado del Río (bonus rioplatense)
    18: ["nostalgia", "alegría"],           # Andrés Calamaro - Flaca
    19: ["intensidad", "agresividad"],      # Los Fabulosos Cadillacs - Matador
    20: ["ternura", "melancolía"],          # Shakira - La Tortura
    21: ["euforia", "intensidad"],          # Bomba Estéreo - Fuego
}

RAW_GENRES = [
    {"_id": GENRE_IDS[0],  "nombre": "rock",             "descripcion": "Género musical con raíces en el rock and roll de los años 50"},
    {"_id": GENRE_IDS[1],  "nombre": "jazz",             "descripcion": "Género musical originado en las comunidades afroamericanas de Nueva Orleans"},
    {"_id": GENRE_IDS[2],  "nombre": "electronic",       "descripcion": "Música producida con instrumentos electrónicos y tecnología digital"},
    {"_id": GENRE_IDS[3],  "nombre": "art rock",         "descripcion": "Subgénero del rock con influencias de la música experimental y vanguardista"},
    {"_id": GENRE_IDS[4],  "nombre": "house",            "descripcion": "Género de música electrónica bailable originado en Chicago"},
    {"_id": GENRE_IDS[5],  "nombre": "vallenato",        "descripcion": "Género folclórico colombiano originado en la región Caribe, patrimonio cultural de la humanidad"},
    {"_id": GENRE_IDS[6],  "nombre": "cumbia",           "descripcion": "Ritmo colombiano de origen afroindígena, ampliamente difundido en Latinoamérica"},
    {"_id": GENRE_IDS[7],  "nombre": "pop latino",       "descripcion": "Variante latinoamericana del pop con influencias de ritmos locales"},
    {"_id": GENRE_IDS[8],  "nombre": "rock argentino",   "descripcion": "Movimiento rockero surgido en Argentina en los años 60, con identidad propia en español"},
    {"_id": GENRE_IDS[9],  "nombre": "folklore",         "descripcion": "Música tradicional latinoamericana que preserva la identidad cultural de los pueblos"},
    {"_id": GENRE_IDS[10], "nombre": "tropical",         "descripcion": "Género bailable colombiano con influencias caribeñas y africanas"},
    {"_id": GENRE_IDS[11], "nombre": "electro-cumbia",   "descripcion": "Fusión de cumbia tradicional con producción electrónica contemporánea"},
    {"_id": GENRE_IDS[12], "nombre": "tango",            "descripcion": "Género rioplatense de origen argentino-uruguayo, declarado patrimonio cultural de la humanidad"},
]

RAW_ARTISTS = [
    # Originales
    {"_id": ARTIST_IDS[0], "nombre": "The Velvet Underground", "pais": "USA",       "generos": ["rock", "art rock"],          "fecha_formacion": datetime(1964, 1, 1), "descripcion": "Banda influyente de Nueva York, pioneros del art rock con Lou Reed."},
    {"_id": ARTIST_IDS[1], "nombre": "Miles Davis",            "pais": "USA",       "generos": ["jazz", "bebop"],             "fecha_formacion": datetime(1944, 1, 1), "descripcion": "Trompetista legendario, figura clave en la historia del jazz."},
    {"_id": ARTIST_IDS[2], "nombre": "Björk",                  "pais": "Iceland",   "generos": ["electronic", "experimental"],"fecha_formacion": datetime(1977, 1, 1), "descripcion": "Cantante y productora islandesa conocida por su estilo ecléctico y vanguardista."},
    {"_id": ARTIST_IDS[3], "nombre": "Daft Punk",              "pais": "France",    "generos": ["electronic", "house"],       "fecha_formacion": datetime(1993, 1, 1), "descripcion": "Dúo francés pionero del french house y la música electrónica."},

    # Colombianos
    {"_id": ARTIST_IDS[4], "nombre": "Carlos Vives",           "pais": "Colombia",  "generos": ["vallenato", "pop latino", "tropical"],  "fecha_formacion": datetime(1986, 1, 1), "descripcion": "Cantante y compositor samario que modernizó el vallenato fusionándolo con el rock y el pop."},
    {"_id": ARTIST_IDS[5], "nombre": "Shakira",                "pais": "Colombia",  "generos": ["pop latino", "rock"],                   "fecha_formacion": datetime(1991, 1, 1), "descripcion": "Artista barranquillera de fama mundial, conocida por fusionar el pop con ritmos árabes y latinos."},
    {"_id": ARTIST_IDS[6], "nombre": "Juanes",                 "pais": "Colombia",  "generos": ["rock", "pop latino"],                   "fecha_formacion": datetime(1994, 1, 1), "descripcion": "Guitarrista y cantautor antioqueño, uno de los artistas latinos más galardonados con múltiples Grammy."},
    {"_id": ARTIST_IDS[7], "nombre": "ChocQuibTown",           "pais": "Colombia",  "generos": ["tropical", "hip-hop", "cumbia"],        "fecha_formacion": datetime(2000, 1, 1), "descripcion": "Agrupación del Chocó que fusiona el hip-hop con ritmos del Pacífico colombiano."},
    {"_id": ARTIST_IDS[8], "nombre": "Aterciopelados",         "pais": "Colombia",  "generos": ["rock", "pop latino", "cumbia"],         "fecha_formacion": datetime(1990, 1, 1), "descripcion": "Banda bogotana liderada por Andrea Echeverri, referente del rock alternativo latinoamericano."},
    {"_id": ARTIST_IDS[9], "nombre": "Bomba Estéreo",          "pais": "Colombia",  "generos": ["electro-cumbia", "tropical", "electronic"], "fecha_formacion": datetime(2005, 1, 1), "descripcion": "Dúo bogotano que mezcla cumbia, champeta y electrónica con una propuesta psicodélica y bailable."},

    # Argentinos
    {"_id": ARTIST_IDS[10], "nombre": "Soda Stereo",           "pais": "Argentina", "generos": ["rock argentino", "new wave", "pop"], "fecha_formacion": datetime(1982, 1, 1), "descripcion": "Banda liderada por Gustavo Cerati, considerada la más influyente del rock en español."},
    {"_id": ARTIST_IDS[11], "nombre": "Gustavo Cerati",        "pais": "Argentina", "generos": ["rock argentino", "electronic", "art rock"], "fecha_formacion": datetime(1992, 1, 1), "descripcion": "Compositor y guitarrista argentino, líder de Soda Stereo y prolífico solista."},
    {"_id": ARTIST_IDS[12], "nombre": "Mercedes Sosa",         "pais": "Argentina", "generos": ["folklore", "folk"],                  "fecha_formacion": datetime(1950, 1, 1), "descripcion": "La Negra, tucumana referente del folklore latinoamericano y símbolo de la resistencia cultural."},
    {"_id": ARTIST_IDS[13], "nombre": "Fito Páez",             "pais": "Argentina", "generos": ["rock argentino", "pop"],             "fecha_formacion": datetime(1982, 1, 1), "descripcion": "Pianista y compositor rosarino, autor de El amor después del amor, el disco más vendido del rock argentino."},
    {"_id": ARTIST_IDS[14], "nombre": "Andrés Calamaro",       "pais": "Argentina", "generos": ["rock argentino", "pop"],             "fecha_formacion": datetime(1979, 1, 1), "descripcion": "Prolífico músico porteño, ex Los Rodríguez, conocido por su estilo melódico y letras cotidianas."},
    {"_id": ARTIST_IDS[15], "nombre": "Los Fabulosos Cadillacs","pais": "Argentina", "generos": ["ska", "rock argentino", "cumbia"],  "fecha_formacion": datetime(1985, 1, 1), "descripcion": "Banda bonaerense que fusionó ska, reggae, cumbia y rock con una fuerte carga política y social."},
]

RAW_ALBUMS = [
    # Originales
    {"_id": ALBUM_IDS[0],  "id_artista": ARTIST_IDS[0],  "titulo": "The Velvet Underground & Nico", "anio_lanzamiento": 1967, "tipo": "album"},
    {"_id": ALBUM_IDS[1],  "id_artista": ARTIST_IDS[0],  "titulo": "White Light/White Heat",         "anio_lanzamiento": 1968, "tipo": "album"},
    {"_id": ALBUM_IDS[2],  "id_artista": ARTIST_IDS[1],  "titulo": "Kind of Blue",                   "anio_lanzamiento": 1959, "tipo": "album"},
    {"_id": ALBUM_IDS[3],  "id_artista": ARTIST_IDS[1],  "titulo": "Bitches Brew",                   "anio_lanzamiento": 1970, "tipo": "album"},
    {"_id": ALBUM_IDS[4],  "id_artista": ARTIST_IDS[2],  "titulo": "Homogenic",                      "anio_lanzamiento": 1997, "tipo": "album"},
    {"_id": ALBUM_IDS[5],  "id_artista": ARTIST_IDS[2],  "titulo": "Vespertine",                     "anio_lanzamiento": 2001, "tipo": "album"},
    {"_id": ALBUM_IDS[6],  "id_artista": ARTIST_IDS[3],  "titulo": "Discovery",                      "anio_lanzamiento": 2001, "tipo": "album"},
    {"_id": ALBUM_IDS[7],  "id_artista": ARTIST_IDS[3],  "titulo": "Random Access Memories",         "anio_lanzamiento": 2013, "tipo": "album"},

    # Colombianos
    {"_id": ALBUM_IDS[8],  "id_artista": ARTIST_IDS[4],  "titulo": "La Bicicleta",                   "anio_lanzamiento": 2016, "tipo": "single"},
    {"_id": ALBUM_IDS[9],  "id_artista": ARTIST_IDS[4],  "titulo": "Corazón Profundo",               "anio_lanzamiento": 2013, "tipo": "album"},
    {"_id": ALBUM_IDS[10], "id_artista": ARTIST_IDS[5],  "titulo": "Laundry Service",                "anio_lanzamiento": 2001, "tipo": "album"},
    {"_id": ALBUM_IDS[11], "id_artista": ARTIST_IDS[5],  "titulo": "She Wolf",                       "anio_lanzamiento": 2009, "tipo": "album"},
    {"_id": ALBUM_IDS[12], "id_artista": ARTIST_IDS[6],  "titulo": "Fíjate Bien",                    "anio_lanzamiento": 2000, "tipo": "album"},
    {"_id": ALBUM_IDS[13], "id_artista": ARTIST_IDS[6],  "titulo": "Mi Sangre",                      "anio_lanzamiento": 2004, "tipo": "album"},
    {"_id": ALBUM_IDS[14], "id_artista": ARTIST_IDS[7],  "titulo": "Somos Sur",                      "anio_lanzamiento": 2017, "tipo": "album"},
    {"_id": ALBUM_IDS[15], "id_artista": ARTIST_IDS[8],  "titulo": "El Dorado",                      "anio_lanzamiento": 1995, "tipo": "album"},
    {"_id": ALBUM_IDS[16], "id_artista": ARTIST_IDS[9],  "titulo": "Amanecer",                       "anio_lanzamiento": 2013, "tipo": "album"},

    # Argentinos
    {"_id": ALBUM_IDS[17], "id_artista": ARTIST_IDS[10], "titulo": "Signos",                         "anio_lanzamiento": 1986, "tipo": "album"},
    {"_id": ALBUM_IDS[18], "id_artista": ARTIST_IDS[10], "titulo": "Dynamo",                         "anio_lanzamiento": 1992, "tipo": "album"},
    {"_id": ALBUM_IDS[19], "id_artista": ARTIST_IDS[11], "titulo": "Bocanada",                       "anio_lanzamiento": 1999, "tipo": "album"},
    {"_id": ALBUM_IDS[20], "id_artista": ARTIST_IDS[12], "titulo": "Gracias a la Vida",              "anio_lanzamiento": 1971, "tipo": "album"},
    {"_id": ALBUM_IDS[21], "id_artista": ARTIST_IDS[12], "titulo": "Como la Cigarra",                "anio_lanzamiento": 1979, "tipo": "album"},
    {"_id": ALBUM_IDS[22], "id_artista": ARTIST_IDS[13], "titulo": "El Amor Después del Amor",       "anio_lanzamiento": 1992, "tipo": "album"},
    {"_id": ALBUM_IDS[23], "id_artista": ARTIST_IDS[13], "titulo": "Abre",                           "anio_lanzamiento": 1999, "tipo": "album"},
    {"_id": ALBUM_IDS[24], "id_artista": ARTIST_IDS[14], "titulo": "Honestidad Brutal",              "anio_lanzamiento": 1999, "tipo": "album"},
    {"_id": ALBUM_IDS[25], "id_artista": ARTIST_IDS[15], "titulo": "Rey Azúcar",                     "anio_lanzamiento": 1995, "tipo": "album"},
    {"_id": ALBUM_IDS[26], "id_artista": ARTIST_IDS[16], "titulo": "Eco",                            "anio_lanzamiento": 2004, "tipo": "album"},
]

RAW_ARTISTS.append(
    {"_id": ARTIST_IDS[16], "nombre": "Jorge Drexler", "pais": "Uruguay", "generos": ["pop", "folklore"], "fecha_formacion": datetime(1992, 1, 1), "descripcion": "Cantautor uruguayo, ganador del Óscar y figura clave en la música rioplatense."}
)

RAW_SONGS = [
    # Las primeras 8
    {"_id": SONG_IDS[0], "id_artista": ARTIST_IDS[0], "id_album": ALBUM_IDS[0], "titulo": "Sunday Morning", "duracion": 174, "genero": "rock", "idioma": "en", "letra": "Sunday morning, praise the dawning It's just a restless feeling by my side"},
    {"_id": SONG_IDS[1], "id_artista": ARTIST_IDS[0], "id_album": ALBUM_IDS[1], "titulo": "White Light/White Heat", "duracion": 167, "genero": "rock", "idioma": "en", "letra": "White light, White light goin' messin' up my mind"},
    {"_id": SONG_IDS[2], "id_artista": ARTIST_IDS[1], "id_album": ALBUM_IDS[2], "titulo": "So What", "duracion": 562, "genero": "jazz", "idioma": "en", "letra": "[Instrumental]"},
    {"_id": SONG_IDS[3], "id_artista": ARTIST_IDS[1], "id_album": ALBUM_IDS[3], "titulo": "Miles Runs the Voodoo Down", "duracion": 843, "genero": "jazz", "idioma": "en", "letra": "[Instrumental]"},
    {"_id": SONG_IDS[4], "id_artista": ARTIST_IDS[2], "id_album": ALBUM_IDS[4], "titulo": "Jóga", "duracion": 305, "genero": "electronic", "idioma": "en", "letra": "All these accidents that happen Follow the dot"},
    {"_id": SONG_IDS[5], "id_artista": ARTIST_IDS[2], "id_album": ALBUM_IDS[5], "titulo": "Hidden Place", "duracion": 328, "genero": "electronic", "idioma": "en", "letra": "Through the warmst cord of care Your love was sent to me"},
    {"_id": SONG_IDS[6], "id_artista": ARTIST_IDS[3], "id_album": ALBUM_IDS[6], "titulo": "One More Time", "duracion": 320, "genero": "electronic", "idioma": "en", "letra": "One more time, we're gonna celebrate Oh yeah"},
    {"_id": SONG_IDS[7], "id_artista": ARTIST_IDS[3], "id_album": ALBUM_IDS[7], "titulo": "Get Lucky", "duracion": 369, "genero": "electronic", "idioma": "en", "letra": "Like the legend of the phoenix All ends with beginnings"},

    # Las nuevas 14
    {"_id": SONG_IDS[8],  "id_artista": ARTIST_IDS[4], "id_album": ALBUM_IDS[8],  "titulo": "La Bicicleta", "duracion": 227, "genero": "pop latino", "idioma": "es", "letra": "Lleva, llévame en tu bicicleta"},
    {"_id": SONG_IDS[9],  "id_artista": ARTIST_IDS[5], "id_album": ALBUM_IDS[10], "titulo": "Hips Don't Lie", "duracion": 218, "genero": "pop latino", "idioma": "en", "letra": "I'm on tonight You know my hips don't lie"},
    {"_id": SONG_IDS[10], "id_artista": ARTIST_IDS[6], "id_album": ALBUM_IDS[12], "titulo": "A Dios le Pido", "duracion": 204, "genero": "rock", "idioma": "es", "letra": "Que mis ojos se despierten con la luz de tu mirada, a Dios le pido"},
    {"_id": SONG_IDS[11], "id_artista": ARTIST_IDS[7], "id_album": ALBUM_IDS[14], "titulo": "De Donde Vengo Yo", "duracion": 252, "genero": "tropical", "idioma": "es", "letra": "De donde vengo yo la cosa no es fácil pero siempre sobrevivimos"},
    {"_id": SONG_IDS[12], "id_artista": ARTIST_IDS[11], "id_album": ALBUM_IDS[19], "titulo": "Fantasma", "duracion": 305, "genero": "rock argentino", "idioma": "es", "letra": "No necesito a nadie que me diga lo que debo hacer"},
    {"_id": SONG_IDS[13], "id_artista": ARTIST_IDS[10], "id_album": ALBUM_IDS[18], "titulo": "De Música Ligera", "duracion": 213, "genero": "rock argentino", "idioma": "es", "letra": "De aquel amor de música ligera, nada nos libra, nada más queda"},
    {"_id": SONG_IDS[14], "id_artista": ARTIST_IDS[12], "id_album": ALBUM_IDS[20], "titulo": "Todo Cambia", "duracion": 286, "genero": "folklore", "idioma": "es", "letra": "Cambia lo superficial, cambia también lo profundo"},
    {"_id": SONG_IDS[15], "id_artista": ARTIST_IDS[13], "id_album": ALBUM_IDS[22], "titulo": "El Amor Después del Amor", "duracion": 310, "genero": "rock argentino", "idioma": "es", "letra": "El amor después del amor, tal vez, se parezca a este rayo de sol"},
    {"_id": SONG_IDS[16], "id_artista": ARTIST_IDS[8], "id_album": ALBUM_IDS[15], "titulo": "Bolero Falaz", "duracion": 222, "genero": "rock", "idioma": "es", "letra": "Buscas un bolero falaz, un corazón marchito"},
    {"_id": SONG_IDS[17], "id_artista": ARTIST_IDS[16], "id_album": ALBUM_IDS[26], "titulo": "Al Otro Lado del Río", "duracion": 195, "genero": "pop", "idioma": "es", "letra": "Clavo mi remo en el agua y dejo que el río me lleve"},
    {"_id": SONG_IDS[18], "id_artista": ARTIST_IDS[14], "id_album": ALBUM_IDS[24], "titulo": "Flaca", "duracion": 242, "genero": "rock argentino", "idioma": "es", "letra": "Flaca, no me claves tus puñales por la espalda"},
    {"_id": SONG_IDS[19], "id_artista": ARTIST_IDS[15], "id_album": ALBUM_IDS[25], "titulo": "Matador", "duracion": 272, "genero": "ska", "idioma": "es", "letra": "Viene el león, viene agazapado. Matador, oh, Matador"},
    {"_id": SONG_IDS[20], "id_artista": ARTIST_IDS[5], "id_album": ALBUM_IDS[10], "titulo": "La Tortura", "duracion": 213, "genero": "pop latino", "idioma": "es", "letra": "Ay, no hay que llorar sobre la mala suerte, qué le vamos a hacer"},
    {"_id": SONG_IDS[21], "id_artista": ARTIST_IDS[9], "id_album": ALBUM_IDS[16], "titulo": "Fuego", "duracion": 252, "genero": "electro-cumbia", "idioma": "es", "letra": "Fuego, mantenlo prendido, fuego, no lo dejes apagar"},
>>>>>>> d8b8bf90163fbb324cc4d24d65b7c89b4c058133
]

RAW_USERS = [
    {"_id": USER_IDS[0], "nombre": "Juan Duran", "correo": "juan@example.com", "plan_suscripcion": "family"},
    {"_id": USER_IDS[1], "nombre": "Maria Perez", "correo": "maria@example.com", "plan_suscripcion": "free"},
    {"_id": USER_IDS[2], "nombre": "Alex Ostrer", "correo": "alex@example.com", "plan_suscripcion": "premium"}
]

<<<<<<< HEAD

=======
>>>>>>> d8b8bf90163fbb324cc4d24d65b7c89b4c058133
def main():
    print("=" * 60)
    print("SEED — 11 colecciones")
    print("=" * 60)
    db = get_db()

    colecciones = [
        "usuarios", "artistas", "albums", "generos", "canciones",
        "playlists", "eventos", "consultas", "resenas", "chunks", "evaluaciones"
    ]
    for coll in colecciones:
        db[coll].delete_many({})
    print("Colecciones limpiadas\n")

    # 1. Generos
    db["generos"].insert_many(RAW_GENRES)
    print(f"1. {len(RAW_GENRES)} Géneros")

    genero_map = {g["nombre"]: g["_id"] for g in RAW_GENRES}

    # 2. Usuarios
    usuarios_docs = []
    for u in RAW_USERS:
        doc = {
            **u,
            "tiempo_escucha": 0,
            "historial_reciente": [],
            "fecha_registro": datetime.now()
        }
        usuarios_docs.append(doc)

    db["usuarios"].insert_many(usuarios_docs)
    print(f"2. {len(RAW_USERS)} Usuarios")

    # 3. Artistas
    artistas_para_insertar = []
    artista_map = {}

    for a in RAW_ARTISTS:
        emb = embed_texto(a["descripcion"])
        doc = {**a, "emb_descripcion": emb}
        artistas_para_insertar.append(doc)
        artista_map[a["_id"]] = {"nombre": a["nombre"], "pais": a["pais"]}

    db["artistas"].insert_many(artistas_para_insertar)
    print(f"3. {len(artistas_para_insertar)} Artistas")

    # 4. Albums (con portada CLIP)
    albums_para_insertar = []
    album_map = {}

    for al in RAW_ALBUMS:
        info_artista = artista_map[al["id_artista"]]
        titulo_album = al["titulo"]

        print(f"   Portada: {titulo_album}...")
        portada_dict = obtener_portada_itunes(info_artista["nombre"], titulo_album)

        portada_subdoc = None
        if portada_dict and portada_dict.get("url"):
            url = portada_dict["url"]
            emb_portada = get_image_embedding(url)
            portada_subdoc = {
                "url": url,
                "descripcion": portada_dict.get("descripcion", ""),
                "emb_imagen": emb_portada
            }

        doc = {
            "_id": al["_id"],
            "id_artista": al["id_artista"],
            "titulo": titulo_album,
            "anio_lanzamiento": al["anio_lanzamiento"],
            "tipo": al["tipo"],
            "portada": portada_subdoc
        }
        albums_para_insertar.append(doc)
        album_map[al["_id"]] = {
            "titulo": titulo_album,
            "anio": al["anio_lanzamiento"],
            "portada_url": portada_subdoc["url"] if portada_subdoc else None
        }

    db["albums"].insert_many(albums_para_insertar)
    print(f"4. {len(albums_para_insertar)} Albums")

    # 5. Canciones
    canciones_para_insertar = []
    cancion_map = {}

    for idx, s in enumerate(RAW_SONGS):
        emb_letra = embed_texto(s["letra"])

        info_artista = artista_map[s["id_artista"]]
        info_album = album_map[s["id_album"]]
        emociones = EMOCIONES_POR_CANCION.get(idx, [])
        id_genero = genero_map.get(s["genero"])

        doc = {
            "_id": s["_id"],
            "titulo": s["titulo"],
            "duracion": s["duracion"],
            "letra": s["letra"],
            "emb_letra": emb_letra,
            "genero": s["genero"],
            "id_genero": id_genero,
            "idioma": s["idioma"],
            "emociones": emociones,
            "artista": {
                "_id": s["id_artista"],
                "nombre": info_artista["nombre"],
                "pais": info_artista["pais"]
            },
            "id_artista": s["id_artista"],
            "album": {
                "_id": s["id_album"],
                "titulo": info_album["titulo"],
                "anio": info_album["anio"]
            },
            "id_album": s["id_album"],
            "fecha_ingreso": datetime.now()
        }
        if info_album["portada_url"]:
            doc["portada_url"] = info_album["portada_url"]

        canciones_para_insertar.append(doc)
        cancion_map[s["_id"]] = doc

    db["canciones"].insert_many(canciones_para_insertar)
    print(f"5. {len(canciones_para_insertar)} Canciones")

    # 6. Chunks (sentence-aware + semantic + artistas)
    chunks_para_insertar = []
    fecha_ingesta = datetime.now()

    for c in canciones_para_insertar:
        if c["letra"] == "[Instrumental]":
            continue

        for chunk in chunkear_texto(c["letra"], estrategia="sentence-aware", max_palabras=40):
            chunk["doc_id"] = c["_id"]
            chunk["tipo_fuente"] = "cancion"
            chunk["embedding"] = embed_texto(chunk["chunk_texto"])
            chunk["modelo"] = "all-MiniLM-L6-v2"
            chunk["fecha_ingesta"] = fecha_ingesta
            chunks_para_insertar.append(chunk)

        for chunk in chunkear_texto(c["letra"], estrategia="semantic", umbral_similitud=0.75):
            chunk["doc_id"] = c["_id"]
            chunk["tipo_fuente"] = "cancion"
            chunk["embedding"] = embed_texto(chunk["chunk_texto"])
            chunk["modelo"] = "all-MiniLM-L6-v2"
            chunk["fecha_ingesta"] = fecha_ingesta
            chunks_para_insertar.append(chunk)

    for a in artistas_para_insertar:
        if not a.get("descripcion"):
            continue
        for chunk in chunkear_texto(a["descripcion"], estrategia="sentence-aware", max_palabras=40):
            chunk["doc_id"] = a["_id"]
            chunk["tipo_fuente"] = "artista"
            chunk["embedding"] = embed_texto(chunk["chunk_texto"])
            chunk["modelo"] = "all-MiniLM-L6-v2"
            chunk["fecha_ingesta"] = fecha_ingesta
            chunks_para_insertar.append(chunk)

    if chunks_para_insertar:
        db["chunks"].insert_many(chunks_para_insertar)

    estrategias_usadas = set(ch["estrategia_chunking"] for ch in chunks_para_insertar)
    print(f"6. {len(chunks_para_insertar)} Chunks — estrategias: {estrategias_usadas}")

    # 7. Playlists
    playlist_docs = [
        {
            "_id": PLAYLIST_IDS[0],
            "id_usuario": USER_IDS[0],
            "titulo": "Rock Clásico",
            "descripcion": "Mis favoritas de Velvet.",
            "visibilidad": "public",
            "fecha_creacion": datetime.now(),
            "canciones": [
                {"id_cancion": SONG_IDS[0], "titulo": cancion_map[SONG_IDS[0]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[0]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[0]].get("portada_url"), "duracion": cancion_map[SONG_IDS[0]]["duracion"]},
                {"id_cancion": SONG_IDS[1], "titulo": cancion_map[SONG_IDS[1]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[1]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[1]].get("portada_url"), "duracion": cancion_map[SONG_IDS[1]]["duracion"]}
            ]
        },
        {
            "_id": PLAYLIST_IDS[1],
            "id_usuario": USER_IDS[0],
            "titulo": "Jazz Masters",
            "descripcion": "Miles y más.",
            "visibilidad": "private",
            "fecha_creacion": datetime.now(),
            "canciones": [
                {"id_cancion": SONG_IDS[2], "titulo": cancion_map[SONG_IDS[2]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[2]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[2]].get("portada_url"), "duracion": cancion_map[SONG_IDS[2]]["duracion"]}
            ]
        },
        {
            "_id": PLAYLIST_IDS[2],
            "id_usuario": USER_IDS[1],
            "titulo": "Electrónica Cool",
            "descripcion": "",
            "visibilidad": "public",
            "fecha_creacion": datetime.now(),
            "canciones": [
                {"id_cancion": SONG_IDS[4], "titulo": cancion_map[SONG_IDS[4]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[4]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[4]].get("portada_url"), "duracion": cancion_map[SONG_IDS[4]]["duracion"]},
                {"id_cancion": SONG_IDS[6], "titulo": cancion_map[SONG_IDS[6]]["titulo"], "nombre_artista": cancion_map[SONG_IDS[6]]["artista"]["nombre"], "fecha_agregada": datetime.now(), "portada_url": cancion_map[SONG_IDS[6]].get("portada_url"), "duracion": cancion_map[SONG_IDS[6]]["duracion"]}
            ]
        }
    ]
    db["playlists"].insert_many(playlist_docs)
    print(f"7. {len(playlist_docs)} Playlists")

    # 8. Eventos
    ahora = datetime.now()
    eventos_docs = [
        {
            "id_usuario": USER_IDS[0],
            "cancion_snapshot": {
                "id_cancion": SONG_IDS[0],
                "titulo": cancion_map[SONG_IDS[0]]["titulo"],
                "nombre_artista": cancion_map[SONG_IDS[0]]["artista"]["nombre"],
                "nombre_genero": cancion_map[SONG_IDS[0]]["genero"],
                "duracion": cancion_map[SONG_IDS[0]]["duracion"]
            },
            "emocion": {"nombre": "nostalgia", "descripcion": "Sentimiento de anhelo por el pasado"},
            "tipo_relacion": "reproducida",
            "fecha_evento": ahora - timedelta(days=2)
        },
        {
            "id_usuario": USER_IDS[0],
            "cancion_snapshot": {
                "id_cancion": SONG_IDS[7],
                "titulo": cancion_map[SONG_IDS[7]]["titulo"],
                "nombre_artista": cancion_map[SONG_IDS[7]]["artista"]["nombre"],
                "nombre_genero": cancion_map[SONG_IDS[7]]["genero"],
                "duracion": cancion_map[SONG_IDS[7]]["duracion"]
            },
            "emocion": {"nombre": "alegría", "descripcion": "Estado de felicidad y bienestar"},
            "tipo_relacion": "favorita",
            "fecha_evento": ahora - timedelta(days=1)
        },
        {
            "id_usuario": USER_IDS[1],
            "cancion_snapshot": {
                "id_cancion": SONG_IDS[4],
                "titulo": cancion_map[SONG_IDS[4]]["titulo"],
                "nombre_artista": cancion_map[SONG_IDS[4]]["artista"]["nombre"],
                "nombre_genero": cancion_map[SONG_IDS[4]]["genero"],
                "duracion": cancion_map[SONG_IDS[4]]["duracion"]
            },
            "emocion": {"nombre": "melancolía", "descripcion": "Tristeza profunda y reflexiva"},
            "tipo_relacion": "reproducida",
            "fecha_evento": ahora - timedelta(hours=5)
        },
        {
            "id_usuario": USER_IDS[2],
            "cancion_snapshot": {
                "id_cancion": SONG_IDS[6],
                "titulo": cancion_map[SONG_IDS[6]]["titulo"],
                "nombre_artista": cancion_map[SONG_IDS[6]]["artista"]["nombre"],
                "nombre_genero": cancion_map[SONG_IDS[6]]["genero"],
                "duracion": cancion_map[SONG_IDS[6]]["duracion"]
            },
            "emocion": {"nombre": "euforia", "descripcion": "Entusiasmo extremo y energía"},
            "tipo_relacion": "reproducida",
            "fecha_evento": ahora
        },
        {
            "id_usuario": USER_IDS[0],
            "cancion_snapshot": {
                "id_cancion": SONG_IDS[2],
                "titulo": cancion_map[SONG_IDS[2]]["titulo"],
                "nombre_artista": cancion_map[SONG_IDS[2]]["artista"]["nombre"],
                "nombre_genero": cancion_map[SONG_IDS[2]]["genero"],
                "duracion": cancion_map[SONG_IDS[2]]["duracion"]
            },
            "emocion": {"nombre": "calma", "descripcion": "Estado de tranquilidad y paz interior"},
            "tipo_relacion": "buscada",
            "fecha_evento": ahora - timedelta(days=5)
        }
    ]
    db["eventos"].insert_many(eventos_docs)
    print(f"8. {len(eventos_docs)} Eventos")

    # 9. Consultas base
    consultas_base = [
        "canciones tristes de los 90",
        "musica electronica para bailar",
        "jazz instrumental relajante",
        "rock experimental con letras profundas"
    ]

    consultas_docs = []
    for i, texto in enumerate(consultas_base):
        vec = embed_texto(texto)
        doc = {
            "id_usuario": USER_IDS[i % len(USER_IDS)],
            "texto_pregunta": texto,
            "fecha": ahora - timedelta(hours=i * 3),
            "vector_embedding": vec,
            "modelo_embedding": "all-MiniLM-L6-v2",
            "resultados": [],
            "respuesta_llm": None
        }
        consultas_docs.append(doc)

    db["consultas"].insert_many(consultas_docs)
    print(f"9. {len(consultas_docs)} Consultas")

    # 10. Resenas (polimorfica)
    resenas_docs = [
        {
            "_id": REVIEW_IDS[0],
            "id_usuario": USER_IDS[0],
            "tipo_objeto": "cancion",
            "id_objeto": SONG_IDS[7],
            "calificacion": 5,
            "comentario": "Get Lucky es un himno generacional, la producción es impecable y el groove es adictivo.",
            "emb_comentario": embed_texto("Get Lucky es un himno generacional, la producción es impecable y el groove es adictivo."),
            "fecha": ahora - timedelta(days=3)
        },
        {
            "_id": REVIEW_IDS[1],
            "id_usuario": USER_IDS[1],
            "tipo_objeto": "album",
            "id_objeto": ALBUM_IDS[4],
            "calificacion": 4,
            "comentario": "Homogenic es una obra maestra de Björk, mezcla lo orgánico con lo electrónico de manera brillante.",
            "emb_comentario": embed_texto("Homogenic es una obra maestra de Björk, mezcla lo orgánico con lo electrónico de manera brillante."),
            "fecha": ahora - timedelta(days=7)
        },
        {
            "_id": REVIEW_IDS[2],
            "id_usuario": USER_IDS[2],
            "tipo_objeto": "playlist",
            "id_objeto": PLAYLIST_IDS[0],
            "calificacion": 4,
            "comentario": "Buena selección de rock clásico, me transporta a otra época.",
            "emb_comentario": embed_texto("Buena selección de rock clásico, me transporta a otra época."),
            "fecha": ahora - timedelta(days=1)
        },
        {
            "_id": REVIEW_IDS[3],
            "id_usuario": USER_IDS[0],
            "tipo_objeto": "cancion",
            "id_objeto": SONG_IDS[4],
            "calificacion": 5,
            "comentario": "Jóga captura perfectamente la sensación de estar perdido en un paisaje emocional.",
            "emb_comentario": embed_texto("Jóga captura perfectamente la sensación de estar perdido en un paisaje emocional."),
            "fecha": ahora - timedelta(days=2)
        }
    ]
    db["resenas"].insert_many(resenas_docs)
    print(f"10. {len(resenas_docs)} Reseñas")

    # 11. Evaluaciones RAGAS
    evaluaciones_docs = [
        {
            "_id": EVAL_IDS[0],
            "id_consulta": consultas_docs[0].get("_id"),
            "metricas": {
                "faithfulness": 0.85,
                "answer_relevancy": 0.90,
                "context_precision": 0.78,
                "context_recall": 0.82
            },
            "modelo_evaluado": "llama-3.1",
            "fecha_evaluacion": ahora
        },
        {
            "_id": EVAL_IDS[1],
            "id_consulta": consultas_docs[1].get("_id"),
            "metricas": {
                "faithfulness": 0.92,
                "answer_relevancy": 0.88,
                "context_precision": 0.80,
                "context_recall": 0.75
            },
            "modelo_evaluado": "llama-3.1",
            "fecha_evaluacion": ahora
        }
    ]
    db["evaluaciones"].insert_many(evaluaciones_docs)
    print(f"11. {len(evaluaciones_docs)} Evaluaciones RAGAS")

    # Resumen
    print("\n" + "=" * 60)
    print("SEED FINALIZADO")
    print("=" * 60)
    for coll_name in colecciones:
        count = db[coll_name].count_documents({})
        print(f"  {coll_name}: {count}")

    print(f"\nChunks por estrategia:")
    for est in estrategias_usadas:
        count = len([c for c in chunks_para_insertar if c["estrategia_chunking"] == est])
        print(f"  {est}: {count}")

    print(f"\nChunks por tipo_fuente:")
    tipos = set(ch["tipo_fuente"] for ch in chunks_para_insertar)
    for t in tipos:
        count = len([c for c in chunks_para_insertar if c["tipo_fuente"] == t])
        print(f"  {t}: {count}")


if __name__ == "__main__":
    main()
