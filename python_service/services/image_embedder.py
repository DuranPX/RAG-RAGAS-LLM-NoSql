import torch
import open_clip
from PIL import Image
import requests
from io import BytesIO
from pymongo import MongoClient

# ===========================================================
# CONEXIÓN A MONGO
# ===========================================================
client = MongoClient("mongodb://localhost:27017")
db = client["spotifyRAG"]
albums = db["albums"]

# ===========================================================
# MODELO OPENCLIP
# ===========================================================
model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="laion2b_s34b_b79k"
)

model.eval()

# ===========================================================
# FUNCIÓN EMBEDDING
# ===========================================================
def get_embedding(image_url):
    response = requests.get(image_url, timeout=10)
    image = Image.open(BytesIO(response.content)).convert("RGB")

    image_input = preprocess(image).unsqueeze(0)

    with torch.no_grad():
        image_features = model.encode_image(image_input)

    image_features /= image_features.norm(dim=-1, keepdim=True)

    return image_features[0].cpu().tolist()


# ===========================================================
# PROCESAMIENTO
# ===========================================================
for album in albums.find({
    "$or": [
        { "emb_portada": { "$exists": False } },
        { "emb_portada": None }
    ]
}):

    portada = album.get("portada")

    if not portada or not portada.get("url"):
        print(f"Sin portada: {album.get('titulo')}")
        continue

    try:
        embedding = get_embedding(portada["url"])

        albums.update_one(
            { "_id": album["_id"] },
            { "$set": { "emb_portada": embedding } }
        )

        print(f"OK: {album.get('titulo')}")

    except Exception as e:
        print(f"Error en {album.get('titulo')}: {e}")