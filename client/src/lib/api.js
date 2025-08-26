const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  async get(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers }
    });
    return handleResponse(response);
  },

  async post(endpoint, data, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    return handleResponse(response);
  },

  async del(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders(), ...options.headers },
      ...options
    });
    return handleResponse(response);
  }
};
