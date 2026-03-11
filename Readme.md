# SETUP DESDE CERO — Sistema RAG NoSQL | Plataforma Musical Spotify-like
# Ejecutar en orden. No hay nada clonado, partimos de una carpeta vacía.

================================================================================
## 0. PREREQUISITOS (instalar antes de comenzar)
================================================================================

  Node.js >= 20.x         https://nodejs.org
  Python >= 3.10          https://python.org
  Git                     https://git-scm.com
  Cuenta MongoDB Atlas    https://cloud.mongodb.com  (cluster M0 gratuito)
  Cuenta Groq             https://console.groq.com   (API key gratuita)
  Cuenta Vercel           https://vercel.com         (deploy frontend gratis)

  # Verificar versiones instaladas
  node -v
  python --version
  git --version

================================================================================
## 1. CREAR CARPETA RAÍZ DEL PROYECTO
================================================================================

  mkdir spotify-rag
  cd spotify-rag
  git init

================================================================================
## 2. FRONTEND — Next.js 14 + Tailwind CSS
================================================================================

  # Crear proyecto Next.js (el asistente interactivo preguntará opciones)
  # Responder EXACTAMENTE así a cada pregunta:
  #
  #   Would you like to use TypeScript?          → No
  #   Would you like to use ESLint?              → Yes
  #   Would you like to use Tailwind CSS?        → Yes
  #   Would you like your code inside a `src/`?  → Yes
  #   Would you like to use App Router?          → Yes
  #   Would you like to use Turbopack?           → No
  #   Would you like to customize the alias?     → No

  npx create-next-app@14.2.3 frontend

  cd frontend

  # Instalar dependencias adicionales
  npm install axios react-icons react-hot-toast clsx

  # Crear archivo de variables de entorno
  echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local

  # Verificar que funciona
  npm run dev
  # Abrir http://localhost:3000 — debe mostrar la página default de Next.js
  # Ctrl+C para detener

  cd ..

================================================================================
## 3. BACKEND — Node.js + Express
================================================================================

  # Crear carpeta y entrar
  mkdir backend
  cd backend

  # Inicializar proyecto Node
  npm init -y

  # Instalar dependencias de producción
  npm install express mongoose cors dotenv helmet express-rate-limit morgan axios express-validator

  # Instalar dependencias de desarrollo
  npm install -D nodemon eslint

  # Agregar scripts al package.json generado
  # Abrir backend/package.json y reemplazar la sección "scripts" con:
  #
  #   "scripts": {
  #     "dev": "nodemon src/index.js",
  #     "start": "node src/index.js"
  #   }
  #
  # También agregar al final del package.json:
  #   "type": "commonjs"

  # Crear estructura de carpetas
  mkdir -p src/config src/models src/routes src/controllers src/middlewares

  # Crear archivo de entrada
  echo "" > src/index.js

  # Crear archivo de variables de entorno
  cat > .env << 'EOF'
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/spotify_rag?retryWrites=true&w=majority
PYTHON_SERVICE_URL=http://localhost:5000
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF

  # Reemplazar <user>, <password> y el cluster con tus datos reales de MongoDB Atlas

  cd ..

================================================================================
## 4. MICROSERVICIO PYTHON — Embeddings + Chunking
================================================================================

  # Crear carpeta y entrar
  mkdir python_service
  cd python_service

  # Crear entorno virtual
  python -m venv venv

  # Activar entorno virtual
  # Windows:
  venv\Scripts\activate
  # macOS / Linux:
  source venv/bin/activate

  # Crear requirements.txt
  cat > requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn==0.30.1
pymongo==4.7.3
sentence-transformers==3.0.1
langchain==0.2.6
langchain-text-splitters==0.2.2
open-clip-torch==2.24.0
Pillow==10.4.0
numpy==1.26.4
python-dotenv==1.0.1
groq==0.9.0
httpx==0.27.0
EOF

  # Instalar dependencias
  pip install -r requirements.txt

  # Crear estructura de carpetas
  mkdir -p scripts services

  # Crear archivos vacíos base
  echo "" > main.py
  echo "" > scripts/ingest_data.py
  echo "" > services/embedder.py
  echo "" > services/image_embedder.py
  echo "" > services/chunker.py

  # Crear archivo de variables de entorno
  cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/spotify_rag
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
EOF

  cd ..

================================================================================
## 5. CREAR .gitignore EN LA RAÍZ
================================================================================

  cat > .gitignore << 'EOF'
# Entornos y secretos
.env
.env.local
.env.production

# Node
node_modules/
.next/
dist/
build/

# Python
venv/
__pycache__/
*.pyc
*.pyo
.pytest_cache/

# Sistema
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
EOF

================================================================================
## 6. ESTRUCTURA FINAL DE CARPETAS
================================================================================

  # Así debe quedar spotify-rag/ después de ejecutar todos los comandos:

  spotify-rag/
  ├── .gitignore
  ├── frontend/                        # Next.js 14
  │   ├── .env.local                   # ← NO subir a Git
  │   ├── package.json
  │   ├── next.config.mjs
  │   ├── tailwind.config.js
  │   ├── public/
  │   └── src/
  │       ├── app/
  │       │   ├── layout.jsx           # Layout global (navbar, footer)
  │       │   ├── page.jsx             # Home → canciones destacadas
  │       │   ├── search/
  │       │   │   └── page.jsx         # Búsqueda semántica + respuesta RAG
  │       │   ├── artists/
  │       │   │   ├── page.jsx         # Listado de artistas
  │       │   │   └── [id]/page.jsx    # Perfil de artista + canciones
  │       │   ├── playlists/
  │       │   │   ├── page.jsx         # Playlists del usuario
  │       │   │   └── [id]/page.jsx    # Detalle de playlist
  │       │   └── song/
  │       │       └── [id]/page.jsx    # Detalle canción + emociones + reseñas
  │       ├── components/
  │       │   ├── layout/
  │       │   │   └── Navbar.jsx
  │       │   ├── search/
  │       │   │   ├── SearchBar.jsx    # Input de búsqueda semántica
  │       │   │   └── RAGResponse.jsx  # Respuesta generada por el LLM
  │       │   ├── music/
  │       │   │   ├── SongCard.jsx     # Tarjeta de canción
  │       │   │   ├── ArtistCard.jsx   # Tarjeta de artista
  │       │   │   └── PlaylistCard.jsx # Tarjeta de playlist
  │       │   └── ui/
  │       │       ├── Button.jsx
  │       │       ├── Badge.jsx        # Para géneros y emociones
  │       │       └── Spinner.jsx
  │       ├── lib/
  │       │   └── api.js               # Instancia axios + funciones de fetch
  │       └── hooks/
  │           ├── useSearch.js         # Hook búsqueda semántica
  │           └── useSongs.js          # Hook CRUD canciones
  │
  ├── backend/                         # Node.js + Express
  │   ├── .env                         # ← NO subir a Git
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
  └── python_service/                  # Embeddings + Chunking
      ├── .env                         # ← NO subir a Git
      ├── requirements.txt
      ├── main.py                      # FastAPI /embed endpoint
      ├── scripts/
      │   └── ingest_data.py           # Carga inicial → MongoDB
      └── services/
          ├── embedder.py              # sentence-transformers
          ├── image_embedder.py        # OpenCLIP
          └── chunker.py              # fixed_size / sentence_aware / semantic

================================================================================
## 7. ORDEN DE EJECUCIÓN PARA DESARROLLO LOCAL
================================================================================

  # Terminal 1 — Python service
  cd spotify-rag/python_service
  source venv/bin/activate          # macOS/Linux
  # venv\Scripts\activate           # Windows
  python main.py

  # Terminal 2 — Backend Node.js
  cd spotify-rag/backend
  npm run dev

  # Terminal 3 — Frontend Next.js
  cd spotify-rag/frontend
  npm run dev

  # Verificar conexión backend
  curl http://localhost:4000/api/health
  # Esperado: { "status": "ok", "mongo": "connected" }

================================================================================
## 8. CONFIGURACIÓN MONGODB ATLAS (índice vectorial)
================================================================================

  # Una vez creado el cluster M0 en Atlas:
  # 1. Ir a Browse Collections → crear base de datos: spotify_rag
  # 2. Ir a Atlas Search → Create Search Index → JSON Editor → colección chunks

  {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 384,
        "similarity": "cosine"
      },
      { "type": "filter", "path": "tipo_fuente" },
      { "type": "filter", "path": "estrategia_chunking" }
    ]
  }

================================================================================#   R A G - R A G A S - L L M - N o S q l  
 