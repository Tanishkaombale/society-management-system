# Sentinel — Multi-Society Management System (MERN)

A full-stack, **multi-tenant** society / residential-complex management system built with
MongoDB, Express, React, and Node.js. The platform hosts unlimited independent societies —
each admin creates their own society and gets a private, isolated workspace. No data is
ever shared or visible across societies.

Three roles exist **within each society**:

- **Admin** — creates the society, shares its join code, approves resident requests,
  manages residents & staff, flats/blocks, notices, complaints, visitor logs,
  maintenance billing, and amenity bookings.
- **Resident** — requests to join a society using its code, then (once approved) views
  notices, raises & tracks complaints, pays maintenance dues, and books amenities.
- **Security** — created by an admin within their society; logs visitor entry/exit at
  the gate and views notices.

Sign-up supports both email/password and **"Continue with Google"**.

---

## 1. How multi-tenancy works

- Registration has two paths, chosen on the **Register** page:
  - **Create a society** — you provide a society name and become its admin immediately.
    The system generates a unique **join code** (e.g. `K7M2QP`) for your society.
  - **Join a society** — you enter an existing society's join code. Your account is
    created with `isApproved: false` and appears under **Residents & staff → Pending**
    for that society's admin to approve.
- Every piece of data (flats, notices, complaints, visitors, payments, amenities,
  bookings, and even other users) is scoped to a `society` field and every backend
  query filters by the logged-in user's society — enforced in the API, not just hidden
  in the UI. Two different societies can each have a flat "A-101" without collision.
- An admin only ever sees and manages people/data inside their own society.

---

## 2. Project structure

```
society-management-system/
├── backend/           Express + MongoDB REST API
│   ├── config/         DB connection
│   ├── controllers/    Route handlers / business logic (all scoped by society)
│   ├── middleware/      Auth (JWT), role guard, error handler
│   ├── models/          Society, User, Flat, Notice, Complaint, Visitor, Payment, Amenity, Booking
│   ├── routes/          Express routers
│   ├── utils/           Token generation, invoice numbers, society code generator, DB seeder
│   └── server.js        App entry point
└── frontend/           React (Vite) + Tailwind CSS SPA
    └── src/
        ├── api/          Axios instance + endpoint wrappers
        ├── components/   Reusable UI (Sidebar, Topbar, Modal, Badge, StatCard, GoogleAuthButton, ...)
        ├── context/       AuthContext (JWT session, create/join society, Google login)
        ├── layouts/       Dashboard & Auth layouts
        └── pages/         marketing/ (public homepage), auth/, admin/, shared/ (role-aware) pages
```

---

## 3. Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either:
  - Local MongoDB (`mongod` running on `localhost:27017`), or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (recommended if you
    don't want to install MongoDB locally)
- *(Optional, for Google Sign-In)* a Google OAuth 2.0 Client ID — see section 6 below.

---

## 4. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/society_management
JWT_SECRET=replace_this_with_a_long_random_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
```

If you're using Atlas, replace `MONGO_URI` with your connection string, e.g.
`mongodb+srv://<user>:<password>@cluster0.mongodb.net/society_management`.
Leave `GOOGLE_CLIENT_ID` blank if you don't need Google Sign-In yet (see section 6).

**Seed demo data** (creates **two separate demo societies** — Sunrise Residency and
Palm Grove Apartments — each with its own admin, security guard, resident, flats,
notices, and amenities, to prove the data is properly isolated):

```bash
npm run seed
```

This prints demo credentials and each society's join code to the console:

```
Society 1: Sunrise Residency  (join code: XXXXXX)
  Admin login:    admin@society.com / Admin@123
  Security login: security@society.com / Security@123
  Resident login: resident@society.com / Resident@123
----------------------------------------------------
Society 2: Palm Grove Apartments  (join code: XXXXXX)
  Admin login:    admin2@society.com / Admin@123
  Security login: security2@society.com / Security@123
  Resident login: resident2@society.com / Resident@123
```

Try registering a brand-new resident with one of the printed join codes to see the
request → approval flow in action.

**Start the API server:**

```bash
npm run dev      # nodemon, auto-restarts on change
# or
npm start        # plain node
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`
to confirm it's up.

---

## 5. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your backend:

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
```

**Start the dev server:**

```bash
npm run dev
```

Visit `http://localhost:5173`. From the homepage, click **Register** to either
**create a new society** (you become its admin) or **join an existing one** with a
join code (you'll wait for that society's admin to approve you). Or log in with one
of the seeded demo accounts above.

**Production build:**

```bash
npm run build     # outputs to frontend/dist
npm run preview   # preview the production build locally
```

---

## 6. Setting up "Continue with Google" (optional)

The Google button renders a disabled placeholder until you configure a real client ID.
To enable it:

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** of type **Web application**.
3. Under **Authorized JavaScript origins**, add `http://localhost:5173` (and your
   production domain later).
4. Copy the generated **Client ID**.
5. Paste the same value into **both**:
   - `backend/.env` → `GOOGLE_CLIENT_ID=...`
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID=...`
6. Restart both the backend and frontend dev servers.

The flow: the frontend uses Google Identity Services to get an ID token, sends it to
`POST /api/auth/google` along with the same "create society" / "join society" choice
as normal registration, and the backend verifies the token server-side before creating
or logging in the account. Existing email/password accounts are automatically linked
the first time someone signs in with Google using the same email.

---

## 7. Key features by module

| Module | Admin | Resident | Security |
|---|---|---|---|
| Society | Create, view join code, edit details | View own society | View own society |
| Residents & staff | Approve join requests, create staff, assign flats, remove | — | — |
| Flats & blocks | Full CRUD | View own | — |
| Notices | Publish, edit, delete | View | View |
| Complaints | View all, update status, comment | Raise, comment, track own | View, update status, comment |
| Visitor log | View all, check out | View own flat's visitors | Log entry, check out |
| Maintenance billing | Generate bills per flat | Pay dues | — |
| Amenities & bookings | Add amenities, approve/reject bookings | Book, cancel | — |

## 8. Authentication & security notes

- Passwords are hashed with bcrypt before storage (not required for Google-only accounts).
- JWT is issued on login/approval and stored in `localStorage` on the frontend; it's
  sent as a `Bearer` token on every request via an Axios interceptor.
- Google ID tokens are verified server-side with `google-auth-library` — the frontend
  never decides who's authenticated on its own.
- Role-based access is enforced server-side (`middleware/auth.js` → `authorize(...roles)`),
  not just hidden in the UI.
- **Society isolation is enforced server-side too**: every query in every controller
  filters by `req.user.society`, so an admin or resident can never read or modify
  another society's data, even by guessing an ID.
- New resident join requests are created with `isApproved: false` and cannot log in
  until that society's admin approves them.
- Rate limiting, `helmet`, and `express-mongo-sanitize` are applied globally in `server.js`.

## 9. Extending the project

- Add file uploads (visitor photos, ID proofs) with `multer` + a storage provider.
- Add email/SMS notifications (e.g. via Nodemailer or Twilio) for approvals, bills, and
  complaint updates.
- Add a payment gateway (Razorpay/Stripe) integration on `PUT /api/payments/:id/pay`.
- Add pagination to list endpoints (`getUsers`, `getComplaints`, etc.) as data grows.
- Add automated tests (Jest + Supertest for the API, Vitest + React Testing Library for
  the frontend).

---

Built as a complete, runnable reference implementation — not a toy demo. Every button
in the UI calls a real, working API endpoint backed by MongoDB.
