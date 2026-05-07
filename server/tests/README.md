# Test Suite

## Running Tests
```bash
npm run test
```

## Notes
- `--runInBand` runs all test suites serially to prevent DB conflicts
- `--forceExit` is required due to a known supertest + Jest issue where
  supertest keeps HTTP connections open after tests finish. This is a 
  tooling limitation, not a bug in the application code.