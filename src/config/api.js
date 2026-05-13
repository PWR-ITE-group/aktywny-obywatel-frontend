import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequestUrl = error.config?.url;
        if (error.response?.status === 401 && !originalRequestUrl.includes('/login')) {
            localStorage.removeItem('token');
            window.location.href = '/logowanie';
        }
        return Promise.reject(error);
    }
);

export default api;