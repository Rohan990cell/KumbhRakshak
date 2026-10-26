# KumbhRakshak – Data Flow Diagrams (DFD)

This document formalizes the Data Flow Architecture specified in **Page 7 of the Project PBL Specification** (*Data flow: collection → processing → alert generation → delivery → acknowledgement*).

---

## 1. DFD Level 0 (Context Diagram)

```
                       ┌─────────────────────────┐
                       │  CCTV & Video Cameras   │
                       └────────────┬────────────┘
                                    │ Live Video Telemetry
                                    ▼
┌─────────────────┐    ┌─────────────────────────┐    ┌──────────────────────┐
│  Weather Radar  ├─►  │                         │ ◄──┤   IoT Crowd Sensors  │
│  & Met Stations │    │       KumbhRakshak      │    │   (IR / RFID / BLE)  │
└─────────────────┘    │   Emergency Alert       │    └──────────────────────┘
                       │   Management System     │
┌─────────────────┐    │                         │    ┌──────────────────────┐
│  Pilgrim App    ├─►  │                         │ ──►│ Control Room Monitor │
│  (Citizen SOS)  │    └────────────┬────────────┘    └──────────────────────┘
└─────────────────┘                 │
                                    │ Automated Dispatch & Alerts
                                    ▼
                       ┌─────────────────────────┐
                       │ First Responders (Fleet)│
                       │ 108 EMS / 112 Police    │
                       └─────────────────────────┘
```

---

## 2. DFD Level 1 (Macro Process Breakdown)

```
                    ┌─────────────────────────┐
                    │ 1.0 Data Ingestion &    │
                    │ Normalization Stream    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ 2.0 AI Crowd Risk &     │◄─── [Weather & Spatial DB]
                    │ Saturation Engine       │
                    └────────────┬────────────┘
                                 │
                  Risk Score > Threshold (60/80)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ 3.0 Automated Alert     │───► [Alerts Data Store]
                    │ Generation Engine       │
                    └────────────┬────────────┘
                                 │
                   Dissemination via Socket.IO
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ 4.0 Multi-Channel Alert │───► Control Room Screen
                    │ Delivery Pipeline       │───► Mobile App & Push
                    └────────────┬────────────┘───► Field Staff Handheld
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ 5.0 Acknowledgement,    │───► [Audit & Feedback DB]
                    │ Triage & Resolution     │
                    └─────────────────────────┘
```

---

## 3. DFD Level 2 (Detailed Alert & Response Sub-process)

1. **Continuous Metric Sampling**:
   - Camera feeds estimate headcounts.
   - Infrared beams capture directional line-crossing counts.
   - Weather station injects rain (mm) and temperature (°C).

2. **Risk Classification Pipeline**:
   - `Crowd Density` = `(Count / Capacity) * 100`
   - Non-linear ramp: Exponential penalty when density > 80%.
   - Inflow/Outflow velocity gradient computed.
   - Result: `Score (0-100)` and `Level (LOW, MODERATE, HIGH, CRITICAL)`.

3. **Trigger Evaluation**:
   - If `Score >= 75` or `Level == 'CRITICAL'`:
     - System auto-creates database record in `Alert` table (`ALT-XXXX`).
     - System maps the zone to nearest idle `EmergencyTeam` (e.g. QRT Alpha).
     - System checks nearest available `EmergencyUnit` (Ambulance 01 / PCR 04).

4. **Multi-Channel Delivery**:
   - WebSocket broadcast triggers instant UI update across Command Center.
   - Synthetic audio siren activates on Command Center browser session.
   - Devotees on Mobile App see `"AVOID AREA: Sangam Ghat Western Steps"`.

5. **Feedback & Sign-off Loop**:
   - Ground Inspector clicks `[ACCEPT ALERT]` on `/field-team`.
   - On arrival, clicks `[REACHED LOCATION]`.
   - Once crowd is redirected, clicks `[RESOLVE INCIDENT]`.
   - Database marks `resolvedAt: NOW()` and archives telemetry.
