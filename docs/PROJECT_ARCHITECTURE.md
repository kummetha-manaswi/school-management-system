# 🏛️ School Management System — Project Architecture

## 1. System Overview

The **School Management System** is a unified digital platform serving educational administration, academic delivery, parent engagement, and school operations/facility maintenance.

The system is designed from day one to support independent, concurrent development by two engineers:
- **Developer 1 (Academic & Parent Domain):** Students, Teachers, Attendance, Assignments, Exams & Results, Teacher Notes, Parent Mobile App.
- **Developer 2 (Operations & Worker Domain):** Workers, Hostel, Transport, Fees, Inventory, Maintenance, Worker Mobile App.

```
+-----------------------------------------------------------------------------------+
|                                  PRESENTATION LAYER                               |
|                                                                                   |
|   +------------------------------------+   +----------------------------------+   |
|   |   Web Admin Portal (React + Vite)  |   |   Mobile Apps (Expo / React Native)   |
|   |   - Central School Administration  |   |   - Parent App (Academic & Fees) |   |
|   |   - Academic & Operations Panes    |   |   - Staff App (Classes & Marks)  |   |
|   |                                    |   |   - Worker App (Tasks & Facility)|   |
|   +------------------------------------+   +----------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | HTTP / REST (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                           APPLICATION & API LAYER (Express.js)                    |
|                                                                                   |
|   +-----------------------+  +------------------------+  +--------------------+   |
|   |  Routes & Middleware  |  |  Academic Controller   |  | Ops Controller     |   |
|   |  - CORS, Helmet       |  |  & Service Layer       |  | & Service Layer    |   |
|   |  - RBAC / JWT Auth    |  |  (Person 1 Scope)      |  | (Person 2 Scope)   |   |
|   +-----------------------+  +------------------------+  +--------------------+   |
+------------------------------------------+----------------------------------------+
                                           | Mongoose ODM
                                           v
+-----------------------------------------------------------------------------------+
|                                  PERSISTENCE LAYER                                |
|                                                                                   |
|                        MongoDB / MongoDB Atlas Document Store                     |
|       - Users & Roles            - Academic Data Collections                      |
|       - Student & Parent Data    - Operations, Transport & Hostel Data            |
+------------------------------------------+----------------------------------------+
                                           | Async Drivers / SDKs
                                           v
+-----------------------------------------------------------------------------------+
|                               EXTERNAL SERVICES LAYER                             |
|                                                                                   |
|     +--------------------+   +---------------------+   +---------------------+    |
|     | Push Notifications |   | Media Storage       |   | Payment Gateway     |    |
|     | Firebase (FCM)     |   | Cloudinary / AWS S3 |   | Razorpay            |    |
|     +--------------------+   +---------------------+   +---------------------+    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Four-Layer Architecture

### Layer 1: Presentation Layer
- **School Admin Web Portal (`frontend/`)**:
  - Central management console used by school leadership, principals, and administrative staff.
  - Built with React 18, Vite, Tailwind CSS, React Router DOM, Axios, and TanStack Query.
  - Divided into modular views reflecting Academic and Operations domains.
- **Mobile Multi-Role Application (`mobile/`)**:
  - Single codebase built on React Native & Expo delivering dedicated persona flows:
    1. **Parent App**: Attendance calendar, homework assignments, report cards, fee breakdown, notices, bus tracker, and teacher notes.
    2. **Staff App**: Classroom attendance taking, grade book entries, student notes, leave requests.
    3. **Worker App**: Daily facility assignments (cleaning schedules, maintenance tickets, kitchen tasks, security logs).

### Layer 2: API & Application Layer (`backend/`)
- Express.js centralized REST API following strict separation of concerns:
  - **`config/`**: Database connections and environment validation.
  - **`controllers/`**: HTTP request handlers and response dispatchers.
  - **`services/`**: Isolated business logic decoupled from HTTP transport.
  - **`middleware/`**: Cross-cutting concerns (authentication, authorization, validation, error handling).
  - **`models/`**: Mongoose schemas and data persistence rules.
  - **`utils/`**: Standard response builders (`ApiResponse`), error types (`ApiError`), and logging.
  - **`routes/`**: Domain-isolated routing tables (`routes/academic.routes.js`, `routes/operations.routes.js`, `routes/health.routes.js`).

### Layer 3: Persistence Layer (Database)
- **MongoDB & Mongoose**:
  - Centralized schema-based NoSQL database hosted on MongoDB Atlas.
  - Flexible document schemas for student profiles, timetable structures, audit logs, and operational maintenance work orders.
  - Indexed queries for high-frequency operations (attendance dates, student roll numbers, fee statuses).

### Layer 4: External Services Layer
- **Push Notifications (Firebase Cloud Messaging - FCM)**:
  - Critical alerts to parents (attendance absences, urgent announcements, exam release notices).
  - Task alerts to workers (urgent maintenance tickets, facility alerts).
- **File & Media Storage (Cloudinary / AWS S3)**:
  - Student and staff photos, document verification uploads, assignment attachments, circular PDFs.
- **Payment Processing (Razorpay)**:
  - Fee invoice payments, receipts, payment verification webhooks.

---

## 3. Role-Based Access Control (RBAC)

The system supports strict role-based separation:

| Role | Web Admin Access | Mobile App Access | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin / Principal** | Full Access | Optional | Complete control over all academic and operational modules. |
| **Academic Admin** | Academic Modules | None | Student enrollment, teacher assignment, syllabus, exam setups. |
| **Operations Admin** | Operations Modules | None | Worker scheduling, hostel rooms, bus fleets, inventory, fees. |
| **Teacher / Staff** | Limited Web portal | Staff App | Marking attendance, assignments, grades, teacher notes. |
| **Parent** | No | Parent App | View children's records, pay fees, receive notices, track transport. |
| **Worker** | No | Worker App | View task lists, report task completion, log maintenance issues. |

---

## 4. Two-Developer Collaboration Model

To allow Developer 1 and Developer 2 to work simultaneously without code conflicts:

### Developer 1: Academic & Parent Domain
- **Backend Route Prefix**: `/api/academic/*` (e.g. `/api/academic/students`, `/api/academic/attendance`)
- **Backend Controller / Service**: `controllers/academic/`, `services/academic/`
- **Frontend Admin Pages**: `src/pages/academic/`
- **Mobile Flows**: `src/screens/parent/` and `src/screens/staff/`

### Developer 2: Operations & Worker Domain
- **Backend Route Prefix**: `/api/operations/*` (e.g. `/api/operations/workers`, `/api/operations/hostel`)
- **Backend Controller / Service**: `controllers/operations/`, `services/operations/`
- **Frontend Admin Pages**: `src/pages/operations/`
- **Mobile Flows**: `src/screens/worker/`

### Shared / Foundation Components
- Shared auth, middleware, database config, and UI component libraries are centralized and agreed upon in the foundation before feature extensions.

---

## 5. Standard Health Check Endpoint

- **Endpoint**: `GET /api/health`
- **Response Format**:
```json
{
  "status": "ok",
  "message": "School Management API is running"
}
```

---

## 6. Future Modules Roadmap

### Phase 2: Core Domain Models & Authentication
- User & Role schema definition with bcrypt & JWT authentication.
- Auth endpoints (`/api/auth/login`, `/api/auth/me`).

### Phase 3: Academic Implementation (Developer 1)
- Student & Teacher profile management.
- Attendance tracking engine.
- Assignment submissions & grading.
- Exams & results publishing.
- Parent mobile app screens.

### Phase 4: Operations Implementation (Developer 2)
- Worker staff management & task scheduler.
- Hostel room allocation & tracking.
- Transport fleet & bus route management.
- Fee structures & Razorpay payment integration.
- Inventory & facility maintenance ticketing.
- Worker mobile app screens.

### Phase 5: Notifications & Media Integration
- FCM device token registration and push alert triggers.
- Cloudinary / S3 document and photo uploads.
- Comprehensive end-to-end testing and deployment.
