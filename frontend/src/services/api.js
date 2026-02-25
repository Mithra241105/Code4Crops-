import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (API_URL && !API_URL.endsWith('/api')) {
    // If the trailing slash is present, remove it before appending /api
    API_URL = `${API_URL.replace(/\/$/, '')}/api`;
}

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kr_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('kr_token');
            localStorage.removeItem('kr_user');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export default api;
