import axios from 'axios';

const api = axios.create({
  baseURL: 'https://portfolio-vercel-bi43.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
});

// Prevent browser caching issues (optional but helpful)
api.interceptors.request.use(
  (config) => {
    // Add cache buster
    config.params = {
      ...config.params,
      _t: Date.now(),
    };

    // Attach JWT token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // IMPORTANT: avoid sending problematic headers if browser adds them
    if (config.headers) {
      delete config.headers['cache-control'];
      delete config.headers['pragma'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;