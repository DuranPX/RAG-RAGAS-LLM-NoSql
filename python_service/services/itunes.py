import requests
from io import BytesIO
from PIL import Image

THUMB_SIZE = (600, 600)
JPEG_QUALITY = 85


def obtener_portada_itunes(artist_name: str, album_title: str = None) -> dict:
    if not artist_name and not album_title:
        return None

    base = "https://itunes.apple.com/search"
    query = f"{artist_name or ''} {album_title or ''}".strip()

    try:
        r = requests.get(base, params={
            "term": query,
            "entity": "album",
            "limit": 10,
            "media": "music"
        }, timeout=10)

        r.raise_for_status()
        results = r.json().get("results", [])

        url = None
        descripcion = f"Portada del álbum {album_title} de {artist_name}"

        if album_title:
            for it in results:
                if it.get("collectionName", "").lower() == album_title.lower():
                    url_raw = it.get("artworkUrl100")
                    if url_raw:
                        url = url_raw.replace("100x100bb.jpg", "600x600bb.jpg")
                        break

        if not url and results:
            url_raw = results[0].get("artworkUrl100")
            if url_raw:
                url = url_raw.replace("100x100bb.jpg", "600x600bb.jpg")

        if url:
            return {"url": url, "descripcion": descripcion}

        return None

    except Exception:
        return None


def download_and_process_image(url: str):
    r = requests.get(url, timeout=15)
    r.raise_for_status()

    img = Image.open(BytesIO(r.content)).convert("RGB")
    img.thumbnail(THUMB_SIZE, Image.LANCZOS)

    bio = BytesIO()
    img.save(bio, format="JPEG", quality=JPEG_QUALITY)
    bio.seek(0)

    return bio.read(), img
