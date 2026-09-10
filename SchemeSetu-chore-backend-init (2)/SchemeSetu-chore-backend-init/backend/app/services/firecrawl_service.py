"""
Firecrawl Service — Page scraping with explicit fallback tracking.

When Firecrawl is available (API key set), it is used first.
If Firecrawl fails for any reason:
  1. The failure is EXPLICITLY RECORDED (reason, timestamp).
  2. The system falls back to httpx + BeautifulSoup.
  3. extraction_method is set to "httpx_fallback" — never silently switched.

The database records which method was used for every single scrape job,
making it auditable: "Was this scheme data obtained via Firecrawl or fallback?"
"""

import asyncio
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime
from urllib.parse import urlparse, urljoin

import httpx
from bs4 import BeautifulSoup

from app.core.config import settings
from app.models.scraper import ExtractionMethod
from app.services.domain_validator import extract_hostname, _is_hostname_trusted

logger = logging.getLogger(__name__)

# ── Rate-limiting constants ───────────────────────────────────────────────────
REQUEST_DELAY_SECONDS = 1.0     # Polite crawl delay between requests
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 2.0        # Exponential: 2s, 4s, 8s
REQUEST_TIMEOUT = 30.0          # Seconds
MAX_CRAWL_PAGES = 10            # Max pages per crawl_scheme_source() call

# Keywords indicating a page is relevant to scheme information
SCHEME_RELEVANT_KEYWORDS = [
    "scheme", "eligibility", "loan", "credit", "benefit", "subsidy",
    "beneficiar", "guideline", "circular", "notification", "application",
    "interest", "repayment", "moratorium", "income", "documents required",
    "who can apply", "how to apply",
]


@dataclass
class PageContent:
    """Result of scraping a single government page."""
    url: str
    hostname: str
    page_title: str
    raw_html: str
    markdown_text: str
    extraction_method: ExtractionMethod
    scraped_at: datetime = field(default_factory=datetime.utcnow)
    firecrawl_used: bool = False
    firecrawl_failure_reason: str | None = None
    pdf_links: list[str] = field(default_factory=list)
    scheme_links: list[str] = field(default_factory=list)
    http_status: int | None = None
    error: str | None = None


# ── Internal helpers ──────────────────────────────────────────────────────────


def _extract_text_from_html(html: str, base_url: str) -> tuple[str, list[str], list[str]]:
    """
    Parse raw HTML with BeautifulSoup and return:
      - markdown-ish plain text
      - list of .pdf/.PDF links on the page (from trusted domains)
      - list of scheme-relevant internal links
    """
    soup = BeautifulSoup(html, "lxml")

    # Remove nav / footer / script / style noise
    for tag in soup.select("nav, footer, script, style, .menu, .sidebar, #header"):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    # Collapse excessive blank lines
    lines = [ln for ln in text.splitlines() if ln.strip()]
    markdown_text = "\n".join(lines)

    # Collect links
    pdf_links: list[str] = []
    scheme_links: list[str] = []

    for a_tag in soup.find_all("a", href=True):
        href: str = a_tag["href"].strip()
        abs_href = urljoin(base_url, href)
        link_text = a_tag.get_text(strip=True).lower()
        href_lower = abs_href.lower()

        parsed_href = urlparse(abs_href)
        link_hostname = parsed_href.hostname or ""

        # Only follow links that stay on trusted government domains
        if not _is_hostname_trusted(link_hostname):
            continue

        if href_lower.endswith(".pdf"):
            pdf_links.append(abs_href)
        else:
            # Check if the link text or URL hints at scheme content
            is_relevant = any(kw in link_text or kw in href_lower for kw in SCHEME_RELEVANT_KEYWORDS)
            if is_relevant:
                scheme_links.append(abs_href)

    return markdown_text, list(dict.fromkeys(pdf_links)), list(dict.fromkeys(scheme_links))


async def _httpx_scrape(url: str, client: httpx.AsyncClient) -> tuple[str, str, int]:
    """
    Fetch a page with httpx and return (html, page_title, http_status).
    Raises httpx.HTTPError on failure.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = await client.get(url, timeout=REQUEST_TIMEOUT, follow_redirects=True)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "lxml")
            title_tag = soup.find("title")
            page_title = title_tag.get_text(strip=True) if title_tag else url
            return response.text, page_title, response.status_code
        except httpx.HTTPStatusError as exc:
            if attempt == MAX_RETRIES:
                raise
            wait = RETRY_BACKOFF_BASE ** attempt
            logger.warning(f"HTTP {exc.response.status_code} for {url} — retry {attempt}/{MAX_RETRIES} in {wait}s")
            await asyncio.sleep(wait)
        except httpx.RequestError as exc:
            if attempt == MAX_RETRIES:
                raise
            wait = RETRY_BACKOFF_BASE ** attempt
            logger.warning(f"Request error for {url}: {exc} — retry {attempt}/{MAX_RETRIES} in {wait}s")
            await asyncio.sleep(wait)


async def _firecrawl_scrape(url: str) -> tuple[str, str] | None:
    """
    Try to scrape using the Firecrawl API.
    Returns (markdown_text, page_title) on success, None on failure.
    """
    if not settings.FIRECRAWL_API_KEY:
        return None

    try:
        from firecrawl import FirecrawlApp  # type: ignore
        app = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
        result = app.scrape_url(url, formats=["markdown"])
        if result and hasattr(result, "markdown"):
            title = getattr(result, "metadata", {}).get("title", url) if hasattr(result, "metadata") else url
            return result.markdown or "", title
        return None
    except Exception as exc:
        logger.warning(f"Firecrawl failed for {url}: {exc}")
        return None


# ── Public API ────────────────────────────────────────────────────────────────


async def scrape_url(url: str) -> PageContent:
    """
    Scrape a single government page.

    Pipeline:
        1. Try Firecrawl (if API key is configured)
        2. If Firecrawl fails → RECORD FAILURE → fall back to httpx
        3. Set extraction_method field explicitly (never silently switch)
    """
    hostname = extract_hostname(url) or ""

    async with httpx.AsyncClient(headers={"User-Agent": "SchemeSetu-GovBot/1.0 (+https://schemesetu.gov)"}) as client:
        # ── Attempt Firecrawl ────────────────────────────────────────────────
        firecrawl_result = None
        firecrawl_failure_reason: str | None = None

        if settings.FIRECRAWL_API_KEY:
            firecrawl_result = await _firecrawl_scrape(url)
            if firecrawl_result is None:
                firecrawl_failure_reason = "Firecrawl returned no content or API call failed."
                logger.info(f"[scrape_url] Firecrawl failed for {url}. Recording failure and switching to httpx fallback.")

        # ── Fall back to httpx if needed ──────────────────────────────────────
        if firecrawl_result is not None:
            markdown_text, page_title = firecrawl_result
            # Build page content from Firecrawl result
            pdf_links: list[str] = []
            scheme_links: list[str] = []
            # Try to extract links from raw page via httpx (Firecrawl may not return links)
            try:
                html, _, _ = await _httpx_scrape(url, client)
                _, pdf_links, scheme_links = _extract_text_from_html(html, url)
                raw_html = html
            except Exception:
                raw_html = ""

            return PageContent(
                url=url,
                hostname=hostname,
                page_title=page_title,
                raw_html=raw_html,
                markdown_text=markdown_text,
                extraction_method=ExtractionMethod.FIRECRAWL,
                firecrawl_used=True,
                pdf_links=pdf_links,
                scheme_links=scheme_links,
            )
        else:
            # httpx fallback — explicitly marked
            try:
                html, page_title, http_status = await _httpx_scrape(url, client)
                markdown_text, pdf_links, scheme_links = _extract_text_from_html(html, url)

                return PageContent(
                    url=url,
                    hostname=hostname,
                    page_title=page_title,
                    raw_html=html,
                    markdown_text=markdown_text,
                    extraction_method=ExtractionMethod.HTTPX_FALLBACK,
                    firecrawl_used=False,
                    firecrawl_failure_reason=firecrawl_failure_reason,
                    pdf_links=pdf_links,
                    scheme_links=scheme_links,
                    http_status=http_status,
                )
            except Exception as exc:
                logger.error(f"httpx scrape also failed for {url}: {exc}")
                return PageContent(
                    url=url,
                    hostname=hostname,
                    page_title="",
                    raw_html="",
                    markdown_text="",
                    extraction_method=ExtractionMethod.HTTPX_FALLBACK,
                    firecrawl_used=False,
                    firecrawl_failure_reason=firecrawl_failure_reason,
                    error=str(exc),
                )


async def crawl_scheme_source(url: str, max_pages: int = MAX_CRAWL_PAGES) -> list[PageContent]:
    """
    Crawl a government scheme index page and follow relevant child links.

    Respects:
    - Per-request delay (polite crawling)
    - Max page limit
    - Duplicate URL detection
    - Only follows links on trusted government domains

    Returns a list of PageContent for the source page + all relevant child pages.
    """
    results: list[PageContent] = []
    visited: set[str] = set()
    queue: list[str] = [url]

    async with httpx.AsyncClient(headers={"User-Agent": "SchemeSetu-GovBot/1.0"}) as _client:
        while queue and len(results) < max_pages:
            current_url = queue.pop(0)
            if current_url in visited:
                continue
            visited.add(current_url)

            logger.info(f"[crawl] Scraping: {current_url}")
            page = await scrape_url(current_url)
            results.append(page)

            # Enqueue relevant scheme links found on this page
            for link in page.scheme_links:
                if link not in visited and len(queue) + len(results) < max_pages:
                    queue.append(link)

            if queue:
                await asyncio.sleep(REQUEST_DELAY_SECONDS)

    return results
