"""
Scheme Extractor — Gemini-powered extraction with strict anti-hallucination rules.

CRITICAL RULE (enforced by prompt):
    If a value is NOT explicitly stated in the official source text:
        → value = null, status = "not_specified"
    NEVER invent or infer a value from context.

Every non-null field carries:
    evidence.source_text = exact sentence from the official page
    evidence.url = source URL

This makes SchemeSetu explainable:
    "Why is this rule this value?"
    → "Because the official NSFDC page at <url> states: '<source_text>'"

Pipeline enforced here:
    Official Source
        ↓
    Gemini extraction (extraction assistant only)
        ↓
    Structured CandidateRule (never auto-activated)
        ↓
    Evidence validation
        ↓
    Human admin review
        ↓
    Published deterministic rule
"""

import json
import logging
import re
from datetime import datetime

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import settings
from app.models.scraper import (
    EvidencedValue,
    SourceEvidence,
    CandidateRule,
    ExtractionMethod,
)

logger = logging.getLogger(__name__)


# ── Extraction prompt ─────────────────────────────────────────────────────────

EXTRACTION_SYSTEM_PROMPT = """
You are a structured data extraction assistant for SchemeSetu, a government scheme eligibility system.

Your ONLY job is to extract scheme information that is EXPLICITLY STATED in the provided official government source text.

STRICT RULES — THESE ARE ABSOLUTE:
1. If a piece of information is NOT explicitly written in the text, set its value to null and status to "not_specified".
2. NEVER invent, infer, assume, or guess any value.
3. NEVER use your training knowledge to fill gaps — only extract what the provided text says.
4. For every non-null value, you MUST provide the exact sentence from the source text that supports it.
5. Eligibility rules must only be created when the source text explicitly states a requirement (e.g., "Annual income should not exceed ₹5 lakh").
6. Do NOT create eligibility rules for values that are only implied or indirectly mentioned.

FINANCIAL VALUE NORMALIZATION:
- "₹5 lakh" → value: 500000, unit: "INR"
- "₹5 crore" → value: 50000000, unit: "INR"
- "6.5%" → value: 6.5, unit: "percent_per_annum"
- "12 months" → value: 12, unit: "months"

OPERATOR RULES:
- "should not exceed", "must be less than or equal to", "maximum" → operator: "<="
- "must be at least", "minimum", "not less than" → operator: ">="
- "must be exactly", "equal to" → operator: "=="
- Membership in a list → operator: "in"
- If no operator is explicitly stated → operator: null, status: "not_specified"

Return ONLY valid JSON. No markdown. No explanation.
"""

EXTRACTION_USER_TEMPLATE = """
Source URL: {source_url}
Page Title: {page_title}

OFFICIAL SOURCE TEXT:
{content}

Extract all scheme information from the above text following the strict rules.
Return JSON matching this schema exactly:

{{
  "scheme_name": null,
  "ministry": null,
  "department": null,
  "implementing_agency": null,
  "scheme_type": "other",
  "description": null,
  "target_beneficiaries": [],
  "category_requirements": [],
  "age_requirements": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "income_requirements": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "location_requirements": [],
  "gender_requirements": [],
  "disability_requirements": [],
  "education_requirements": [],
  "business_requirements": [],
  "project_cost": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "loan_amount": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "interest_rate": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "subsidy": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "margin_money": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "moratorium": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "repayment_period": {{"value": null, "unit": null, "status": "not_specified", "evidence": null}},
  "benefits": [],
  "required_documents": [],
  "application_process": [],
  "channel_partners": [],
  "application_url": null,
  "official_contact": null,
  "candidate_rules": []
}}

For EvidencedValue fields with a non-null value, use this evidence structure:
{{
  "value": <extracted_value>,
  "unit": "<unit_if_applicable>",
  "status": "ok",
  "evidence": {{
    "url": "{source_url}",
    "page_title": "{page_title}",
    "source_text": "<EXACT sentence from the text>",
    "retrieved_at": "{retrieved_at}"
  }}
}}

For candidate_rules, use this structure (ONLY for EXPLICITLY stated requirements):
{{
  "rule_id": "auto-<field>-001",
  "scheme_id": "pending",
  "field": "<field_name>",
  "operator": "<operator_or_null>",
  "value": <value_or_null>,
  "unit": "<unit_or_null>",
  "description": "<human readable description>",
  "source_url": "{source_url}",
  "source_text": "<EXACT sentence from the text>",
  "version": "{version}",
  "status": "candidate"
}}
"""


def _clean_llm_json(response_text: str) -> dict:
    """Strip markdown fences from LLM response and parse JSON."""
    text = response_text.strip()
    # Remove ```json ... ``` blocks
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
    return json.loads(text)


def _parse_evidenced_value(raw: dict | None, source_url: str, method: ExtractionMethod) -> EvidencedValue:
    """Convert a raw dict from LLM output into an EvidencedValue object."""
    if not raw or raw.get("value") is None:
        return EvidencedValue(value=None, status="not_specified")

    evidence_raw = raw.get("evidence")
    evidence = None
    if evidence_raw and evidence_raw.get("source_text"):
        evidence = SourceEvidence(
            url=evidence_raw.get("url", source_url),
            page_title=evidence_raw.get("page_title"),
            source_text=evidence_raw["source_text"],
            extraction_method=method,
        )

    return EvidencedValue(
        value=raw.get("value"),
        unit=raw.get("unit"),
        status=raw.get("status", "ok") if raw.get("value") is not None else "not_specified",
        evidence=evidence,
    )


# ── Public API ────────────────────────────────────────────────────────────────


async def extract_scheme_data(
    content: str,
    source_url: str,
    page_title: str,
    extraction_method: ExtractionMethod = ExtractionMethod.HTTPX_FALLBACK,
    version: str | None = None,
) -> dict:
    """
    Use Gemini to extract structured scheme data from official government text.

    Returns a dict with all extracted fields. Every non-null value includes
    source_text evidence from the original page.

    IMPORTANT: Candidate rules in the output are NEVER auto-published.
    They must go through Admin Review → Published Rule.
    """
    if not version:
        version = f"{datetime.utcnow().year}.1"

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0,    # Deterministic — no creativity allowed in extraction
    )

    # Truncate very long content to avoid token limit issues
    MAX_CONTENT_CHARS = 8000
    if len(content) > MAX_CONTENT_CHARS:
        content = content[:MAX_CONTENT_CHARS] + "\n... [content truncated for length]"
        logger.info(f"[scheme_extractor] Content truncated to {MAX_CONTENT_CHARS} chars for {source_url}")

    user_message = EXTRACTION_USER_TEMPLATE.format(
        source_url=source_url,
        page_title=page_title,
        content=content,
        retrieved_at=datetime.utcnow().isoformat(),
        version=version,
    )

    try:
        response = await llm.ainvoke([
            SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
            HumanMessage(content=user_message),
        ])
        raw_data = _clean_llm_json(response.content)
    except json.JSONDecodeError as exc:
        logger.error(f"[scheme_extractor] JSON parse error for {source_url}: {exc}")
        return {"error": f"LLM returned non-JSON output: {exc}", "source_url": source_url}
    except Exception as exc:
        logger.error(f"[scheme_extractor] Gemini call failed for {source_url}: {exc}")
        return {"error": str(exc), "source_url": source_url}

    # ── Parse EvidencedValue fields ────────────────────────────────────────────
    evidenced_fields = [
        "age_requirements", "income_requirements", "project_cost",
        "loan_amount", "interest_rate", "subsidy", "margin_money",
        "moratorium", "repayment_period",
    ]
    for field_name in evidenced_fields:
        raw_data[field_name] = _parse_evidenced_value(
            raw_data.get(field_name), source_url, extraction_method
        )

    # ── Parse candidate rules ──────────────────────────────────────────────────
    raw_rules = raw_data.get("candidate_rules", [])
    candidate_rules: list[CandidateRule] = []
    for i, r in enumerate(raw_rules):
        # Only accept rules with explicit source_text evidence
        if not r.get("source_text") or not r.get("field"):
            logger.warning(f"[scheme_extractor] Skipping rule without evidence at index {i}")
            continue
        try:
            candidate_rules.append(CandidateRule(
                rule_id=r.get("rule_id", f"auto-{r['field']}-{i:03d}"),
                scheme_id=r.get("scheme_id", "pending"),
                field=r["field"],
                operator=r.get("operator"),
                value=r.get("value"),
                unit=r.get("unit"),
                description=r.get("description"),
                source_url=source_url,
                source_text=r["source_text"],
                version=version,
                status="candidate",
            ))
        except Exception as exc:
            logger.warning(f"[scheme_extractor] Malformed rule at index {i}: {exc}")

    raw_data["candidate_rules"] = candidate_rules
    raw_data["source_url"] = source_url
    raw_data["page_title"] = page_title
    raw_data["extraction_method"] = extraction_method
    raw_data["version"] = version

    logger.info(
        f"[scheme_extractor] Extracted from {source_url}: "
        f"name={raw_data.get('scheme_name')}, "
        f"rules={len(candidate_rules)}, "
        f"method={extraction_method}"
    )

    return raw_data
