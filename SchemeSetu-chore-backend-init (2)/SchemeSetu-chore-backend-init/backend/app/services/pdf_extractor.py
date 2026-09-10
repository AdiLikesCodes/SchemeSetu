"""
PDF Extractor — Text PDF vs Scanned PDF routing.

Government scheme information is often published as PDFs.
Two types exist:

  1. Text PDFs  — digitally created; extractable with pdfplumber
  2. Scanned PDFs — image-based; require OCR (reuses PaddleOCR infrastructure)

Pipeline:
    PDF URL
      ↓
    Domain validation (must be trusted gov domain)
      ↓
    Download PDF
      ↓
    Detect type:
      ├── Text PDF → pdfplumber
      └── Scanned PDF → PaddleOCR (reuse existing ocr_service)
      ↓
    Return extracted text + detection_method
"""

import io
import logging
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx

from app.services.domain_validator import _is_hostname_trusted
from app.models.scraper import PdfDetectionMethod

logger = logging.getLogger(__name__)

PDF_DOWNLOAD_TIMEOUT = 60.0         # Seconds — PDFs can be large
MIN_TEXT_CHARS_THRESHOLD = 50       # Minimum chars to consider a PDF "text-based"


@dataclass
class PdfExtractionResult:
    """Result of extracting text from an official government PDF."""
    pdf_url: str
    extracted_text: str
    detection_method: PdfDetectionMethod
    page_count: int
    character_count: int
    trusted_domain: bool
    error: str | None = None


def _is_pdf_domain_trusted(pdf_url: str) -> bool:
    """Verify that a PDF URL comes from a trusted government domain."""
    try:
        hostname = urlparse(pdf_url).hostname or ""
        return _is_hostname_trusted(hostname)
    except Exception:
        return False


async def _download_pdf(pdf_url: str) -> bytes:
    """Download a PDF from a government URL. Raises on failure."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            pdf_url,
            timeout=PDF_DOWNLOAD_TIMEOUT,
            follow_redirects=True,
            headers={"User-Agent": "SchemeSetu-GovBot/1.0"},
        )
        response.raise_for_status()
        return response.content


def _extract_text_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """
    Extract text from a digitally-created PDF using pdfplumber.
    Returns (extracted_text, page_count).
    """
    import pdfplumber

    text_parts: list[str] = []
    page_count = 0

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        page_count = len(pdf.pages)
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())

    return "\n\n".join(text_parts), page_count


async def _extract_scanned_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """
    Extract text from a scanned (image-based) PDF using PaddleOCR.
    Each page is rendered as an image and passed through the OCR engine.
    Reuses the existing ocr_service infrastructure.
    """
    import fitz  # PyMuPDF — renders PDF pages to images
    from app.services.ocr_service import process_document

    text_parts: list[str] = []
    page_count = 0

    try:
        pdf_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page_count = pdf_doc.page_count

        for page_num in range(page_count):
            page = pdf_doc.load_page(page_num)
            # Render at 2x resolution for better OCR accuracy
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")

            # Reuse the existing OCR service
            page_text = await process_document(img_bytes)
            if page_text:
                text_parts.append(page_text)

        pdf_doc.close()
    except Exception as exc:
        logger.warning(f"Scanned PDF OCR extraction error: {exc}")

    return "\n\n".join(text_parts), page_count


async def extract_pdf_text(pdf_url: str) -> PdfExtractionResult:
    """
    Main entry point: extract text from an official government PDF.

    Steps:
    1. Validate the PDF URL comes from a trusted government domain.
    2. Download the PDF.
    3. Detect whether it is text-based or scanned.
    4. Route to the appropriate extractor.
    5. Return structured result with detection_method recorded.
    """
    # ── Step 1: Domain validation ────────────────────────────────────────────
    trusted = _is_pdf_domain_trusted(pdf_url)
    if not trusted:
        hostname = urlparse(pdf_url).hostname or "unknown"
        return PdfExtractionResult(
            pdf_url=pdf_url,
            extracted_text="",
            detection_method=PdfDetectionMethod.UNKNOWN,
            page_count=0,
            character_count=0,
            trusted_domain=False,
            error=f"PDF domain '{hostname}' is not a trusted government domain. Skipped.",
        )

    # ── Step 2: Download ─────────────────────────────────────────────────────
    try:
        pdf_bytes = await _download_pdf(pdf_url)
    except Exception as exc:
        logger.error(f"Failed to download PDF {pdf_url}: {exc}")
        return PdfExtractionResult(
            pdf_url=pdf_url,
            extracted_text="",
            detection_method=PdfDetectionMethod.UNKNOWN,
            page_count=0,
            character_count=0,
            trusted_domain=True,
            error=f"PDF download failed: {exc}",
        )

    # ── Step 3: Detect type — try text extraction first ──────────────────────
    try:
        text_content, page_count = _extract_text_pdf(pdf_bytes)
    except Exception as exc:
        logger.warning(f"pdfplumber failed for {pdf_url}: {exc}")
        text_content = ""
        page_count = 0

    if len(text_content.strip()) >= MIN_TEXT_CHARS_THRESHOLD:
        # Sufficient text extracted — this is a text PDF
        return PdfExtractionResult(
            pdf_url=pdf_url,
            extracted_text=text_content,
            detection_method=PdfDetectionMethod.TEXT_PDF,
            page_count=page_count,
            character_count=len(text_content),
            trusted_domain=True,
        )

    # ── Step 4: Scanned PDF — use PaddleOCR ──────────────────────────────────
    logger.info(f"[pdf_extractor] Minimal text from pdfplumber ({len(text_content.strip())} chars). Routing to PaddleOCR for {pdf_url}")
    try:
        ocr_text, ocr_page_count = await _extract_scanned_pdf(pdf_bytes)
        return PdfExtractionResult(
            pdf_url=pdf_url,
            extracted_text=ocr_text,
            detection_method=PdfDetectionMethod.SCANNED,
            page_count=ocr_page_count or page_count,
            character_count=len(ocr_text),
            trusted_domain=True,
        )
    except Exception as exc:
        logger.error(f"PaddleOCR PDF extraction failed for {pdf_url}: {exc}")
        return PdfExtractionResult(
            pdf_url=pdf_url,
            extracted_text=text_content or "",
            detection_method=PdfDetectionMethod.UNKNOWN,
            page_count=page_count,
            character_count=len(text_content),
            trusted_domain=True,
            error=f"OCR extraction failed: {exc}",
        )
