# KumbhRakshak – College Viva Demonstration Guide

This guide prepares you to deliver a **10/10 college project viva and practical demonstration**.

---

## 1. Quick Project Elevator Pitch (30 Seconds)

> *"Good morning, esteemed examiners. Our project is **KumbhRakshak: Kumbh Mela Management & Emergency Alert System**.*
> *During mega gatherings like Kumbh Mela, managing 20+ million pilgrims creates sudden risks of stampedes, bottlenecks, and medical collapses.*
> *While previous academic literature (such as Yamin 2019 or Karthika 2020) focused on isolated RFID sensors or offline crowd simulations, our system implements an **integrated real-time emergency framework** combining multi-source data ingestion, an explainable AI risk engine, automated alert generation, and closed-loop field staff acknowledgement."*

---

## 2. The 15-Step Viva Demonstration Script (Scenario 22)

To demonstrate the full emergency scenario during viva, open the **Demo Simulation Panel** (top button on the sidebar):

| Step | Action in Demo Panel | What Happens on Screen | What to Say to the Examiner |
|---|---|---|---|
| **1** | Click **Step 1: Normal Baseline** or `[Reset All to Normal]` | Sangam Ghat has 18,450 people (74% capacity). Density is moderate, status is Caution. | *"Here we see our command dashboard tracking Triveni Sangam during normal morning snan. Average density is 74%."* |
| **2** | Click **Step 2: Inflow Surging** | Inflow rate spikes from 340 to 420 persons/min as special trains arrive. Density rises to 82%. | *"Notice how the incoming momentum jumps on the Recharts graph without any page reload via WebSocket."* |
| **3** | Click **Step 3: Risk High Threshold** | Density crosses 85%. AI Risk Score climbs to 78. Sector turns Orange on GIS Map. | *"Once density crosses 85%, our AI risk engine automatically reclassifies the sector to HIGH RISK."* |
| **4** | Click **Step 4: Critical Stampede Risk** or `[Surge Crowd (Sangam)]` | Headcount spikes to 24,250 (97%). Risk Score becomes 95/100. Sector flashes RED. | *"At 97% capacity, the system detects an acute stampede hazard. Notice the automated critical alert generated immediately."* |
| **5** | Sound & Toast Alert activates | Web Audio synthesizer plays an emergency alert chime. A red banner pops up in bottom-right. | *"The system automatically emits a multi-channel alert and plays an acoustic warning in the command room."* |
| **6** | Inspect Alert in **Live Alerts** | Shows alert `ALT-CRIT-XXXX` recommending: *'Restrict incoming movement and deploy additional field personnel along ramp 4.'* | *"The alert includes transparent AI explainability detailing exactly why the risk escalated."* |
| **7** | Switch to **Field Staff Console** (`/field-team`) | Shows assigned alert for QRT Alpha with action buttons. | *"The ground magistrate receives the alert on their tactical mobile interface."* |
| **8** | Click `[ACCEPT ALERT]` | Alert status changes to `ACKNOWLEDGED`. Timestamp recorded in audit database. | *"The ground team acknowledges the directive, creating a digital audit log in SQLite/PostgreSQL."* |
| **9** | Click `[REACHED LOCATION]` | Team status changes to `ON_SCENE`. | *"First responders mark arrival at the western bathing pier."* |
| **10** | Click `[START RESPONSE]` | Status becomes `IN_PROGRESS`. Police redirect inbound flow toward holding zones. | *"Radial dispersal gates 3B and 4 are opened to relieve bottleneck pressure."* |
| **11** | Click `[RESOLVE INCIDENT]` | Status becomes `RESOLVED`. Density graph eases below 75%. | *"Once crowd density normalizes, the incident is closed and archived."* |

---

## 3. Anticipated Viva Questions & Model Answers

### Q1: Is the AI risk scoring using a real trained neural network or rule-based?
**Answer**:
> *"We built a hybrid, ML-ready risk engine with Python FastAPI. It evaluates non-linear capacity saturation, flow momentum derivatives, meteorological stress, and citizen SOS frequency. In accordance with honest engineering guidelines, we transparently label this as a prototype classification engine that provides explainable factor contribution weights rather than a black-box model."*

### Q2: How does the system handle real-time updates without refreshing the browser?
**Answer**:
> *"We use Socket.IO over WebSockets. The backend Express server emits typed events (`crowd:update`, `alert:new`, `incident:updated`, `weather:update`) whenever sensor data shifts. The React frontend maintains active socket subscriptions and updates state reactively."*

### Q3: What database are you using?
**Answer**:
> *"We use Prisma ORM with 16 strongly typed relational models. For effortless local evaluation, we default to SQLite (`dev.db`), while providing full PostgreSQL production configuration in `docker-compose.yml` and `.env.example`."*

### Q4: How does this project differ from a standard disaster dashboard?
**Answer**:
> *"Standard dashboards are passive viewers. KumbhRakshak implements a closed-loop system: multi-sensor detection → automated AI threshold scoring → multi-channel dispatch → field staff digital acknowledgement → verified incident resolution."*
