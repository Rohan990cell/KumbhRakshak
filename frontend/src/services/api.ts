const BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('kumbh_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('kumbh_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('kumbh_token');
  localStorage.removeItem('kumbh_user');
};

const request = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
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

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
