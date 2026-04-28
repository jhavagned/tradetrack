# TradeTrack User Stories

---

## 1. Trade Creation

**As a** trader  
**I want** to log a trade  
**So that** I can track my trading activity

### Acceptance Criteria:

- User can input symbol, type, entry price, quantity
- Optional fields: exit price, exit time, notes, strategy
- Trade is sent to backend API
- Trade is stored in memory
- Trade appears in UI immediately
- Form resets after submission

---

## 2. Trade List

**As a** trader  
**I want** to view all my trades  
**So that** I can review my history

### Acceptance Criteria:

- All trades are fetched from backend
- Trades display symbol, type, prices, quantity
- Open trades show "Open" instead of exit price

---

## 3. Individual Trade P&L

**As a** trader  
**I want** to see profit/loss per trade  
**So that** I can evaluate performance

### Acceptance Criteria:

- P&L is calculated only for closed trades
- Buy: (exit - entry)
- Sell: (entry - exit)
- Multiplier is applied based on symbol
- Positive = green, negative = red

---

## 4. Total P&L

**As a** trader  
**I want** to see my total profit/loss  
**So that** I understand overall performance

### Acceptance Criteria:

- Total P&L sums all closed trades
- Updates when new trade is added
- Color reflects profit/loss

---

## 5. Trade Validation (Backend)

**As a** trader  
**I want** input validation  
**So that** invalid trades are prevented

### Acceptance Criteria:

- Required fields enforced
- Numeric fields validated
- Partial exit data is rejected
- Backend returns meaningful error messages

---

# Backend Architecture Refactor Stories

---

## 6. Domain-Based Module Structure

**As a** developer  
**I want** to reorganize backend code into feature-based modules (e.g., trades, auth)  
**So that** the system is scalable and easier to extend with authentication and new domains

### Acceptance Criteria:

- A `modules/` directory is introduced
- Trades logic is moved into `modules/trades/`
- Each module contains:
  - routes
  - controllers
  - services
  - repositories
  - validation (if applicable)
- Existing API behavior remains unchanged
- All tests continue to pass

---

## 7. Extract Validation into Domain Layer

**As a** developer  
**I want** trade validation logic to live inside the trades module  
**So that** business rules are not mixed with generic utilities

### Acceptance Criteria:

- `validateTrade.js` is moved into `modules/trades/validation/`
- Validation is only used by trade service/controller
- `utils/` no longer contains business validation logic
- All tests pass without behavior changes
- API behavior remains unchanged

---

## 8. Repository Abstraction Layer

**As a** developer  
**I want** the repository to follow a structured interface instead of direct array usage  
**So that** data storage can later be replaced with a database without changing business logic

### Acceptance Criteria:

- Repository exposes:
  - `create()`
  - `findAll()`
  - `clear()` (test utility)
- In-memory storage is encapsulated inside repository
- Services do not access raw arrays directly
- No breaking changes to API behavior
- All tests continue to pass

---

## 9. Middleware Layer Introduction

**As a** developer  
**I want** a dedicated middleware layer in the backend  
**So that** authentication, logging, and error handling can be added cleanly

### Acceptance Criteria:

- A `middleware/` directory is created
- Includes placeholder files:
  - `auth.middleware.js`
  - `logger.middleware.js`
  - `error.middleware.js`
- Express app is prepared to use middleware
- No impact on current API behavior

---

## 10. Test Suite Stability During Refactor

**As a** developer  
**I want** the test suite to remain stable during architectural changes  
**So that** refactoring does not reduce confidence in system behavior

### Acceptance Criteria:

- All Jest tests pass after refactor
- Fixtures remain reusable
- Repository state resets between tests
- No shared state leakage between tests
- Integration tests still validate full request flow

# 11. Backend Logging & Observability System

**As a** developer  
**I want** a structured logging system across the backend (requests, errors, and service-level events)  
**So that** I can debug issues, trace request flows, and monitor system behavior in a production-like way

---

## Acceptance Criteria:

- A centralized logging system is introduced in the backend
- Each incoming HTTP request is assigned a unique request ID
- Request logs include:
  - HTTP method
  - endpoint
  - status code
  - response time
  - request ID
- Errors are logged separately with stack traces
- Logs are structured (JSON format preferred)
- Logging is integrated into Express via middleware
- Service-level events (e.g. trade creation) can optionally log internal actions
- Logging does not affect API response structure or performance significantly
- Existing tests continue to pass without modification
