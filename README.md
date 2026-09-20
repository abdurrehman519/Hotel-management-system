# 🏨 Grand Horizon - Hotel Management System (HMS)

A modern, full-stack **Hotel Management System** built with **React 19**, **Vite**, **Express.js**, and **Sequelize (SQLite / MySQL)**.

---

## 🌟 Features

- **Guest Portal & Online Booking**: Public landing page for guests to explore room types, check availability, and place direct bookings.
- **Admin & Staff Dashboard**: Real-time stats on total revenue, occupancy rate, pending check-ins, and active bookings.
- **Room & Inventory Management**: Manage room types, pricing, capacity, amenities, and real-time room statuses (available, occupied, maintenance).
- **Check-In / Check-Out Workflow**: Streamlined front-desk workflow to check in arriving guests, assign rooms, and automate invoice generation upon checkout.
- **Billing & Invoicing**: Automated tax calculations, invoice generation, deposit/full payment processing, and printable invoice receipts.
- **Reports & Analytics**: Occupancy & revenue reports with charts powered by Recharts.
- **Role-Based Access Control**: Secure JWT authentication for **Admin**, **Manager**, and **Receptionist**.

---

## 🔑 Demo Login Credentials

The system comes pre-seeded with sample data and staff accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@grandhorizon.com` | `admin123` |
| **Manager** | `manager@grandhorizon.com` | `manager123` |
| **Receptionist** | `front@grandhorizon.com` | `front123` |

---

## 🚀 Quick Start (Running on Localhost)

### 1. Install Dependencies
Run the following from the root directory:
```bash
npm run install:all
```
*(Or install individually: `cd server && npm install`, `cd client && npm install`)*

### 2. Seed Database
Initialize SQLite database and seed demo data:
```bash
npm run seed
```

### 3. Run Backend & Frontend

- **Start Backend Server** (runs on `http://localhost:5000`):
  ```bash
  npm run server
  ```

- **Start Frontend Client** (runs on `http://localhost:5173`):
  ```bash
  npm run client
  ```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application!

---

## 🌐 Live GitHub Pages & Hosting

1. **Pushing to GitHub**:
   ```bash
   git push -u origin main
   ```

2. **Automated Deployment**:
   - The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the frontend static site to GitHub Pages whenever you push to `main`.
   - Your live site will be accessible at:
     `https://abdurrehman519.github.io/Hotel-management-system/`

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router v7, TanStack Query, Framer Motion, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, JWT, BcryptJS, Express Validator, Morgan, Helmet
- **Database**: SQLite (Zero-config local setup) / MySQL (Production configurable via `.env`)
