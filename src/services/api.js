import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: ()       => api.get('/admin/dashboard'),
  addUser:      (data)   => api.post('/admin/add-user', data),
  addStore:     (data)   => api.post('/admin/add-store', data),
  getUsers:     (params) => api.get('/admin/users', { params }),
  getStores:    (params) => api.get('/admin/stores', { params }),
  getUserById:  (id)     => api.get(`/admin/user/${id}`),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getStores:      (params) => api.get('/stores', { params }),
  submitRating:   (data)   => api.post('/ratings', data),
  updateRating:   (id, data) => api.put(`/ratings/${id}`, data),
  updatePassword: (data)   => api.put('/user/update-password', data),
};

// ─── Store Owner ──────────────────────────────────────────────────────────────
export const storeOwnerAPI = {
  getDashboard:   ()     => api.get('/store-owner/dashboard'),
  updatePassword: (data) => api.put('/store-owner/update-password', data),
};

export default api;
