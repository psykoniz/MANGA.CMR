# PREDEM / SmartFoncier Africa

**Digital platform for municipal property declarations and land tenure verification in Douala, Cameroon**

## Overview

PREDEM is a comprehensive MVP for SmartFoncier Africa's mission to digitize and streamline property declaration processes in Douala. The platform enables citizens to submit property declarations, integrates OCR for document processing, applies automated business rules, and generates digital attestations for land records.

### Key Features

- **Multi-step Declaration Workflow**: Draft → Payment → Submission → Review → Attestation
- **Document OCR Processing**: Automated text extraction with confidence scoring
- **Intelligent Rules Engine**: Auto-approval, fraud flagging, and escalation logic
- **Digital Attestations**: Generate and verify QR-coded attestation documents
- **Preemption Zones**: GIS-integrated property boundary verification
- **Mobile Money Integration**: MTN & Orange Money payment simulation (dev-mode)
- **Instructeur Dashboard**: Backoffice for document review and approval
- **Audit Trail**: Complete event logging for compliance

## Tech Stack

### Backend
- **Framework**: NestJS 10 (Node.js)
- **Database**: PostgreSQL 15 + PostGIS (spatial)
- **Caching**: Redis
- **Storage**: MinIO (S3-compatible)
- **Queue**: Bull (job processing)
- **Auth**: JWT + bcrypt

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Maps**: Leaflet.js
- **API**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: SQL scripts (001, 002, 003, ...)

## Project Structure

```
predem/
├── apps/
│   ├── api/                    # NestJS backend
│   │   └── src/
│   │       ├── auth/           # Authentication (JWT, roles, guards)
│   │       ├── declarations/   # Declaration workflow
│   │       ├── documents/      # Document upload & OCR
│   │       ├── rules-engine/   # Rule evaluation logic
│   │       ├── attestations/   # Attestation generation
│   │       ├── payments/       # Payment processing (MTN/Orange)
│   │       ├── geo/            # GIS & preemption zones
│   │       ├── fraud/          # Fraud detection alerts
│   │       ├── biens/          # Property referential
│   │       ├── notifications/  # Email/SMS
│   │       └── common/         # Constants, utilities, guards
│   └── web/                    # Next.js frontend
│       └── app/
│           ├── (public)/       # Public pages (verify)
│           └── (authenticated)/# Protected pages (declare, dashboard, etc.)
├── packages/
│   └── shared-types/           # TypeScript interfaces (users, declarations, etc.)
├── infra/
│   └── migrations/             # PostgreSQL + PostGIS SQL migrations
├── docs/                       # Documentation
├── docker-compose.yml          # Local dev environment
├── package.json               # Monorepo workspace config
└── .env.example               # Environment variables template
```

## Quick Start

### Prerequisites
- Node.js >= 18
- Docker & Docker Compose
- Git

### Setup

1. **Clone and install dependencies**
```bash
cd predem
npm install
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Start Docker services**
```bash
docker-compose up -d
```

Wait for services to be healthy:
- PostgreSQL: port 5432
- Redis: port 6379
- MinIO: port 9000 (console on 9001)
- Mailhog: port 8025 (web UI)

4. **Run database migrations**
```bash
# Migrations auto-run on docker-compose startup, or manually:
psql -h localhost -U predem_dev -d predem_db -f infra/migrations/001_initial_schema.sql
psql -h localhost -U predem_dev -d predem_db -f infra/migrations/002_zones_preemption_douala.sql
psql -h localhost -U predem_dev -d predem_db -f infra/migrations/003_demo_data.sql
```

5. **Start development servers**
```bash
# Terminal 1: Backend API
npm run dev -w @predem/api

# Terminal 2: Frontend
npm run dev -w @predem/web
```

Services:
- API: http://localhost:3000 (Swagger at /api)
- Frontend: http://localhost:3000 (Next.js)
- MinIO: http://localhost:9001
- Mailhog: http://localhost:8025

## Demo Credentials

**Declarant (citizen)**
- Email: `declarant@test.cm`
- Password: `Test123!`

**Instructeur (reviewer)**
- Email: `instructeur@test.cm`
- Password: `Test123!`

**Admin**
- Email: `admin@test.cm`
- Password: `Test123!`

## API Documentation

Swagger docs available at: `http://localhost:3000/api`

### Key Endpoints

**Declarations**
- `GET /declarations` - List declarations (filters: status, page, limit)
- `POST /declarations` - Create new declaration
- `GET /declarations/:id` - Get declaration details
- `PATCH /declarations/:id` - Update draft declaration
- `POST /declarations/:id/submit` - Submit to payment
- `POST /declarations/:id/sign` - Sign & submit for review (OTP)
- `POST /declarations/:id/review` - Instructor review & decision

**Documents**
- `POST /documents/upload` - Upload document (file + type)
- `GET /documents/:documentId/ocr` - Get OCR results
- `GET /documents/:documentId/signed-url` - Download document

**Attestations** (Public - no auth)
- `GET /attestations/verify` - Verify attestation (reference + code)

**Rules Engine**
- `GET /rules-engine/rules` - List active rules
- `POST /rules-engine/evaluate` - Test rule evaluation

## Common Tasks

### Run tests
```bash
npm run test --workspaces
```

### Type check
```bash
npm run type-check --workspaces
```

### Lint
```bash
npm run lint --workspaces
```

### Database: Reset to clean state
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d     # Fresh start with migrations
```

### Database: Access PostgreSQL directly
```bash
psql -h localhost -U predem_dev -d predem_db
```

### Build for production
```bash
npm run build --workspaces
npm start --workspaces
```

## Architecture Highlights

### Code Quality (Karpathy Guidelines)
- ✅ No code duplication (shared utilities: `generateReference()`, `constants.ts`)
- ✅ No magic numbers (centralized config in `src/common/constants.ts`)
- ✅ Type safety (runtime validation, no blind casting)
- ✅ Single responsibility (clean service boundaries)
- ✅ Efficient database queries (batch operations, SQL aggregation)

### Security
- JWT tokens in HttpOnly cookies (CSRF-safe)
- Role-based access control (RBAC) with 6 user roles
- Password hashing with bcrypt (12 rounds)
- Request throttling on auth endpoints (100 req/min)
- Input validation with Zod schemas
- Prepared statements (TypeORM ORM protection)

### Scalability
- PostgreSQL with indexes and PostGIS for spatial queries
- Redis for caching and session management
- Bull job queue for async document processing
- Stateless API design (horizontal scaling ready)

## Workflow Example

1. **Citizen logs in** → Create declaration → Fill out property details
2. **Upload documents** → OCR processes automatically (async Bull queue)
3. **Review OCR results** → Confirm extracted data
4. **Pay fees** → MTN/Orange Mobile Money (dev-mode simulation)
5. **Submit for review** → System evaluates rules engine
6. **Instructeur reviews** → Approves, rejects, or requests more info
7. **System generates attestation** → Digital certificate with QR code
8. **Public verification** → Anyone can verify attestation by reference

## Rules Engine Logic

Rules are evaluated in priority order:
1. **Auto-Approve** (priority 10): OCR score >= 90% → Immediate approval
2. **Flag Fraud** (priority 20): OCR score < 40% → Manual review required
3. **Escalate** (priority 30): Amount >= 100M XAF → Higher authority review
4. **Default Review** (priority 100): All other cases → Standard review process

Conditions support boolean logic (AND/OR) and operators: `>`, `>=`, `<`, `<=`, `=`, `!=`

## Troubleshooting

**Port already in use**
```bash
# Find process on port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

**Database connection fails**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs predem-postgres

# Restart
docker-compose restart postgres
```

**MinIO bucket not created**
```bash
# Create bucket via MinIO console (http://localhost:9001)
# Login: minioadmin / minioadmin
# Create bucket: predem-docs
```

## Deployment

For production:
1. Use strong `JWT_SECRET` environment variable
2. Enable HTTPS/TLS on API
3. Configure database with replication and backups
4. Use managed Redis cluster (e.g., AWS ElastiCache)
5. Configure S3 or managed object storage (replace MinIO)
6. Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
7. Use production-grade email service (SendGrid, AWS SES)
8. Enable logging aggregation (ELK, Datadog, etc.)

## Support & Contact

For questions or issues with the PREDEM MVP:
- GitHub Issues: [project-repo/issues]
- Email: support@smartfoncier-africa.cm
- Documentation: `/docs`

## License

Private - SmartFoncier Africa

---

**Last Updated**: April 2026
**MVP Version**: 0.1.0
