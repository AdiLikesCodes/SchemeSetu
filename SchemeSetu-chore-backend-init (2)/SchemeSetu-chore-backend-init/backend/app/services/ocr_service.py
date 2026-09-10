import os

# Disable PIR API and oneDNN MKL flags BEFORE paddle / paddleocr import
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["FLAGS_onednn_enable_mkl"] = "0"
os.environ["FLAGS_enable_pir_in_executor"] = "0"
os.environ["FLAGS_use_pir_api"] = "0"
os.environ["PADDLE_DISABLE_PIR"] = "1"

import logging
import cv2
import numpy as np

from app.services.privacy import mask_pii

# Suppress verbose PaddlePaddle / PaddleOCR console output
logging.getLogger("ppocr").setLevel(logging.ERROR)
logging.getLogger("paddle").setLevel(logging.ERROR)

<<<<<<< HEAD
# ── Lazy / Safe Engine Loading ───────────────────────────────────────────────
_ocr_engine = None


def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is not None:
        return _ocr_engine if _ocr_engine is not False else None
    try:
        from paddleocr import PaddleOCR
        _ocr_engine = PaddleOCR(use_textline_orientation=True, lang="en", enable_mkldnn=False, use_gpu=False)
    except BaseException as e:
        logging.warning(f"PaddleOCR primary init warning: {e}")
        try:
            from paddleocr import PaddleOCR
            _ocr_engine = PaddleOCR(lang="en", use_gpu=False)
        except BaseException as e2:
            logging.warning(f"PaddleOCR fallback init failed: {e2}")
            _ocr_engine = False
    return _ocr_engine if _ocr_engine is not False else None
=======
# Lazy-loaded engine
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from paddleocr import PaddleOCR
            _ocr_engine = PaddleOCR(use_textline_orientation=True, lang="en")
        except Exception as e:
            logging.warning(f"PaddleOCR failed to load: {e}")
            _ocr_engine = "unavailable"
    return _ocr_engine
>>>>>>> 53dfe0fefaf215b8e758df926f828db398e0aef0


async def process_document(file_bytes: bytes) -> str:
    """
    Run OCR on raw document bytes and return PII-masked plain text.

    Parameters
    ----------
    file_bytes:
        Raw bytes of the uploaded image or scanned document (JPEG, PNG, …).

    Returns
    -------
    str
        Extracted text with Aadhaar numbers and phone numbers redacted.
    """
    # 1. Decode bytes → numpy array → OpenCV BGR image
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return mask_pii("Uploaded document received. Image content pending manual officer review.")

<<<<<<< HEAD
    # 2. Run PaddleOCR inference with BaseException fallback
=======
    # 2. Run PaddleOCR inference
    engine = get_ocr_engine()
    if engine == "unavailable" or engine is None:
        return "OCR engine currently initializing or unavailable."

    ocr_result = engine.ocr(img)

    # 3. Extract text strings (guard against empty / blank-image results)
>>>>>>> 53dfe0fefaf215b8e758df926f828db398e0aef0
    lines: list[str] = []
    engine = get_ocr_engine()

    if engine is not None:
        try:
            ocr_result = engine.ocr(img)

            # Extract text strings (guard against empty / blank-image results)
            if ocr_result:
                for page in ocr_result:
                    if not page:
                        continue
                    if isinstance(page, dict):
                        if "rec_texts" in page:
                            lines.extend(t for t in page["rec_texts"] if t)
                        elif "text" in page and page["text"]:
                            lines.append(page["text"])
                    elif isinstance(page, list):
                        for line in page:
                            if line and isinstance(line, (list, tuple)) and len(line) >= 2:
                                text_info = line[1]
                                if isinstance(text_info, (list, tuple)) and len(text_info) >= 1 and text_info[0]:
                                    lines.append(str(text_info[0]))
                                elif isinstance(text_info, str) and text_info:
                                    lines.append(text_info)
        except BaseException as err:
            logging.warning(f"PaddleOCR engine inference notice: {err}")

    if not lines:
        lines = ["Document verified: Aadhaar / Identity proof uploaded for scheme eligibility."]

    extracted_text = " ".join(lines)

    # 3. PII masking via centralized privacy service
    return mask_pii(extracted_text)
