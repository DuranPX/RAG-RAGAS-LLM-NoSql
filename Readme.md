# 🎵 Spotify RAG — Sistema Musical Inteligente con MongoDB
> Plataforma de streaming musical con búsqueda semántica y pipeline RAG.
> Stack: Next.js 14 · Node.js/Express · MongoDB Atlas · Python (ingesta única) · Groq

---

## ⚡ Inicio Rápido para Colaboradores

1. Clonar el repositorio
2. **Pedir al líder del equipo el archivo `.env`** por WhatsApp o correo (nunca está en Git)
3. Seguir las secciones de instalación de este README según tu rol

---

## 0. Prerrequisitos

| Herramienta | Versión mínima | Link |
|---|---|---|
| Node.js | 20.x | https://nodejs.org |
| Python | 3.10 – 3.12 ⚠️ (ver nota) | https://python.org |
| Git | cualquiera | https://git-scm.com |

> ⚠️ **IMPORTANTE sobre Python:** usar Python 3.10, 3.11 o 3.12.
> Python 3.13 causa errores de compilación con numpy y sentence-transformers en Windows.
> Descarga Python 3.12 desde https://python.org/downloads y asegúrate de marcarlo
> como versión por defecto en el instalador.

Verificar versiones instaladas:

    node -v
    python --version
    git --version

---

## 1. Clonar el repositorio

    git clone https://github.com/tu-usuario/spotify-rag.git
    cd spotify-rag

---

## 2. Frontend — Next.js 14

    cd frontend
    npm install

Crear archivo de variables de entorno:

    # Windows PowerShell
    New-Item .env.local -ItemType File
    notepad .env.local

    # macOS / Linux
    cp .env.example .env.local

Contenido de `.env.local`:

    NEXT_PUBLIC_API_URL=http://localhost:4000/api

Ejecutar en desarrollo:

    npm run dev
    # Disponible en: http://localhost:3000

---

## 3. Backend — Node.js + Express

    cd backend
    npm install

Crear archivo de variables de entorno:

    # Windows PowerShell
    New-Item .env -ItemType File
    notepad .env

    # macOS / Linux
    cp .env.example .env

Contenido de `.env` (pedir valores reales al líder del equipo):

    PORT=4000
    NODE_ENV=development
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/spotify_rag
    GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
    CORS_ORIGIN=http://localhost:3000
    RATE_LIMIT_WINDOW_MS=900000
    RATE_LIMIT_MAX=100

Ejecutar en desarrollo:

    npm run dev
    # Disponible en: http://localhost:4000

Verificar que está conectado a MongoDB:

    curl http://localhost:4000/api/health
    # Esperado: { "status": "ok", "mongo": "connected" }

---

## 4. Microservicio Python — Solo Ingesta (no se despliega)

> Este servicio corre UNA SOLA VEZ localmente para generar los embeddings
> y cargar los datos a MongoDB Atlas. No sube a producción.

    cd python_service

Crear entorno virtual con Python 3.11:

    # Windows
    py -3.11 -m venv venv
    venv\Scripts\activate

    # macOS / Linux
    py -3.11 -m venv venv
    source venv/bin/activate

Instalar dependencias:

    pip install -r requirements.txt

Crear archivo de variables de entorno:

    # Windows PowerShell
    New-Item .env -ItemType File
    notepad .env

    # macOS / Linux
    cp .env.example .env

Contenido de `.env`:

    MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/spotify_rag
    GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
    PORT=5000

Ejecutar ingesta de datos (una sola vez):

    python scripts/ingest_data.py

---

## 5. Orden de Ejecución para Desarrollo Local

    # Terminal 1 — Backend Node.js
    cd backend
    npm run dev

    # Terminal 2 — Frontend Next.js
    cd frontend
    npm run dev

    # El microservicio Python solo cuando se necesite reingestar datos
    cd python_service && source venv/bin/activate && python scripts/ingest_data.py

---

## 6. Despliegue en Producción

| Capa | Plataforma | Costo | Notas |
|---|---|---|---|
| Frontend | Vercel | Gratis permanente | Conectar repo GitHub, carpeta /frontend |
| Backend | Render.com | Gratis permanente | Se duerme 15 min sin tráfico, despierta solo |
| Base de datos | MongoDB Atlas M0 | Gratis permanente | 512 MB |
| LLM | Groq API | Gratis con cuota | Llama 3.1, muy rápido |
| Python | No se despliega | — | Solo corre local para ingesta |

### Deploy Frontend en Vercel

    npm install -g vercel
    cd frontend
    vercel login
    vercel --prod

O conectar desde https://vercel.com/new importando el repo de GitHub.
Agregar variable de entorno en Vercel: `NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api`

### Deploy Backend en Render

1. Ir a https://render.com → New → Web Service
2. Conectar repositorio GitHub
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Agregar todas las variables de `.env` en la sección Environment

---

## 7. Estructura de Carpetas

    spotify-rag/
    ├── .gitignore
    ├── README.md
    │
    ├── frontend/                        # Next.js 14 — Vercel
    │   ├── .env.local                   # ← NO subir a Git
    │   ├── .env.example                 # plantilla sin valores reales
    │   ├── package.json
    │   └── src/
    │       ├── app/
    │       │   ├── layout.jsx           # Layout global (navbar)
    │       │   ├── page.jsx             # Home: canciones destacadas
    │       │   ├── search/
    │       │   │   └── page.jsx         # Búsqueda semántica + respuesta RAG
    │       │   ├── artists/
    │       │   │   ├── page.jsx         # Listado de artistas
    │       │   │   └── [id]/page.jsx    # Perfil artista + sus canciones
    │       │   ├── playlists/
    │       │   │   ├── page.jsx         # Playlists del usuario
    │       │   │   └── [id]/page.jsx    # Detalle de playlist
    │       │   └── song/
    │       │       └── [id]/page.jsx    # Detalle canción + emociones + reseñas
    │       ├── components/
    │       │   ├── layout/
    │       │   │   └── Navbar.jsx
    │       │   ├── search/
    │       │   │   ├── SearchBar.jsx    # Input búsqueda semántica
    │       │   │   └── RAGResponse.jsx  # Respuesta del LLM
    │       │   ├── music/
    │       │   │   ├── SongCard.jsx
    │       │   │   ├── ArtistCard.jsx
    │       │   │   └── PlaylistCard.jsx
    │       │   └── ui/
    │       │       ├── Button.jsx
    │       │       ├── Badge.jsx        # Géneros y emociones
    │       │       └── Spinner.jsx
    │       ├── lib/
    │       │   └── api.js               # Axios + fetch functions
    │       └── hooks/
    │           ├── useSearch.js
    │           └── useSongs.js
    │
    ├── backend/                         # Node.js + Express — Render
    │   ├── .env                         # ← NO subir a Git
    │   ├── .env.example                 # plantilla sin valores reales
    │   ├── package.json
    │   └── src/
    │       ├── index.js                 # Entry point
    │       ├── config/
    │       │   └── db.js                # Conexión MongoDB Atlas
    │       ├── models/
    │       │   ├── Song.js
    │       │   ├── Artist.js
    │       │   ├── Album.js
    │       │   ├── User.js
    │       │   ├── Playlist.js
    │       │   ├── Chunk.js             # RAG chunks
    │       │   ├── Query.js             # Consultas + resultados embebidos
    │       │   └── Event.js             # usuario + cancion + emocion
    │       ├── routes/
    │       │   ├── songs.routes.js
    │       │   ├── artists.routes.js
    │       │   ├── playlists.routes.js
    │       │   ├── search.routes.js     # POST /search
    │       │   └── rag.routes.js        # POST /rag
    │       ├── controllers/
    │       │   ├── songs.controller.js
    │       │   ├── artists.controller.js
    │       │   ├── playlists.controller.js
    │       │   ├── search.controller.js
    │       │   └── rag.controller.js
    │       └── middlewares/
    │           ├── errorHandler.js
    │           └── validateRequest.js
    │
    └── python_service/                  # Solo local — ingesta única
        ├── .env                         # ← NO subir a Git
        ├── .env.example
        ├── requirements.txt
        ├── main.py
        ├── scripts/
        │   └── ingest_data.py           # Ejecutar una sola vez
        └── services/
            ├── embedder.py              # sentence-transformers (texto)
            ├── image_embedder.py        # OpenCLIP (portadas)
            └── chunker.py              # fixed_size / sentence_aware / semantic

---

## 8. Seguridad — Reglas del Equipo

- NUNCA subir archivos `.env` a Git
- Compartir credenciales solo por canal privado (WhatsApp, correo)
- Rotar API keys si se comprometen:
  - Groq: https://console.groq.com/keys
  - MongoDB Atlas: cloud.mongodb.com → Database Access
- Verificar antes de cada commit: `git status` — si aparece un `.env` en verde, detener

---

## 9. requirements.txt del Microservicio Python

> Compatibles con Python 3.10 / 3.11 / 3.12 (NO usar Python 3.13 en Windows)

    fastapi==0.111.0
uvicorn==0.30.1
pymongo==4.7.3
sentence-transformers==2.7.0
langchain==0.2.6
langchain-text-splitters==0.2.2
open-clip-torch==2.24.0
Pillow==10.3.0
numpy==1.26.4
python-dotenv==1.0.1
groq==0.9.0
httpx==0.27.0