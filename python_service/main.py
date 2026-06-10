import sys
import os
import io
import base64
import torch
import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from PIL import Image

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.embedder import embed_texto
from services.image_embedder import get_clip_model

app = FastAPI(title="RAG Embedding Microservice")

class TextQuery(BaseModel):
    texto: str

class ImageQueryBase64(BaseModel):
    image_base64: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/embed/texto")
def get_text_embedding(query: TextQuery):
    try:
        vector = embed_texto(query.texto)
        return {"embedding": vector}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/embed/imagen_base64")
def get_image_embedding_b64(query: ImageQueryBase64):
    try:
        # Decodificar Base64
        image_data = base64.b64decode(query.image_base64)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        model, preprocess = get_clip_model()
        image_input = preprocess(image).unsqueeze(0)

        with torch.no_grad():
            image_features = model.encode_image(image_input)

        image_features /= image_features.norm(dim=-1, keepdim=True)
        vector = image_features[0].cpu().tolist()
        
        return {"embedding": vector}
    except Exception as e:
        print("Error embed imagen:", e)
        raise HTTPException(status_code=500, detail=str(e))

class TextToImageQuery(BaseModel):
    texto: str

@app.post("/api/embed/texto_a_imagen")
def get_text_to_image_embedding(query: TextToImageQuery):
    """
    Genera un embedding CLIP de 512 dims a partir de texto.
    Permite buscar imágenes/álbumes por descripción textual,
    ya que CLIP proyecta texto e imagen al mismo espacio vectorial.
    """
    try:
        model, _ = get_clip_model()
        
        # CLIP tokeniza texto directamente
        import open_clip
        tokenizer = open_clip.get_tokenizer("ViT-B-32")
        text_tokens = tokenizer([query.texto])
        
        with torch.no_grad():
            text_features = model.encode_text(text_tokens)
        
        text_features /= text_features.norm(dim=-1, keepdim=True)
        vector = text_features[0].cpu().tolist()
        
        return {"embedding": vector, "dims": len(vector)}
    except Exception as e:
        print("Error embed texto→imagen:", e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Iniciando servicio de embeddings internos en puerto 5000...")
    uvicorn.run(app, port=5000)
