# **HTU Final Year Project Management & Defense Scoring System**

> **Ho Technical University (HTU) — Department of Computer Science**  
> A comprehensive, containerized enterprise web application for managing student final-year project proposals, supervisor workload allocations, peer evaluations, multi-format broadsheet exports, queued notifications, and real-time defense rubric scoring.

---

## **1. System Overview & Technology Stack**

The system is architected as a decoupled **Single Page Application (SPA)** powered by a containerized microservices stack:

- **Backend API:** Laravel 11 (PHP 8.3) with Sanctum Token Authentication & Spatie RBAC.
- **Frontend SPA:** React 18 + TypeScript + Vite, styled with Tailwind CSS & Lucide Icons.
- **Database:** MySQL 8.0 relational database with 11 domain tables.
- **Caching & Queues:** Redis 7 memory store with Laravel Horizon queue worker.
- **Real-Time WebSockets:** Soketi WebSocket Server with Laravel Echo event broadcasting.
- **Email Portal:** Mailpit SMTP mail capturer.
- **Containerization:** Docker & Docker Compose orchestrating 9 isolated services.

---

## **2. User Personas & System Roles**

| Role | Primary Responsibilities & Capabilities |
| :--- | :--- |
| 🎓 **Student** | Create project teams, submit project proposal topics, upload GitHub & Google Drive deliverables, and perform teammate peer evaluations (1–10 scores with feedback). |
| 📋 **Coordinator** | Review submitted proposals (Approve/Reject state machine), run student auto-grouping tool, allocate supervisors with capacity tracking, and export multi-format broadsheets. |
| 👨‍🏫 **Supervisor** | View assigned student teams, inspect GitHub repositories & testing environments, and provide research guidance. |
| ⚖️ **Defense Panel Member** | Grade defense presentations against Rubric Criteria (Technical Architecture 30 pts, System Demo 35 pts, Q&A Defense 35 pts). |
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

## **4. Step-by-Step Installation & Setup Guide**

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

### **Step 3: Run Database Migrations & Seed 30-Student Demo Dataset**
```powershell
docker exec fyp_app php artisan migrate:fresh --seed
```
**Expected Output:**
```text
Dropping all tables ................................................ 25ms DONE
Running migrations:
  2026_09_03_110000_create_academic_years_and_semesters_table ..... 15ms DONE
  2026_09_03_110001_create_courses_table ........................... 10ms DONE
  2026_09_03_110002_create_topics_table ............................ 12ms DONE
  ...
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

## **5. Demo Accounts & Test Credentials**

> **Password for ALL demo accounts:** `password`

| Role | Email Address | Description |
| :--- | :--- | :--- |
| **System Admin** | `admin@htu.edu.gh` | Full system access |
| **Coordinator** | `coordinator@htu.edu.gh` | Auto-grouping, proposal reviews & broadsheet downloads |
| **Supervisors (1 - 6)** | `supervisor1@htu.edu.gh` to `supervisor6@htu.edu.gh` | Team supervision & defense rubric grading |
| **Students (1 - 30)** | `student1@htu.edu.gh` to `student30@htu.edu.gh` | Proposal submission, deliverables & peer review |

*(Tip: You can also click any of the 1-Click Quick Demo Login buttons on the React login screen!)*

---

## **6. Multi-Format Broadsheet Exporters**

Coordinators and Supervisors can export student broadsheet reports directly from the dashboard:

- **CSV / XLSX Export:** `GET /api/v1/exports/broadsheet/csv` (Powered by `maatwebsite/excel`).
- **Formal PDF Report:** `GET /api/v1/exports/broadsheet/pdf` (Powered by `barryvdh/laravel-dompdf`).

---

## **7. Project Structure**

```
laravel-best/
├── backend/                  # Laravel 11 API Backend
│   ├── app/
│   │   ├── Exports/          # Broadsheet CSV/XLSX exporters
│   │   ├── Events/           # Soketi WebSocket broadcast events
│   │   ├── Http/Controllers/ # REST API Controllers (Auth, Topic, Team, etc.)
│   │   ├── Mail/             # Queued Mailable Notifications
│   │   └── Models/           # 15 Eloquent Domain Models
│   ├── database/
│   │   ├── migrations/       # 11 Domain DB Migrations
│   │   └── seeders/          # RoleSeeder & DemoDataSeeder (30 Students)
│   └── routes/api.php        # Protected API Endpoints
├── frontend/                 # React 18 TypeScript SPA Frontend
│   ├── src/
│   │   ├── api/              # Axios & Laravel Echo Soketi WebSocket Clients
│   │   ├── components/       # 8 Modular UI Components (Navbar, ProposalList, etc.)
│   │   ├── pages/            # Login Screen
│   │   └── store/            # Zustand Authentication Store
├── docker-compose.yml        # Docker Compose Stack Definition
├── README.md                 # Complete System Documentation
└── TROUBLESHOOT.md           # Troubleshooting & Diagnostic Guide
```
