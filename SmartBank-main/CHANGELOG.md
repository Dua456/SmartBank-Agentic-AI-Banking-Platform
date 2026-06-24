# Changelog

## [2.1.0] - 2026-06-24

### Added
- Alembic database migration with full table definitions for all 6 models
- Admin Panel — User Management with search, role badges, case counts
- Admin Panel — Audit Log viewer with filtering, statistics, hash integrity display
- Chat History Persistence — messages saved to PostgreSQL with session management
- Chat Session sidebar UI — create, load, delete chat sessions
- Celery background tasks wiring with dedicated worker entry point
- 9 new API endpoints for admin and chat history operations

### Enhanced
- Backend routing: `admin.py` and `chat_history.py` routers added
- Chat store (`chatStore.ts`) now persists messages to backend
- Chat page (`ChatPage.tsx`) with session history sidebar
- Admin layout (`AdminLayout.tsx`) with full Users and Audit Log UIs
- Configuration extended: `CELERY_WORKER_CONCURRENCY` setting

### Infrastructure
- `alembic upgrade head` creates all tables with proper constraints
- `celery -A backend.celery_worker worker` for background task processing
- `POST /api/chat/save` endpoint for chat message persistence
- New dependency: none (uses existing FastAPI + SQLAlchemy stack)

## [2.0.0] - 2025-06-20

### Added
- Complete SmartBank Agentic AI Banking Platform
- Phase 01: Enterprise Architecture with layered design
- Phase 02: AI Request Classification Agent (8 intent categories)
- Phase 03: UiPath Maestro BPMN Workflows (9 BPMN 2.0 XML files)
- Phase 04: RPA Robot Workforce (4 specialised robots)
- Phase 05: Document AI & OCR Pipeline (NADRA CNIC verification)
- Phase 06: FinTech AI Customer Assistant "Zara"
- Phase 07: Open Banking API Integration (OpenAPI 3.1 spec)
- Phase 08: Coding Agent Acceleration CI/CD pipelines
- Phase 09: Demo Video Script (5-minute showcase)
- Phase 10: GitHub README & Documentation
- Frontend UI: Operations Dashboard + AI Chat Widget

### Architecture
- 7-layer cloud-native banking platform
- OAuth 2.0 + PKCE + mTLS security
- Kubernetes HPA with queue-based load levelling
- Multi-region active-passive failover
- 99.95% uptime SLA, <2s P99 latency

### AI Agents
- Multi-lingual NLU (English + Roman Urdu)
- 8 banking intent categories with confidence scoring
- PII masking and entity extraction
- Escalation triggers at confidence < 0.65
- Responsible AI guardrails and bias controls

### Automation
- UiPath Maestro BPMN orchestration for all flows
- 4 specialised RPA robots with error handling
- Human-in-the-Loop approval gates for high-risk ops
- Document AI with fraud scoring (0-100 scale)
- Multi-channel notifications (Email, SMS, WhatsApp)
