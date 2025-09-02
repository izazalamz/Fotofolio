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

// Portfolio API functions
export const portfolioApi = {
  async uploadPortfolioImage(formData) {
    const response = await fetch(`${API_BASE}/portfolio/upload`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      body: formData
    });
    return handleResponse(response);
  },

  async listPortfolio(photographerId) {
    return api.get(`/portfolio/${photographerId}`);
  },

  async deletePortfolioImage(id) {
    return api.del(`/portfolio/${id}`);
  }
};

// Reviews API functions
export const reviewsApi = {
  async postReview(bookingId, { rating, comment }) {
    return api.post(`/reviews/${bookingId}`, { rating, comment });
  },

  async getPhotographerReviews(photographerId, { limit = 10, offset = 0 } = {}) {
    return api.get(`/reviews/photographer/${photographerId}?limit=${limit}&offset=${offset}`);
  },

  async getReviewSummary(photographerId) {
    return api.get(`/reviews/summary/${photographerId}`);
  },

  async getBookingReview(bookingId) {
    return api.get(`/reviews/booking/${bookingId}`);
  }
};

// Payments API functions
export const paymentsApi = {
  async payBooking(bookingId, amount = 0) {
    return api.post(`/payments/${bookingId}/pay`, { amount });
  },

  async getPayment(bookingId) {
    return api.get(`/payments/${bookingId}`);
  }
};
