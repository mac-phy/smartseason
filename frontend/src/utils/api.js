// In development, Vite proxies /api to localhost:4000.
// In production (Render), set VITE_API_URL to your backend URL:
//   e.g.  VITE_API_URL=https://smartseason-api.onrender.com/api
const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('ss_token');
}

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Is the backend running?');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Server returned non-JSON (${res.status}). ` +
      `Check VITE_API_URL is set correctly and the backend is running.`
    );
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
  dashboard: () => request('/users/dashboard'),
  agents: () => request('/users/agents'),
  users: () => request('/users'),
  fields: () => request('/fields'),
  field: (id) => request(`/fields/${id}`),
  createField: (data) => request('/fields', { method: 'POST', body: JSON.stringify(data) }),
  updateField: (id, data) => request(`/fields/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteField: (id) => request(`/fields/${id}`, { method: 'DELETE' }),
};
