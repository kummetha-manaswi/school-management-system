# 🏫 School Management System

A centralized digital management platform designed for modern school administration, academic delivery, parent engagement, and support worker operations.

The platform is structured into clear domains to enable independent, concurrent development by two engineers.

---

## 📌 Project Overview

The system unifies the entire school ecosystem into a single centralized architecture:

1. **🌐 School Admin Website**: Central management console for school leadership and administrators.
2. **📱 Parent Mobile App**: Mobile portal for parents to track attendance, fees, homework, results, and teacher notices.
3. **📱 Staff Mobile App**: Mobile portal for teachers to mark attendance, assign tasks, and communicate with parents.
4. **📱 Worker Mobile App**: Mobile application for facility, cleaning, cooking, transport, and maintenance personnel.
5. **⚙️ Centralized REST API**: Modular Express.js backend.
6. **🗄️ Centralized Database**: MongoDB Atlas document store with Mongoose ODM.
7. **🔐 Role-Based Access Control (RBAC)**: Secure multi-tier permissions.
8. **🔔 Notification Engine**: Push alerts powered by Firebase Cloud Messaging (FCM).

---

## 👥 Two-Developer Domain Division

The codebase is split into isolated domain mount points so both developers can work independently:

### Person 1 — Academic & Parent Side
- Student Management
- Teacher Management
- Attendance Tracking
- Assignments & Homework
- Exams & Results
- Teacher Notes
- Parent Mobile App & Staff Mobile App

### Person 2 — Operations & Worker Side
- Worker Staff Management
- Worker Mobile App (Cleaning, Cooking, Maintenance, Security)
- Hostel Management
- Transport & Bus Route Fleet
- Fee Management & Invoices
- Inventory & Equipment
- Maintenance Work Orders

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Web Admin Portal** | React 18, Vite, Tailwind CSS, React Router DOM, Axios, TanStack Query, Recharts |
| **Mobile Applications** | React Native, Expo |
| **Backend REST API** | Node.js, Express.js, Helmet, CORS, Morgan |
| **Database** | MongoDB, Mongoose |
| **Authentication & Security** | JWT (JSON Web Tokens), bcrypt, Role-Based Access Control (RBAC) |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Cloud File Storage** | Cloudinary / AWS S3 |
| **Payment Gateway** | Razorpay |

---

## 📁 Project Structure

```
school-management-system/
├── frontend/                     # React + Vite + Tailwind CSS Web Admin Portal
│   ├── src/
│   │   ├── components/           # Shared UI components
│   │   ├── layouts/              # AdminLayout, AuthLayout
│   │   ├── pages/                # Foundation Dashboard, 404
│   │   ├── routes/               # AppRoutes (domain routing layout)
│   │   ├── services/             # Axios API client
│   │   ├── hooks/                # Custom React hooks (useHealthCheck)
│   │   ├── utils/                # Helper utilities
│   │   ├── App.jsx               # QueryClientProvider & RouterProvider
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── backend/                      # Express.js REST API
│   ├── src/
│   │   ├── config/               # db.js, env.js
│   │   ├── controllers/          # health.controller.js
│   │   ├── middleware/           # errorHandler.js, notFound.js, auth.js
│   │   ├── routes/               # Modular routes:
│   │   │   ├── index.js          # Main API router (/api)
│   │   │   ├── health.routes.js  # GET /api/health
│   │   │   ├── academic.routes.js    # Developer 1 mount point
│   │   │   └── operations.routes.js  # Developer 2 mount point
│   │   ├── services/             # Service layer index
│   │   ├── models/               # Mongoose models index
│   │   ├── utils/                # ApiResponse.js, ApiError.js, logger.js
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # HTTP server bootstrap
│   ├── .env.example
│   └── package.json
│
├── mobile/                       # Expo + React Native Multi-Persona App Shell
│   ├── app/                      # Screen modules
│   ├── components/               # Mobile UI components
│   ├── services/                 # Mobile API client
│   ├── hooks/                    # Mobile custom hooks
│   ├── App.js                    # Mobile shell & health integration
│   ├── app.json                  # Expo config
│   ├── .env.example
│   └── package.json
│
├── docs/
│   └── PROJECT_ARCHITECTURE.md   # Complete system architecture specification
│
├── .env.example                  # Root environment template
├── package.json                  # Root orchestration package.json
├── README.md                     # Project documentation
└── .gitignore                    # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24+ supported)
- **npm**: v9.0.0 or higher

---

### Step 1: Install Dependencies

You can install all dependencies across the root, backend, frontend, and mobile workspaces at once:

```powershell
# From the project root
npm run install:all
```

Or install individually inside each directory:

```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Mobile
cd ../mobile
npm install
```

*(Note for Windows PowerShell: If script execution is restricted on your system, invoke `npm.cmd` instead of `npm`)*

---

### Step 2: Configure Environment Variables

Create `.env` files from the provided templates:

```powershell
# Backend
copy backend\.env.example backend\.env

# Frontend
copy frontend\.env.example frontend\.env

# Mobile
copy mobile\.env.example mobile\.env
```

---

### Step 3: Running the Applications

#### 1. Backend REST API
```powershell
# Option A: From root directory
npm run dev:backend

# Option B: Directly from backend/ directory
cd backend
npm run dev
# Or for single run:
node src/server.js
```
The server will start at `http://localhost:5000`.

#### 2. Frontend Admin Web Portal
```powershell
# Option A: From root directory
npm run dev:frontend

# Option B: Directly from frontend/ directory
cd frontend
npm run dev
```
The Vite development server will start at `http://localhost:5173`.

#### 3. Mobile Application (Expo)
```powershell
# Option A: From root directory
npm run dev:mobile

# Option B: Directly from mobile/ directory
cd mobile
npm run start
```
This opens the Expo interactive terminal. Press:
- `a` to open on an Android emulator or device
- `i` to open on an iOS simulator
- `w` to run on web browser

---

## 🏥 Health-Check Endpoint

The centralized backend exposes a standard health-check endpoint:

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Expected Response**:
```json
{
  "status": "ok",
  "message": "School Management API is running"
}
```

You can test this endpoint using `curl` or any browser:
```powershell
curl http://localhost:5000/api/health
```

---

## 🛡️ Git & Contribution Guidelines

- **No business features during foundation**: Business logic will be implemented as modular features in Phase 2.
- **Never commit real secrets**: Keep all credentials in local `.env` files (ignored by Git).
- **Domain separation**: Person 1 commits to academic modules; Person 2 commits to operations modules.