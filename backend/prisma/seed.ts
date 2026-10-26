import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding KumbhRakshak database...');

  // Clean existing records if any
  await prisma.acknowledgement.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.userReport.deleteMany({});
  await prisma.incident.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.crowdData.deleteMany({});
  await prisma.sensor.deleteMany({});
  await prisma.cCTV.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.emergencyUnit.deleteMany({});
  await prisma.emergencyTeam.deleteMany({});
  await prisma.zone.deleteMany({});
  await prisma.weatherData.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // 1. Roles
  const roles = [
    {
      name: 'CONTROL_ROOM',
      label: 'Control Room / Command Authority',
      description: 'Central Kumbh Mela Command & Emergency Operations Center',
      permissions: JSON.stringify(['view_all', 'manage_alerts', 'assign_teams', 'run_simulations', 'broadcast_alerts', 'manage_zones']),
    },
    {
      name: 'FIELD_STAFF',
      label: 'Ground Field Staff / Sector Magistrate',
      description: 'Field officers deployed at Ghats, sectors, and barriers',
      permissions: JSON.stringify(['view_assigned_alerts', 'update_status', 'acknowledge_alert', 'report_ground_status']),
    },
    {
      name: 'EMERGENCY_SERVICES',
      label: 'Emergency Response Units (Ambulance/Police/Fire/NDRF)',
      description: 'Rapid dispatch response teams and fleet coordinators',
      permissions: JSON.stringify(['view_incidents', 'dispatch_unit', 'update_location', 'resolve_incident']),
    },
    {
      name: 'PILGRIM',
      label: 'Pilgrim / Public User',
      description: 'Devotee / citizen portal for safety alerts, safe routes, and SOS reporting',
      permissions: JSON.stringify(['view_public_alerts', 'view_safe_routes', 'submit_sos_report']),
    },
    {
      name: 'ADMIN',
      label: 'System Administrator',
      description: 'IT infrastructure, sensors, CCTV integration, system configuration',
      permissions: JSON.stringify(['all']),
    },
  ];

  const createdRoles: Record<string, string> = {};
  for (const r of roles) {
    const roleRecord = await prisma.role.create({ data: r });
    createdRoles[r.name] = roleRecord.id;
  }

  // 2. Users (5 Roles with bcrypt hashed passwords)
  const defaultPassword = await bcrypt.hash('Kumbh@123', 10);
  const users = [
    {
      email: 'control@kumbhrakshak.gov.in',
      name: 'Dr. Rajeshwar Sharma, IAS (Mela Adhikari)',
      department: 'Central Command & Disaster Management Cell',
      roleId: createdRoles['CONTROL_ROOM'],
      phone: '+91 94150 11001',
    },
    {
      email: 'field@kumbhrakshak.gov.in',
      name: 'Inspector Vikram Singh (Sector 1 Incharge)',
      department: 'UP Police & Mela Suraksha Bal',
      roleId: createdRoles['FIELD_STAFF'],
      phone: '+91 94150 22002',
    },
    {
      email: 'emergency@kumbhrakshak.gov.in',
      name: 'Dr. Ananya Roy (Chief Medical Officer, Sector 3)',
      department: 'Emergency Medical Services & 108 Ambulance Dispatch',
      roleId: createdRoles['EMERGENCY_SERVICES'],
      phone: '+91 94150 33003',
    },
    {
      email: 'pilgrim@kumbhrakshak.gov.in',
      name: 'Amitabh Mishra (Pilgrim / Devotee)',
      department: 'General Public (Prayagraj Visitor)',
      roleId: createdRoles['PILGRIM'],
      phone: '+91 98765 43210',
    },
    {
      email: 'admin@kumbhrakshak.gov.in',
      name: 'Saurabh Verma (Lead Systems Architect)',
      department: 'NIC & Kumbh IT Infrastructure Directorate',
      roleId: createdRoles['ADMIN'],
      phone: '+91 94150 55005',
    },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        ...u,
        passwordHash: defaultPassword,
      },
    });
  }

  // 3. 10 Kumbh Zones with realistic Prayagraj coordinates (Triveni Sangam region)
  const zonesData = [
    {
      code: 'ZONE-SANGAM',
      name: 'Triveni Sangam Ghat',
      description: 'Primary holy bathing confluence of Ganga, Yamuna & Saraswati. Highest risk during Shahi Snan.',
      capacity: 25000,
      currentCrowd: 18450,
      density: 73.8,
      riskLevel: 'HIGH',
      riskScore: 74.5,
      status: 'CAUTION',
      latitude: 25.4285,
      longitude: 81.8845,
      inflowRate: 340,
      outflowRate: 260,
      movementDirection: 'WEST_TO_RIVER',
    },
    {
      code: 'ZONE-ENTRY-MAIN',
      name: 'Main Entry Gate & Bandha Road',
      description: 'Primary pedestrian arterial entrance corridor connecting Parade Ground to Ghats.',
      capacity: 18000,
      currentCrowd: 11200,
      density: 62.2,
      riskLevel: 'MODERATE',
      riskScore: 58.0,
      status: 'NORMAL',
      latitude: 25.4335,
      longitude: 81.8720,
      inflowRate: 280,
      outflowRate: 250,
      movementDirection: 'NORTH_TO_SOUTH',
    },
    {
      code: 'ZONE-SEC-1',
      name: 'Sector 1 (Akshayavat & Fort Corridor)',
      description: 'Historic sacred banyan tree axis and Patalpuri temple circumambulation zone.',
      capacity: 15000,
      currentCrowd: 13500,
      density: 90.0,
      riskLevel: 'CRITICAL',
      riskScore: 88.5,
      status: 'RESTRICTED',
      latitude: 25.4300,
      longitude: 81.8770,
      inflowRate: 310,
      outflowRate: 190,
      movementDirection: 'BIDIRECTIONAL_CONGESTED',
    },
    {
      code: 'ZONE-SEC-2',
      name: 'Sector 2 (Akhada Camp & Dharmshala)',
      description: 'Major residential tents for Juna, Niranjani and Mahanirvani Akharas.',
      capacity: 22000,
      currentCrowd: 9800,
      density: 44.5,
      riskLevel: 'LOW',
      riskScore: 28.0,
      status: 'NORMAL',
      latitude: 25.4360,
      longitude: 81.8810,
      inflowRate: 140,
      outflowRate: 150,
      movementDirection: 'CIRCULAR_CAMP',
    },
    {
      code: 'ZONE-SEC-3',
      name: 'Sector 3 (Jhusi Pontoon Bridge Approach)',
      description: 'High traffic bottleneck leading to eastern pontoon bridges across the Ganga.',
      capacity: 16000,
      currentCrowd: 12800,
      density: 80.0,
      riskLevel: 'HIGH',
      riskScore: 78.0,
      status: 'CAUTION',
      latitude: 25.4260,
      longitude: 81.8930,
      inflowRate: 290,
      outflowRate: 220,
      movementDirection: 'EAST_BRIDGE_ENTRY',
    },
    {
      code: 'ZONE-PARKING',
      name: 'Central Parking & Shuttle Terminal',
      description: 'Interstate bus stands, tourist parking, and electric e-rickshaw transit hub.',
      capacity: 30000,
      currentCrowd: 12000,
      density: 40.0,
      riskLevel: 'LOW',
      riskScore: 22.0,
      status: 'NORMAL',
      latitude: 25.4420,
      longitude: 81.8650,
      inflowRate: 180,
      outflowRate: 170,
      movementDirection: 'DISPERSED',
    },
    {
      code: 'ZONE-FOOD-LGR',
      name: 'Annakshetra & Food Distribution Zone',
      description: 'Mass langar, clean drinking water dispensaries, and civil food courts.',
      capacity: 14000,
      currentCrowd: 6500,
      density: 46.4,
      riskLevel: 'LOW',
      riskScore: 25.0,
      status: 'NORMAL',
      latitude: 25.4390,
      longitude: 81.8750,
      inflowRate: 120,
      outflowRate: 130,
      movementDirection: 'QUEUE_FORMED',
    },
    {
      code: 'ZONE-MED-CTRL',
      name: 'Central Hospital & Emergency Medical Hub',
      description: '100-bed makeshift trauma center, helipad, and triage area.',
      capacity: 5000,
      currentCrowd: 1850,
      density: 37.0,
      riskLevel: 'LOW',
      riskScore: 18.0,
      status: 'NORMAL',
      latitude: 25.4340,
      longitude: 81.8680,
      inflowRate: 45,
      outflowRate: 40,
      movementDirection: 'AMBULANCE_CORRIDOR_CLEAR',
    },
    {
      code: 'ZONE-EXIT-NORTH',
      name: 'Northern Relief Exit & Daraganj Corridor',
      description: 'Designated emergency egress route towards Daraganj Railway Station.',
      capacity: 16000,
      currentCrowd: 5900,
      density: 36.8,
      riskLevel: 'LOW',
      riskScore: 21.0,
      status: 'NORMAL',
      latitude: 25.4410,
      longitude: 81.8880,
      inflowRate: 90,
      outflowRate: 180,
      movementDirection: 'OUTFLOW_HEAVY',
    },
    {
      code: 'ZONE-ARAIL-GHAT',
      name: 'Arail Ghat & Southern Tent City',
      description: 'Southern bank opposite Sangam, luxury pilgrim tents and boat boarding jetties.',
      capacity: 17000,
      currentCrowd: 7400,
      density: 43.5,
      riskLevel: 'LOW',
      riskScore: 26.0,
      status: 'NORMAL',
      latitude: 25.4190,
      longitude: 81.8790,
      inflowRate: 110,
      outflowRate: 105,
      movementDirection: 'RIVER_CROSSING',
    },
  ];

  const createdZones: Record<string, string> = {};
  for (const z of zonesData) {
    const zone = await prisma.zone.create({ data: z });
    createdZones[z.code] = zone.id;
  }

  // 4. 20 CCTV Cameras
  const cctvs = [
    { cameraCode: 'CAM-001', name: 'Sangam Ghat Core - Tower A', zoneCode: 'ZONE-SANGAM', lat: 25.4288, lng: 81.8842, crowd: 6200, density: 78.5, risk: 'HIGH' },
    { cameraCode: 'CAM-002', name: 'Sangam Ghat North Steps - Tower B', zoneCode: 'ZONE-SANGAM', lat: 25.4292, lng: 81.8849, crowd: 5900, density: 75.0, risk: 'HIGH' },
    { cameraCode: 'CAM-003', name: 'Sangam Pontoon Arrival Pier', zoneCode: 'ZONE-SANGAM', lat: 25.4278, lng: 81.8839, crowd: 6350, density: 82.0, risk: 'HIGH' },
    { cameraCode: 'CAM-004', name: 'Main Gate Inflow Arch 1', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4338, lng: 81.8718, crowd: 4100, density: 64.0, risk: 'MODERATE' },
    { cameraCode: 'CAM-005', name: 'Main Gate Pedestrian Hold Area', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4332, lng: 81.8724, crowd: 3800, density: 60.5, risk: 'MODERATE' },
    { cameraCode: 'CAM-006', name: 'Bandha Road Bottleneck', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4341, lng: 81.8732, crowd: 3300, density: 55.0, risk: 'MODERATE' },
    { cameraCode: 'CAM-007', name: 'Akshayavat Temple Gate 1', zoneCode: 'ZONE-SEC-1', lat: 25.4303, lng: 81.8768, crowd: 5200, density: 92.0, risk: 'CRITICAL' },
    { cameraCode: 'CAM-008', name: 'Fort Perimeter Barricade', zoneCode: 'ZONE-SEC-1', lat: 25.4298, lng: 81.8775, crowd: 4600, density: 88.0, risk: 'CRITICAL' },
    { cameraCode: 'CAM-009', name: 'Patalpuri Temple Exit Ramp', zoneCode: 'ZONE-SEC-1', lat: 25.4305, lng: 81.8778, crowd: 3700, density: 89.5, risk: 'CRITICAL' },
    { cameraCode: 'CAM-010', name: 'Juna Akhada Procession Route', zoneCode: 'ZONE-SEC-2', lat: 25.4364, lng: 81.8808, crowd: 3200, density: 45.0, risk: 'LOW' },
    { cameraCode: 'CAM-011', name: 'Niranjani Camp Crossway', zoneCode: 'ZONE-SEC-2', lat: 25.4357, lng: 81.8816, crowd: 3500, density: 44.0, risk: 'LOW' },
    { cameraCode: 'CAM-012', name: 'Jhusi Pontoon Bridge 1 Entry', zoneCode: 'ZONE-SEC-3', lat: 25.4262, lng: 81.8926, crowd: 4700, density: 84.0, risk: 'HIGH' },
    { cameraCode: 'CAM-013', name: 'Jhusi Pontoon Bridge 2 Pier', zoneCode: 'ZONE-SEC-3', lat: 25.4258, lng: 81.8935, crowd: 4400, density: 78.0, risk: 'HIGH' },
    { cameraCode: 'CAM-014', name: 'Jhusi Crowd Surge Buffer Ramp', zoneCode: 'ZONE-SEC-3', lat: 25.4265, lng: 81.8940, crowd: 3700, density: 76.5, risk: 'HIGH' },
    { cameraCode: 'CAM-015', name: 'Central Parking Bus Depot Entry', zoneCode: 'ZONE-PARKING', lat: 25.4423, lng: 81.8647, crowd: 4100, density: 42.0, risk: 'LOW' },
    { cameraCode: 'CAM-016', name: 'Shuttle Rickshaw Staging Bay', zoneCode: 'ZONE-PARKING', lat: 25.4418, lng: 81.8655, crowd: 3800, density: 39.0, risk: 'LOW' },
    { cameraCode: 'CAM-017', name: 'Annakshetra Langar Hall A', zoneCode: 'ZONE-FOOD-LGR', lat: 25.4392, lng: 81.8748, crowd: 3600, density: 48.0, risk: 'LOW' },
    { cameraCode: 'CAM-018', name: 'Hospital Green Corridor Gate', zoneCode: 'ZONE-MED-CTRL', lat: 25.4342, lng: 81.8683, crowd: 950, density: 38.0, risk: 'LOW' },
    { cameraCode: 'CAM-019', name: 'Daraganj Rail Overbridge Exit', zoneCode: 'ZONE-EXIT-NORTH', lat: 25.4412, lng: 81.8884, crowd: 3100, density: 37.0, risk: 'LOW' },
    { cameraCode: 'CAM-020', name: 'Arail Ghat Jetty Pontoon South', zoneCode: 'ZONE-ARAIL-GHAT', lat: 25.4192, lng: 81.8792, crowd: 3900, density: 44.0, risk: 'LOW' },
  ];

  for (const c of cctvs) {
    await prisma.cCTV.create({
      data: {
        cameraCode: c.cameraCode,
        name: c.name,
        zoneId: createdZones[c.zoneCode],
        streamUrl: `https://cctv.kumbhrakshak.gov.in/live/${c.cameraCode.toLowerCase()}`,
        status: 'ONLINE',
        resolution: '4K-HDR',
        crowdEstimate: c.crowd,
        densityPercent: c.density,
        riskLevel: c.risk,
        latitude: c.lat,
        longitude: c.lng,
      },
    });
  }

  // 5. 15 Field Teams
  const fieldTeams = [
    { teamCode: 'TEAM-QRT-01', name: 'Quick Response Team Alpha', leader: 'Inspector Rajesh Pandey', phone: '+91 94150 90001', dept: 'UP Police Anti-Riot Wing', zoneCode: 'ZONE-SANGAM', lat: 25.4286, lng: 81.8841, members: 8, status: 'AVAILABLE' },
    { teamCode: 'TEAM-QRT-02', name: 'Quick Response Team Bravo', leader: 'Sub-Inspector Mohan Lal', phone: '+91 94150 90002', dept: 'UP Police', zoneCode: 'ZONE-SEC-1', lat: 25.4301, lng: 81.8772, members: 8, status: 'ASSIGNED' },
    { teamCode: 'TEAM-NDRF-01', name: 'NDRF 11th Battalion Water Rescue', leader: 'Commander K. S. Tyagi', phone: '+91 94150 90003', dept: 'National Disaster Response Force', zoneCode: 'ZONE-SANGAM', lat: 25.4280, lng: 81.8848, members: 12, status: 'AVAILABLE' },
    { teamCode: 'TEAM-NDRF-02', name: 'NDRF Crowd Containment Unit', leader: 'Inspector Devrat Roy', phone: '+91 94150 90004', dept: 'NDRF', zoneCode: 'ZONE-SEC-3', lat: 25.4261, lng: 81.8928, members: 10, status: 'AVAILABLE' },
    { teamCode: 'TEAM-TRAFFIC-01', name: 'Traffic Management Squad North', leader: 'Traffic SI Anil Gaur', phone: '+91 94150 90005', dept: 'Traffic Police', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4336, lng: 81.8721, members: 6, status: 'AVAILABLE' },
    { teamCode: 'TEAM-TRAFFIC-02', name: 'Traffic Management Squad South', leader: 'Traffic SI Harish Rao', phone: '+91 94150 90006', dept: 'Traffic Police', zoneCode: 'ZONE-PARKING', lat: 25.4421, lng: 81.8651, members: 6, status: 'AVAILABLE' },
    { teamCode: 'TEAM-SECTOR-01', name: 'Sector 1 Magistrate Escort', leader: 'Executive Magistrate R. K. Dixit', phone: '+91 94150 90007', dept: 'Revenue Administration', zoneCode: 'ZONE-SEC-1', lat: 25.4302, lng: 81.8769, members: 5, status: 'ON_SCENE' },
    { teamCode: 'TEAM-SECTOR-02', name: 'Sector 2 Akhada Liaison Unit', leader: 'Deputy SP R. N. Tiwari', phone: '+91 94150 90008', dept: 'Religious Affairs Liaison', zoneCode: 'ZONE-SEC-2', lat: 25.4361, lng: 81.8812, members: 6, status: 'AVAILABLE' },
    { teamCode: 'TEAM-SECTOR-03', name: 'Sector 3 Bridge Vigilance Squad', leader: 'Inspector Sandeep Negi', phone: '+91 94150 90009', dept: 'Civil Defence', zoneCode: 'ZONE-SEC-3', lat: 25.4263, lng: 81.8932, members: 7, status: 'AVAILABLE' },
    { teamCode: 'TEAM-VOL-01', name: 'Bharat Scouts & Guides Volunteer Alpha', leader: 'Coordinator Meena Gupta', phone: '+91 94150 90010', dept: 'Civil Defence Volunteers', zoneCode: 'ZONE-FOOD-LGR', lat: 25.4391, lng: 81.8749, members: 15, status: 'AVAILABLE' },
    { teamCode: 'TEAM-VOL-02', name: 'Civil Defence Lost & Found Taskforce', leader: 'Officer Amit Srivastava', phone: '+91 94150 90011', dept: 'Civil Defence', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4334, lng: 81.8725, members: 8, status: 'AVAILABLE' },
    { teamCode: 'TEAM-MED-FIELD-01', name: 'Mobile First-Aid Field Squad 1', leader: 'Dr. Neha Agnihotri', phone: '+91 94150 90012', dept: 'Health Department', zoneCode: 'ZONE-SANGAM', lat: 25.4287, lng: 81.8844, members: 4, status: 'AVAILABLE' },
    { teamCode: 'TEAM-MED-FIELD-02', name: 'Mobile First-Aid Field Squad 2', leader: 'Dr. Vivek Mishra', phone: '+91 94150 90013', dept: 'Health Department', zoneCode: 'ZONE-SEC-1', lat: 25.4304, lng: 81.8771, members: 4, status: 'ASSIGNED' },
    { teamCode: 'TEAM-FIRE-PATROL-01', name: 'Mobile Fire Suppression Patrol 1', leader: 'Station Officer S. K. Pathak', phone: '+91 94150 90014', dept: 'UP Fire Service', zoneCode: 'ZONE-SEC-2', lat: 25.4362, lng: 81.8814, members: 5, status: 'AVAILABLE' },
    { teamCode: 'TEAM-ARAIL-PATROL', name: 'Southern Ghat River Patrol', leader: 'Sub-Inspector J. P. Yadav', phone: '+91 94150 90015', dept: 'PAC Jal Police', zoneCode: 'ZONE-ARAIL-GHAT', lat: 25.4191, lng: 81.8794, members: 6, status: 'AVAILABLE' },
  ];

  const createdTeams: Record<string, string> = {};
  for (const t of fieldTeams) {
    const team = await prisma.emergencyTeam.create({
      data: {
        teamCode: t.teamCode,
        name: t.name,
        leaderName: t.leader,
        contactPhone: t.phone,
        department: t.dept,
        zoneId: createdZones[t.zoneCode],
        latitude: t.lat,
        longitude: t.lng,
        membersCount: t.members,
        status: t.status,
      },
    });
    createdTeams[t.teamCode] = team.id;
  }

  // 6. 10 Emergency Units
  const emergencyUnits = [
    { unitCode: 'AMBULANCE-01', name: 'Advanced Life Support Ambulance 01', type: 'AMBULANCE', reg: 'UP-70-G-1101', status: 'AVAILABLE', zoneCode: 'ZONE-MED-CTRL', lat: 25.4343, lng: 81.8682, dist: 0.4, phone: '108 / +91 94150 88001' },
    { unitCode: 'AMBULANCE-02', name: 'Basic Life Support Ambulance 02', type: 'AMBULANCE', reg: 'UP-70-G-1102', status: 'BUSY', zoneCode: 'ZONE-SEC-1', lat: 25.4306, lng: 81.8767, dist: 1.1, phone: '108 / +91 94150 88002' },
    { unitCode: 'AMBULANCE-07', name: 'Rapid Cardiac Ambulance 07', type: 'AMBULANCE', reg: 'UP-70-G-1107', status: 'AVAILABLE', zoneCode: 'ZONE-SEC-3', lat: 25.4264, lng: 81.8929, dist: 1.2, phone: '108 / +91 94150 88007' },
    { unitCode: 'POLICE-PCR-01', name: 'Dial 112 Mobile Patrol Van 01', type: 'POLICE', reg: 'UP-70-P-2001', status: 'AVAILABLE', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4337, lng: 81.8722, dist: 0.6, phone: '112 / +91 94150 88011' },
    { unitCode: 'POLICE-PCR-04', name: 'Dial 112 Mobile Patrol Van 04', type: 'POLICE', reg: 'UP-70-P-2004', status: 'DISPATCHED', zoneCode: 'ZONE-SEC-1', lat: 25.4300, lng: 81.8770, dist: 0.9, phone: '112 / +91 94150 88014' },
    { unitCode: 'FIRE-TENDER-01', name: 'Heavy Foam Tender 01', type: 'FIRE_BRIGADE', reg: 'UP-70-F-3001', status: 'AVAILABLE', zoneCode: 'ZONE-SEC-2', lat: 25.4363, lng: 81.8811, dist: 1.5, phone: '101 / +91 94150 88021' },
    { unitCode: 'FIRE-MIST-02', name: 'High-Pressure Water Mist Unit 02', type: 'FIRE_BRIGADE', reg: 'UP-70-F-3002', status: 'AVAILABLE', zoneCode: 'ZONE-SANGAM', lat: 25.4284, lng: 81.8846, dist: 0.5, phone: '101 / +91 94150 88022' },
    { unitCode: 'NDRF-BOAT-01', name: 'Inflatable High-Speed Rescue Boat 01', type: 'DISASTER_RESPONSE', reg: 'NDRF-BOAT-01', status: 'AVAILABLE', zoneCode: 'ZONE-SANGAM', lat: 25.4282, lng: 81.8850, dist: 0.3, phone: '1070 / +91 94150 88031' },
    { unitCode: 'NDRF-BOAT-02', name: 'Inflatable High-Speed Rescue Boat 02', type: 'DISASTER_RESPONSE', reg: 'NDRF-BOAT-02', status: 'AVAILABLE', zoneCode: 'ZONE-ARAIL-GHAT', lat: 25.4193, lng: 81.8791, dist: 1.8, phone: '1070 / +91 94150 88032' },
    { unitCode: 'DISASTER-HAZMAT-01', name: 'State Disaster Rapid Relief Unit', type: 'DISASTER_RESPONSE', reg: 'UP-70-D-4001', status: 'AVAILABLE', zoneCode: 'ZONE-PARKING', lat: 25.4419, lng: 81.8653, dist: 2.1, phone: '1070 / +91 94150 88041' },
  ];

  const createdUnits: Record<string, string> = {};
  for (const u of emergencyUnits) {
    const unit = await prisma.emergencyUnit.create({
      data: {
        unitCode: u.unitCode,
        name: u.name,
        type: u.type,
        vehicleNumber: u.reg,
        status: u.status,
        zoneId: createdZones[u.zoneCode],
        latitude: u.lat,
        longitude: u.lng,
        distanceKm: u.dist,
        contactNumber: u.phone,
      },
    });
    createdUnits[u.unitCode] = unit.id;
  }

  // 7. Sensors (10 IoT sensors)
  const sensors = [
    { code: 'SNS-BEAM-01', name: 'Sangam Main Ramp IR Counter', type: 'INFRARED_BEAM', zoneCode: 'ZONE-SANGAM', lat: 25.4287, lng: 81.8843, battery: 94, reading: 330.0 },
    { code: 'SNS-RFID-01', name: 'Parade Ground Gate RFID Barcode Gate', type: 'RFID_GATE', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4336, lng: 81.8721, battery: 98, reading: 275.0 },
    { code: 'SNS-DRONE-01', name: 'Sangam Aerial Density Quadcopter', type: 'DRONE_COUNTER', zoneCode: 'ZONE-SANGAM', lat: 25.4289, lng: 81.8847, battery: 85, reading: 18450.0 },
    { code: 'SNS-BEAM-02', name: 'Akshayavat Queue Strain Sensor', type: 'INFRARED_BEAM', zoneCode: 'ZONE-SEC-1', lat: 25.4302, lng: 81.8769, battery: 91, reading: 308.0 },
    { code: 'SNS-BLE-01', name: 'Sector 3 Bridge Entrance BLE Mesh', type: 'BLUETOOTH_BEACON', zoneCode: 'ZONE-SEC-3', lat: 25.4262, lng: 81.8929, battery: 99, reading: 285.0 },
    { code: 'SNS-RFID-02', name: 'Arail Boat Staging RFID Scanner', type: 'RFID_GATE', zoneCode: 'ZONE-ARAIL-GHAT', lat: 25.4191, lng: 81.8793, battery: 92, reading: 110.0 },
    { code: 'SNS-DRONE-02', name: 'Sector 1-2 Overhead Patrol Drone', type: 'DRONE_COUNTER', zoneCode: 'ZONE-SEC-1', lat: 25.4308, lng: 81.8776, battery: 78, reading: 13500.0 },
    { code: 'SNS-BEAM-03', name: 'Daraganj Rail Overpass Optical Counter', type: 'INFRARED_BEAM', zoneCode: 'ZONE-EXIT-NORTH', lat: 25.4411, lng: 81.8882, battery: 96, reading: 178.0 },
    { code: 'SNS-BLE-02', name: 'Annakshetra Queue Density Sensor', type: 'BLUETOOTH_BEACON', zoneCode: 'ZONE-FOOD-LGR', lat: 25.4393, lng: 81.8747, battery: 88, reading: 122.0 },
    { code: 'SNS-RFID-03', name: 'Hospital Green Corridor RFID Transponder', type: 'RFID_GATE', zoneCode: 'ZONE-MED-CTRL', lat: 25.4341, lng: 81.8681, battery: 100, reading: 44.0 },
  ];

  for (const s of sensors) {
    await prisma.sensor.create({
      data: {
        sensorCode: s.code,
        name: s.name,
        type: s.type,
        zoneId: createdZones[s.zoneCode],
        status: 'ACTIVE',
        batteryLevel: s.battery,
        lastReading: s.reading,
        latitude: s.lat,
        longitude: s.lng,
      },
    });
  }

  // 8. 50 Crowd Data History records across zones
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    const minutesAgo = (50 - i) * 15;
    const time = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const sangamRatio = 0.55 + 0.25 * Math.sin(i / 8);
    const count = Math.round(25000 * sangamRatio);
    const density = +(count / 250).toFixed(1);
    await prisma.crowdData.create({
      data: {
        zoneId: createdZones['ZONE-SANGAM'],
        timestamp: time,
        crowdCount: count,
        densityPercent: Math.min(density, 98.0),
        inflowRate: Math.round(260 + 90 * Math.sin(i / 5)),
        outflowRate: Math.round(220 + 50 * Math.cos(i / 6)),
        netFlow: Math.round(40 + 40 * Math.sin(i / 4)),
        riskScore: +(density * 0.95).toFixed(1),
        riskLevel: density > 85 ? 'CRITICAL' : density > 65 ? 'HIGH' : density > 40 ? 'MODERATE' : 'LOW',
        source: 'CCTV_AI_ANALYSIS',
      },
    });
  }

  // 9. Weather Data
  const weatherPoints = [
    { temp: 31.5, hum: 62.0, rain: 0.0, wind: 12.0, cond: 'Clear Sky', risk: 'LOW', heat: 34.0, vis: 8.0 },
    { temp: 33.0, hum: 68.0, rain: 0.0, wind: 14.5, cond: 'Humid & Sunny', risk: 'MODERATE', heat: 38.5, vis: 7.0 },
    { temp: 29.8, hum: 84.0, rain: 4.2, wind: 24.0, cond: 'Intermittent Rain', risk: 'MODERATE', heat: 32.0, vis: 5.5 },
  ];
  for (const w of weatherPoints) {
    await prisma.weatherData.create({
      data: {
        temperature: w.temp,
        humidity: w.hum,
        rainMm: w.rain,
        windSpeedKmh: w.wind,
        condition: w.cond,
        weatherRisk: w.risk,
        heatIndex: w.heat,
        visibilityKm: w.vis,
      },
    });
  }

  // 10. 20 Realistic Alerts
  const alertsData = [
    {
      code: 'ALT-2026-001',
      title: 'Extreme crowd density detected at Sangam Ghat',
      desc: 'CCTV and infrared beam analysis indicates pedestrian density crossed 78% with strong inbound rush from Pontoon 2.',
      type: 'Overcrowding',
      sev: 'HIGH',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Triveni Sangam Ghat Western Steps',
      crowd: 18450,
      dens: 73.8,
      risk: 74.5,
      status: 'ACKNOWLEDGED',
      teamCode: 'TEAM-QRT-01',
      action: 'Restrict incoming movement and deploy additional field personnel along ramp 4.',
      minsAgo: 14,
    },
    {
      code: 'ALT-2026-002',
      title: 'High Stampede Risk at Akshayavat Bottleneck',
      desc: 'Critical bidirectional collision detected in narrow passageway leading to Patalpuri underground temple.',
      type: 'Stampede Risk',
      sev: 'CRITICAL',
      zoneCode: 'ZONE-SEC-1',
      loc: 'Sector 1 (Akshayavat & Fort Corridor)',
      crowd: 13500,
      dens: 90.0,
      risk: 88.5,
      status: 'IN_PROGRESS',
      teamCode: 'TEAM-QRT-02',
      action: 'Enforce one-way radial dispersal, open emergency gate 3B, halt inbound pilgrims at Fort barrier.',
      minsAgo: 8,
    },
    {
      code: 'ALT-2026-003',
      title: 'Elderly Heat Exhaustion Cluster Reported',
      desc: 'Multiple devotees reported dehydration and acute fainting near Annakshetra water fountain 3.',
      type: 'Medical Emergency',
      sev: 'WARNING',
      zoneCode: 'ZONE-FOOD-LGR',
      loc: 'Annakshetra & Food Distribution Zone',
      crowd: 6500,
      dens: 46.4,
      risk: 42.0,
      status: 'ASSIGNED',
      teamCode: 'TEAM-VOL-01',
      action: 'Dispatch ORS electrolyte supplies and notify Medical Post Alpha.',
      minsAgo: 22,
    },
    {
      code: 'ALT-2026-004',
      title: 'Pontoon Bridge 1 Sway Vibrations Warning',
      desc: 'Structural sensors on Pontoon 1 record dynamic load surge exceeding 80% tolerance during peak snan movement.',
      type: 'Infrastructure Failure',
      sev: 'HIGH',
      zoneCode: 'ZONE-SEC-3',
      loc: 'Sector 3 Jhusi Pontoon Bridge Approach',
      crowd: 12800,
      dens: 80.0,
      risk: 78.0,
      status: 'NEW',
      teamCode: 'TEAM-NDRF-02',
      action: 'Meter entrance rate to 100 persons/minute; redirect excess flow to Pontoon Bridge 3.',
      minsAgo: 5,
    },
    {
      code: 'ALT-2026-005',
      title: 'Electrical Spark in Akhada Tent Row 4',
      desc: 'Minor electrical short reported near generator back-feed behind Niranjani camp kitchen.',
      type: 'Fire',
      sev: 'HIGH',
      zoneCode: 'ZONE-SEC-2',
      loc: 'Sector 2 (Akhada Camp & Dharmshala)',
      crowd: 9800,
      dens: 44.5,
      risk: 65.0,
      status: 'IN_PROGRESS',
      teamCode: 'TEAM-FIRE-PATROL-01',
      action: 'Isolate feeder switch 12; deploy mist foam extinguisher team.',
      minsAgo: 18,
    },
    {
      code: 'ALT-2026-006',
      title: 'Lost Child (6 yrs, Red Kurta) Broadcast',
      desc: 'Parent SOS submitted via Pilgrim App. Child separated near Sangam Pier 3.',
      type: 'Missing Person',
      sev: 'WARNING',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Sangam Pontoon Arrival Pier',
      crowd: 18450,
      dens: 73.8,
      risk: 35.0,
      status: 'NEW',
      teamCode: 'TEAM-VOL-02',
      action: 'Display alert on Sector digital signboards and announce via PA system.',
      minsAgo: 30,
    },
    {
      code: 'ALT-2026-007',
      title: 'Sudden Wind Gust & Dust Storm Advisory',
      desc: 'Prayagraj Met Station warns of 45 km/h squall in next 20 minutes across riverbed.',
      type: 'Weather Emergency',
      sev: 'WARNING',
      zoneCode: 'ZONE-ARAIL-GHAT',
      loc: 'Arail Ghat & Southern Tent City',
      crowd: 7400,
      dens: 43.5,
      risk: 52.0,
      status: 'ACKNOWLEDGED',
      teamCode: 'TEAM-ARAIL-PATROL',
      action: 'Secure temporary tent guy-wires and suspend leisure boat rides.',
      minsAgo: 45,
    },
    {
      code: 'ALT-2026-008',
      title: 'Blocked Barricade on Bandha Link Road',
      desc: 'Overturned supply cart causing 200m pedestrian tailback behind Main Gate.',
      type: 'Blocked Route',
      sev: 'WARNING',
      zoneCode: 'ZONE-ENTRY-MAIN',
      loc: 'Bandha Road Corridor',
      crowd: 11200,
      dens: 62.2,
      risk: 54.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-TRAFFIC-01',
      action: 'Clear obstruction and redirect pedestrians through bypass 2.',
      minsAgo: 85,
    },
    {
      code: 'ALT-2026-009',
      title: 'Unattended Metallic Bag Spotted',
      desc: 'Suspicious unattended bag spotted near Daraganj rail underpass.',
      type: 'Suspicious Activity',
      sev: 'HIGH',
      zoneCode: 'ZONE-EXIT-NORTH',
      loc: 'Daraganj Corridor',
      crowd: 5900,
      dens: 36.8,
      risk: 68.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-QRT-01',
      action: 'BDDS bomb disposal unit scanned and declared safe (forgotten luggage).',
      minsAgo: 120,
    },
    {
      code: 'ALT-2026-010',
      title: 'High Inflow Surge Detected at Main Entrance',
      desc: 'Inflow rate spiked to 390 persons/min following arrival of 4 special trains at Prayagraj Jn.',
      type: 'Overcrowding',
      sev: 'HIGH',
      zoneCode: 'ZONE-ENTRY-MAIN',
      loc: 'Main Entry Gate & Bandha Road',
      crowd: 12500,
      dens: 69.4,
      risk: 72.0,
      status: 'ACKNOWLEDGED',
      teamCode: 'TEAM-TRAFFIC-01',
      action: 'Open holding zones 4 and 5 on Parade Ground.',
      minsAgo: 35,
    },
    {
      code: 'ALT-2026-011',
      title: 'Emergency Green Corridor Breach',
      desc: 'Pedestrians spilling over barricades into designated hospital ambulance lane.',
      type: 'Blocked Route',
      sev: 'HIGH',
      zoneCode: 'ZONE-MED-CTRL',
      loc: 'Hospital Green Corridor Gate',
      crowd: 1850,
      dens: 37.0,
      risk: 66.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-TRAFFIC-01',
      action: 'Deploy police cordoning to maintain ambulance passage.',
      minsAgo: 95,
    },
    {
      code: 'ALT-2026-012',
      title: 'Water Level Rise Alert - River Ganga',
      desc: 'Irrigation department informs 15cm gradual rise in water level; warning flags hoisted.',
      type: 'Weather Emergency',
      sev: 'INFO',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Triveni Sangam Ghat',
      crowd: 18450,
      dens: 73.8,
      risk: 30.0,
      status: 'ACKNOWLEDGED',
      teamCode: 'TEAM-NDRF-01',
      action: 'NDRF divers on high vigil; safety ropes inspected.',
      minsAgo: 110,
    },
    {
      code: 'ALT-2026-013',
      title: 'Temporary Footbridge Crowd Density Surge',
      desc: 'Slow moving queue at bridge 4 causing pressure at entry bottleneck.',
      type: 'Overcrowding',
      sev: 'WARNING',
      zoneCode: 'ZONE-SEC-3',
      loc: 'Sector 3 Jhusi',
      crowd: 12800,
      dens: 80.0,
      risk: 63.0,
      status: 'ACKNOWLEDGED',
      teamCode: 'TEAM-SECTOR-03',
      action: 'Regulate batch release every 2 minutes.',
      minsAgo: 50,
    },
    {
      code: 'ALT-2026-014',
      title: 'Medical SOS: Cardiac Distress in Camp Sector 2',
      desc: '65-year-old pilgrim collapsed with acute chest pain near Camp 14.',
      type: 'Medical Emergency',
      sev: 'CRITICAL',
      zoneCode: 'ZONE-SEC-2',
      loc: 'Sector 2 Akhada Camp',
      crowd: 9800,
      dens: 44.5,
      risk: 85.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-MED-FIELD-01',
      action: 'Ambulance-01 dispatched; patient stabilized and admitted to Central Hospital.',
      minsAgo: 140,
    },
    {
      code: 'ALT-2026-015',
      title: 'PA System Speaker Failure on Northern Exit',
      desc: 'Audio announcement line disconnected on pillar 18 to 22.',
      type: 'Infrastructure Failure',
      sev: 'INFO',
      zoneCode: 'ZONE-EXIT-NORTH',
      loc: 'Northern Relief Exit',
      crowd: 5900,
      dens: 36.8,
      risk: 25.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-VOL-01',
      action: 'Technician restored line; mega-phones deployed during downtime.',
      minsAgo: 160,
    },
    {
      code: 'ALT-2026-016',
      title: 'Congestion at Shuttle Bus Boarding Bays',
      desc: 'Long queues due to delay in return trip turnaround on GT Road.',
      type: 'Overcrowding',
      sev: 'INFO',
      zoneCode: 'ZONE-PARKING',
      loc: 'Central Parking & Shuttle Terminal',
      crowd: 12000,
      dens: 40.0,
      risk: 32.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-TRAFFIC-02',
      action: '20 spare UPSRTC buses pressed into service.',
      minsAgo: 175,
    },
    {
      code: 'ALT-2026-017',
      title: 'Barricade Rope Snapping Hazard',
      desc: 'Heavy crowd surge strained safety guide ropes near bathing ghat 4.',
      type: 'Infrastructure Failure',
      sev: 'WARNING',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Triveni Sangam Ghat',
      crowd: 18450,
      dens: 73.8,
      risk: 58.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-QRT-01',
      action: 'Reinforced with secondary steel barricade line.',
      minsAgo: 200,
    },
    {
      code: 'ALT-2026-018',
      title: 'Lost Child (8 yrs, Blue Kurta) Reunited',
      desc: 'Child traced at Daraganj assistance booth and handed over to family.',
      type: 'Missing Person',
      sev: 'INFO',
      zoneCode: 'ZONE-EXIT-NORTH',
      loc: 'Daraganj Corridor',
      crowd: 5900,
      dens: 36.8,
      risk: 15.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-VOL-02',
      action: 'Verification completed; case closed.',
      minsAgo: 220,
    },
    {
      code: 'ALT-2026-019',
      title: 'Night Illumination Tower 9 Power Trip',
      desc: 'High-mast LED tower tripped due to overload.',
      type: 'Infrastructure Failure',
      sev: 'WARNING',
      zoneCode: 'ZONE-PARKING',
      loc: 'Central Parking',
      crowd: 12000,
      dens: 40.0,
      risk: 45.0,
      status: 'RESOLVED',
      teamCode: 'TEAM-TRAFFIC-02',
      action: 'Backup DG set engaged within 90 seconds.',
      minsAgo: 250,
    },
    {
      code: 'ALT-2026-020',
      title: 'Heavy Inflow Forecast for Morning Shahi Snan',
      desc: 'Predictive model projects peak density above 90% between 04:00 and 08:00 AM.',
      type: 'Overcrowding',
      sev: 'HIGH',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Sangam Ghat Core & Approaches',
      crowd: 18450,
      dens: 73.8,
      risk: 75.0,
      status: 'NEW',
      teamCode: 'TEAM-QRT-01',
      action: 'Pre-position 8 additional QRT teams and initiate sector zoning protocol.',
      minsAgo: 2,
    },
  ];

  for (const a of alertsData) {
    const alertTime = new Date(now.getTime() - a.minsAgo * 60 * 1000);
    await prisma.alert.create({
      data: {
        alertCode: a.code,
        title: a.title,
        description: a.desc,
        type: a.type,
        severity: a.sev,
        zoneId: createdZones[a.zoneCode],
        locationText: a.loc,
        crowdCount: a.crowd,
        densityPercent: a.dens,
        riskScore: a.risk,
        status: a.status,
        assignedTeamId: a.teamCode ? createdTeams[a.teamCode] : null,
        recommendedAction: a.action,
        acknowledgedBy: a.status !== 'NEW' ? 'Inspector Vikram Singh' : null,
        acknowledgedAt: a.status !== 'NEW' ? new Date(alertTime.getTime() + 2 * 60 * 1000) : null,
        resolvedAt: a.status === 'RESOLVED' ? new Date(alertTime.getTime() + 25 * 60 * 1000) : null,
        createdAt: alertTime,
        updatedAt: alertTime,
      },
    });
  }

  // 11. 15 Incidents
  const incidentsData = [
    {
      code: 'INC-2026-001',
      title: 'Severe Crowd Bottleneck at Akshayavat Entry',
      desc: 'Pilgrims surge towards narrow gate leading to Fort corridor; movement stalled.',
      cat: 'Crowd Surge',
      sev: 'CRITICAL',
      status: 'IN_PROGRESS',
      zoneCode: 'ZONE-SEC-1',
      loc: 'Akshayavat Temple Corridor Gate 1',
      lat: 25.4302,
      lng: 81.8769,
      unitCode: 'POLICE-PCR-04',
      teamCode: 'TEAM-QRT-02',
      notes: 'Team QRT-02 holding entry barricade. Radial exit opened to relieve queue pressure.',
      minsAgo: 10,
    },
    {
      code: 'INC-2026-002',
      title: 'Heatstroke Emergency at Sangam Ghat Bathing Pier',
      desc: 'Elderly lady collapsed near water edge; unconscious with feeble pulse.',
      cat: 'Medical',
      sev: 'HIGH',
      status: 'VERIFIED',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Sangam Pier 2 Steps',
      lat: 25.4287,
      lng: 81.8844,
      unitCode: 'AMBULANCE-01',
      teamCode: 'TEAM-MED-FIELD-01',
      notes: 'First aid oxygen administered. Ambulance-01 navigating through green corridor.',
      minsAgo: 15,
    },
    {
      code: 'INC-2026-003',
      title: 'Electrical Spark in Akhada Dining Tent',
      desc: 'Short circuit sparks detected near tarpaulin ceiling.',
      cat: 'Fire',
      sev: 'HIGH',
      status: 'IN_PROGRESS',
      zoneCode: 'ZONE-SEC-2',
      loc: 'Sector 2 Akhada Kitchen Row',
      lat: 25.4362,
      lng: 81.8813,
      unitCode: 'FIRE-TENDER-01',
      teamCode: 'TEAM-FIRE-PATROL-01',
      notes: 'Power feeder disconnected. Foam spray deployed. No casualties.',
      minsAgo: 20,
    },
    {
      code: 'INC-2026-004',
      title: 'Missing Child Case: Aarav Verma (Age 7)',
      desc: 'Separated from parents near Pontoon 1 entry ramp.',
      cat: 'Lost Person',
      sev: 'MEDIUM',
      status: 'ASSIGNED',
      zoneCode: 'ZONE-SEC-3',
      loc: 'Sector 3 Jhusi Pontoon Bridge',
      lat: 25.4262,
      lng: 81.8929,
      unitCode: 'POLICE-PCR-01',
      teamCode: 'TEAM-VOL-02',
      notes: 'Photo circulated to all sector kiosks and WhatsApp alert group.',
      minsAgo: 32,
    },
    {
      code: 'INC-2026-005',
      title: 'Pontoon Bridge Guide Rail Vibration Load',
      desc: 'Heavy crowd load caused sway beyond recommended tolerance.',
      cat: 'Structural',
      sev: 'HIGH',
      status: 'REPORTED',
      zoneCode: 'ZONE-SEC-3',
      loc: 'Pontoon Bridge 1 Middle Span',
      lat: 25.4260,
      lng: 81.8932,
      unitCode: 'NDRF-BOAT-01',
      teamCode: 'TEAM-NDRF-02',
      notes: 'Engineers dispatched for physical inspection.',
      minsAgo: 7,
    },
    {
      code: 'INC-2026-006',
      title: 'Pedestrian Barrier Failure at Sangam Main Ramp',
      desc: 'Bamboos dislodged due to crowd surge from riverbank.',
      cat: 'Structural',
      sev: 'HIGH',
      status: 'RESOLVED',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Sangam Western Ramp',
      lat: 25.4284,
      lng: 81.8841,
      unitCode: 'POLICE-PCR-01',
      teamCode: 'TEAM-QRT-01',
      notes: 'Replaced with iron barricade frame. Crowd channeled successfully.',
      minsAgo: 60,
    },
    {
      code: 'INC-2026-007',
      title: 'Minor Stampede Scare near Parade Ground Exit',
      desc: 'False rumor caused brief panic and running.',
      cat: 'Crowd Surge',
      sev: 'HIGH',
      status: 'RESOLVED',
      zoneCode: 'ZONE-ENTRY-MAIN',
      loc: 'Parade Ground Gate 4',
      lat: 25.4335,
      lng: 81.8722,
      unitCode: 'POLICE-PCR-01',
      teamCode: 'TEAM-TRAFFIC-01',
      notes: 'Police PA system calmed crowd. 3 minor scrapes treated on spot.',
      minsAgo: 90,
    },
    {
      code: 'INC-2026-008',
      title: 'Food Poisoning Alert at Private Bhandara',
      desc: '8 pilgrims reported nausea after consuming sweets from unregistered stall.',
      cat: 'Medical',
      sev: 'MEDIUM',
      status: 'RESOLVED',
      zoneCode: 'ZONE-FOOD-LGR',
      loc: 'Annakshetra Outer Lane',
      lat: 25.4390,
      lng: 81.8752,
      unitCode: 'AMBULANCE-02',
      teamCode: 'TEAM-MED-FIELD-02',
      notes: 'Food safety officer seized stall. Patients rehydrated and discharged.',
      minsAgo: 120,
    },
    {
      code: 'INC-2026-009',
      title: 'Boat Engine Stalling in Deep Sangam Current',
      desc: 'Passenger boat with 12 pilgrims stalled 50m off Sangam point.',
      cat: 'Structural',
      sev: 'HIGH',
      status: 'RESOLVED',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Mid-River Confluence',
      lat: 25.4279,
      lng: 81.8852,
      unitCode: 'NDRF-BOAT-01',
      teamCode: 'TEAM-NDRF-01',
      notes: 'NDRF rescue boat towed vessel safely to Arail shore. All safe.',
      minsAgo: 150,
    },
    {
      code: 'INC-2026-010',
      title: 'Lost Senior Citizen (Female, 72 yrs) Located',
      desc: 'Found resting at Daraganj camp without mobile phone.',
      cat: 'Lost Person',
      sev: 'LOW',
      status: 'RESOLVED',
      zoneCode: 'ZONE-EXIT-NORTH',
      loc: 'Daraganj Helpdesk',
      lat: 25.4410,
      lng: 81.8885,
      unitCode: 'POLICE-PCR-01',
      teamCode: 'TEAM-VOL-02',
      notes: 'Son contacted through registered wristband QR code.',
      minsAgo: 180,
    },
    {
      code: 'INC-2026-011',
      title: 'Traffic Gridlock at Sangam Link Bypass',
      desc: 'VIP motorcade movement caused brief stoppage for general traffic.',
      cat: 'Law and Order',
      sev: 'MEDIUM',
      status: 'RESOLVED',
      zoneCode: 'ZONE-PARKING',
      loc: 'GT Road Junction',
      lat: 25.4422,
      lng: 81.8654,
      unitCode: 'POLICE-PCR-01',
      teamCode: 'TEAM-TRAFFIC-02',
      notes: 'Diverted traffic to bypass loop B.',
      minsAgo: 210,
    },
    {
      code: 'INC-2026-012',
      title: 'Minor Gas Cylinder Leak in Community Kitchen',
      desc: 'LPG hose smell detected during evening meal preparation.',
      cat: 'Fire',
      sev: 'MEDIUM',
      status: 'RESOLVED',
      zoneCode: 'ZONE-FOOD-LGR',
      loc: 'Sector 3 Annakshetra',
      lat: 25.4388,
      lng: 81.8746,
      unitCode: 'FIRE-MIST-02',
      teamCode: 'TEAM-FIRE-PATROL-01',
      notes: 'Regulator replaced. Area ventilated. No fire occurred.',
      minsAgo: 240,
    },
    {
      code: 'INC-2026-013',
      title: 'Unconscious Male Devotee on Arail Sandbar',
      desc: 'Exhausted pilgrim spotted lying near boat pier.',
      cat: 'Medical',
      sev: 'HIGH',
      status: 'RESOLVED',
      zoneCode: 'ZONE-ARAIL-GHAT',
      loc: 'Arail Ghat Jetty',
      lat: 25.4190,
      lng: 81.8790,
      unitCode: 'AMBULANCE-01',
      teamCode: 'TEAM-ARAIL-PATROL',
      notes: 'Treated for acute sun exhaustion; vitals returned to normal.',
      minsAgo: 280,
    },
    {
      code: 'INC-2026-014',
      title: 'Drone Intrusion in No-Fly Zone above Shahi Snan',
      desc: 'Unauthorized civilian drone flying over Akhada procession.',
      cat: 'Law and Order',
      sev: 'MEDIUM',
      status: 'RESOLVED',
      zoneCode: 'ZONE-SEC-2',
      loc: 'Sector 2 Akhada Axis',
      lat: 25.4361,
      lng: 81.8810,
      unitCode: 'POLICE-PCR-04',
      teamCode: 'TEAM-SECTOR-02',
      notes: 'Anti-drone gun jammed frequency; operator detained and penalized.',
      minsAgo: 320,
    },
    {
      code: 'INC-2026-015',
      title: 'Pontoon Pier Mooring Rope Slack at Sangam',
      desc: 'High river current loosened pontoon securing ropes.',
      cat: 'Structural',
      sev: 'MEDIUM',
      status: 'RESOLVED',
      zoneCode: 'ZONE-SANGAM',
      loc: 'Sangam Pontoon 2',
      lat: 25.4281,
      lng: 81.8845,
      unitCode: 'NDRF-BOAT-02',
      teamCode: 'TEAM-NDRF-01',
      notes: 'PWD bridges division re-anchored steel cables.',
      minsAgo: 360,
    },
  ];

  for (const inc of incidentsData) {
    const incTime = new Date(now.getTime() - inc.minsAgo * 60 * 1000);
    await prisma.incident.create({
      data: {
        incidentCode: inc.code,
        title: inc.title,
        description: inc.desc,
        category: inc.cat,
        severity: inc.sev,
        status: inc.status,
        zoneId: createdZones[inc.zoneCode],
        locationText: inc.loc,
        latitude: inc.lat,
        longitude: inc.lng,
        reportedBy: 'Control Room Surveillance & Citizen SOS',
        assignedUnitId: inc.unitCode ? createdUnits[inc.unitCode] : null,
        assignedTeamId: inc.teamCode ? createdTeams[inc.teamCode] : null,
        responseNotes: inc.notes,
        reportedAt: incTime,
        verifiedAt: new Date(incTime.getTime() + 2 * 60 * 1000),
        inProgressAt: inc.status === 'IN_PROGRESS' || inc.status === 'RESOLVED' ? new Date(incTime.getTime() + 5 * 60 * 1000) : null,
        resolvedAt: inc.status === 'RESOLVED' ? new Date(incTime.getTime() + 25 * 60 * 1000) : null,
      },
    });
  }

  // 12. 30 Notifications
  const notifCategories = ['Critical Alert', 'Warning', 'Incident Update', 'Team Assignment', 'Weather Warning', 'Public Announcement'];
  const severities = ['CRITICAL', 'HIGH', 'WARNING', 'INFO'];
  for (let i = 1; i <= 30; i++) {
    const cat = notifCategories[i % notifCategories.length];
    const sev = severities[i % severities.length];
    await prisma.notification.create({
      data: {
        title: `Kumbh Alert #${i}: ${cat} Notification`,
        message: `Official advisory issued regarding crowd density and safety protocol update in sector ${((i % 5) + 1)}. Please review control board instructions.`,
        category: cat,
        severity: sev,
        recipientRole: i % 4 === 0 ? 'ALL' : i % 3 === 0 ? 'FIELD_STAFF' : 'CONTROL_ROOM',
        isRead: i > 5,
        linkUrl: '/alerts',
        createdAt: new Date(now.getTime() - i * 18 * 60 * 1000),
      },
    });
  }

  // 13. 20 User Reports
  const reportTypes = ['Overcrowding', 'Medical', 'Lost Child/Elder', 'Fire', 'Obstruction', 'Suspicious Item'];
  const reportLocations = [
    'Sangam Western Bathing Pier',
    'Akshayavat Temple Corridor',
    'Main Entry Gate Bandha Road',
    'Sector 3 Pontoon Bridge 1',
    'Annakshetra Langar Hall B',
    'Central Parking Bus Stand',
    'Daraganj Railway Bridge Underpass',
    'Arail Ghat Southern Camp',
    'Juna Akhada Procession Crossway',
    'Medical Camp 2 Triage Tent',
  ];
  for (let i = 1; i <= 20; i++) {
    const repType = reportTypes[i % reportTypes.length];
    const repLoc = reportLocations[i % reportLocations.length];
    await prisma.userReport.create({
      data: {
        reportCode: `REP-${1000 + i}`,
        reporterName: `Devotee ${['Rameshwar', 'Sunita Devi', 'Alok Pandey', 'Pooja Tiwari', 'Mahesh Gupta', 'Kavita Verma'][i % 6]}`,
        reporterPhone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
        emergencyType: repType,
        location: repLoc,
        description: `Citizen emergency report regarding ${repType.toLowerCase()} observed near ${repLoc}. Urgent attention requested from sector magistrate.`,
        priority: i % 3 === 0 ? 'CRITICAL' : i % 2 === 0 ? 'HIGH' : 'MEDIUM',
        status: i > 12 ? 'RESOLVED' : i > 6 ? 'VERIFIED' : 'SUBMITTED',
        latitude: 25.4285 + (Math.random() - 0.5) * 0.02,
        longitude: 81.8845 + (Math.random() - 0.5) * 0.02,
        createdAt: new Date(now.getTime() - i * 25 * 60 * 1000),
      },
    });
  }

  // 14. Key POI Locations for Map (Medical camps, Police stations, Fire stations, Emergency exits)
  const poiLocations = [
    { name: 'Central Disaster Management HQ', type: 'HELPLINE_DESK', zoneCode: 'ZONE-SANGAM', lat: 25.4310, lng: 81.8800, desc: 'Central Control & Command Operations Room', icon: 'shield' },
    { name: 'Sangam Trauma & Medical Post Alpha', type: 'MEDICAL_CAMP', zoneCode: 'ZONE-SANGAM', lat: 25.4290, lng: 81.8840, desc: 'Immediate medical stabilization with 4 ICUs', icon: 'hospital' },
    { name: 'Sector 1 Police Station Kotwali', type: 'POLICE_POST', zoneCode: 'ZONE-SEC-1', lat: 25.4300, lng: 81.8765, desc: 'Mela Police Station & FIR center', icon: 'badge' },
    { name: 'Sector 2 Fire Station Brigade 2', type: 'FIRE_STATION', zoneCode: 'ZONE-SEC-2', lat: 25.4365, lng: 81.8815, desc: '24x7 Water tender and chemical foam post', icon: 'flame' },
    { name: 'Northern Emergency Reliever Exit Gate 1', type: 'EMERGENCY_EXIT', zoneCode: 'ZONE-EXIT-NORTH', lat: 25.4415, lng: 81.8885, desc: 'Wide 40m clear evacuation corridor to Daraganj', icon: 'log-out' },
    { name: 'Main Central 100-Bed Hospital', type: 'MEDICAL_CAMP', zoneCode: 'ZONE-MED-CTRL', lat: 25.4342, lng: 81.8680, desc: 'Full surgical and trauma facility', icon: 'hospital' },
    { name: 'Lost & Found Khoya-Paya Kendra 1', type: 'LOST_FOUND_BOOTH', zoneCode: 'ZONE-ENTRY-MAIN', lat: 25.4335, lng: 81.8725, desc: 'Digital biometric lost persons tracing desk', icon: 'search' },
    { name: 'Arail Southern Police Outpost', type: 'POLICE_POST', zoneCode: 'ZONE-ARAIL-GHAT', lat: 25.4190, lng: 81.8795, desc: 'River bank police squad and water patrol', icon: 'badge' },
  ];

  for (const poi of poiLocations) {
    await prisma.location.create({
      data: {
        name: poi.name,
        type: poi.type,
        zoneId: createdZones[poi.zoneCode],
        latitude: poi.lat,
        longitude: poi.lng,
        description: poi.desc,
        contactInfo: 'Mela Toll-Free: 1920 / Emergency: 112',
        icon: poi.icon,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`- Roles: 5`);
  console.log(`- Users: 5 (Control Room, Field Staff, Emergency Services, Pilgrim, Admin)`);
  console.log(`- Zones: 10`);
  console.log(`- CCTV Cameras: 20`);
  console.log(`- Field Teams: 15`);
  console.log(`- Emergency Units: 10`);
  console.log(`- Crowd History: 50`);
  console.log(`- Alerts: 20`);
  console.log(`- Incidents: 15`);
  console.log(`- Notifications: 30`);
  console.log(`- User Reports: 20`);
  console.log(`- Map POIs: 8`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
