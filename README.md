# BadrGo Mini Operations Wallet Portal

A full-stack wallet operations portal built for the BadrGo engineering assessment. Supports user management, wallet credit/debit operations, idempotent transactions, and daily reporting.

---

## Architecture

```
badrgo/
├── backend/          # Node.js + Express REST API
│   ├── src/
│   │   ├── config/       # Environment, DB, Swagger config
│   │   ├── controllers/  # HTTP request handlers (no business logic)
│   │   ├── middlewares/  # Error handling, validation
│   │   ├── models/       # Mongoose schemas (User, Wallet, Transaction)
│   │   ├── routes/       # Express routers with Swagger annotations
│   │   ├── services/     # All business logic lives here
│   │   ├── utils/        # Error factories
│   │   └── validators/   # express-validator rule sets
│   └── tests/            # Jest unit tests
└── frontend/         # Next.js 15 App Router
    └── src/
        ├── app/          # Pages: /, /users, /wallets, /reports
        ├── components/   # Navbar
        └── lib/          # Axios API wrapper
```

**Layer rule:** Controllers delegate to Services. Services own all business logic. UI components do not contain any backend rules.

---

## Tech Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Backend     | Node.js, Express                             |
| Database    | MongoDB (Mongoose, Decimal128)               |
| Validation  | express-validator                            |
| API Docs    | Swagger (swagger-jsdoc + swagger-ui-express) |
| Frontend    | Next.js 15, React, Tailwind CSS              |
| HTTP Client | Axios                                        |
| Testing     | Jest, mongodb-memory-server                  |

**Why MongoDB over PostgreSQL:** MongoDB was chosen because the assessment schema is document-oriented and does not require relational joins. Decimal128 natively handles precise monetary values. The idempotency pattern is easier to implement without needing distributed transactions or a Replica Set.

---

## Prerequisites

- Node.js 20+
- MongoDB 7+ (local)

---

## Local Setup (Without Docker)

**1. Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Environment Variables

| Variable    | Description                              | Default                                   |
| ----------- | ---------------------------------------- | ----------------------------------------- |
| `PORT`      | Backend server port                      | `3001`                                    |
| `MONGO_URI` | MongoDB connection string                | `mongodb://localhost:27017/badrgo_wallet` |
| `NODE_ENV`  | Environment (`development`/`production`) | `development`                             |

---

## API Reference

Swagger UI is available at `http://localhost:3001/api-docs` when the server is running.

| Method | Endpoint                        | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| `POST` | `/api/users`                    | Create a new user            |
| `GET`  | `/api/users`                    | List all users (paginated)   |
| `POST` | `/api/wallets`                  | Create a wallet for a user   |
| `GET`  | `/api/wallets/stats`            | Aggregate dashboard stats    |
| `GET`  | `/api/wallets`                  | List all wallets (paginated) |
| `GET`  | `/api/wallets/:id`              | Get wallet by ID             |
| `POST` | `/api/wallets/:id/credit`       | Credit a wallet              |
| `POST` | `/api/wallets/:id/debit`        | Debit a wallet               |
| `GET`  | `/api/wallets/:id/transactions` | List wallet transactions     |
| `GET`  | `/api/reports/daily-summary`    | Daily aggregation report     |

**Credit/Debit Request Body:**

```json
{
  "amount": 100.0,
  "referenceId": "invoice-tx-001",
  "description": "Top up"
}
```

---

## Key Design Decisions

### 1. Balance Safety Decimal128

All monetary values are stored as MongoDB `Decimal128` to avoid IEEE-754 floating-point drift. Native JavaScript `Number` cannot safely represent values like `0.1 + 0.2`.

### 2. Idempotency Claim-First Strategy

We enforce idempotency by utilizing a unique index on `Transaction.referenceId`. The strategy follows a "claim-first" approach:

- We first attempt to `Transaction.create(...)` the transaction record.
- If the `referenceId` already exists, MongoDB throws a duplicate key error (code 11000), rejecting the request immediately with a 409 status code before any balance change occurs.
- If creation succeeds, we then update the wallet balance via `Wallet.findOneAndUpdate(...)`.
- If the balance update fails (e.g. insufficient funds), we perform a compensating deletion to remove the pending transaction.
- This provides strong consistency and prevents duplicate processing of the same transaction reference without requiring distributed transactions.

### 3. Negative Balance Prevention

The debit `findOneAndUpdate` query includes `{ balance: { $gte: amountDecimal } }`. If the balance is insufficient, MongoDB simply returns null the balance is never touched. The service then does a secondary lookup to distinguish between "wallet not found", "wallet frozen", and "insufficient funds" to return a meaningful error.

### 4. Layered Architecture

Controllers contain zero business logic. They receive HTTP requests, call the appropriate service method, and return the result. This makes the business logic independently testable.

---

## Running Tests

```bash
cd backend
npm test
```

Tests use `mongodb-memory-server` no external MongoDB connection is needed.

**Test coverage:**

- Credit: verifies balance update and transaction record creation
- Debit: verifies insufficient funds rejection (statusCode 400)
- Duplicate referenceId: verifies idempotency rejection (statusCode 409)
- Concurrent debit: fires two simultaneous debits with the same referenceId and verifies exactly one succeeds

---

## Frontend Manual Test Checklist

- [ ] Dashboard loads with correct stat cards (total wallets, balance, credits, debits, transaction count)
- [ ] Dashboard shows recent daily activity table
- [ ] Users page: create a new user with name, email, phone
- [ ] Users page: new user appears in the list immediately after creation
- [ ] Users page: duplicate email shows a clear error message
- [ ] Wallets page: loading state appears while fetching wallet
- [ ] Wallets page: unknown wallet ID shows clear error message
- [ ] Wallets page: credit increases balance and creates a transaction record
- [ ] Wallets page: debit decreases balance and creates a transaction record
- [ ] Wallets page: debit below zero shows "Insufficient funds" error
- [ ] Wallets page: duplicate referenceId shows "Duplicate transaction reference" error
- [ ] Wallets page: credit/debit buttons show "Processing..." while request is in flight
- [ ] Reports page: table loads on page open
- [ ] Reports page: date filters correctly narrow results
- [ ] Reports page: clear button removes filters and reloads all data
- [ ] All pages: navigation bar links work correctly

---

## Known Limitations

- No authentication or authorization layer all endpoints are public. This is intentional per the assessment scope ("no-auth assessment submission").
- The idempotency pattern relies on single-document operations and a compensating deletion. While effective for standalone instances or replica sets, cross-shard operations in a highly distributed cluster might require more complex coordination mechanisms.

---

## AI Usage Disclosure

This project was built with AI assistance (Antigravity IDE powered by Google DeepMind).

**What AI was used for:**

- Scaffolding boilerplate (Express app setup, Next.js file creation)
- Drafting initial Mongoose schemas
- Generating Swagger annotation syntax
- Writing initial Tailwind CSS layout classes

**What was manually designed and understood:**

- The Decimal128 monetary precision choice
- The claim-first idempotency pattern utilizing MongoDB's unique indices and compensating transactions
- The TOCTOU race condition analysis and why `findOne` + `findOneAndUpdate` is unsafe
- The layered architecture (controllers own no logic, services own all logic)
- The `$gte` balance check inside the atomic `findOneAndUpdate` to prevent negative balances
- All error handling flows and the distinction between 400, 404, 409 status codes
- The secondary wallet lookup in debit to produce meaningful error messages

**Every design decision in this codebase can be explained and modified live.**
