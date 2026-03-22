import os
from pymongo import MongoClient
from dotenv import load_dotenv


# Cargar variables desde .env si existe
load_dotenv()

def get_db():
    """
    Retorna la instancia de la base de datos MongoDB centralizada.
    Usa MONGODB_URI desde el entorno.
    """
    uri = os.getenv("MONGODB_URI")
    if not uri:
        # Fallback para desarrollo local si no hay .env (aunque .env debería existir)
        uri = "mongodb://localhost:27017"
        
    client = MongoClient(uri)
    # El nombre de la base de datos se puede extraer del URI o usar el default 'spotifyRAG'
    db_name = os.getenv("DB_NAME", "spotifyRAG")
    return client[db_name]


