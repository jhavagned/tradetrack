 1. Trade Creation
Test Case 1.1 — Successful Trade Creation

Given: Valid trade input
When: User submits the form
Then: Trade is stored and displayed in UI

Test Case 1.2 — Missing Required Fields

Given: Missing symbol or entryPrice
When: User submits
Then: Submission is rejected and error is logged

Test Case 1.3 — Invalid Numeric Values

Given: entryPrice = -100
When: User submits
Then: Submission is rejected

Test Case 1.4 — Partial Exit Data

Given: exitPrice is filled but exitTime is empty
When: User submits
Then: Submission is rejected

Test Case 1.5 — Form Reset

Given: Trade submitted successfully
When: Response is received
Then: Form fields reset to default values

2. Trade List
Test Case 2.1 — Fetch Trades

Given: Backend has trades stored
When: Page loads
Then: Trades are displayed

Test Case 2.2 — Empty State

Given: No trades exist
When: Page loads
Then: Empty list is displayed (or no rows)

Test Case 2.3 — Open Trade Display

Given: exitPrice is null
When: Trade is rendered
Then: "Open" is displayed instead of exit price

3. Individual Trade P&L
Test Case 3.1 — Long Profit

Given: entry = 100, exit = 110
When: Trade is rendered
Then: P&L is positive

Test Case 3.2 — Long Loss

Given: entry = 100, exit = 90
Then: P&L is negative

Test Case 3.3 — Short Profit

Given: entry = 100, exit = 90
Then: P&L is positive

Test Case 3.4 — Multiplier Applied

Given: symbol = NQ (multiplier 20)
Then: P&L is scaled correctly

Test Case 3.5 — Open Trade

Given: no exitPrice
Then: P&L shows "Open"

4. Total P&L
Test Case 4.1 — Sum of Trades

Given: multiple closed trades
Then: totalPnl equals sum of individual P&L

Test Case 4.2 — Ignores Open Trades

Given: open trades exist
Then: they are excluded from total

Test Case 4.3 — Updates After New Trade

Given: new trade added
Then: totalPnl updates immediately

Test Case 4.4 — Color Logic

Given: totalPnl > 0
Then: color is green

 5. Validation 
Test Case 5.1 — Required Fields

Reject empty symbol, entryPrice, quantity

Test Case 5.2 — Numeric Conversion

Ensure numbers are converted before API call