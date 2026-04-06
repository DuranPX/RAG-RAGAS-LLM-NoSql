SISTEMA RAG NoSQL CON MONGODB
Plataforma Musical Inteligente — Tipo Spotify
Entrega 1 — Documento de Análisis: Transformación SQL a NoSQL
Bases de Datos No Relacionales — 2026
1. Universo del Discurso

1.1 Descripción del Dominio
El sistema desarrollado es una plataforma musical inteligente, inspirada en Spotify, que incorpora capacidades de Recuperación y Generación Aumentada (RAG). La plataforma gestiona un catálogo musical compuesto por canciones, artistas, álbumes y géneros, y permite a los usuarios crear playlists, registrar emociones asociadas a sus escuchas y hacer calificaciones y reseñas del contenido.
A diferencia de una plataforma de streaming convencional, este sistema incorpora un motor de búsqueda semántica y generación de lenguaje natural: el usuario puede formular preguntas en lenguaje natural como 'canciones melancólicas de los años 90 en español' y recibir respuestas generadas por un LLM que utiliza como contexto los documentos más similares recuperados de MongoDB mediante búsqueda vectorial.

1.2 Actores del Sistema
•	Usuario final: escucha canciones, crea playlists, registra emociones, hace consultas en lenguaje natural y escribe reseñas.
•	Artista: entidad que publica canciones y álbumes, clasificada por género musical y país.
•	Sistema RAG: componente inteligente que procesa consultas del usuario, recupera contexto relevante de MongoDB y genera respuestas con un LLM.
•	Sistema RAGAS: evaluación mediante las métricas comunes
1.3 Principales Flujos del Sistema
1.	El usuario realiza una consulta en lenguaje natural desde el frontend React/Next.js.
2.	La API REST Node.js/Express recibe la consulta y la envía al microservicio Python.
3.	El microservicio Python genera un embedding de la consulta usando sentence-transformers (all-MiniLM-L6-v2).
4.	La API ejecuta una búsqueda vectorial sobre la colección chunks en MongoDB Atlas usando Atlas Vector Search ($vectorSearch).
5.	Los chunks recuperados se pasan como contexto al LLM (Groq API + Llama 3.1) que genera la respuesta final.
6.	La consulta, el embedding y los resultados se persisten en la colección consultas de MongoDB.
7.	El usuario recibe la respuesta y puede explorar el contenido relacionado (canciones, artistas, álbumes).
2. Análisis de Requerimientos
2.1 Requerimientos Funcionales
1: Gestión del Catálogo Musical
•	El sistema debe almacenar canciones con título, letra, duración, artista, álbum y género.
•	Cada canción debe tener un embedding vectorial de su letra (vector de dimensión 384).
•	Los artistas deben poder clasificarse en múltiples géneros musicales.
•	Los álbumes deben incluir portada con su propio embedding de imagen (vector de dimensión 512).
2: Gestión de Usuarios y Actividad
•	Los usuarios deben poder registrarse con nombre, correo y plan de suscripción (free, premium, family).
•	El sistema debe registrar cada evento de escucha vinculando usuario, canción y emoción experimentada.
•	Los usuarios deben poder crear playlists y agregar canciones a ellas.
•	Los usuarios deben poder escribir reseñas y calificaciones para canciones, álbumes y playlists.
3: Motor de Búsqueda Semántica (RAG)
•	El sistema debe permitir búsquedas en lenguaje natural sobre el catálogo musical.
•	El pipeline RAG debe chunkerizar las letras y descripciones usando al menos dos estrategias diferentes (semantic-chunking y sentence-aware).
•	Cada chunk debe almacenarse con su embedding vectorial y el campo estrategia_chunking.
•	Los resultados de las consultas deben incluir un score de similitud coseno.
•	El LLM (Groq/Llama 3.1) debe recibir los chunks recuperados como contexto para generar respuestas.
4: Búsqueda Híbrida
•	La API debe soportar búsqueda multimodal: texto-texto, imagen-texto.
•	Las búsquedas deben poder combinarse con filtros de metadatos (género, año, país del artista).
•	La colección chunks debe soportar índice vectorial knnVector para Atlas Vector Search.

2.2 Requerimientos No Funcionales
•	Infraestructura: MongoDB Atlas M0 (gratuito, 512 MB). El diseño de esquema debe ser eficiente en almacenamiento.
•	Rendimiento: las consultas vectoriales más frecuentes deben estar soportadas por índices especializados.
•	Escalabilidad: las colecciones de alto volumen (eventos, chunks) deben diseñarse para crecimiento horizontal.
•	Flexibilidad de esquema: MongoDB permite documentos con estructura variable; esto se aprovecha en la colección resenas (polimórfica) y chunks (distintas estrategias).
•	Disponibilidad del LLM: se usa Groq API por su cuota gratuita generosa y baja latencia de inferencia.

2.3 Justificación del Uso de MongoDB sobre PostgreSQL
El sistema original fue diseñado en PostgreSQL con tablas estrictamente normalizadas. La migración a MongoDB está motivada por los siguientes factores técnicos:
•	Embeddings vectoriales nativos: MongoDB Atlas incluye Vector Search sin extensiones adicionales. En PostgreSQL se requiere pgvector como extensión externa.
•	Flexibilidad de esquema: los chunks generados por distintas estrategias de chunking tienen estructuras levemente diferentes. MongoDB admite esto sin migraciones de esquema.
•	Eliminación de JOINs costosos: en el modelo relacional, una consulta de canción con artista, álbum, género y emociones requería al menos 5 JOINs. En MongoDB se resuelve en una sola lectura de documento.
•	Modelo documental natural: una canción con su artista, géneros y emociones es intuitivamente un documento, no un conjunto de filas relacionadas.
•	Atlas Search: índices de texto completo y vectoriales integrados en la misma plataforma.
3. Arquitectura Técnica del Sistema

La arquitectura adoptada es una aplicación web de tres capas con un microservicio adicional para el pipeline de embeddings:

Frontend (React/Next.js — Vercel)
API REST (Node.js + Express)
MongoDB Atlas M0
•	Atlas Vector Search — búsqueda semántica sobre embeddings
•	Atlas Search — búsqueda de texto completo
Pipeline RAG (Python)
•	sentence-transformers / all-MiniLM-L6-v2 — embeddings de texto (384d)
•	OpenCLIP / clip-vit-base-patch32 — embeddings de imagen (512d)
•	Groq API + Llama 3.1 — generación de respuestas

Tecnología	Capa	Rol en el sistema
React / Next.js (Vercel)	Frontend	Interfaz de búsqueda, reproductor, gestión de playlists y visualización de resultados RAG
Node.js + Express	API REST	Endpoints /search, /rag, CRUD de entidades. Conecta frontend con MongoDB y el microservicio Python
MongoDB Atlas M0	Base de datos	Almacenamiento de todas las colecciones, Atlas Vector Search para búsqueda semántica, Atlas Search para texto completo
Python (script/microservicio)	Embeddings e ingesta	Generación de embeddings con sentence-transformers; chunking de textos; carga inicial de datos
Groq API + Llama 3.1	LLM	Generación de respuestas RAG. API gratuito con cuota generosa. Rápido y con soporte para español
4. Transformación SQL a NoSQL — Mapa de Entidades
El modelo relacional original contaba con 14 tablas, muchas de ellas tablas intermedias de relaciones N:M. La transformación a MongoDB reduce estas a 11 colecciones significativas, eliminando las tablas intermedias mediante embeddings de arrays y simplificando el esquema general.

Tabla SQL	Colección MongoDB	Transformación
Usuario	usuarios	Misma estructura + historial_reciente embebido. Se elimina FK a portada.
Artista	artistas	Agrega campo generos[] (array). Elimina tabla artista_genero.
Genero	generos	Se conserva como catálogo. El nombre se desnormaliza en canciones/artistas.
Album	albums	Agrega subdocumento portada embebido. Se elimina tabla portada independiente.
Cancion	canciones	Agrega subdocumentos artista y album (resúmenes). Campo emociones[] como array. Se eliminan tablas intermedias.
Usuario_Cancion_Emocion	eventos	Se mantiene como colección separada por volumen alto. Índice compuesto en {id_usuario, fecha}.
Playlist	playlists	Array canciones[] de ObjectIds reemplaza playlist_cancion. Portada embebida.
Portada	— (embebida)	Se elimina como colección independiente. Se embebe en album, usuario y playlist.
Cancion_Emocion	— (eliminada)	Reemplazada por array emociones[] en canciones y colección eventos.
Artista_Genero	— (eliminada)	Reemplazada por array generos[] en artistas.
Playlist_Cancion	— (eliminada)	Reemplazada por array canciones[] en playlists.
Consulta	consultas	Incluye vector_embedding y resultados como subdocumentos. Unifica 3 tablas SQL.
Resultado	— (embebido)	Embebido en consultas como array resultados[].
Query_Embedding	— (embebido)	Embebido en consultas como campo vector_embedding.
Embedding_Texto	— (en colección)	Los embeddings de letra van en cancion.emb_letra. Los de artista en artista.emb_descripcion.
Embedding_Imagen	— (en colección)	El embedding de portada va embebido en album.portada.emb_imagen.
Resena (nueva)	resenas	Nueva colección para calificaciones/comentarios con emb_comentario vectorial.
— (nueva)	chunks	Nueva colección requerida por el proyecto para el pipeline RAG y experimento de chunking.
— (nueva)	evaluaciones	Nueva colección para scores RAGAS (nota extra).
5. Decisiones de Modelado: Embedding vs. Referencing
Estrategia	Caso Concreto	Justificación
Embebido	cancion.artista (resumen: id, nombre, pais)	Se lee siempre junto con la canción; el resumen no cambia frecuentemente
Embebido	cancion.album (resumen: id, titulo, anio)	Acceso inmediato sin JOIN; cambios al álbum no invalidan el resumen
Embebido	cancion.emociones (array de strings)	Elimina la tabla cancion_emocion; las emociones son propiedad directa de la canción
Embebido	album.portada (subdocumento)	La portada es exclusiva del álbum; evita una colección portadas con muchos docs compartidos
Embebido	usuario.historial_reciente (últimos 20)	Acceso inmediato al historial reciente en una sola lectura
Embebido	consulta.vector_embedding + resultados	Una consulta y su embedding siempre se leen juntos; simplifica el pipeline RAG
Referenciado	cancion.id_artista → artistas	Un artista tiene muchas canciones; actualizar bio del artista no requiere tocar todas las canciones
Referenciado	cancion.id_album → albums	Relación 1:N; el álbum puede consultarse independientemente
Referenciado	playlist.canciones[] → canciones	N:M natural; una canción puede estar en muchas playlists
Referenciado	evento.id_usuario, id_cancion, id_emocion	Alto volumen; no embeber en usuario evita documentos enormes
Referenciado	chunk.doc_id → (canciones/artistas/albums)	Los chunks son documentos de trabajo del pipeline; no pertenecen al documento padre
Referenciado	resena.id_objeto (polimórfico)	Apunta a diferentes colecciones según tipo_objeto; patrón polimórfico clásico en MongoDB
6. Definición de Colecciones y Documentos de Ejemplo
6.1 Colección: canciones
Documento central del sistema. Contiene resúmenes embebidos de artista y álbum para evitar JOINs en las lecturas más frecuentes.

Ejemplo de documento:
{
  "_id": ObjectId("..."),
  "titulo": "Bohemian Rhapsody",
  "duracion": 354,
  "letra": "Is this the real life?...",
  "emb_letra": [0.023, -0.117, ...],  // vector(384)
  "genero": "Rock",
  "emociones": ["euforia", "drama", "nostalgia"],
  "artista": { "_id": ObjectId, "nombre": "Queen", "pais": "Reino Unido" },
  "album": { "_id": ObjectId, "titulo": "A Night at the Opera", "anio": 1975 }
}
6.2 Colección: chunks
Colección crítica para el pipeline RAG. Cada chunk es un fragmento de texto (letra, descripción) vectorizado. El campo estrategia_chunking es obligatorio para el experimento comparativo.

{
  "_id": ObjectId("..."),
  "doc_id": ObjectId("ref a cancion/artista/album"),
  "tipo_fuente": "cancion",
  "chunk_index": 3,
  "estrategia_chunking": "sentence-aware",
  "chunk_texto": "Mama, just killed a man...",
  "embedding": [0.023, -0.117, ...],  // vector(384)
  "modelo": "all-MiniLM-L6-v2",
  "fecha_ingesta": ISODate("2026-01-01T00:00:00Z")
}
6.3 Colección: consultas
Consolida las tablas SQL consulta, query_embedding y resultado en un solo documento. Una consulta siempre se lee con su embedding y sus resultados.

{
  "_id": ObjectId("..."),
  "id_usuario": ObjectId("ref a usuario"),
  "texto_pregunta": "canciones tristes de los 90",
  "fecha": ISODate("2026-03-10T14:30:00Z"),
  "vector_embedding": [0.023, -0.117, ...],
  "resultados": [
    { "cancion_id": ObjectId, "titulo": "Nothing Compares 2U", "score": 0.92 },
    { "cancion_id": ObjectId, "titulo": "Tears in Heaven", "score": 0.87 }
  ]
}
7. Tabla Resumen de Colecciones
La siguiente tabla consolida las 11 colecciones del modelo NoSQL con su estrategia de modelado y justificación:

Colección	Tipo	Estrategia	Frecuencia	Justificación
canciones	Principal	Embebido	Alta	Consulta central del sistema; incluye resumen de artista, álbum, género y emociones como subdocumentos
artistas	Principal	Referenciado	Alta	Compartido por muchas canciones; se embebe solo como resumen {id, nombre, pais}
albums	Principal	Referenciado	Media	Un álbum es fuente para muchas canciones; la portada se embebe como subdocumento
generos	Catálogo	Referenciado	Baja	Datos pequeños, estables; el nombre del género se denormaliza en canciones y artistas
usuarios	Principal	Embebido	Alta	La portada y el historial reciente (últimos 20 eventos) se embeban; el historial completo va a eventos
playlists	Principal	Mixto	Alta	Portada embebida; canciones referenciadas por ObjectId (N:M natural)
eventos	Operacional	Referenciado	Muy Alta	Reemplaza usuario_cancion_emocion; volumen alto → colección separada con índice compuesto
consultas	RAG	Embebido	Media	El vector_embedding y los resultados se embeban en el mismo documento consulta
resenas	Social	Referenciado	Media	Polimórfica: apunta a cancion/album/playlist; el emb_comentario es un campo vector(384)
chunks	RAG/Vector	Referenciado	Muy Alta	Colección crítica para el pipeline RAG; doc_id referencia al documento padre; campo estrategia_chunking obligatorio
evaluaciones	Calidad	Embebido	Baja	Scores RAGAS embebidos; referencia a id_consulta

