# TradeTrack

![CI](https://github.com/jhavagned/tradetrack/actions/workflows/test.yml/badge.svg?branch=main)

A full-stack trading journal application for tracking trades and analysing trading performance.

**[Live Demo](https://tradetrack-jugn.onrender.com)**

---

## Overview

TradeTrack is a personal trading journal built and maintained using modern technologies and industry-standard engineering practices — designed from the start to reflect how real software teams work, not how tutorials teach.

Built end to end across the full software development lifecycle:

- **Product thinking** — user stories with acceptance criteria, prioritised backlog
- **System design** — layered architecture, clean separation of concerns
- **Backend engineering** — REST API, session auth, request tracing, error handling
- **Frontend engineering** — React SPA, component design, client-side validation
- **Data** — PostgreSQL schema design, versioned migrations, analytics queries
- **Testing** — 57 tests across 4 suites, isolated test database, CI pipeline
- **DevOps** — Docker for local development, GitHub Actions CI/CD, production deployment across three platforms

The goal was to build something genuinely useful while gaining hands-on experience with the tools, patterns, and workflows used in professional software development.

---

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | React (Vite), Tailwind CSS, Recharts                |
| Backend  | Node.js, Express                                    |
| Database | PostgreSQL (Docker locally, Supabase in production) |
| Testing  | Jest, Supertest                                     |
| CI/CD    | GitHub Actions                                      |
| Hosting  | Render (full stack), Supabase (database)            |

---

## Features

### Trade Management

- Create trades with full field set (symbol, type, entry/exit price, times, quantity, notes, strategy)
- Close open trades with exit price and exit time
- Edit any trade — recalculates `trade_status` and `closed_at` automatically
- Delete trades with confirmation modal
- P&L calculation with futures contract multipliers (NQ, ES, MNQ, MES, and more)
- Mobile responsive — card layout on small screens, table layout on desktop
- Emotional state tracking (before, during, after) with emoji pill selectors
- Trade detail view showing all trade information in one place

### Analytics Dashboard

- P&L over time — bar chart with day / week / month toggle
- Win rate — total trades, wins, losses, breakevens
- Symbol breakdown — ranked by total P&L with per-symbol win rate
- Emotion insights — win rate by emotional state, most common emotion before wins and losses

### Authentication

- Session-based authentication (httpOnly cookies)
- Register, login, logout
- Protected routes on both frontend and backend
- Request-scoped user context via AsyncLocalStorage

### Observability

- Structured logging (pretty in dev, JSON in prod)
- Request tracing via `requestId` using AsyncLocalStorage
- Scoped loggers per module
- Environment-based log levels

---

## Architecture

```
client/                              # React frontend (Vite)
    .env                             # Frontend environment variables (VITE_API_URL)
    index.html                       # HTML entry point
    package.json                     # Frontend dependencies
    package-lock.json                # Locked dependency versions
    public/                          # Static assets served as-is
    src/
        App.jsx                      # Root component — sets up routing
        main.jsx                     # App entry point — mounts React root
        components/
          CloseTradeModal.jsx        # Modal for closing open trades
          DeleteConfirmModal.jsx     # Modal for confirming trade deletion
          EditTradeModal.jsx         # Modal for editing trades
          JournalSection.jsx         # Collapsible emotional state selector
          TradeDetailModal.jsx       # Full trade detail view with emotional state
        config/
          api.js                     # API base URL from environment variable
        context/
          AuthContext.jsx            # Global auth state — current user, login/logout
        pages/
          Login.jsx                  # Login page
          Register.jsx               # Registration page
          TradeEntry.jsx             # Trade log page
          Dashboard.jsx              # Analytics dashboard
        routes/
          ProtectedRoute.jsx         # Route guard for authenticated routes
        utils/
          formatters.js              # Shared formatting utilities
          validation.js              # Client-side validation

server/                              # Node.js/Express backend
  .env                               # Backend environment variables (DB, session secret)
  package.json                       # Backend dependencies
  package-lock.json                  # Locked dependency versions
  src/
    app.js                           # Express app setup
    server.js                        # Entry point
    middleware/
      requestLogger.middleware.js    # Request lifecycle, requestId, duration
      auth.middleware.js             # Session validation
    utils/
      logger.js                      # Scoped logger factory
      asyncRequestContext.js         # AsyncLocalStorage for request tracing
      constants.js                   # Shared constants (futures multipliers)
    db/
      config/
        db.js                        # Lazy pool + centralized query function
      migrations/                    # Versioned SQL migration files
    modules/
      auth/                          # Auth controller, service, repositories
      trades/                        # Trades controller, service, repository, validation
      analytics/                     # Analytics controller, service, repository
    tests/                           # Jest test suites (57 tests, 4 suites)
      api/
        auth.test.js                 # Authentication flows (12 tests)
        trades.test.js               # Trade business logic (25 tests)
        app.test.js                  # Infrastructure — requestId, concurrency (8 tests)
        analytics.test.js            # Analytics endpoints (12 tests)
      fixtures/
        auth.js                      # Auth helpers
        trades.js                    # Trade fixtures

package.json                         # Root package.json — coordinates build
```

### Request Flow

```
Client Request
↓
Request Logger Middleware (requestId + AsyncLocalStorage)
↓
Auth Middleware (session validation via PostgreSQL)
↓
Controller → Service → Validation → Repository
↓
Response
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) (for local PostgreSQL)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/jhavagned/tradetrack.git
cd tradetrack
```

### 2. Start the database

```bash
docker compose start
```

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Configure environment variables

Backend — Create `server/.env`:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=tradetrack
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MAX=20

SESSION_SECRET=your_session_secret
```

Frontend — Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 5. Run migrations

```bash
psql -U postgres -d tradetrack -f server/src/db/migrations/001_initial_schema.sql
psql -U postgres -d tradetrack -f server/src/db/migrations/002_add_entry_exit_time_to_trades.sql
psql -U postgres -d tradetrack -f server/src/db/migrations/003_add_emotions_to_trades.sql
```

### 6. Start the Application

Backend:

```bash
cd server && npm run start
```

Frontend:

```bash
cd client && npm run dev
```

---

## Running Tests

Tests run against an isolated `tradetrack_test` database and never touch development data.

### Create the test database (first time only)

```bash
psql -U postgres -c "CREATE DATABASE tradetrack_test;"
psql -U postgres -d tradetrack_test -f server/src/db/migrations/001_initial_schema.sql
psql -U postgres -d tradetrack_test -f server/src/db/migrations/002_add_entry_exit_time_to_trades.sql
```

### Run the test suite

```bash
cd server && npm test
```

**57 tests across 4 suites:**

| Suite               | Tests | Coverage                                        |
| ------------------- | ----- | ----------------------------------------------- |
| `trades.test.js`    | 25    | Trade creation, close, edit, delete, validation |
| `auth.test.js`      | 12    | Registration, login, logout, session management |
| `app.test.js`       | 8     | Request tracing, concurrency, error shape       |
| `analytics.test.js` | 12    | P&L by period, win rate, symbol breakdown       |

---

## API Endpoints

### Auth

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/auth/register` | Register a new user            |
| POST   | `/api/auth/login`    | Login and create session       |
| GET    | `/api/auth/me`       | Get current authenticated user |
| POST   | `/api/auth/logout`   | Logout and destroy session     |

### Trades

| Method | Endpoint                | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| GET    | `/api/trades`           | Get all trades for authenticated user |
| POST   | `/api/trades`           | Create a new trade                    |
| PATCH  | `/api/trades/:id/close` | Close an open trade                   |
| PUT    | `/api/trades/:id`       | Edit a trade                          |
| DELETE | `/api/trades/:id`       | Delete a trade                        |

### Analytics

| Method | Endpoint                                     | Description                              |
| ------ | -------------------------------------------- | ---------------------------------------- |
| GET    | `/api/analytics/pnl?period=day\|week\|month` | P&L grouped by period                    |
| GET    | `/api/analytics/win-rate`                    | Win rate across all closed trades        |
| GET    | `/api/analytics/symbols`                     | P&L and win rate by symbol               |
| GET    | `/api/analytics/emotions`                    | Win rate and patterns by emotional state |

---

## Production Deployment

The frontend is served as static files directly from the Express backend.
Both are deployed together as a single service on Render.

| Layer    | Platform | Notes                    |
| -------- | -------- | ------------------------ |
| App      | Render   | Auto-deploys from `main` |
| Database | Supabase | Hosted PostgreSQL        |

### Environment Variables (Production)

Render:

```env
NODE_ENV=production
DATABASE_URL=your_supabase_connection_string
SESSION_SECRET=your_session_secret
DB_POOL_MAX=30
```

---

## CI/CD

Every pull request and push to `main` automatically runs the full test suite via GitHub Actions. The badge at the top of this file reflects the current state of `main`.

Every merge to `main` triggers automatic deployment to Render. No manual deployment steps required — a passing PR merged to `main` is live in production within minutes.
