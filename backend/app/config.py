import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
EMBEDDINGS_DIR = DATA_DIR / "embeddings"
REPORTS_DIR = DATA_DIR / "reports"

# Ensure runtime directories exist
EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Database
DATABASE_PATH = DATA_DIR / "attendance.db"

# API & Security
API_TITLE = "Smart Classroom Biometric Attendance API"
API_VERSION = "1.0.0"
ALLOWED_ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "*",
]

# AI / Biometric Configurations
# Recommended cosine similarity threshold for ArcFace (insightface)
COSINE_SIMILARITY_THRESHOLD = float(os.getenv("COSINE_SIMILARITY_THRESHOLD", 0.50))
DETECTION_CONFIDENCE_THRESHOLD = float(os.getenv("DETECTION_CONFIDENCE_THRESHOLD", 0.60))
INSIGHTFACE_MODEL_NAME = os.getenv("INSIGHTFACE_MODEL_NAME", "buffalo_l")
