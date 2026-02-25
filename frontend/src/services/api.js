import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Clean up any trailing slashes or /api provided by the user in the ENV
if (API_URL.endsWith('/api')) API_URL = API_URL.replace(/\/api$/, '');
if (API_URL.endsWith('/')) API_URL = API_URL.replace(/\/$/, '');

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Attach JWT token to every request and enforce /api prefix
api.interceptors.request.use((config) => {
    // Ensure all backend paths include the /api prefix (Axios URL overriding fix)
    if (config.url && !config.url.startsWith('/api')) {
        config.url = `/api${config.url.startsWith('/') ? config.url : '/' + config.url}`;
    }

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
