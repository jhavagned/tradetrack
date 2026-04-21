# TradeTrack User Stories

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
- Long: (exit - entry)
- Short: (entry - exit)
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

## 5. Trade Validation (Future)
**As a** trader  
**I want** input validation  
**So that** invalid trades are prevented  

### Acceptance Criteria:
- Required fields enforced
- Numeric fields validated
- Partial exit data is rejected