# KumbhRakshak – Kumbh Mela Management & Emergency Alert System
### Academic PBL Project • Computer Science & Design

> **"Real-time monitoring • Risk detection • Automated alerts • Coordinated response"**

---

## 1. Project Overview & Problem Statement
Kumbh Mela is the largest human congregation on Earth, with tens of millions of pilgrims gathering at the holy confluence of Ganga, Yamuna, and Saraswati (Triveni Sangam in Prayagraj). In such massive temporary gatherings, crowd density surges, bottleneck congestion, sudden weather changes, and localized medical collapses can rapidly escalate into severe stampedes if not detected and addressed in real time.

**KumbhRakshak** is a comprehensive, production-grade emergency management prototype designed to solve this challenge. It continuously aggregates inputs from simulated CCTV video analytics, IoT sensors, weather radar, and mobile pilgrim SOS reports, performs continuous AI risk scoring, automatically generates multi-channel emergency alerts, and coordinates rapid response across police, medical, fire, and disaster teams.

---

## 2. Core Objectives
1. **Real-Time Crowd & Density Monitoring**: Continuous tracking of pedestrian headcounts, saturation density (%), and directional flow velocity across 10 Kumbh sectors.
2. **Automated Risk Detection**: Multi-factor AI/ML-ready risk engine calculating a 0–100 composite risk score with transparent human-readable explanations.
3. **Automated Instant Alerts**: Triggering critical alarms when density or flow thresholds are breached.
4. **Multi-Channel Delivery**: Simultaneous dispatch to Control Room command displays, Field Staff mobile consoles, Emergency Fleet units, and Public Pilgrim portals.
5. **Closed-Loop Feedback**: Tracking digital acknowledgement (`[ACCEPT ALERT]` → `[REACHED LOCATION]` → `[START RESPONSE]` → `[RESOLVE INCIDENT]`).
6. **Centralized Geospatial Command**: Full Leaflet GIS mapping of Prayagraj sectors, emergency corridors, CCTVs, and first-responder vehicles.

---

## 3. Technology Stack

### Frontend:
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (Government / Public Safety design system in deep navy, amber, and safety red)
- **Leaflet & OpenStreetMap** (Interactive GIS with custom SVG markers and sector polygons)
- **Recharts** (Real-time time-series density graphs, inflow/outflow velocity, incident category breakdown)
- **Lucide React** (Civic and emergency icons)
- **Socket.IO Client** (Instant reactive WebSocket events)
- **Web Audio API** (Synthetic emergency acoustic chime/siren)

### Backend:
- **Node.js** + **Express.js** + **TypeScript**
- **Socket.IO Server** (Bi-directional real-time communication bus)
- **Prisma ORM** (16 relational models, foreign keys, and indexes)
- **JSON Web Tokens (JWT)** & **Bcrypt.js** (Role-based access control and password hashing)
- **RESTful API Architecture**

### AI / ML Microservice:
- **Python 3.13** + **FastAPI** + **Uvicorn**
- **Explainable Crowd Risk Engine**: Multi-factor gradient model evaluating density saturation, flow momentum derivatives, meteorological stress, and citizen SOS frequency.

### Database:
- **SQLite** (`dev.db`): Default out-of-the-box zero-dependency database for instant local evaluation.
- **PostgreSQL**: Production-ready configuration supported via `docker-compose.yml` and `.env.example`.

---

## 4. System Architecture & Research Gap Alignment
This project addresses the research gap identified from three primary literature papers:
- **Mohammad Yamin (2019)**: Highlighted RFID and mobile communication but lacked an end-to-end alert pipeline.
- **Karthika et al. (2020)**: Simulated crowd dynamics with 73.45% accuracy but omitted multi-channel alert delivery.
- **Kasthala et al. (2019)**: Analyzed spatial routes in Haridwar but lacked continuous live monitoring.

**KumbhRakshak bridges this gap** by unifying multi-sensor collection, continuous AI risk processing, automated alert generation, role-based consoles, and audit feedback loops into one seamless workflow.

---

## 5. Demo Login Credentials (All 5 Roles)

All accounts share the default password: **`Kumbh@123`**

| Role | Email | Name / Designation | Primary Capability |
|---|---|---|---|
| **Control Room / Authority** | `control@kumbhrakshak.gov.in` | Dr. Rajeshwar Sharma, IAS (Mela Adhikari) | Central command, live GIS, alert broadcast |
| **Field Staff / Magistrate** | `field@kumbhrakshak.gov.in` | Inspector Vikram Singh (Sector 1 Incharge) | Tactical console, alert accept & resolve |
| **Emergency Services** | `emergency@kumbhrakshak.gov.in` | Dr. Ananya Roy (Chief Medical Officer) | 108 Ambulance, Dial 112, Fire dispatch |
| **Pilgrim / Citizen** | `pilgrim@kumbhrakshak.gov.in` | Amitabh Mishra (Devotee) | Mobile app, safe routes, SOS reporting |
| **System Administrator** | `admin@kumbhrakshak.gov.in` | Saurabh Verma (Lead Architect) | Hardware diagnostics, IoT sensors, audit log |

> *Tip: The Login page and Header feature a **1-click Role Switcher** to easily jump between perspectives during viva!*

---

## 6. How to Run the Project Locally

### Step 1: Clone and Install Dependencies
From the project root directory (`KumbhRakshak/`):
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
npx prisma generate
npx prisma db push
npx ts-node-dev prisma/seed.ts
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start the System

#### Option A: Running with npm (Recommended)
You can start both backend and frontend together from the root directory:
```bash
npm run dev
```

#### Option B: Running Services Individually
- **Backend API & Sockets** (Port 5000):
  ```bash
  cd backend
  npm run dev
  ```
- **Frontend Dashboard** (Port 5173):
  ```bash
  cd frontend
  npm run dev
  ```
- **Python ML Risk Microservice** (Port 8000):
  ```bash
  cd ml-service
  python -m uvicorn app.main:app --port 8000 --reload
  ```
  *(Note: The backend features an automatic resilient fallback risk engine; if Python is not started, the application continues to run flawlessly without crashing!)*

---

## 7. Demo Simulation Mode (For Viva Examination)

To demonstrate the project in college without actual Kumbh infrastructure:
1. Click the glowing **"Demo Simulation Mode"** button at the top of the sidebar.
2. The **College Viva Demo Simulator** drawer opens.
3. Test any of the one-click emergency triggers:
   - **`[Surge Crowd (Sangam)]`**: Instantly spikes Sangam Ghat headcount to 24,250 (97% density, 95 risk score). System sounds an acoustic siren, flags a critical alert, and dispatches QRT Alpha.
   - **`[Akhada Tent Fire]`**: Triggers a critical fire emergency in Sector 2 kitchen, notifying Fire Tender 01.
   - **`[Medical Heatstroke]`**: Dispatches Ambulance 01 to Sangam Pier 2.
   - **`[Squall & Heavy Rain]`**: Simulates 28.5 mm rainfall, shifting meteorological risk to SEVERE.
   - **`[Simulate Citizen SOS]`**: Injects a devotee emergency ticket from the crowd.
   - **`[Reset All to Normal]`**: Restores all sectors back to safe baseline.
4. Or use the **"Viva Walkthrough Flow (Next Step)"** button to step through the 8-step chronological scenario!

---

## 8. Complete Project Routes

| Route | Description |
|---|---|
| `/login` | Role-based authentication with 1-click demo logins |
| `/dashboard` | Executive Command Center with KPI cards, GIS Map, Live Alerts, and Recharts |
| `/crowd-monitoring` | Sector-by-sector live crowd count, density %, inflow, outflow, and manual sliders |
| `/risk-analysis` | AI Risk Engine breakdown, factor contribution, explainability, and research papers |
| `/alerts` | Full filterable alert table, acknowledgement, and directive broadcast |
| `/incidents` | Incident lifecycle tracker (`Reported` → `Verified` → `Assigned` → `In Progress` → `Resolved`) |
| `/cctv` | 20-camera simulated video grid with bounding boxes and "Simulate Crowd Increase" control |
| `/weather` | Meteorological radar with temperature, rain mm, wind speed, and squall simulator |
| `/map` | Full-screen Leaflet GIS map with toggleable operational layers |
| `/emergency-services` | Fleet management for Ambulances, Police PCRs, Fire Tenders, and NDRF boats |
| `/field-team` | Dedicated field staff console with `[ACCEPT]`, `[REACHED]`, and `[RESOLVE]` buttons |
| `/reports` | Citizen SOS triage for verifying, escalating, or converting reports into incidents |
| `/notifications` | Notification center with push/SMS transmission tool |
| `/public` | Mobile-first devotee portal with emergency speed dials (112, 108, 1920) and SOS reporting |
| `/admin/settings` | Hardware status, IoT sensor telemetry, and database diagnostics |

---

## 9. Future Scope
- Integration with live drone photogrammetry and automatic optical density estimation.
- Cellular network cell-tower call-detail-record (CDR) telemetry for macro crowd ingress estimation.
- Multi-lingual automated voice advisory announcements via public PA systems in Hindi, Bengali, Marathi, and Tamil.
- Edge-AI camera deployment for localized bottleneck detection without cloud latency.
