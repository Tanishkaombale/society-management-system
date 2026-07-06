<div align="center">

# 🏢 Sentinel — Multi-Society Management System

### A full-stack MERN platform that lets *any number* of residential societies run their entire operations — residents, dues, complaints, visitors, and more — from one clean dashboard.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## 🚀 What is this?

**Sentinel** is a production-style **multi-tenant SaaS** built on the MERN stack — meaning it's not built for *one* society, it's built to host **unlimited independent societies** on the same platform, each with its own completely isolated data, residents, and admin.

Think of it as *"Slack workspaces, but for residential societies."* An admin spins up their own society in seconds, gets a unique join code, and their residents request to join using that code — all data is scoped and walled off per society at the database and API level, not just hidden in the UI.

Built end-to-end: real authentication, real role-based access control, real business logic — not a UI mockup.

---

## ✨ Core Features

### 🏘️ Multi-Tenant Architecture
- Unlimited societies on one platform — each fully isolated from the others
- Admin **creates a society** and instantly receives a unique **join code**
- Residents **request to join** using that code and wait for admin approval
- Every resource (flats, notices, complaints, visitors, bills, amenities) is scoped server-side — no data ever leaks across societies

### 🔐 Authentication & Access Control
- Secure JWT-based authentication with bcrypt password hashing
- **"Continue with Google"** sign-in and sign-up, fully wired end-to-end
- Three distinct roles per society — **Admin**, **Resident**, **Security** — each with a tailored dashboard and permissions enforced on the backend, not just hidden in the UI
- Resident approval workflow before first login

### 🧑‍🤝‍🧑 Residents & Staff Management
- Admin dashboard to approve pending residents, assign flats, and manage staff accounts
- Add security personnel directly, scoped to the admin's own society

### 🏢 Flats & Blocks
- Full CRUD for the flat inventory — block, floor, type, parking, monthly maintenance rate
- Occupied / vacant tracking tied directly to resident assignment

### 📢 Notice Board
- Publish, edit, and delete society-wide announcements
- Mark notices as important with visual highlighting
- Categorized by type — general, maintenance, event, emergency, meeting

### 🛠️ Complaint Tracking
- Residents raise issues and follow them through to resolution
- Threaded comments between resident and staff on every complaint
- Status pipeline: pending → in-progress → resolved/rejected
- Priority levels and category tagging (plumbing, electrical, security, etc.)

### 🚪 Visitor Gate Log
- Security logs every visitor's entry against the exact flat they're visiting
- One-tap checkout with automatic exit timestamp
- Residents can see who's visited their own flat

### 💳 Maintenance Billing
- Admin generates monthly invoices per flat with auto-numbered receipts
- Residents view and settle dues online
- Status tracking — pending, paid, overdue

### 🏊 Amenities & Bookings
- Admin configures shared amenities (clubhouse, pool, gym, courts) with capacity and hourly rates
- Residents book time slots; the system automatically blocks double-bookings
- Admin approval workflow for each booking request

### 📊 Role-Aware Dashboard
- Real-time stats and charts tailored to each role — occupancy, dues collected, complaint breakdowns, gate activity
- Built with Recharts for clean, readable data visualization

### 🎨 Polished, Animated UI
- Custom "ledger" design system — navy & amber palette, editorial serif headings, nothing templated
- Public marketing homepage with scroll-reveal animations, hover-interactive feature cards, and floating background elements
- Fully responsive across desktop and mobile

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT + bcrypt + Google Identity Services (OAuth 2.0) |
| **Security** | Helmet, rate limiting, Mongo query sanitization |

---

## 🏗️ Architecture Highlights

- 🔁 **RESTful API** with clean separation — routes → controllers → models
- 🧩 **Role-based middleware** (`protect` + `authorize(...roles)`) guarding every sensitive endpoint
- 🏢 **Society-scoped queries everywhere** — the multi-tenancy boundary is enforced in the database layer, not the frontend
- 🔑 **Google OAuth token verification** happens server-side — the frontend never self-certifies who's logged in
- ⚙️ Clean environment-based configuration, ready for deployment on Render / Vercel / MongoDB Atlas

---

## 👥 Who It's Built For

| Role | What they can do |
|---|---|
| 🧑‍💼 **Admin** | Create the society, approve residents, manage flats & staff, publish notices, resolve complaints, generate bills, approve bookings |
| 🏠 **Resident** | Join a society, view notices, raise & track complaints, pay dues, book amenities |
| 🛡️ **Security** | Log visitor entry/exit, view active visitors, read notices |

---

## 💡 Why This Project

This was built as a **real, working reference implementation** of a multi-tenant SaaS product — not a toy CRUD demo. Every button in the UI calls a real, authenticated API endpoint, backed by properly scoped MongoDB queries, with the kind of role-based security and data isolation you'd actually need in production.

If you're a resident association, a housing society, or just exploring how to architect a genuine multi-tenant MERN application — this is built to be a solid, extensible starting point.

---

<div align="center">

### 🛠️ Built with the MERN Stack — designed to scale from one society to thousands.

⭐ If you found this useful, consider giving it a star!

</div>
