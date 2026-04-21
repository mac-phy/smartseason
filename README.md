# 🌾 SmartSeason Field Monitoring System

A web application for tracking crop progress across multiple fields during a growing season. Built as a technical assessment for SmartSeason.

---

## Live Demo (if deployed)

> _See submission email for live link_

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin / Coordinator | `admin@smartseason.com` | `admin123` |
| Field Agent (James) | `james@smartseason.com` | `agent123` |
| Field Agent (Grace) | `grace@smartseason.com` | `agent123` |
| Field Agent (Peter) | `peter@smartseason.com` | `agent123` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | SQLite via `@libsql/client` |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | React 18 + React Router v6 |
| Bundler | Vite |

**Why this stack?**
- Node/Express is lightweight, easy to run locally, and fits a focused CRUD API.
- SQLite removes the need to run a separate DB server — the database is a single file, making setup trivial. `@libsql/client` is a pure-JS SQLite driver, so there are no native build dependencies.
- React + Vite gives a fast, modern frontend DX without unnecessary complexity.
- No ORM was used intentionally — raw SQL keeps queries transparent and easy to reason about.

---

## Project Structure

```
smartseason/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── init.js       # Schema + async query helpers
│   │   │   └── seed.js       # Demo data seed script
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT authenticate + role guards
│   │   ├── routes/
│   │   │   ├── auth.js       # POST /login, GET /me
│   │   │   ├── fields.js     # Full CRUD for fields
│   │   │   └── users.js      # Agents list, dashboard summary
│   │   ├── utils/
│   │   │   └── status.js     # Field status computation logic
│   │   └── index.js          # Express app entry point
│   ├── data/                 # SQLite database file (auto-created)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── FieldsPage.jsx
    │   │   ├── FieldDetailPage.jsx
    │   │   └── AgentsPage.jsx
    │   ├── components/
    │   │   └── Layout.jsx       # Sidebar + nav shell
    │   ├── utils/
    │   │   └── api.js           # Typed fetch wrapper
    │   └── App.jsx              # Route definitions + guards
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/smartseason.git
cd smartseason
```

### 2. Set up the backend

```bash
cd backend
npm install
npm run seed       # Creates the database and loads demo data
npm run dev        # Starts API on http://localhost:4000
```

> The SQLite database file is created automatically at `backend/data/smartseason.db`.  
> To reset it: delete the file and run `npm run seed` again.

### 3. Set up the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # Starts React app on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Environment Variables (optional)

The backend reads these env vars with sensible defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | API server port |
| `JWT_SECRET` | `smartseason-dev-secret-2024` | JWT signing secret |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |

For production, set these in a `.env` file.

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | None | Returns JWT token |
| GET | `/api/auth/me` | Bearer | Current user profile |

### Fields
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/fields` | Bearer | List fields (role-scoped) |
| POST | `/api/fields` | Admin | Create a new field |
| GET | `/api/fields/:id` | Bearer | Field detail + update history |
| PUT | `/api/fields/:id` | Bearer | Update field (role-scoped) |
| DELETE | `/api/fields/:id` | Admin | Delete a field |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/agents` | Admin | Agents with field counts |
| GET | `/api/users/dashboard` | Bearer | Role-aware dashboard summary |

---

## Field Status Logic

Status is a **computed property** — it is never stored in the database, always derived at query time from the field's stage, planting date, and the timestamp of its most recent update.

```
backend/src/utils/status.js
```

### Rules

| Status | Condition |
|--------|-----------|
| **Completed** | Stage is `Harvested` |
| **At Risk** | Stage is `Ready` AND planted > 120 days ago (overdue harvest) |
| **At Risk** | Stage is `Growing` AND no update in 14+ days AND planted > 30 days ago (stale) |
| **At Risk** | Stage is `Planted` AND no update in 7+ days AND planted > 14 days ago (missed emergence check) |
| **Active** | Everything else (normal progression) |

### Rationale

The "At Risk" logic captures two failure modes:
1. **Harvest overdue** — a Ready field sitting too long risks crop spoilage or pest damage.
2. **Stale / unmonitored** — a field with no recent observations is a data gap; we flag it until an agent logs an update, at which point the timer resets.

The time thresholds (7/14/120 days) are reasonable for a mixed-crop operation and can easily be adjusted per crop type in a future iteration.

---

## Role Permissions Summary

| Action | Admin | Agent |
|--------|-------|-------|
| View all fields | ✅ | ❌ (own fields only) |
| Create fields | ✅ | ❌ |
| Edit all field metadata | ✅ | ❌ |
| Update stage + add notes | ✅ | ✅ (own fields) |
| Delete fields | ✅ | ❌ |
| View agents list | ✅ | ❌ |
| Dashboard (full overview) | ✅ | ✅ (own fields) |

---

## Deploying to Render

### Backend (Web Service)

1. Create a new **Web Service** on Render, connected to your repo
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node src/index.js`
5. Add these **Environment Variables** in the Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | _(any long random string)_ |
| `FRONTEND_URL` | `https://your-frontend-name.onrender.com` |

6. After first deploy, open the Render **Shell** tab and run: `node src/db/seed.js`

> **Note:** Render's free tier uses an ephemeral filesystem — the SQLite `.db` file will be wiped on each redeploy. For a persistent setup, mount a Render Disk at `./data` or switch to a hosted Postgres database.

### Frontend (Static Site)

1. Create a new **Static Site** on Render, connected to your repo
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Publish Directory**: `dist`
5. Add this **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-name.onrender.com/api` |

6. Add a **Rewrite Rule**: `/*` → `/index.html` (status `200`) so React Router works on page refresh.

---

## Assumptions Made

1. **Single organisation** — no multi-tenancy; all users share the same dataset within the app.
2. **Admin creates users** — there is no self-registration. Demo accounts are seeded; in production an admin would create agent accounts.
3. **One agent per field** — the data model supports a single assigned agent per field. A many-to-many relationship could be added if needed.
4. **SQLite is sufficient** — given the scope (one growing season, ~dozens of fields, a handful of agents), SQLite handles concurrent reads well enough. Switching to PostgreSQL would require minimal code changes (update the `@libsql/client` connection string or swap in a `pg` client).
5. **Status is always computed fresh** — this avoids stale status values in the DB and keeps the logic in one place. For very large datasets a materialised computed column or indexed cache column would be more efficient.

---

## Design Decisions

- **No ORM** — Drizzle/Prisma would add abstraction overhead for a project this size. Raw SQL is explicit and easy to audit.
- **Sync seed script** — kept simple; runs once to populate demo data. Not idempotent by design (truncates tables first).
- **JWT in localStorage** — acceptable for an assessment; a production build should use httpOnly cookies.
- **Inline CSS in React** — chosen for portability (no build-time CSS framework required). A larger project would use CSS Modules or Tailwind.
- **libsql over better-sqlite3** — `better-sqlite3` requires a native Node addon (C++ build). `@libsql/client` is pure JS and installs without a C compiler, making setup simpler across machines.
