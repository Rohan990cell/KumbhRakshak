import { mockStore } from './mockStore';

export const IS_DEMO_MODE = true;

export const getAuthToken = (): string | null => {
  return localStorage.getItem('kumbh_token') || 'demo-jwt-token-control';
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('kumbh_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('kumbh_token');
  localStorage.removeItem('kumbh_user');
};

// Client-side Demo API Router
const handleMockApi = async <T = any>(endpoint: string, method: string, body?: any): Promise<T> => {
  // Artificial micro-delay for realistic snappy UI feedback
  await new Promise((resolve) => setTimeout(resolve, 60));

  // Clean endpoint
  const cleanEndpoint = endpoint.replace(/^\/api/, '');
  const [path, queryString] = cleanEndpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // 1. Auth routes
  if (path === '/auth/me') {
    return { user: mockStore.getCurrentUser() } as unknown as T;
  }
  if (path === '/auth/login') {
    const res = mockStore.loginUser(body?.email || 'control@kumbhrakshak.gov.in');
    setAuthToken(res.token);
    return res as unknown as T;
  }

  // 2. Dashboard
  if (path === '/dashboard/stats') {
    return mockStore.getDashboardStats() as unknown as T;
  }

  // 3. Zones & Crowd
  if (path === '/zones') {
    return mockStore.getZones() as unknown as T;
  }
  if (path === '/zones/map-data') {
    return mockStore.getMapData() as unknown as T;
  }
  if (path === '/crowd/update') {
    return mockStore.updateCrowd(body) as unknown as T;
  }

  // 4. Alerts
  if (path === '/alerts') {
    if (method === 'POST') {
      return mockStore.createAlert(body) as unknown as T;
    }
    const statusParam = params.get('status') || undefined;
    return mockStore.getAlerts(statusParam) as unknown as T;
  }
  if (path.startsWith('/alerts/') && path.endsWith('/acknowledge')) {
    const parts = path.split('/');
    const alertId = parts[2];
    return mockStore.acknowledgeAlert(alertId, body?.actionTaken || 'IN_PROGRESS', body?.notes) as unknown as T;
  }

  // 5. Incidents
  if (path === '/incidents') {
    if (method === 'POST') {
      return mockStore.createIncident(body) as unknown as T;
    }
    return mockStore.getIncidents() as unknown as T;
  }
  if (path.startsWith('/incidents/')) {
    const incidentId = path.split('/')[2];
    if (method === 'PATCH') {
      return mockStore.updateIncident(incidentId, body) as unknown as T;
    }
  }

  // 6. Emergency Fleet & Teams
  if (path === '/emergency/units') {
    return mockStore.getEmergencyUnits() as unknown as T;
  }
  if (path.startsWith('/emergency/units/')) {
    const unitId = path.split('/')[3];
    return mockStore.updateEmergencyUnit(unitId, body) as unknown as T;
  }
  if (path === '/emergency/teams') {
    return mockStore.getEmergencyTeams() as unknown as T;
  }
  if (path.startsWith('/emergency/teams/')) {
    const teamId = path.split('/')[3];
    return mockStore.updateEmergencyTeam(teamId, body) as unknown as T;
  }

  // 7. CCTV
  if (path === '/cctv') {
    return mockStore.getCCTVs() as unknown as T;
  }
  if (path.startsWith('/cctv/') && path.endsWith('/simulate')) {
    const camId = path.split('/')[2];
    return mockStore.simulateCCTVSurge(camId, body?.crowdDelta || 1800) as unknown as T;
  }

  // 8. Weather
  if (path === '/weather') {
    return mockStore.getWeather() as unknown as T;
  }
  if (path === '/weather/simulate') {
    return mockStore.simulateWeather(body) as unknown as T;
  }

  // 9. Explainable AI Risk Analysis
  if (path === '/risk/zones') {
    return mockStore.getRiskZones() as unknown as T;
  }
  if (path === '/risk/research-citations') {
    return mockStore.getResearchCitations() as unknown as T;
  }

  // 10. Reports
  if (path === '/reports') {
    if (method === 'POST') {
      return mockStore.createReport(body) as unknown as T;
    }
    return mockStore.getReports() as unknown as T;
  }
  if (path.startsWith('/reports/')) {
    const reportId = path.split('/')[2];
    if (method === 'PATCH') {
      return mockStore.updateReport(reportId, body) as unknown as T;
    }
  }

  // 11. Notifications
  if (path === '/notifications') {
    return mockStore.getNotifications() as unknown as T;
  }
  if (path === '/notifications/all/read') {
    return mockStore.markAllNotificationsRead() as unknown as T;
  }
  if (path === '/notifications/broadcast') {
    return mockStore.broadcastNotification(body) as unknown as T;
  }

  // 12. Simulation Panel Triggers
  if (path === '/simulation/trigger') {
    return mockStore.triggerSimulation(body?.scenarioType) as unknown as T;
  }

  // Fallback for demo resilience
  console.info(`[Demo Mode Mock API] Handled fallback for ${method} ${endpoint}`, body);
  return { success: true } as unknown as T;
};

// Real network fallback if IS_DEMO_MODE is ever disabled
const networkRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) errorMessage = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
};

const execute = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  if (IS_DEMO_MODE) {
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    return handleMockApi<T>(endpoint, options.method || 'GET', body);
  }
  return networkRequest<T>(endpoint, options);
};

export const api = {
  get: <T = any>(endpoint: string) => execute<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    execute<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(endpoint: string, body?: any) =>
    execute<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) => execute<T>(endpoint, { method: 'DELETE' }),
};
