import axios from 'axios';

// Dynamic API URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('hospitalUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

export const userAPI = {
  getAllUsers: () => api.get('/api/users'),
  getUser: (userId) => api.get(`/api/users/${userId}`),
};

export const departmentAPI = {
  getDepartments: () => api.get('/api/departments'),
};

// Health check
export const healthCheck = () => api.get('/api/health');

export default api;