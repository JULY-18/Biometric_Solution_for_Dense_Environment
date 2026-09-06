import sqlite3
import json
from datetime import datetime
from typing import List, Optional, Tuple
import numpy as np
from app.config import DATABASE_PATH, EMBEDDINGS_DIR

def get_connection():
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite schema for students and attendance logs."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            srn TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            branch TEXT,
            embedding_file TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            srn TEXT NOT NULL,
            course_code TEXT,
            marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            confidence REAL,
            FOREIGN KEY (srn) REFERENCES students (srn)
        )
    """)
    conn.commit()
    conn.close()

def save_student(srn: str, name: str, email: Optional[str], branch: Optional[str], embedding: np.ndarray):
    """Saves student record and writes the 512D embedding vector to disk."""
    embedding_file = f"{srn}.npy"
    embedding_path = EMBEDDINGS_DIR / embedding_file
    np.save(embedding_path, embedding)

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO students (srn, name, email, branch, embedding_file)
        VALUES (?, ?, ?, ?, ?)
    """, (srn, name, email, branch, embedding_file))
    conn.commit()
    conn.close()

def get_all_enrolled_students() -> List[Tuple[str, str, np.ndarray]]:
    """
    Returns a list of (srn, name, embedding_vector) for all students.
    """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT srn, name, embedding_file FROM students")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for row in rows:
        srn, name, emb_file = row["srn"], row["name"], row["embedding_file"]
        if emb_file:
            emb_path = EMBEDDINGS_DIR / emb_file
            if emb_path.exists():
                emb = np.load(emb_path)
                results.append((srn, name, emb))
    return results

def log_attendance(srn: str, confidence: float, course_code: str = "CLASS-01"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO attendance_logs (srn, course_code, confidence, marked_at)
        VALUES (?, ?, ?, ?)
    """, (srn, course_code, confidence, datetime.utcnow()))
    conn.commit()
    conn.close()

def get_enrolled_count() -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM students")
    count = cursor.fetchone()[0]
    conn.close()
    return count
