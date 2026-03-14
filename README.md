# My Favorite Places

A full-stack application to save and search your favorite addresses with geolocation.

---

## Stack

| Layer | Technology |
|---|---|
| API server | Express 5, TypeScript, TypeORM, SQLite (better-sqlite3) |
| Auth | Argon2 (password hashing), JWT (jsonwebtoken) |
| Geocoding | [data.geopf.fr](https://data.geopf.fr) — French national geocoding API |
| Client | React 18, Vite 5, TypeScript |
| Unit / Integration tests | Jest, ts-jest, Supertest, faker-js |
| E2E tests | Playwright (Chromium) |
| CI | GitHub Actions |

---

## Project structure

```
.
├── server/               # Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers (Users, Addresses)
│   │   ├── entities/     # TypeORM entities (User, Address)
│   │   ├── utils/        # Helpers (getDistance, geocoding, auth)
│   │   ├── app.ts        # Express app
│   │   ├── router.ts     # API router mounted at /api
│   │   ├── datasource.ts # TypeORM SQLite datasource
│   │   ├── app.spec.ts   # Integration tests — Users API
│   │   └── addresses.spec.ts # Integration tests — Addresses API
│   ├── tests/            # Unit tests
│   ├── jest.config.js
│   └── package.json
├── client/               # React + Vite frontend
│   ├── src/
│   │   └── App.tsx       # Main UI — API tester with auth flow
│   ├── e2e/
│   │   └── auth.e2e.spec.ts  # Playwright E2E tests
│   └── playwright.config.ts
└── .github/
    └── workflows/
        └── server-tests.yml  # CI pipeline
```

---

## Prerequisites

- Node.js >= 20
- Yarn 1.x (`corepack enable` then `corepack prepare yarn@1.22.22 --activate`)
- npm (for the client)

---

## Setup

### 1. Clone the repo

```bash
git clone git@github.com:Az3r1y/myf_ynov_2026.git
cd myf_ynov_2026
```

### 2. Install server dependencies

```bash
cd server
yarn install
```

> If you get a `NODE_MODULE_VERSION` error with `better-sqlite3`, rebuild the native module:
> ```bash
> npm rebuild better-sqlite3
> ```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

### 4. Install Playwright browsers (E2E only)

```bash
cd client
npx playwright install chromium
```

---

## Running the app

### Start the API server

```bash
cd server
yarn dev
```

Server starts on **http://localhost:3000**

### Start the client

```bash
cd client
npm run dev
```

Client starts on **http://localhost:5173**

Vite proxies all `/api` requests to `localhost:3000` automatically — no CORS configuration needed.

---

## API endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users` | — | Create a new account |
| `POST` | `/api/users/tokens` | — | Log in, get a JWT token |
| `GET` | `/api/users/me` | Bearer token | Get current user profile |
| `POST` | `/api/addresses` | Bearer token | Save a new address (geocoded) |
| `GET` | `/api/addresses` | Bearer token | List all saved addresses |
| `POST` | `/api/addresses/searches` | Bearer token | Find addresses within a radius |

### Authentication

All protected routes accept a JWT either as:
- `Authorization: Bearer <token>` header
- `token` cookie (set automatically on login)

### Example — create a user

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"supersecret123"}'
```

### Example — search within 50 km of Paris

```bash
curl -X POST http://localhost:3000/api/addresses/searches \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"radius":50,"from":{"lat":48.8566,"lng":2.3522}}'
```

---

## Running tests

### Unit + integration tests

```bash
cd server
yarn test
```

### With coverage report

```bash
cd server
yarn test:coverage
```

The HTML report is generated in `server/coverage/lcov-report/index.html`.

Coverage thresholds (enforced on every run):

| Metric | Threshold | Actual |
|---|---|---|
| Statements | ≥ 90% | 98.25% |
| Branches | ≥ 85% | 100% |
| Functions | ≥ 85% | 100% |
| Lines | ≥ 90% | 98.19% |

### E2E tests

Both the server and the client must **not** be running — Playwright starts them automatically.

```bash
cd client
npm run test:e2e
```

To open the Playwright UI:

```bash
npm run test:e2e:ui
```

---

## Branch strategy

```
main    ← production (protected — PR + CI required)
  └── dev  ← integration (protected — PR + CI required)
        └── feature/*  ← one branch per feature
```

- No direct push to `main` or `dev` — open a PR
- A Husky `pre-push` hook runs `yarn test` before any push

---

## CI

GitHub Actions runs on every push and PR targeting `main` or `dev`:

1. Checkout
2. Setup Node 22 + Corepack
3. `yarn install --frozen-lockfile`
4. `yarn test:coverage`
5. Upload coverage report as a build artifact (retained 7 days)

The `test` job must pass for a PR to be mergeable into `main`.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the API server listens on |
| `SESSION_SECRET` | `superlongstring` | Secret key used to sign JWT tokens |

Set them in a `.env` file at the root of `server/` (never commit this file).
