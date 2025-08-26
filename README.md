# 📸 Fotofolio — Photographer Hiring Platform

Fotofolio is a **full-stack web application** where clients can post photography jobs and photographers can apply. Clients then review applications, select a photographer, and lock the booking. The project highlights **DBMS fundamentals** such as queries, joins, transactions, and constraints, with a simple yet professional frontend.

---

## 🚀 Features

### Core (DBMS demo-ready)
- **Authentication & Roles**
  - Login/Register with JWT  
  - Roles: **Admin**, **Client**, **Photographer**  

- **Bookings (Jobs)**
  - Clients can create bookings (event date, location, type, notes)  
  - Open bookings visible to all photographers  
  - Filter & pagination support  

- **Applications**
  - Photographers can apply once per booking  
  - Clients see application pool (with portfolio count)  
  - Clients select one photographer → booking becomes **LOCKED**  

- **Select Photographer (Transaction)**
  - Locks booking and updates statuses atomically:  
    - Chosen app → `ACCEPTED`  
    - Others → `REJECTED`  
  - Enforced with DB transaction  

### Stretch (Optional)
- Mock **Payments** (`UNPAID` → `PAID`)  
- **Reviews** (clients rate photographers)  
- **Portfolio** CRUD for photographers  
- **Admin dashboard** with full CRUD access  

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite) + TailwindCSS  
- **Backend:** Node.js + Express  
- **Database:** SQLite (file-based)  
- **Auth:** JWT + bcrypt  

---

## 📂 Project Structure
```
server/
  src/
    app.js
    db.js
    middleware/auth.js
    routes/
      auth.js
      bookings.js
      applications.js
      select.js
  schema.sql
  seed.sql
  .env
  package.json

client/   # React (Vite)
  src/
    main.jsx
    App.jsx
    pages/
      Landing.jsx
      Login.jsx
      Register.jsx
      BookingsList.jsx
      BookingCreate.jsx
      Applications.jsx
      ProfileClient.jsx
      ProfilePhotographer.jsx
    components/
      Navbar.jsx
  package.json
  tailwind.config.js
  postcss.config.js
```

---

## 🗄️ Database Schema (Highlights)

- **User**: `user_id`, `email`, `password_hash`, `role`, `name`  
- **Client**: linked to User  
- **Photographer**: linked to User (specialization, location, profile image)  
- **Booking**: `client_id`, `photographer_id?`, `status` (`OPEN`, `LOCKED`, …)  
- **Booking_Application**: `application_id`, `booking_id`, `photographer_id`, `status`  
- **Payment**: booking-based, mock `UNPAID` → `PAID`  
- **Portfolio**: photographer’s photos  
- **Review**: client → photographer, one per booking  

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/your-username/fotofolio.git
cd fotofolio
```

### 2. Backend Setup
```bash
cd server
npm install
mkdir -p data
sqlite3 ./data/app.db < schema.sql
sqlite3 ./data/app.db < seed.sql   # optional dummy data
```

Create `.env` in `/server`:
```env
JWT_SECRET=supersecret123
DB_PATH=./data/app.db
PORT=3000
```

Run backend:
```bash
npm run dev
```
Server available at [http://localhost:3000](http://localhost:3000)

---

### 3. Frontend Setup
```bash
cd client
npm install
```

Create `.env` in `/client`:
```env
VITE_API_URL=http://localhost:3000/api
```

Run frontend:
```bash
npm run dev
```
Frontend available at [http://localhost:5173](http://localhost:5173)

---

## 🔗 API Endpoints (Main)

### Auth
- `POST /api/auth/register` — create user (client/photographer)  
- `POST /api/auth/login` — returns JWT  

### Bookings
- `POST /api/bookings` — create booking (client)  
- `GET /api/bookings` — list bookings with filters/pagination  
- `GET /api/bookings/:id` — booking details  

### Applications
- `POST /api/bookings/:id/applications` — apply for job (photographer)  
- `GET /api/bookings/:id/applications` — view applicants (client)  

### Select Photographer (Transaction)
- `POST /api/bookings/:id/select`  
  **Body:** `{ application_id }`  
  Locks booking, accepts chosen application, rejects others  

---

## 🎨 Frontend Pages

- **Landing Page** — app intro, roles, CTA buttons  
- **Login / Register** — auth forms with JWT handling  
- **Bookings List** — filter/search, apply button for photographers  
- **Booking Create** — client form to post new job  
- **Applications** — client-only, view applicants, select photographer  
- **Profile Pages** — client (phone + my bookings), photographer (portfolio CRUD)  
- **Navbar** — dynamic links based on role  

---

## 🧪 Demo Flow
1. Register/Login as Client → create a booking  
2. Login as Photographer → apply for booking  
3. Client opens Applications → selects one → booking locks  
4. Logs/queries show DB operations (INSERT, JOIN, GROUP BY, transaction)  

---

## 📋 DBMS Learning Points
- `GET` with filters, pagination, `ORDER BY`  
- `POST` inserts (bookings, applications)  
- `JOIN` + `GROUP BY` (application pool w/ portfolio counts)  
- **Transaction** (select photographer, reject others)  
- **Constraints**: unique app per booking, foreign keys, enums  

---

## 👨‍💻 Author
Developed as part of a **DBMS Course Project** (2025).  
Focus: demonstrate practical usage of queries, joins, and transactions in a real-world style application.
