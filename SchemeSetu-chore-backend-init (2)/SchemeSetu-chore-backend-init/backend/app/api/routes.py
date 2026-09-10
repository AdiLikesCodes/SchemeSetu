"""
API routes for SchemeSetu.

Exposes:
  POST /admin/seed          — seed the DB with a sample scheme
  POST /chat/{beneficiary_id} — conversational intake + eligibility evaluation
"""

from uuid import UUID, uuid4, uuid5, NAMESPACE_URL
from datetime import datetime

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.models.beneficiary import BeneficiaryProfile
from app.models.scheme import Scheme
from app.models.partner import ChannelPartner
from app.models.eligibility import EligibilityRule, EligibilityResult, ReasonCode
from app.services.ai_extractor import extract_entities_from_message
from app.services.rule_engine import evaluate_eligibility
from app.services.ai_responder import generate_conversational_reply
from app.services.ocr_service import process_document
from app.services.privacy import mask_pii
from app.services.partner_router import find_nearest_partners, resolve_location_coordinates
from app.services.calculators import calculate_financial_plan

from app.models.user import User
from app.core.security import hash_password, verify_password

router = APIRouter()


# ── Request / Response schemas ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str


<<<<<<< HEAD
class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    phone_number: str | None = None
    category: str = "SC"
    state: str = "Kerala"
    district: str = "Thiruvananthapuram"
    role: str = "beneficiary"


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    category: str | None = None
    state: str | None = None
    district: str | None = None
    pin_code: str | None = None
    age: int | None = None
    gender: str | None = None
    annual_income: float | None = None
    occupation: str | None = None
    business_type: str | None = None
    project_cost: float | None = None
    loan_required: float | None = None


# ── Auth Endpoints ─────────────────────────────────────────────────────────────

@router.post("/auth/signup")
async def signup(request: SignupRequest) -> dict:
    """
    Register a new beneficiary or admin user. Stores details in MongoDB.
    """
    email_clean = request.email.lower().strip()
    existing_user = await User.find_one(User.email == email_clean)
    if existing_user:
        raise HTTPException(status_code=400, detail="User email already registered")

    user_role = request.role if request.role in ("admin", "beneficiary") else "beneficiary"

    user = User(
        email=email_clean,
        password_hash=hash_password(request.password),
        full_name=request.full_name,
        phone_number=request.phone_number,
        category=request.category,
        state=request.state,
        district=request.district,
        role=user_role,
    )
    await user.insert()

    # Ensure corresponding BeneficiaryProfile document exists in MongoDB
    profile = await BeneficiaryProfile.find_one(BeneficiaryProfile.beneficiary_id == user.user_id)
    if not profile:
        profile = BeneficiaryProfile(
            beneficiary_id=user.user_id,
            category=user.category.lower(),
            location={"state": user.state, "district": user.district},
        )
        await profile.insert()

    loc = profile.location or {}

    return {
        "message": "Registration successful",
        "user": {
            "user_id": str(user.user_id),
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "category": user.category,
            "state": user.state,
            "district": user.district,
            "pin_code": loc.get("pincode", ""),
            "role": user.role,
            "age": profile.age,
            "gender": profile.gender,
            "annual_income": profile.annual_income,
            "business_type": profile.business_type,
            "project_cost": profile.project_cost,
            "loan_required": profile.loan_required,
        }
    }


@router.post("/auth/login")
async def login(request: LoginRequest) -> dict:
    """
    Authenticate beneficiary or admin user from MongoDB.
    """
    email_clean = request.email.lower().strip()
    user = await User.find_one(User.email == email_clean)
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email address or password")

    # Trust the role stored in MongoDB — set during signup and editable by DB admins
    user_role = user.role if user.role in ("admin", "beneficiary") else "beneficiary"

    profile = await BeneficiaryProfile.find_one(BeneficiaryProfile.beneficiary_id == user.user_id)
    if not profile:
        profile = BeneficiaryProfile(
            beneficiary_id=user.user_id,
            category=user.category.lower() if user.category else "sc",
            location={"state": user.state, "district": user.district},
        )
        await profile.insert()

    loc = profile.location or {}

    return {
        "message": "Login successful",
        "user": {
            "user_id": str(user.user_id),
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "category": user.category,
            "state": user.state,
            "district": user.district,
            "pin_code": loc.get("pincode", ""),
            "role": user_role,
            "age": profile.age,
            "gender": profile.gender,
            "annual_income": profile.annual_income,
            "business_type": profile.business_type,
            "project_cost": profile.project_cost,
            "loan_required": profile.loan_required,
        }
    }


@router.get("/auth/profile/{user_id}")
async def get_profile(user_id: str) -> dict:
    """
    Get combined User and BeneficiaryProfile from MongoDB.
    """
    try:
        u_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await User.find_one(User.user_id == u_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = await BeneficiaryProfile.find_one(BeneficiaryProfile.beneficiary_id == u_uuid)
    if not profile:
        profile = BeneficiaryProfile(beneficiary_id=u_uuid)
        await profile.insert()

    loc = profile.location or {}

    return {
        "user_id": str(user.user_id),
        "full_name": user.full_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "category": user.category,
        "state": user.state or loc.get("state", ""),
        "district": user.district or loc.get("district", ""),
        "pin_code": loc.get("pincode", ""),
        "role": user.role,
        "age": profile.age,
        "gender": profile.gender,
        "annual_income": profile.annual_income,
        "occupation": getattr(profile, "occupation", None),
        "business_type": profile.business_type,
        "project_cost": profile.project_cost,
        "loan_required": profile.loan_required,
        "profile_completeness_pct": profile.profile_completeness_pct,
    }


@router.put("/auth/profile/{user_id}")
async def update_profile(user_id: str, request: ProfileUpdateRequest) -> dict:
    """
    Update User and BeneficiaryProfile in MongoDB.
    """
    try:
        u_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await User.find_one(User.user_id == u_uuid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = await BeneficiaryProfile.find_one(BeneficiaryProfile.beneficiary_id == u_uuid)
    if not profile:
        profile = BeneficiaryProfile(beneficiary_id=u_uuid)
        await profile.insert()

    # Update User document
    if request.full_name is not None:
        user.full_name = request.full_name
    if request.phone_number is not None:
        user.phone_number = request.phone_number
    if request.category is not None:
        user.category = request.category
    if request.state is not None:
        user.state = request.state
    if request.district is not None:
        user.district = request.district
    user.updated_at = datetime.utcnow()
    await user.save()

    # Update BeneficiaryProfile document
    if request.category is not None:
        profile.category = request.category.lower()
    if request.age is not None:
        profile.age = request.age
    if request.gender is not None:
        profile.gender = request.gender.lower()
    if request.annual_income is not None:
        profile.annual_income = request.annual_income
    if request.business_type is not None:
        profile.business_type = request.business_type
    if request.project_cost is not None:
        profile.project_cost = request.project_cost
    if request.loan_required is not None:
        profile.loan_required = request.loan_required

    loc = profile.location or {}
    if request.state is not None:
        loc["state"] = request.state
    if request.district is not None:
        loc["district"] = request.district
    if request.pin_code is not None:
        loc["pincode"] = request.pin_code
    profile.location = loc
    profile.updated_at = datetime.utcnow()

    # Track completeness
    tracked = [
        "channel", "language", "category", "gender", "age",
        "location", "annual_income", "education_level",
        "business_type", "project_cost", "loan_required",
    ]
    filled = sum(1 for f in tracked if getattr(profile, f) is not None)
    profile.profile_completeness_pct = round((filled / len(tracked)) * 100)

    await profile.save()

    return {
        "message": "Profile updated successfully",
        "user": {
            "user_id": str(user.user_id),
            "email": user.email,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "category": user.category,
            "state": user.state,
            "district": user.district,
            "pin_code": loc.get("pincode", ""),
            "role": user.role,
            "age": profile.age,
            "gender": profile.gender,
            "annual_income": profile.annual_income,
            "business_type": profile.business_type,
            "project_cost": profile.project_cost,
            "loan_required": profile.loan_required,
            "profile_completeness_pct": profile.profile_completeness_pct,
        }
    }


@router.get("/schemes")
async def list_schemes() -> list[dict]:
    """
    Fetch all active schemes from MongoDB.
    If none exist in DB, seed standard schemes into MongoDB.
    """
    schemes = await Scheme.find_all().to_list()
    if not schemes:
        default_schemes = [
            Scheme(
                scheme_id="MOSJEBIZ-001",
                name="MoSJE Business Loan",
                ministry="Ministry of Social Justice and Empowerment",
                category_eligibility=["sc", "st", "obc", "ews"],
                income_ceiling=800_000.0,
                project_cost_range={"min": 50_000.0, "max": 1_000_000.0},
                loan_limit=500_000.0,
                subsidy_pct=25.0,
                margin_money_pct=5.0,
                interest_rate_range={"min": 6.0, "max": 9.0},
                tenure_months=60,
                moratorium_months=6,
                required_documents=["aadhaar", "pan", "income_certificate", "caste_certificate"],
                rule_version="1.0.0",
                last_updated=datetime.utcnow(),
                source_url="https://socialjustice.gov.in/schemes",
            ),
            Scheme(
                scheme_id="NSFDC-TERM-01",
                name="NSFDC Term Loan Scheme",
                ministry="Ministry of Social Justice and Empowerment",
                category_eligibility=["sc"],
                income_ceiling=300_000.0,
                project_cost_range={"min": 50_000.0, "max": 500_000.0},
                loan_limit=500_000.0,
                subsidy_pct=10.0,
                margin_money_pct=10.0,
                interest_rate_range={"min": 6.0, "max": 6.0},
                tenure_months=60,
                moratorium_months=6,
                required_documents=["aadhaar", "caste_certificate", "income_certificate", "project_report"],
                rule_version="1.0.0",
                last_updated=datetime.utcnow(),
                source_url="https://nsfdc.nic.in/schemes/term-loan",
            ),
            Scheme(
                scheme_id="NSFDC-MICRO-02",
                name="Micro Finance Scheme (NSFDC)",
                ministry="Ministry of Social Justice and Empowerment",
                category_eligibility=["sc"],
                income_ceiling=300_000.0,
                project_cost_range={"min": 10_000.0, "max": 140_000.0},
                loan_limit=140_000.0,
                subsidy_pct=5.0,
                margin_money_pct=5.0,
                interest_rate_range={"min": 5.0, "max": 5.0},
                tenure_months=36,
                moratorium_months=3,
                required_documents=["aadhaar", "caste_certificate", "income_certificate"],
                rule_version="1.0.0",
                last_updated=datetime.utcnow(),
                source_url="https://nsfdc.nic.in/schemes/micro-finance",
            ),
            Scheme(
                scheme_id="STANDUP-IND-03",
                name="Stand-Up India Scheme",
                ministry="Ministry of Finance",
                category_eligibility=["sc", "st", "women"],
                income_ceiling=10_000_000.0,
                project_cost_range={"min": 1_000_000.0, "max": 10_000_000.0},
                loan_limit=10_000_000.0,
                subsidy_pct=0.0,
                margin_money_pct=15.0,
                interest_rate_range={"min": 8.0, "max": 11.0},
                tenure_months=84,
                moratorium_months=18,
                required_documents=["aadhaar", "caste_certificate", "project_report", "bank_statement"],
                rule_version="1.0.0",
                last_updated=datetime.utcnow(),
                source_url="https://www.standupmitra.in",
            ),
        ]
        for s in default_schemes:
            await s.insert()
        schemes = await Scheme.find_all().to_list()

    return [s.model_dump(mode="json", exclude={"id"}) for s in schemes]


=======
class PartnerMatchRequest(BaseModel):
    scheme_id: str
    latitude: float
    longitude: float
    limit: int = 3
>>>>>>> 53dfe0fefaf215b8e758df926f828db398e0aef0


# ── Hardcoded demo rules (no DB yet) ─────────────────────────────────────────

def _build_demo_rules(scheme_id: str) -> list[EligibilityRule]:
    """Return a minimal set of demo eligibility rules for testing."""
    return [
        EligibilityRule(
            rule_id="R001",
            scheme_id=scheme_id,
            field="annual_income",
            operator="<=",
            value=800_000.0,
            reason_code_on_fail=ReasonCode.INCOME_EXCEEDED,
        ),
        EligibilityRule(
            rule_id="R002",
            scheme_id=scheme_id,
            field="category",
            operator="in",
            value=["sc", "st", "obc", "ews"],
            reason_code_on_fail=ReasonCode.CATEGORY_NOT_ELIGIBLE,
        ),
        EligibilityRule(
            rule_id="R003",
            scheme_id=scheme_id,
            field="age",
            operator=">=",
            value=18,
            reason_code_on_fail=ReasonCode.RULE_VIOLATED_OTHER,
        ),
    ]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/admin/seed")
async def seed_schemes() -> dict:
    """
    Seed the database with a sample scheme and channel partners for development / testing.
    Idempotent: returns early if resources already exist.
    """
    scheme_count = await Scheme.find_all().count()
    if scheme_count == 0:
        scheme = Scheme(
            scheme_id="MOSJEBIZ-001",
            name="MoSJE Business Loan",
            ministry="Ministry of Social Justice and Empowerment",
            category_eligibility=["sc", "st", "obc", "ews"],
            income_ceiling=800_000.0,
            project_cost_range={"min": 50_000.0, "max": 1_000_000.0},
            loan_limit=500_000.0,
            subsidy_pct=25.0,
            margin_money_pct=5.0,
            interest_rate_range={"min": 6.0, "max": 9.0},
            tenure_months=60,
            moratorium_months=6,
            required_documents=["aadhaar", "pan", "income_certificate", "caste_certificate"],
            rule_version="1.0.0",
            last_updated=datetime.utcnow(),
            source_url="https://socialjustice.gov.in/schemes",
        )
        await scheme.insert()

    partner_count = await ChannelPartner.find_all().count()
    if partner_count < 6:
        # Clear previous partial seed if any so both regions are populated
        if partner_count > 0:
            await ChannelPartner.find_all().delete()

        sample_partners = [
            # Kerala / Thiruvananthapuram Partners
            ChannelPartner(
                partner_id="PARTNER-SCA-002",
                name="Kerala State Development Corporation for SC/ST (SCA)",
                type="SCA",
                compatible_schemes=["MOSJEBIZ-001"],
                latitude=8.4997,
                longitude=76.9436,
                address="Vanchiyoor, Thiruvananthapuram, Kerala 695035",
                district="Thiruvananthapuram",
                state="Kerala",
                contact_phone="+91 471 230 5678",
                fund_availability_status="available",
                rating=4.8,
            ),
            ChannelPartner(
                partner_id="PARTNER-BANK-002",
                name="Canara Bank - Main Branch Thiruvananthapuram",
                type="Bank",
                compatible_schemes=["MOSJEBIZ-001"],
                latitude=8.4890,
                longitude=76.9490,
                address="MG Road, Statue, Thiruvananthapuram, Kerala 695001",
                district="Thiruvananthapuram",
                state="Kerala",
                contact_phone="+91 471 247 1122",
                fund_availability_status="available",
                rating=4.5,
            ),
            ChannelPartner(
                partner_id="PARTNER-CSC-002",
                name="CSC Digital Seva Kendra - Thiruvananthapuram",
                type="CSC",
                compatible_schemes=["MOSJEBIZ-001"],
                latitude=8.5241,
                longitude=76.9366,
                address="Kazhakkoottam, Thiruvananthapuram, Kerala 695582",
                district="Thiruvananthapuram",
                state="Kerala",
                contact_phone="+91 471 270 9900",
                fund_availability_status="available",
                rating=4.7,
            ),
            # Delhi / North India Partners
            ChannelPartner(
                partner_id="PARTNER-SCA-001",
                name="State Channelizing Agency (SCA) - Delhi HQ",
                type="SCA",
                compatible_schemes=["MOSJEBIZ-001"],
                latitude=28.6139,
                longitude=77.2090,
                address="Central Secretariat, New Delhi, Delhi 110001",
                district="New Delhi",
                state="Delhi",
                contact_phone="+91 11 2338 1234",
                fund_availability_status="available",
                rating=4.8,
            ),
            ChannelPartner(
                partner_id="PARTNER-BANK-001",
                name="Canara Bank - Lead Bank Branch",
                type="Bank",
                compatible_schemes=["MOSJEBIZ-001"],
                latitude=28.6328,
                longitude=77.2197,
                address="Connaught Place, New Delhi, Delhi 110001",
                district="New Delhi",
                state="Delhi",
                contact_phone="+91 11 2341 5678",
                fund_availability_status="available",
                rating=4.5,
            ),
            ChannelPartner(
                partner_id="PARTNER-CSC-001",
                name="CSC Suvidha Kendra - Noida Sector 62",
                type="CSC",
                compatible_schemes=["MOSJEBIZ-001"],
                latitude=28.5355,
                longitude=77.3910,
                address="Sector 62, Noida, Uttar Pradesh 201309",
                district="Gautam Buddha Nagar",
                state="Uttar Pradesh",
                contact_phone="+91 120 456 7890",
                fund_availability_status="available",
                rating=4.6,
            ),
        ]
        for p in sample_partners:
            await p.insert()

    total_schemes = await Scheme.find_all().count()
    total_partners = await ChannelPartner.find_all().count()

    demo_rules = _build_demo_rules("MOSJEBIZ-001")

    return {
        "msg": "Seeded successfully",
        "scheme_count": total_schemes,
        "partner_count": total_partners,
        "demo_rules": [r.model_dump() for r in demo_rules],
    }


@router.post("/partners/match")
async def match_partners(request: PartnerMatchRequest) -> dict:
    """
    Find nearest channel partners compatible with the specified scheme
    ranked by Haversine straight-line distance.
    """
    results = await find_nearest_partners(
        scheme_id=request.scheme_id,
        user_lat=request.latitude,
        user_lon=request.longitude,
        limit=request.limit,
    )
    return {"partners": results}


@router.post("/chat/{beneficiary_id}")
async def chat(beneficiary_id: str, request: ChatRequest) -> dict:

    """
    Core conversational intake endpoint.

    1. Fetch or create the beneficiary profile.
    2. Extract entities from the user message via Gemini.
    3. Merge extracted fields into the profile and persist.
    4. Run the eligibility rule engine against all known schemes.
    5. Return the updated profile + eligibility results.
    """
    # Accept a valid UUID string, or generate a deterministic uuid5 from
    # any arbitrary string (e.g. "test-user-123") so development testing
    # works without pre-generating a UUID.
    try:
        ben_uuid = UUID(beneficiary_id)
    except ValueError:
        ben_uuid = uuid5(NAMESPACE_URL, beneficiary_id)

    profile = await BeneficiaryProfile.find_one(
        BeneficiaryProfile.beneficiary_id == ben_uuid
    )

    if profile is None:
        profile = BeneficiaryProfile(beneficiary_id=ben_uuid)
        await profile.insert()

    # ── Immediately sanitize incoming text for PII masking ──────────────────
    sanitized_message = mask_pii(request.message)

    # ── 2. Extract entities from message ─────────────────────────────────────
    extraction = await extract_entities_from_message(
        user_message=sanitized_message,
        current_state=profile.model_dump(mode="json", exclude_none=True),
    )
    # ── 3. Merge non-None extracted fields into the profile ───────────────────
    extracted = extraction.model_dump(exclude_none=True)
    # Remove beneficiary_id — never overwrite the identity field from extraction
    extracted.pop("beneficiary_id", None)

    for field, value in extracted.items():
        setattr(profile, field, value)

    profile.updated_at = datetime.utcnow()

    # Recalculate completeness: count non-None fields out of the 12 tracked fields
    tracked = [
        "channel", "language", "category", "gender", "age",
        "location", "annual_income", "education_level",
        "business_type", "project_cost", "loan_required",
    ]
    filled = sum(1 for f in tracked if getattr(profile, f) is not None)
    profile.profile_completeness_pct = round((filled / len(tracked)) * 100)

    await profile.save()

    # ── 4. Evaluate eligibility against all schemes ───────────────────────────
    schemes = await Scheme.find_all().to_list()

    eligibility_results: list[dict] = []
    eligible_scheme_id = None
    for scheme in schemes:
        rules = _build_demo_rules(scheme.scheme_id)
        result: EligibilityResult = evaluate_eligibility(profile, scheme, rules)
        res_dict = result.model_dump()
        eligibility_results.append(res_dict)
        if result.eligible and eligible_scheme_id is None:
            eligible_scheme_id = scheme.scheme_id

    financial_plan = None
    recommended_partners = None

    if eligible_scheme_id is not None:
        project_cost = (
            profile.project_cost
            if profile.project_cost and profile.project_cost > 0
            else 500_000.0
        )
        financial_plan = calculate_financial_plan(
            project_cost=project_cost,
            subsidy_pct=25.0,
            margin_money_pct=10.0,
            annual_interest_rate=8.0,
            tenure_months=60,
        )
        # Dynamically resolve coordinates based on user location
        try:
            user_coords = resolve_location_coordinates(profile.location)
        except Exception:
            user_coords = None

        # Fallback to Trivandrum/Kerala coordinates (Lat: 8.5241, Lon: 76.9366) if resolution fails,
        # returns None, or returns default coordinates when not in Delhi
        if (
            not user_coords
            or (user_coords == (28.6139, 77.2090) and not (profile.location and "delhi" in str(profile.location).lower()))
        ):
            user_lat, user_lon = 8.5241, 76.9366
        else:
            user_lat, user_lon = user_coords

        recommended_partners = await find_nearest_partners(
            scheme_id=eligible_scheme_id,
            user_lat=user_lat,
            user_lon=user_lon,
            limit=2,
        )

    # ── 5. Generate conversational reply ──────────────────────────────────────
    reply_text = await generate_conversational_reply(
        user_message=sanitized_message,
        profile_state=profile.model_dump(mode="json", exclude={"id"}),
        eligibility_results=eligibility_results
    )

    # ── 6. Return response ────────────────────────────────────────────────────
    return {
        "reply": reply_text,
        "beneficiary_id": str(profile.beneficiary_id),
        "profile_completeness_pct": profile.profile_completeness_pct,
        "extracted_this_turn": extracted,
        "profile": profile.model_dump(mode="json", exclude={"id"}),
        "eligibility_results": eligibility_results,
        "financial_plan": financial_plan,
        "recommended_partners": recommended_partners,
    }

@router.post("/chat/{beneficiary_id}/document")
async def upload_document(beneficiary_id: str, file: UploadFile = File(...)):
    """
    Upload a document (e.g. Aadhaar card) for OCR processing and PII masking.
    Currently returns the masked text directly.
    """
    file_bytes = await file.read()
    
    # Process the document with OCR and mask PII
    masked_text = await process_document(file_bytes)
    
    return {
        "message": "Document processed",
        "extracted_text": masked_text
    }
