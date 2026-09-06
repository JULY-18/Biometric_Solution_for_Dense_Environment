import logging
from typing import List, Dict, Any
import numpy as np
from app.config import INSIGHTFACE_MODEL_NAME, DETECTION_CONFIDENCE_THRESHOLD

logger = logging.getLogger(__name__)

class BiometricPipeline:
    """
    Encapsulates InsightFace FaceAnalysis (RetinaFace for dense localization
    and ArcFace for 512-dimensional vector embedding extraction).
    """
    _instance = None
    _app = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self._initialize_model()

    def _initialize_model(self):
        try:
            import insightface
            from insightface.app import FaceAnalysis

            logger.info("Initializing InsightFace FaceAnalysis (%s)...", INSIGHTFACE_MODEL_NAME)
            # ctx_id=0 for GPU, -1 for CPU
            self._app = FaceAnalysis(name=INSIGHTFACE_MODEL_NAME, providers=['CPUExecutionProvider'])
            self._app.prepare(ctx_id=-1, det_size=(640, 640))
            logger.info("InsightFace pipeline ready.")
        except Exception as exc:
            logger.warning(
                "InsightFace could not be loaded directly (%s). Pipeline will operate in fallback mode until dependencies/weights are installed.",
                exc
            )
            self._app = None

    def process_image(self, image_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs dense face detection and feature extraction on the input image.
        Returns a list of detected face objects with bbox, landmarks, and embedding.
        """
        if self._app is None:
            # Fallback mock/simulated detection for initial testing if onnxruntime/insightface not initialized
            return []

        faces = self._app.get(image_bgr)
        results = []
        for face in faces:
            if face.det_score < DETECTION_CONFIDENCE_THRESHOLD:
                continue
            results.append({
                "bbox": face.bbox.tolist(), # [x1, y1, x2, y2]
                "kps": face.kps.tolist() if face.kps is not None else [],
                "score": float(face.det_score),
                "embedding": face.embedding # 512-D numpy vector
            })
        return results
