import numpy as np

def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Decodes raw image bytes from HTTP upload into a NumPy BGR image matrix.
    Safe fallback if OpenCV is installed or using PIL.
    """
    try:
        import cv2
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image with OpenCV.")
        return img
    except ImportError:
        import io
        from PIL import Image
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Convert RGB to BGR for OpenCV compatibility
        rgb_arr = np.array(pil_img)
        return rgb_arr[:, :, ::-1]

def get_image_dimensions(img: np.ndarray) -> tuple:
    """Returns (height, width, channels) of image."""
    return img.shape
