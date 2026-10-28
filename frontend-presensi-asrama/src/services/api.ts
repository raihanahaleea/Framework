import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Disesuaikan dengan URL backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error respons
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired atau tidak valid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Bisa redirect ke halaman login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
