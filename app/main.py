from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.routes import router

load_dotenv()

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(title="Memoir API")
app.include_router(router)
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
