# main.py
import os
import uuid
import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from video_translator import process_all_languages
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Video Translate Backend (no captions)")

# CORS (allow local/dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.abspath(".")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "originals")
TMP_DIR = os.path.join(BASE_DIR, "uploads", "tmp")
PROCESSED_DIR = os.path.join(BASE_DIR, "processed")
TITLE_FILE = os.path.join(BASE_DIR, "video_titles.json")
COUNTER_FILE = os.path.join(BASE_DIR, "counter.txt")

# languages we support
LANGS = ["en", "hi", "te", "kn"]

# ensure folders exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)
for l in LANGS:
    os.makedirs(os.path.join(PROCESSED_DIR, l), exist_ok=True)


def load_titles():
    if os.path.exists(TITLE_FILE):
        with open(TITLE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_title(video_id: int, title: str):
    data = load_titles()
    data[str(video_id)] = title
    with open(TITLE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def read_counter():
    if not os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, "w", encoding="utf-8") as f:
            f.write("0")
        return 0
    with open(COUNTER_FILE, "r", encoding="utf-8") as f:
        try:
            return int(f.read().strip())
        except:
            return 0


def write_counter(n: int):
    with open(COUNTER_FILE, "w", encoding="utf-8") as f:
        f.write(str(n))


@app.post("/api/upload-video")
async def upload_video(title: str = Form(...), video_file: UploadFile = File(...)):
    # Save uploaded video
    if not video_file:
        return JSONResponse({"error": "No file provided"}, status_code=400)

    ext = video_file.filename.split(".")[-1] or "mp4"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # write file
    with open(filepath, "wb") as f:
        f.write(await video_file.read())

    print("🎞 Uploaded:", filepath)

    # get counter
    vid = read_counter()

    # process
    try:
        outputs = process_all_languages(filepath, vid)  # returns dict lang->outputpath
    except Exception as e:
        print("❌ Processing failed:", e)
        return JSONResponse({"error": str(e)}, status_code=500)

    # save title and increment counter
    save_title(vid, title)
    write_counter(vid + 1)

    # build response URLs
    translations = {}
    for lang, out_path in outputs.items():
        # serve using static endpoint /processed/{lang}/{filename}
        fname = os.path.basename(out_path)
        translations[lang] = f"http://127.0.0.1:8000/processed/{lang}/{fname}"

    return {
        "status": "success",
        "video_id": vid,
        "title": title,
        "translations": translations,
    }


@app.get("/api/all-videos")
def list_all_videos():
    titles = load_titles()
    last = read_counter()
    videos = []
    for vid in range(0, last):
        entry = {"id": vid, "title": titles.get(str(vid), f"Video {vid}"), "translations": {}}
        for lang in LANGS:
            path = os.path.join(PROCESSED_DIR, lang, f"video{vid}.mp4")
            if os.path.exists(path):
                entry["translations"][lang] = f"http://127.0.0.1:8000/processed/{lang}/video{vid}.mp4"
        videos.append(entry)
    return {"videos": videos}


@app.get("/processed/{lang}/{filename}")
def serve_processed(lang: str, filename: str):
    # static file serving for processed videos
    file_path = os.path.join(PROCESSED_DIR, lang, filename)
    if not os.path.exists(file_path):
        return JSONResponse({"error": "File not found"}, status_code=404)
    return FileResponse(file_path, media_type="video/mp4")


@app.get("/api/get-video/{video_id}")
def get_video_by_id(video_id: int):
    titles = load_titles()
    last = read_counter()
    if video_id < 0 or video_id >= last:
        return JSONResponse({"error": "Video id not found"}, status_code=404)

    result = {"id": video_id, "title": titles.get(str(video_id), f"Video {video_id}"), "translations": {}}
    for lang in LANGS:
        p = os.path.join(PROCESSED_DIR, lang, f"video{video_id}.mp4")
        if os.path.exists(p):
            result["translations"][lang] = f"http://127.0.0.1:8000/processed/{lang}/video{video_id}.mp4"
    if not result["translations"]:
        return JSONResponse({"error": "No translations found"}, status_code=404)
    return result
