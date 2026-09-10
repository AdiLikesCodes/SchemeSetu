# SchemeSetu (SIH PS 26092)

> **Core Architectural Principle**: *AI understands the user; the deterministic engine makes the financial decision.*

SchemeSetu is a production-structured platform designed to empower marginalized entrepreneurs (SC, ST, Safai Karamchari, OBC, Divyangjan) to discover eligible Ministry of Social Justice and Empowerment (MoSJE) schemes, understand financial requirements (subsidy, margin money, EMI), and connect with local channelizing partners (SCAs, Banks, CSCs).

---

## Architecture

```
User (Web Chat)
   │
   ▼
[Sanitization Shield] (Aadhaar / PAN / Phone Redaction)
   │
   ▼
[Gemini 3.8 Flash] (Extract: age, income, category, business, location + Intent)
   │
   ▼
[UserProfile Builder] (Incremental Profile State)
   │
   ▼
[Deterministic Rule Engine] (Hardcoded, auditable evaluation against verified rules)
   │
   ├── [Eligible] ──► [Financial Simulator] (Subsidy, Margin Money, EMI)
   │                       │
   │                       ▼
   │                  [Partner Routing] (Haversine Nearest SCA/Bank/CSC)
   │
   ├── [Ineligible] ──► [Explainable Reason] (Specific failed criteria + CSC guidance)
   │
   └── [Missing Info] ──► [Next-Best-Question] (Discriminates candidate schemes)
```

## Key Technical Decisions & Innovations

1. **Deterministic Financial Decisions**: LLM NEVER approves loans or calculates eligibility. The FastAPI deterministic rule engine is the single source of financial truth.
2. **Independent Rule & Scheme Versioning**: `scheme_version` and `rule_version` vary independently, creating an auditable provenance trail for every decision.
3. **Workflow-Enforced Data Provenance**: Scheme numbers originate from official MoSJE/NSFDC/NSKFDC/NHFDC/NBCFDC gazettes and circulars (see full [Loan Schemes Ground-Truth Findings & Provenance Dossier](file:///home/alan/Work/tries/hack1/docs/LOAN_SCHEMES_FINDINGS.md) and offline artifacts in [`docs/provenance/`](file:///home/alan/Work/tries/hack1/docs/provenance/)). Unverified candidate schemes are kept in `status: draft` and excluded from matching.
4. **Pre-LLM Privacy Shield**: Sanitized message context is stored in conversation history; raw PII never reaches Gemini.
5. **Discriminator Next-Best-Question**: Instead of an arbitrary 30-field form, the system identifies which missing field narrows candidate schemes fastest.
6. **Modern Stack**: Python 3.12, FastAPI, PyMongo Async (Motor replacement), Gemini 3.8 Flash, `uv` package manager with pinned Docker images, React + Vite + Tailwind CSS.

---

## Quick Start

### Backend

```bash
cd backend

# Run with uv
uv sync
uv run pytest -v
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker Compose

```bash
docker compose up --build
```
