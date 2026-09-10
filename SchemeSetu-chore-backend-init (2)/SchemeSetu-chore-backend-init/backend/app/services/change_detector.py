"""
Change Detector — Field-level diff and conflict detection.

When a scheme is re-scraped:
  1. Compare newly extracted data against the stored version.
  2. Identify fields that have changed.
  3. Detect conflicts when two sources disagree on the same field.
  4. Create ScrapeChange records — admin must review before changes are applied.

RULE: Changes are NEVER automatically applied.
      Conflicts are NEVER automatically resolved.
      Admin review is ALWAYS required.
"""

import logging
from datetime import datetime
from typing import Any

from app.models.scraper import FieldChange, ConflictRecord, ScrapeChange

logger = logging.getLogger(__name__)

# Fields tracked for change detection
TRACKED_FIELDS = [
    "name",
    "ministry",
    "scheme_type",
    "description",
    "category_requirements",
    "income_requirements",
    "age_requirements",
    "loan_amount",
    "interest_rate",
    "subsidy",
    "margin_money",
    "moratorium",
    "repayment_period",
    "project_cost",
    "required_documents",
    "application_process",
    "channel_partners",
    "target_beneficiaries",
]


def _normalize_value(value: Any) -> Any:
    """Normalize values for comparison (handles EvidencedValue dicts)."""
    if isinstance(value, dict):
        # For EvidencedValue-like dicts, compare only the value field
        return value.get("value")
    if isinstance(value, list):
        return sorted([str(v) for v in value])
    return value


def _values_differ(old: Any, new: Any) -> bool:
    """Return True if two field values are meaningfully different."""
    old_norm = _normalize_value(old)
    new_norm = _normalize_value(new)

    if old_norm is None and new_norm is None:
        return False
    if old_norm is None or new_norm is None:
        return True
    if isinstance(old_norm, list) and isinstance(new_norm, list):
        return old_norm != new_norm
    # Use string comparison for robustness with floats
    return str(old_norm).strip() != str(new_norm).strip()


def detect_changes(
    old_scheme: dict,
    new_scheme: dict,
    old_source_url: str | None = None,
    new_source_url: str | None = None,
) -> list[FieldChange]:
    """
    Compare two scheme dicts (old vs newly scraped) and return a list
    of FieldChange records for every field that has changed.

    old_scheme: The stored scheme's model_dump()
    new_scheme: The freshly extracted scheme data dict
    """
    changes: list[FieldChange] = []

    for field_name in TRACKED_FIELDS:
        old_val = old_scheme.get(field_name)
        new_val = new_scheme.get(field_name)

        if _values_differ(old_val, new_val):
            changes.append(FieldChange(
                field=field_name,
                old_value=_normalize_value(old_val),
                new_value=_normalize_value(new_val),
                old_source_url=old_source_url,
                new_source_url=new_source_url,
                detected_at=datetime.utcnow(),
                requires_review=True,
            ))
            logger.info(
                f"[change_detector] Change detected in '{field_name}': "
                f"{_normalize_value(old_val)!r} → {_normalize_value(new_val)!r}"
            )

    return changes


def detect_conflicts(
    field_name: str,
    source_values: list[dict],
) -> ConflictRecord | None:
    """
    Check if multiple sources disagree on the value of a single field.

    source_values: list of {"url": ..., "value": ..., "authority": ..., "retrieved_at": ...}

    Returns a ConflictRecord if conflict detected, None if all sources agree.

    RULE: Conflicts are NEVER automatically resolved.
          An admin must review and decide which source is authoritative.
    """
    if len(source_values) < 2:
        return None

    # Normalize all values
    unique_values = set()
    for source in source_values:
        norm = _normalize_value(source.get("value"))
        unique_values.add(str(norm) if norm is not None else "null")

    if len(unique_values) <= 1:
        return None  # All sources agree

    # Conflict detected
    logger.warning(
        f"[change_detector] CONFLICT detected in field '{field_name}': "
        f"{len(unique_values)} different values from {len(source_values)} sources."
    )

    return ConflictRecord(
        field=field_name,
        sources=source_values,
        detected_at=datetime.utcnow(),
        resolved=False,
        resolution_notes=None,
    )


async def create_scrape_change_record(
    scheme_id: str,
    job_id: str,
    old_version: str,
    new_version: str,
    changes: list[FieldChange],
    conflicts: list[ConflictRecord] | None = None,
) -> ScrapeChange:
    """
    Persist a ScrapeChange document to MongoDB and return it.
    This record will appear in the Admin Dashboard for review.
    """
    import uuid
    record = ScrapeChange(
        change_id=str(uuid.uuid4()),
        scheme_id=scheme_id,
        job_id=job_id,
        old_version=old_version,
        new_version=new_version,
        changes=changes,
        conflicts=conflicts or [],
        requires_review=True,
        reviewed=False,
        detected_at=datetime.utcnow(),
    )
    await record.insert()
    logger.info(
        f"[change_detector] ScrapeChange created: {record.change_id} "
        f"({len(changes)} changes, {len(conflicts or [])} conflicts)"
    )
    return record
