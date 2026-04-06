import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


def get_db():
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = MongoClient(uri)
    db_name = os.getenv("DB_NAME", "spotifyRAG")
    return client[db_name]
