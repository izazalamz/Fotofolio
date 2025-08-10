# Fotolio

Fotolio is a freelance photographer hiring platform designed as a DBMS course project. 
It enables clients to find, book, and review photographers while giving photographers a platform to showcase their portfolios.

---

## 📌 Features
1. **User Authentication** – Separate login for Admin, Clients, and Photographers.
2. **Photographer Profiles** – Includes personal info, skills, and portfolio images.
3. **Portfolio Management** – Photographers can upload multiple photo URLs with titles and descriptions.
4. **Job Posting** – Clients can post photography jobs.
5. **Booking System** – Clients can book photographers for specific jobs.
6. **Payment Tracking** – Record payment status, method, and amount (no real payment gateway integration).
7. **Review System** – Clients can leave reviews and ratings for completed bookings.
8. **Admin Dashboard** – Admin can manage users, jobs, bookings, and reviews.
9. **Photographer Approval System** – Admin can approve/reject photographer registrations.

---

## 🗄 Database Schema Overview

### Entities & Attributes
- **User** (PK: user_id) → email, password, role
- **Client** (PK, FK: client_id) → name, phone
- **Photographer** (PK, FK: photographer_id) → name, phone, profile_image_url, skills, status
- **Portfolio** (PK: portfolio_id, FK: photographer_id) → title, description
- **PortfolioImage** (PK: image_id, FK: portfolio_id) → image_url
- **Job** (PK: job_id, FK: client_id) → title, description, date_posted
- **Booking** (PK: booking_id, FK: job_id, photographer_id) → booking_date, status
- **Payment** (PK: payment_id, FK: booking_id) → payment_method, payment_date, amount, status
- **Review** (PK: review_id, FK: booking_id) → rating, comment

---

## 🔗 Relationships (with cardinality)
- User–Client → 1:1 (mandatory on both sides)
- User–Photographer → 1:1 (mandatory on both sides)
- Photographer–Portfolio → 1:N (mandatory photographer, optional portfolio)
- Portfolio–PortfolioImage → 1:N (mandatory portfolio, optional image)
- Client–Job → 1:N (mandatory client, optional job)
- Job–Booking → 1:1 (optional job, optional booking until assigned)
- Booking–Payment → 1:1 (mandatory booking, optional payment)
- Booking–Review → 1:1 (optional booking, optional review)

---

## ⚙️ Tech Stack
- **Frontend:** HTML, CSS
- **Backend:** Node.js
- **Database:** MySQL (via XAMPP)
- **Tools:** phpMyAdmin for DB management

---

## 🚀 How It Works
1. Users sign up as **Client** or **Photographer**.
2. Photographers request account approval → Admin reviews and approves.
3. Clients post jobs.
4. Clients select a photographer from available profiles and create a booking.
5. Booking details are stored in DB, payment status is tracked.
6. After completion, client leaves a review for the booking.

---

## 📅 Turnaround Time Example
- Client posts a wedding photography job for **March 15**.
- Photographer accepts booking on **March 1**.
- Booking marked as complete on **March 16**.
- Turnaround time = 15 days.

---

## 📍 Notes
- This is a **demo academic project** and does not integrate real payment processing.
- Designed to highlight **DBMS concepts**: PK/FK constraints, relationship cardinalities, and normalization.

---

© 2025 Fotolio
