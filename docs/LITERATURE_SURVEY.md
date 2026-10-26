# KumbhRakshak – Literature Survey & Research Gap Analysis

*Preserved directly from the project specification document (Pages 9–14)*

---

## 1. Summary of 3 Primary Research Papers

| # | Paper Title | Author(s) | Year | Journal / Publisher | Technology / Method | Key Result | Limitation / Research Gap |
|---|---|---|---|---|---|---|---|
| **1** | *Managing Crowds with Technology: Cases of Hajj and Kumbh Mela* | Mohammad Yamin | 2019 | *International Journal of Information Technology* (Springer), DOI: 10.1007/s41870-018-0266-1 | RFID, sensors, wireless & mobile technologies, distributed fog processing | Technology-assisted framework for crowd monitoring and disaster response | Discusses technologies and case studies; lacks a single integrated end-to-end alert implementation. |
| **2** | *Integration of Image Processing and Crowd Simulation for Understanding Crowd Dynamics in Kumbh Mela* | Karthika P. S., Ashish Verma, Subhadeep Pal | 2020 | *Transportation Research Procedia* (Elsevier), DOI: 10.1016/j.trpro.2020.08.229 | Image processing, pedestrian detection, Social Force Model, crowd simulation, heat map generation | Pedestrian inflow from image processing fed into simulation; average accuracy of 73.45% | Focuses on crowd analysis and simulation; multi-channel emergency alert delivery is not the main focus. |
| **3** | *Spatial Strategies for Crowd Management in Haridwar, India* | Sindhuja Kasthala, Binoy B.V., Harshit S. Lakra | 2019 | *Intl Journal of Advanced Civil Engineering & Architecture Research*, DOI: 10.23953/cloud.ijacear.421 | GIS, remote sensing, spatial analysis, crowd-flow analysis, infrastructure assessment | Analyses crowd routes, infrastructure and emergency preparedness for Ardh Kumbh Mela 2016 in Haridwar | Planning and spatial design focus; lacks continuous real-time monitoring and automated alerting. |

---

## 2. Research Gap (PDF Page 13)

### What Existing Research Covers:
- Crowd-management technologies in isolation (RFID gates, standalone sensors).
- CCTV / image-based crowd counting.
- Microscopic pedestrian simulation and offline heat-maps.
- Static GIS spatial zoning and route planning.
- Post-incident disaster reviews.

### The Identified Research Gap:
There is an acute lack of an **integrated framework** that seamlessly bridges:
1. **Multiple real-time data sources** (CCTV + IoT + Weather + Citizen SOS).
2. **Continuous risk analysis** with explainable AI factor breakdowns.
3. **Automated alert generation** triggered dynamically by density and momentum thresholds.
4. **Multi-channel emergency communication** (Control Room + Field Staff + First Responders + Pilgrims).
5. **Alert acknowledgement and feedback loop** to record officer actions and ensure resolution.
6. **Centralized control-room monitoring** with live geospatial GIS.

---

## 3. How KumbhRakshak Addresses the Gap (PDF Page 14)

1. **Multiple Data Sources**: Ingests data concurrently from simulated 4K CCTVs, 10 IoT counting sensors, meteorological weather radar, and mobile crowdsourced SOS tickets.
2. **Real-Time Stream Processing**: Uses a Node.js + Socket.IO reactive event pipeline to push updates under 50ms without page reloads.
3. **Transparent Risk Engine**: Evaluates density, momentum, weather stressors, and spatial bottlenecks, providing a human-readable explanation (`"Risk increased because crowd density reached 94%..."`).
4. **Multi-Channel Dispatch**: Distributes targeted directives to specific role consoles (Control Room, Field Staff, 108 Ambulance/112 Police, and Public Devotees).
5. **Closed-Loop Feedback**: Implements digital sign-off (`[ACCEPT]`, `[REACHED]`, `[RESOLVE]`), maintaining complete accountability in Prisma audit logs.
