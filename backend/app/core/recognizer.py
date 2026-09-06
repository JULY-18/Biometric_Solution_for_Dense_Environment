from typing import List, Tuple, Optional, Dict, Any
import numpy as np
from app.config import COSINE_SIMILARITY_THRESHOLD

def compute_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Computes the cosine similarity between two normalized 512D ArcFace vectors:
    sim = (A . B) / (||A|| * ||B||)
    """
    if vec1 is None or vec2 is None:
        return 0.0
    v1 = vec1.flatten()
    v2 = vec2.flatten()
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))

def match_face(
    face_embedding: np.ndarray,
    enrolled_students: List[Tuple[str, str, np.ndarray]],
    threshold: float = COSINE_SIMILARITY_THRESHOLD
) -> Optional[Dict[str, Any]]:
    """
    Compares a detected face embedding against all enrolled students.
    Returns the closest match if its cosine similarity exceeds the threshold.
    """
    best_match = None
    highest_score = -1.0

    for srn, name, stored_emb in enrolled_students:
        score = compute_cosine_similarity(face_embedding, stored_emb)
        if score > highest_score:
            highest_score = score
            if score >= threshold:
                best_match = {
                    "srn": srn,
                    "name": name,
                    "confidence": round(float(score), 4)
                }

    return best_match
