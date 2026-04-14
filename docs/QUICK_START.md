# PREDEM MVP - Quick Start Guide

Get PREDEM running locally in 5 minutes.

## Prerequisites

- Node.js >= 18.x
- Docker & Docker Compose
- Git
- 4GB+ RAM, 2GB disk space

## Installation & Setup

### 1. Clone Repository
```bash
git clone <predem-repo-url>
cd predem
```

### 2. Install Dependencies
```bash
npm install
```
This installs all workspaces (API, frontend, packages).

### 3. Environment Configuration
```bash
# Copy example env file
cp .env.example .env

# (Optional) Edit .env if you need custom ports/credentials
# Default values are pre-configured for local dev
```

### 4. Start Docker Services
```bash
docker-compose up -d
```

Wait for all services to be healthy (30-60 seconds):
```bash
docker-compose ps
# All services should show "healthy" or "running"
```

**Services:**
- PostgreSQL: 5432
- Redis: 6379
- MinIO: 9000 (console: 9001)
- Mailhog: 8025

### 5. Run Database Migrations
```bash
# Migrations auto-run on docker-compose startup
# To manually verify:
docker-compose exec postgres psql -U predem_dev -d predem_db -c "SELECT COUNT(*) FROM users;"
# Should return: 3 (test users)
```

### 6. Start Development Servers
Open 3 terminal windows:

**Terminal 1 - API Backend:**
```bash
npm run dev -w @predem/api
# Listens on http://localhost:3000
```

**Terminal 2 - Web Frontend:**
```bash
npm run dev -w @predem/web
# Listens on http://localhost:3000 (Next.js dev server)
```

**Terminal 3 - Keep monitoring (optional):**
```bash
docker-compose logs -f
# View all service logs
```

### 7. Verify Everything Works
Open browser and test each URL:

- **Frontend**: http://localhost:3000
- **API Swagger Docs**: http://localhost:3000/api
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Mailhog (Email Testing)**: http://localhost:8025

---

## 🔐 Test Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Citizen | declarant@test.cm | Test123! | DECLARANT |
| Reviewer | instructeur@test.cm | Test123! | INSTRUCTEUR |
| Admin | admin@test.cm | Test123! | ADMIN_METIER |

---

## 🧪 Try These Workflows

### Workflow 1: Submit a Declaration
1. Login as `declarant@test.cm`
2. Click "Nouvelle Déclaration"
3. Fill out multi-step form
4. Upload document (OCR score: 85% simulated)
5. Proceed to payment
6. Select MTN, enter phone: `+237123456789`
7. Click "Payer"
8. ✅ Success screen shows transaction reference

### Workflow 2: Review & Approve (Backoffice)
1. Login as `instructeur@test.cm` (incognito window)
2. Navigate to "Backoffice"
3. View declarations awaiting review
4. Click on a "SUBMITTED" declaration
5. Review OCR scores and document details
6. Click "Valider" to approve
7. System generates attestation automatically

### Workflow 3: Verify Attestation (Public)
1. Go to http://localhost:3000/verifier (no login required)
2. Enter attestation reference: `ATT-DOUALA-20260414-00001`
3. Enter control code: `123456`
4. Click "Vérifier"
5. See: ✅ Valide / Emis le [date] / Expire le [date]

---

## 📁 Project Structure

```
predem/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication & guards
│   │   │   ├── declarations/  # Core workflow
│   │   │   ├── documents/     # OCR & uploads
│   │   │   ├── rules-engine/  # Auto-approval logic
│   │   │   └── ...
│   │   └── package.json
│   └── web/              # Next.js 14 frontend
│       ├── app/
│       │   ├── (public)/     # Public pages
│       │   └── (authenticated)/  # Protected pages
│       └── package.json
├── infra/
│   └── migrations/       # PostgreSQL SQL scripts
├── docs/                 # Documentation
├── docker-compose.yml    # Local dev services
├── package.json          # Monorepo config
└── README.md             # Project overview
```

---

## 🛠️ Common Commands

### Development
```bash
# Watch mode (both apps auto-reload)
npm run dev -w @predem/api &
npm run dev -w @predem/web &

# Type check
npm run type-check --workspaces

# Linting
npm run lint --workspaces

# Tests
npm run test --workspaces
```

### Database
```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U predem_dev -d predem_db

# View logs
docker-compose logs postgres

# Reset database (warning: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Debugging
```bash
# API debug mode
npm run start:debug -w @predem/api

# Browser DevTools (F12 in Chrome/Firefox)
# Frontend errors visible in Console tab

# API error logs
docker-compose logs api
```

---

## 📊 API Documentation

Full Swagger docs at: **http://localhost:3000/api**

### Key Endpoints

**Declarations**
- `POST /declarations` - Create new declaration
- `GET /declarations` - List declarations (with filters)
- `GET /declarations/:id` - Get declaration details
- `POST /declarations/:id/submit` - Submit to payment
- `POST /declarations/:id/sign` - Sign with OTP
- `POST /declarations/:id/review` - Instructeur reviews

**Documents**
- `POST /documents/upload` - Upload file
- `GET /documents/:id/ocr` - Get OCR results

**Attestations** (Public)
- `GET /attestations/verify?reference=X&code=Y` - Verify attestation

**Rules Engine**
- `GET /rules-engine/rules` - List active rules
- `POST /rules-engine/evaluate` - Test rule evaluation

---

## 🚨 Troubleshooting

### Port Already in Use?
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev -w @predem/web
```

### Database Connection Failed?
```bash
# Check if postgres is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### OCR Not Working?
- API should return demo OCR score 85%
- In production, integrates with Tesseract.js
- Check backend logs: `docker-compose logs api`

### Frontend Doesn't Connect to API?
- Verify `NEXT_PUBLIC_API_URL=http://localhost:3000/api` in `.env`
- Check browser console (F12) for CORS errors
- Ensure API is running: `curl http://localhost:3000/health`

### Want to Reset Everything?
```bash
# Stop all services
docker-compose down

# Remove volumes (careful: deletes data)
docker-compose down -v

# Fresh start
docker-compose up -d
npm install
npm run dev -w @predem/api &
npm run dev -w @predem/web &
```

---

## 📝 Configuration

All configuration via `.env` file:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | development | App mode |
| `API_PORT` | 3000 | Backend port |
| `DATABASE_HOST` | localhost | PostgreSQL host |
| `REDIS_HOST` | localhost | Redis host |
| `MINIO_BUCKET` | predem-docs | Object storage |
| `JWT_SECRET` | dev_secret... | Auth secret |
| `PAYMENT_DEV_MODE` | true | Payment simulation |

---

## 📞 Support

### Getting Stuck?
1. Check **Troubleshooting** section above
2. View logs: `docker-compose logs -f`
3. Check browser console (F12)
4. Review `/docs/DEMO_WALKTHROUGH.md` for expected behavior

### Want to Go Deeper?
- See `/docs/DEMO_WALKTHROUGH.md` for presentation walkthrough
- See `/README.md` for full architecture details
- API Swagger docs: http://localhost:3000/api

---

## 🎯 Next: Client Presentation

Once running locally, follow `/docs/DEMO_WALKTHROUGH.md` for a complete client demo script.

**Estimated time**: 15-20 minutes
**Topics**: Citizen workflow → Payment → Backoffice review → Public verification → GIS integration

---

**Version**: 0.1.0 (MVP)  
**Last Updated**: April 2026  
**Maintained By**: SmartFoncier Africa Team
