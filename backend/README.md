# SHIFX PRODUCTS — Full Stack

React + FastAPI + PostgreSQL eCommerce platform.

```
shifx-fullstack/
├── frontend/              ← React 18 + Vite
│   ├── src/
│   │   ├── main.jsx       ← React entry point
│   │   └── App.jsx        ← Entire app (single-file React)
│   ├── index.html
│   ├── vite.config.js     ← Dev proxy: /auth /products → :8000
│   └── package.json
│
├── backend/               ← FastAPI + SQLAlchemy
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py        ← bcrypt + JWT
│   ├── dependencies.py    ← Auth guards
│   ├── seed.py            ← Creates DB + seed data
│   └── routes/
│       ├── auth_routes.py
│       ├── product_routes.py
│       ├── order_routes.py
│       ├── review_routes.py
│       ├── wishlist_routes.py
│       ├── admin_routes.py
│       └── company_routes.py
│
├── start.sh               ← Mac/Linux: one command startup
├── start.bat              ← Windows: one command startup
└── README.md
```

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Python | 3.11+ | `python3 --version` |
| Node.js | 18+ | `node --version` |
| PostgreSQL | 14+ | `psql --version` |

---

## Quick Start (3 steps)

### Step 1 — Create the database

```sql
-- In psql or pgAdmin:
CREATE DATABASE shifx_products;
```

### Step 2 — Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shifx_products
SECRET_KEY=run-this-to-generate: python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Step 3 — Start everything

**Mac / Linux:**
```bash
bash start.sh
```

**Windows:**
```
start.bat
```

This will:
1. Create Python virtual environment
2. Install all Python packages
3. Seed the database (admin users + products)
4. Install npm packages
5. Start FastAPI on `http://localhost:8000`
6. Start Vite on `http://localhost:3000` ← **Open this**

---

## Manual Start (if script fails)

**Terminal 1 — Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 seed.py                   # first time only
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## How the Frontend ↔ Backend Connection Works

```
Browser (localhost:3000)
        │
        │  fetch("/auth/login")        ← relative URL, no CORS
        │
Vite Dev Server (localhost:3000)
        │
        │  proxy: /auth → http://localhost:8000
        │
FastAPI (localhost:8000)
        │
        │  Validates JWT, bcrypt, queries DB
        │
PostgreSQL (localhost:5432/shifx_products)
```

The key is `vite.config.js`:
```js
proxy: {
  "/auth":     { target: "http://localhost:8000", changeOrigin: true },
  "/products": { target: "http://localhost:8000", changeOrigin: true },
  // ...etc
}
```

All API calls in the frontend use relative paths like `/auth/login` — Vite proxies them to FastAPI. **Zero CORS issues.**

---

## Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin1@shifx.com | Admin1@123456 |
| 👑 Admin | admin2@shifx.com | Admin2@123456 |
| 🏢 Company | employee1@shifx.com | Employee1@123456 |
| 🏢 Company | employee2@shifx.com | Employee2@123456 |
| 👤 User | Register via signup form | — |

---

## API Endpoints

| Category | Endpoints |
|----------|-----------|
| Auth | POST /auth/register, /auth/verify-otp, /auth/resend-otp, /auth/login, GET /auth/me |
| Products | GET /products, GET /products/{id}, POST/PUT/DELETE /products |
| Orders | POST /orders, GET /orders, GET /orders/{id} |
| Reviews | POST /reviews, GET /reviews/{product_id} |
| Wishlist | GET /wishlist, POST /wishlist, DELETE /wishlist/{product_id} |
| Admin | GET /admin/users, /admin/analytics, /admin/orders |
| Company | GET /company/stats, /company/products, /company/orders |

**Interactive docs:** `http://localhost:8000/docs`

---

## Production Deployment

**Backend (e.g. Railway / Render):**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```
Set `APP_ENV=production` in env vars — this disables SQL echo and hides demo OTPs.

**Frontend (e.g. Vercel / Netlify):**
```bash
cd frontend
npm run build          # outputs to frontend/dist/
```
Set env var: `VITE_API_URL=https://your-api.railway.app`

---

## Security Notes

- Passwords: bcrypt hashed, never stored plain
- JWT: signed HS256, 24hr expiry, role embedded
- Role checks: server-side in `dependencies.py`, frontend role is display-only
- OTP: 6-digit, 10min TTL, deleted after use
- Soft-delete on products preserves order history
- CORS: restricted to frontend URL in production
