from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import API_TITLE, API_VERSION, ALLOWED_ORIGINS
from app.database.db import init_db
from app.api.routes import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables on startup
    init_db()
    yield

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="Web-Native Biometric Classroom Attendance System using RetinaFace and ArcFace.",
    lifespan=lifespan
)

# Enable CORS for browser frontend cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Classroom Attendance Biometric API",
        "docs": "/docs",
        "version": API_VERSION
    }
