# Deployment & Production Architecture

This document covers the production guidelines for deploying the UdyamMitra MVP backend securely to Google Cloud Run and MongoDB Atlas.

## 1. Cloud Run Architecture
- **Stateless Workers**: The FastAPI backend is entirely stateless.
- **Docker Image**: We use a multi-stage `Dockerfile` with the `uv` package manager, ensuring a lightweight, pinned, and non-root production container.
- **Concurrency**: PaddleOCR instances are lazy-loaded. Cloud Run concurrency limits should be tuned based on OCR memory utilization (e.g., maximum 80 concurrent requests per instance).

## 2. MongoDB Atlas Configuration
- **Network Security**: Database is securely hosted on MongoDB Atlas via private VPC peering or strict IP whitelists (no `0.0.0.0/0`).
- **Least Privilege**: The application runs under a constrained database user identity. Audit logs append operations are strictly enforced.

## 3. Secret Management
- Do not commit `.env` files.
- Provision `MONGODB_URI`, `GEMINI_API_KEY`, and CORS configurations securely via Google Secret Manager and expose them to Cloud Run.

## 4. Disaster Recovery
- **Database Backups**: Automated daily backups are enabled in Atlas with PITR (Point-in-Time Recovery).
- **Rollbacks**: Cloud Run manages immutable revisions; reverting a faulty deployment takes seconds.

## 5. CI / CD Pipeline
- Our GitHub Actions pipeline validates `uv run pytest` and `uv run ruff check .` on every pull request.
- Automated container builds ensure what passes tests in CI is exactly what gets deployed to production.
