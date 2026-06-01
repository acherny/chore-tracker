from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database import create_db
from routers import kids, chores, completions, stats
from scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db()
    start_scheduler()
    yield


app = FastAPI(title="Chore Tracker", version="1.0.0", lifespan=lifespan)

# Allow the Vite dev server to call the API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(kids.router, prefix="/api/kids")
app.include_router(chores.router, prefix="/api/chores")
app.include_router(completions.router, prefix="/api/completions")
app.include_router(stats.router, prefix="/api/stats")


# ── Serve the built React app ─────────────────────────────────────────────────
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react(full_path: str):
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    async def dev_root():
        return {"status": "API running — frontend not built yet"}
