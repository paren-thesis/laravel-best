# **HTU Final Year Project Management & Defense Scoring System**

> **Ho Technical University (HTU) — Department of Computer Science**  
> A comprehensive, containerized enterprise web application for managing student final-year project proposals, supervisor workload allocations, peer evaluations, multi-format broadsheet exports, queued notifications, and real-time defense rubric scoring.

---

## **1. System Overview & Technology Stack**

The system is architected as a decoupled **Single Page Application (SPA)** powered by a containerized microservices stack:

- **Backend API:** Laravel 11 (PHP 8.3) with Sanctum Token Authentication & Spatie RBAC.
- **Frontend SPA:** React 18 + TypeScript + Vite, styled with Tailwind CSS, Lucide Icons, React Router v6 & TanStack Query (React Query).
- **Database:** MySQL 8.0 relational database with 12 domain tables (including team invite code support).
- **Caching & Queues:** Redis 7 memory store with Laravel Horizon queue worker.
- **Real-Time WebSockets:** Soketi WebSocket Server with Laravel Echo event broadcasting.
- **Email Portal:** Mailpit SMTP mail capturer.
- **Containerization:** Docker & Docker Compose orchestrating 9 isolated services.

---

## **2. User Personas & System Roles**

| Role | Primary Responsibilities & Capabilities |
| :--- | :--- |
| 🎓 **Student** | Create project teams, join existing teams via 6-character **Invite Codes (FR-02.3)**, submit project proposal topics, upload GitHub & Google Drive deliverables, and perform teammate peer evaluations (1–10 scores with feedback). |
| 📋 **Coordinator** | Review submitted proposals (Approve/Reject state machine), run student auto-grouping tool, allocate supervisors with capacity tracking, configure custom **Defense Rubrics & Criteria**, and export multi-format broadsheets. |
| 👨‍🏫 **Supervisor** | View assigned student teams, inspect GitHub repositories & testing environments, and provide research guidance. |
| ⚖️ **Defense Panel Member** | Grade defense presentations against custom Rubric Criteria (Technical Architecture, System Demo, Q&A Defense). |
| 🛡️ **System Administrator** | Manage academic sessions, course tracks (HND & BTech), and system settings. |

---

## **3. Containerized Architecture & Service Ports**

| Container Service | Image / Tech | Host Port | Purpose |
| :--- | :--- | :--- | :--- |
| `fyp_frontend` | `node:20-alpine` | `http://localhost:5173` | React 18 Vite SPA Frontend |
| `fyp_webserver` | `nginx:1.25-alpine` | `http://localhost:8000` | Nginx HTTP Reverse Proxy |
| `fyp_app` | PHP 8.3 FPM | `9000` (Internal) | Laravel 11 REST API Service |
| `fyp_horizon` | PHP 8.3 CLI | `http://localhost:8000/horizon` | Horizon Queue Metrics Dashboard |
| `fyp_websockets` | `soketi:1.6-alpine` | `http://localhost:6001` | Soketi Real-Time WebSocket Engine |
| `fyp_mailpit` | `axllent/mailpit` | `http://localhost:8025` | Mailpit SMTP Email Testing Portal |
| `fyp_db` | `mysql:8.0` | `3306` | Primary Database Engine |
| `fyp_redis` | `redis:7-alpine` | `6379` | Session Cache & Queue Message Broker |

---

## **4. Key Frontend & Backend Features**

### 📱 **Frontend SPA Features**
- **Client-Side Routing (`react-router-dom`):** Dedicated, bookmarkable routes behind `RequireAuth` role guards (`/`, `/proposals`, `/my-team`, `/supervision`, `/defense`, `/reports`).
- **Server State & Caching (`@tanstack/react-query`):** Automatic caching, background refetching, and query invalidation on form mutations.
- **Team Management (FR-02.3):** Dedicated team creation form and team joining form using unique invite codes.
- **Rubric Configuration Screen:** Coordinators can create and activate custom defense grading rubrics with dynamic criteria and max scores.
- **Responsive Layout:** Adaptive navigation bar and mobile/tablet drawer support.

### ⚙️ **Backend API Features**
- **Invite Code System (`POST /api/v1/teams/join`):** Automatically generates unique 6-character alphanumeric invite codes (`Team::booted`) and validates team capacity and student single-team restrictions.
- **Peer Evaluation Safeguards (`POST /api/v1/teams/peer-evaluations`):** Validates team membership to ensure students can only evaluate teammates within their assigned team.
- **Single-Team Creation Limit (`POST /api/v1/teams`):** Enforces a one-team-per-student limit.
- **Rubric API (`POST /api/v1/defense/rubrics`):** Transactional creation of defense rubrics and criteria.
- **Broadsheet Exporters (`GET /api/v1/exports/broadsheet/csv` & `/pdf`):** Optimized CSV and PDF broadsheet stream generation.

---

## **5. Step-by-Step Installation & Setup Guide**

### **Prerequisites**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on Windows/Mac/Linux.
- [Git](https://git-scm.com/) installed.

### **Step 1: Clone Repository & Navigate to Folder**
```powershell
git clone <repository-url>
cd laravel-best
```
**Expected Output:**
```text
Cloning into 'laravel-best'...
remote: Enumerating objects: 100% (XXX/XXX), done.
Receiving objects: 100% (XXX/XXX), done.
```

### **Step 2: Launch Container Stack**
```powershell
docker compose up -d
```
**Expected Output:**
```text
[+] Running 9/9
 ✔ Network fyp_network           Created                                   0.1s 
 ✔ Container fyp_db              Started                                   0.5s 
 ✔ Container fyp_redis           Started                                   0.5s 
 ✔ Container fyp_websockets      Started                                   0.5s 
 ✔ Container fyp_mailpit         Started                                   0.5s 
 ✔ Container fyp_app             Started                                   0.8s 
 ✔ Container fyp_webserver       Started                                   1.1s 
 ✔ Container fyp_frontend        Started                                   1.1s 
 ✔ Container fyp_horizon         Started                                   1.1s 
```

### **Step 3: Run Database Migrations & Seed Demo Dataset**
```powershell
docker exec fyp_app php artisan migrate:fresh --seed
```
**Expected Output:**
```text
Dropping all tables ................................................ 25ms DONE
Running migrations:
  2026_09_03_110000_create_academic_years_and_semesters_table ..... 15ms DONE
  2026_09_03_110001_create_courses_table ........................... 10ms DONE
  ...
  2026_09_13_000001_add_invite_code_to_teams_table ................. 12ms DONE
INFO  Seeding: Database\Seeders\RoleSeeder ........................ 45ms DONE
INFO  Seeding: Database\Seeders\DemoDataSeeder .................... 120ms DONE
```

### **Step 4: Publish Horizon Queue Dashboard Assets**
```powershell
docker exec fyp_app php artisan horizon:install
```
**Expected Output:**
```text
Publishing Horizon Assets .......................................... DONE
Publishing Horizon Configuration .................................... DONE
Publishing Horizon Service Provider ................................. DONE
Horizon scaffolding installed successfully.
```

### **Step 5: Access System Dashboards**
Open your web browser and navigate to:

- 🚀 **React SPA Frontend:** [`http://localhost:5173`](http://localhost:5173)
- 📊 **Horizon Queue Dashboard:** [`http://localhost:8000/horizon`](http://localhost:8000/horizon)
- 📬 **Mailpit Email Portal:** [`http://localhost:8025`](http://localhost:8025)
- ⚡ **Soketi WebSockets:** [`http://localhost:6001`](http://localhost:6001)

---

## **6. Demo Accounts & Test Credentials**

> **Password for ALL demo accounts:** `password`

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **System Admin** | `admin@htu.edu.gh` | Full system access |
| **Coordinator** | `coordinator@htu.edu.gh` | Auto-grouping, proposal reviews, rubric configuration & broadsheet downloads |
| **Supervisors (1 - 6)** | `supervisor1@htu.edu.gh` to `supervisor6@htu.edu.gh` | Team supervision & defense rubric grading |
| **Students (1 - 30)** | `student1@htu.edu.gh` to `student30@htu.edu.gh` | Proposal submission, team creation/join via invite code, deliverables & peer review |

*(Tip: You can also click any of the 1-Click Quick Demo Login buttons on the React login screen!)*

---

## **7. Multi-Format Broadsheet Exporters**

Coordinators and Supervisors can export student broadsheet reports directly from the dashboard:

- **CSV Export:** `GET /api/v1/exports/broadsheet/csv` (Powered by `maatwebsite/excel` with eager-loaded student profiles).
- **Formal PDF Report:** `GET /api/v1/exports/broadsheet/pdf` (Powered by `barryvdh/laravel-dompdf`).

---

## **8. Project Structure**

```
laravel-best/
├── backend/                  # Laravel 11 API Backend
│   ├── app/
│   │   ├── Exports/          # Broadsheet CSV/XLSX exporters
│   │   ├── Events/           # Soketi WebSocket broadcast events
│   │   ├── Http/Controllers/ # REST API Controllers (Auth, Topic, Team, Defense, etc.)
│   │   ├── Mail/             # Queued Mailable Notifications
│   │   └── Models/           # 15 Eloquent Domain Models (Team, User, Rubric, etc.)
│   ├── database/
│   │   ├── migrations/       # 12 Domain DB Migrations (including team invite codes)
│   │   └── seeders/          # RoleSeeder & DemoDataSeeder (30 Students)
│   └── routes/api.php        # Protected API Endpoints
├── frontend/                 # React 18 TypeScript SPA Frontend
│   ├── src/
│   │   ├── api/              # Axios Client & TanStack Query Hooks
│   │   ├── components/       # Modular UI Components (CreateTeamForm, RubricConfig, etc.)
│   │   ├── pages/            # Page Views (Overview, Proposals, MyTeam, Defense, Reports)
│   │   ├── routes/           # React Router v6 Navigation & RequireAuth Guard
│   │   └── store/            # Zustand Stores (Auth & UI State)
├── docker-compose.yml        # Docker Compose Stack Definition
├── README.md                 # System Documentation
└── TROUBLESHOOT.md           # Troubleshooting & Diagnostic Guide
```

---

## **9. Container Management & Useful Commands**

### **Stopping & Shutting Down Containers**
```powershell
# Stop all running container services (preserves data):
docker compose stop

# Stop and remove containers, networks, and volumes cleanly:
docker compose down
```

### **Starting & Restarting Services**
```powershell
# Start stopped containers:
docker compose start

# Restart specific container services (e.g. app or frontend):
docker compose restart app frontend
```

### **Monitoring Container Logs & Status**
```powershell
# Check status of running services:
docker compose ps

# Tail live log outputs from all services:
docker compose logs --tail=30 -f
```
