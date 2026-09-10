"""
Beanie document model for a government scheme.
"""

from datetime import datetime

from beanie import Document
from pydantic import Field


class Scheme(Document):
    """
    Represents a government financial scheme (e.g., PMEGP, MUDRA).
    Stored as a single document in the `schemes` MongoDB collection.
    """

    scheme_id: str
    name: str
    ministry: str | None = None
    category_eligibility: list[str] = Field(default_factory=list)
    # e.g., ["sc", "st", "women", "general"]
    income_ceiling: float | None = None
    project_cost_range: dict | None = None  # {"min": float, "max": float}
    loan_limit: float | None = None
    subsidy_pct: float | None = None
    margin_money_pct: float | None = None
    interest_rate_range: dict | None = None  # {"min": float, "max": float}
    tenure_months: int | None = None
    moratorium_months: int | None = None
    required_documents: list[str] = Field(default_factory=list)
    rule_version: str | None = None
    last_updated: datetime | None = None
    source_url: str | None = None

    class Settings:
        name = "schemes"
