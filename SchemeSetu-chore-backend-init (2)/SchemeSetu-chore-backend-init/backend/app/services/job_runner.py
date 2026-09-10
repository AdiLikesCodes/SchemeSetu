"""
Job Runner — Background scrape job execution.

Design decisions:
  - Uses FastAPI BackgroundTasks for the current MVP (no Redis/Celery needed).
  - run_scrape_job() is fully isolated — the API layer just calls it via
    background_tasks.add_task(run_scrape_job, ...) and returns 202 immediately.
  - To migrate to Celery/RQ later, only this file needs to change. The API
    routes and scraper services remain unchanged.

Pipeline per job:
    Domain validation (Layer 1 + Layer 2)
        ↓
    Firecrawl / httpx fallback (extraction_method recorded explicitly)
        ↓
    PDF detection & extraction (text PDF → pdfplumber | scanned → PaddleOCR)
        ↓
    Gemini extraction (structured + candidate rules)
        ↓
    Change detection (vs existing published scheme if re-scrape)
        ↓
    Conflict detection
        ↓
    Validation
        ↓
    Save ScrapedScheme with status = DRAFT or REVIEW_REQUIRED
        ↓
    Update ScrapeJob status = SUCCESS or FAILED
        ↓
    Append AuditLog
"""

import logging
import uuid
from datetime import datetime

from app.models.scraper import (
    ScrapeJob,
    ScrapedScheme,
    SchemeVersion,
    AuditLog,
    JobStatus,
    SchemeStatus,
    ExtractionMethod,
    EvidencedValue,
    CandidateRule,
    ConflictRecord,
)
from app.services.domain_validator import validate_government_url
from app.services.firecrawl_service import scrape_url, crawl_scheme_source, PageContent
from app.services.pdf_extractor import extract_pdf_text
from app.services.scheme_extractor import extract_scheme_data
from app.services.change_detector import detect_changes, create_scrape_change_record

logger = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────


async def _append_audit_log(
    actor: str,
    action: str,
    target_type: str,
    target_id: str,
    details: dict | None = None,
) -> None:
    """Append an immutable audit log entry."""
    log = AuditLog(
        log_id=str(uuid.uuid4()),
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details or {},
        created_at=datetime.utcnow(),
    )
    try:
        await log.insert()
    except Exception as exc:
        logger.warning(f"[job_runner] AuditLog insert failed: {exc}")


def _validate_extracted_scheme(extracted: dict) -> tuple[list[str], list[str]]:
    """
    Validate the extracted scheme data.
    Returns (errors, warnings).
    """
    errors: list[str] = []
    warnings: list[str] = []

    if not extracted.get("scheme_name"):
        warnings.append("Scheme name could not be extracted from the source.")

    if not extracted.get("ministry") and not extracted.get("implementing_agency"):
        warnings.append("No ministry or implementing agency found.")

    if not extracted.get("candidate_rules"):
        warnings.append("No explicit eligibility rules found in source text.")

    if extracted.get("income_requirements", {}).get("status") == "not_specified":
        warnings.append("Income eligibility criteria not explicitly stated in source.")

    if "error" in extracted:
        errors.append(f"Extraction error: {extracted['error']}")

    return errors, warnings


def _determine_status(
    errors: list[str],
    warnings: list[str],
    has_conflicts: bool,
) -> SchemeStatus:
    """Determine the initial status of a scraped scheme based on validation results."""
    if errors:
        return SchemeStatus.VALIDATION_FAILED
    if has_conflicts or warnings:
        return SchemeStatus.REVIEW_REQUIRED
    return SchemeStatus.DRAFT


async def _build_scraped_scheme(
    extracted: dict,
    page: PageContent,
    job: ScrapeJob,
    version: str,
    errors: list[str],
    warnings: list[str],
    conflicts: list[ConflictRecord],
) -> ScrapedScheme:
    """Construct a ScrapedScheme Beanie document from extraction results."""

    def _ev(field: str) -> EvidencedValue:
        val = extracted.get(field)
        if isinstance(val, EvidencedValue):
            return val
        if isinstance(val, dict):
            return EvidencedValue(**val)
        return EvidencedValue()

    has_conflicts = len(conflicts) > 0
    status = _determine_status(errors, warnings, has_conflicts)

    scheme_id = f"SCRAPED-{uuid.uuid4().hex[:8].upper()}"

    # Assign real scheme_id to candidate rules
    candidate_rules: list[CandidateRule] = extracted.get("candidate_rules", [])
    for rule in candidate_rules:
        if rule.scheme_id == "pending":
            rule.scheme_id = scheme_id

    return ScrapedScheme(
        scheme_id=scheme_id,
        job_id=job.job_id,
        source_id=job.source_id,
        version=version,
        status=status,
        name=extracted.get("scheme_name"),
        ministry=extracted.get("ministry"),
        department=extracted.get("department"),
        implementing_agency=extracted.get("implementing_agency"),
        scheme_type=extracted.get("scheme_type", "other"),
        description=extracted.get("description"),
        target_beneficiaries=extracted.get("target_beneficiaries", []),
        category_requirements=extracted.get("category_requirements", []),
        age_requirements=_ev("age_requirements"),
        income_requirements=_ev("income_requirements"),
        location_requirements=extracted.get("location_requirements", []),
        gender_requirements=extracted.get("gender_requirements", []),
        disability_requirements=extracted.get("disability_requirements", []),
        education_requirements=extracted.get("education_requirements", []),
        business_requirements=extracted.get("business_requirements", []),
        project_cost=_ev("project_cost"),
        loan_amount=_ev("loan_amount"),
        interest_rate=_ev("interest_rate"),
        subsidy=_ev("subsidy"),
        margin_money=_ev("margin_money"),
        moratorium=_ev("moratorium"),
        repayment_period=_ev("repayment_period"),
        benefits=extracted.get("benefits", []),
        required_documents=extracted.get("required_documents", []),
        application_process=extracted.get("application_process", []),
        channel_partners=extracted.get("channel_partners", []),
        application_url=extracted.get("application_url"),
        official_contact=extracted.get("official_contact"),
        candidate_rules=candidate_rules,
        source_url=page.url,
        source_domain=page.hostname,
        source_authority=job.authority,
        page_title=page.page_title,
        extraction_method=page.extraction_method,
        pdf_sources=[],
        scraped_at=page.scraped_at,
        validation_errors=errors,
        validation_warnings=warnings,
        conflicts=conflicts,
        has_conflicts=has_conflicts,
    )


# ── Main Job Runner ───────────────────────────────────────────────────────────


async def run_scrape_job(job_id: str, url: str) -> None:
    """
    Full scrape pipeline for a single government URL.
    Designed to run as a FastAPI BackgroundTask.
    Can be replaced by a Celery task without changing the API layer.

    The API returns 202 immediately; this function runs asynchronously.
    """
    # Load the job record
    job = await ScrapeJob.find_one(ScrapeJob.job_id == job_id)
    if not job:
        logger.error(f"[job_runner] Job {job_id} not found in DB.")
        return

    job.status = JobStatus.RUNNING
    job.started_at = datetime.utcnow()
    await job.save()

    version = f"{datetime.utcnow().year}.1"
    scraped_schemes: list[ScrapedScheme] = []

    try:
        # ── Step 1: Domain validation ─────────────────────────────────────────
        validation = await validate_government_url(url)
        if not validation.allowed:
            job.status = JobStatus.FAILED
            job.errors.append(f"Domain validation failed: {validation.rejection_reason}")
            job.completed_at = datetime.utcnow()
            await job.save()
            await _append_audit_log(
                actor="system",
                action="SCRAPE_DOMAIN_REJECTED",
                target_type="ScrapeJob",
                target_id=job_id,
                details={"url": url, "reason": validation.rejection_reason},
            )
            return

        source_record = validation.source_record
        job.source_id = str(source_record.id) if source_record else None
        job.authority = validation.authority
        await job.save()

        # ── Step 2: Scrape page (Firecrawl → httpx fallback) ─────────────────
        page = await scrape_url(url)

        # Record extraction method on the job
        job.firecrawl_used = page.firecrawl_used
        job.extraction_method = page.extraction_method
        if page.firecrawl_failure_reason:
            job.firecrawl_failure_reason = page.firecrawl_failure_reason
            job.warnings.append(f"Firecrawl fallback used: {page.firecrawl_failure_reason}")

        if page.error:
            job.status = JobStatus.FAILED
            job.errors.append(f"Page scrape failed: {page.error}")
            job.completed_at = datetime.utcnow()
            await job.save()
            return

        # ── Step 3: Process PDFs found on the page ────────────────────────────
        combined_text = page.markdown_text
        pdf_sources: list[str] = []

        for pdf_url in page.pdf_links[:5]:  # Limit to 5 PDFs per page
            logger.info(f"[job_runner] Processing PDF: {pdf_url}")
            pdf_result = await extract_pdf_text(pdf_url)
            if pdf_result.extracted_text and not pdf_result.error:
                combined_text += f"\n\n--- PDF: {pdf_url} ---\n{pdf_result.extracted_text}"
                pdf_sources.append(pdf_url)
                job.pdfs_processed += 1
            elif pdf_result.error:
                job.warnings.append(f"PDF extraction warning ({pdf_url}): {pdf_result.error}")

        # ── Step 4: Gemini extraction ─────────────────────────────────────────
        extracted = await extract_scheme_data(
            content=combined_text,
            source_url=url,
            page_title=page.page_title,
            extraction_method=page.extraction_method,
            version=version,
        )

        # ── Step 5: Change detection (if scheme exists) ───────────────────────
        if extracted.get("scheme_name"):
            existing = await ScrapedScheme.find_one(
                ScrapedScheme.name == extracted.get("scheme_name"),
                ScrapedScheme.status == SchemeStatus.PUBLISHED,
            )
            if existing:
                changes = detect_changes(
                    old_scheme=existing.model_dump(mode="json"),
                    new_scheme=extracted,
                    old_source_url=existing.source_url,
                    new_source_url=url,
                )
                if changes:
                    await create_scrape_change_record(
                        scheme_id=existing.scheme_id,
                        job_id=job_id,
                        old_version=existing.version,
                        new_version=version,
                        changes=changes,
                    )
                    # Bump version number
                    try:
                        year, rev = existing.version.split(".")
                        version = f"{year}.{int(rev) + 1}"
                    except Exception:
                        version = f"{datetime.utcnow().year}.2"

        # ── Step 6: Validation ────────────────────────────────────────────────
        errors, warnings = _validate_extracted_scheme(extracted)

        # ── Step 7: Build and save ScrapedScheme ──────────────────────────────
        scraped_scheme = await _build_scraped_scheme(
            extracted=extracted,
            page=page,
            job=job,
            version=version,
            errors=errors,
            warnings=warnings,
            conflicts=[],
        )
        scraped_scheme.pdf_sources = pdf_sources
        await scraped_scheme.insert()
        scraped_schemes.append(scraped_scheme)

        # ── Step 8: Finalize job ──────────────────────────────────────────────
        job.status = JobStatus.SUCCESS
        job.schemes_found = len(scraped_schemes)
        job.completed_at = datetime.utcnow()
        await job.save()

        await _append_audit_log(
            actor="system",
            action="SCRAPE_COMPLETED",
            target_type="ScrapeJob",
            target_id=job_id,
            details={
                "url": url,
                "schemes_found": len(scraped_schemes),
                "extraction_method": job.extraction_method,
                "pdfs_processed": job.pdfs_processed,
            },
        )

    except Exception as exc:
        logger.exception(f"[job_runner] Unhandled error in job {job_id}: {exc}")
        try:
            job.status = JobStatus.FAILED
            job.errors.append(f"Unhandled error: {str(exc)}")
            job.completed_at = datetime.utcnow()
            await job.save()
        except Exception:
            pass
