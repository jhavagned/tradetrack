# TradeTrack

![CI](https://github.com/jhavagned/tradetrack/actions/workflows/test.yml/badge.svg?branch=main)

A full-stack trading journal application for tracking trades, calculating P&L, and learning real-world backend architecture patterns.

---

## Overview

TradeTrack is a full-stack trading journal application designed to:

- Track trades
- Calculate P&L
- Learn real backend architecture patterns
- Evolve into a production-grade system

TradeTrack is built with a focus on clean architecture, observability, and production-grade backend practices — not just CRUD. It features session-based authentication, structured logging with request tracing, and a fully tested API backed by PostgreSQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | PostgreSQL (Docker) |
| Frontend | React (Vite) |
| Testing | Jest, Supertest |
| CI | GitHub Actions |

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
        App.css                      # Global app styles
        App.jsx                      # Root component — sets up routing
        index.css                    # Base/reset styles
        main.jsx                     # App entry point — mounts React root
        assets/                      # Images, icons, static media
        config/
            api.js                   # API base URL sourced from environment variabl
        context/
            AuthContext.jsx          # Global auth state — current user, login/logout
        pages/
            Login.jsx                # Login page
            Register.jsx             # Registration page
        routes/
            ProtectedRoute.jsx       # Route guard — redirects unauthenticated users

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
    db/
      config/
        db.js                        # Lazy pool + centralized query function
      migrations/                    # Versioned SQL migration files
    modules/
      auth/                          # Auth controller, service, repositories
      trades/                        # Trades controller, service, repository, validation
    tests/                           # Jest test suites (21 tests, 3 suites)
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
- [Docker](https://www.docker.com/) (for PostgreSQL)

---

## Setup

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

Backend:

```bash
cd server
npm install
```
Frontend:

```bash
cd client
npm install
```

### 4. Configure environment variables

Backend — Create a `.env` file in `server/`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=tradetrack
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MAX=10

SESSION_SECRET=your_session_secret
```
Frontend — Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5000
```
### 5. Run migrations

```bash
psql -U postgres -d tradetrack -f server/src/db/migrations/001_initial_schema.sql
psql -U postgres -d tradetrack -f server/src/db/migrations/002_add_entry_exit_time_to_trades.sql
```

### 6. Start the Application

Backend:

```bash
cd server
npm run start
```

Frontend:

```bash
cd client
npm run dev
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
cd server
npm run test
```

21 tests across 3 suites:
- `auth.test.js` — authentication flows
- `trades.test.js` — trade business logic
- `app.test.js` — infrastructure (requestId, concurrency)

---

## CI

Every pull request and push to `main` automatically runs the full test suite via GitHub Actions. The badge at the top of this file reflects the current state of `main`.