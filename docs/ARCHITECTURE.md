# KumbhRakshak – System Architecture & Design Specification

## 1. Overview
**KumbhRakshak** ("Kumbh Mela Management & Emergency Alert System") is an end-to-end, multi-tier public safety and incident response platform designed for high-density religious and cultural congregations such as the Mahakumbh in Prayagraj.

---

## 2. Layered Architecture

```
+---------------------------------------------------------------------------------------+
|                                1. DATA COLLECTION LAYER                               |
|   +-------------------+  +------------------+  +-----------------+  +---------------+ |
|   | 20x CCTV Streams  |  | 10x IoT Sensors  |  | Weather Radar   |  | Citizen SOS   | |
|   | (Simulated Feeds) |  | (IR/RFID/BLE)    |  | (Met Station)   |  | (Mobile App)  | |
+---+-------------------+--+------------------+--+-----------------+--+---------------+--+
                                        │
                                        ▼ (REST / JSON Telemetry)
+---------------------------------------------------------------------------------------+
|                               2. REAL-TIME PROCESSING LAYER                           |
|                      Node.js / Express Gateway + Socket.IO Bus                         |
|   - Request Authentication (JWT & RBAC)                                               |
|   - Telemetry Ingestion & Smoothing                                                   |
|   - Real-Time Event Dispatch (`crowd:update`, `alert:new`, `weather:update`)          |
+---------------------------------------+-----------------------------------------------+
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
+---------------------------------------+   +-------------------------------------------+
|          3. AI / ML RISK ENGINE       |   |             4. PERSISTENCE LAYER          |
|      (Python FastAPI Microservice)    |   |                (Prisma ORM)               |
|  - Non-linear Capacity Saturation     |   |  - Database: SQLite (Zero-config)         |
|  - Flow Momentum (+Inflow / -Outflow) |   |    / PostgreSQL (Production Docker)       |
|  - Weather & Environmental Stress     |   |  - 16 Relational Models                   |
|  - Citizen SOS & Incident Intensity   |   |  - Full Audit & Acknowledgement Trails    |
|  - Explainable Diagnostic Output      |   +-------------------------------------------+
+---------------------------------------+
                    │
                    ▼ (Risk Score 0 - 100 & Alert Trigger)
+---------------------------------------------------------------------------------------+
|                         5. ALERT DISSEMINATION & COORDINATION                         |
|   +--------------------+  +--------------------+  +-----------------+  +------------+ |
|   | Control Room Dash  |  | Field Staff App    |  | Fleet Dispatch  |  | Pilgrim UI | |
|   | (Executive View)   |  | (Tactical Action)  |  | (108/112/NDRF)  |  | (Public)   | |
+---------------------------------------------------------------------------------------+
```

---

## 3. Core Database Models (16 Prisma Entities)
1. **User**: Authentication, role assignment, active flag, department.
2. **Role**: RBAC (CONTROL_ROOM, FIELD_STAFF, EMERGENCY_SERVICES, PILGRIM, ADMIN).
3. **Zone**: 10 Kumbh sectors with polygon coordinates, capacity, density %, risk level, status.
4. **CrowdData**: Time-series historical crowd observations for Recharts analytics.
5. **Sensor**: 10 IoT counting sensors (Infrared beam, RFID, Drone counters, BLE mesh).
6. **CCTV**: 20 surveillance cameras with resolution, stream URL, crowd estimate, and risk state.
7. **WeatherData**: Temperature, relative humidity, rain precipitation (mm), wind speed (km/h), heat index.
8. **Alert**: Automated and manual emergency alerts with severity, status progression, and recommendations.
9. **Incident**: Full incident lifecycle (`REPORTED` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`).
10. **Notification**: Multi-channel broadcast messages for authority and citizen groups.
11. **EmergencyTeam**: 15 ground field units (QRT Alpha, NDRF, Sector Magistrates, Traffic Squads).
12. **EmergencyUnit**: 10 emergency vehicles (ALS Ambulances, Dial 112 Police PCRs, Fire Tenders, Rescue Boats).
13. **UserReport**: Citizen crowdsourced SOS tickets with auto-escalation into verified incidents.
14. **Acknowledgement**: Digital timestamped sign-off recording who acknowledged an alert and on-ground notes.
15. **Location**: GIS Points of Interest (Trauma Centers, Police Outposts, Fire Stations, Emergency Relief Exits).
16. **AuditLog**: Traceability log capturing user logins, manual overrides, and simulation triggers.

---

## 4. Real-time Event Specification (Socket.IO)

| Event Name | Direction | Payload Description |
|---|---|---|
| `crowd:update` | Server → Client | Zone crowd count, density %, inflow/outflow velocity |
| `risk:update` | Server → Client | Composite AI risk score, factor breakdown, explainability |
| `alert:new` | Server → Client | Newly generated alert; triggers audio siren and toast |
| `alert:updated` | Server → Client | Status transition (`ACKNOWLEDGED` → `IN_PROGRESS` → `RESOLVED`) |
| `incident:new` | Server → Client | Emergency incident reported; suggests nearest unit |
| `incident:updated` | Server → Client | Progression through lifecycle steps |
| `notification:new` | Server → Client | Broadcast advisory message |
| `team:location:update`| Server → Client | GPS coordinates and availability of emergency units |
| `weather:update` | Server → Client | Weather radar metrics and environmental hazard score |
| `simulation:event` | Server → Client | Viva demo scenario event broadcast |
