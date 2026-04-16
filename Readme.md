El sistema desarrollado es una plataforma musical inteligente, inspirada en Spotify, que incorpora capacidades de Recuperación y Generación Aumentada (RAG). La plataforma gestiona un catálogo musical compuesto por canciones, artistas, álbumes y géneros, y permite a los usuarios crear playlists, registrar emociones asociadas a sus escuchas y hacer calificaciones y reseñas del contenido.
A diferencia de una plataforma de streaming convencional, este sistema incorpora un motor de búsqueda semántica y generación de lenguaje natural: el usuario puede formular preguntas en lenguaje natural como 'canciones melancólicas de los años 90 en español' y recibir respuestas generadas por un LLM que utiliza como contexto los documentos más similares recuperados de MongoDB mediante búsqueda vectorial.

Arquitectura Técnica del Sistema

La arquitectura adoptada es una aplicación web de tres capas con un microservicio adicional para el pipeline de embeddings:

Frontend (React/Next.js — Vercel)
API REST (Node.js + Express)
MongoDB Atlas M0
•	Atlas Vector Search — búsqueda semántica sobre embeddings
•	Atlas Search — búsqueda de texto completo
Pipeline RAG (Python)
•	sentence-transformers / all-MiniLM-L6-v2 — embeddings de texto (384d)
•	OpenCLIP / clip-vit-base-patch32 — embeddings de imagen (512d)
•	Llama 3.1 — generación de respuestas
