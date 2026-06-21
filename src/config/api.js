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

let consecutiveNetworkFailures = 0;
const FAILURE_THRESHOLD = 2;

api.interceptors.response.use(
    (response) => {
        consecutiveNetworkFailures = 0;
        return response;
    },
    (error) => {
        const originalRequestUrl = error.config?.url;
        const isMockToken = localStorage.getItem('token') === 'mock.jwt.token';
        const status = error.response?.status;
        
        // Detect backend truly unreachable:
        // 1) No response at all (raw network error / timeout)
        // 2) Gateway/proxy errors (500, 502, 503, 504)
        //    Vite dev proxy returns 500 when upstream backend is down
        const isNetworkError = !error.response && error.request;
        const isProxyError = status >= 500;

        if (isNetworkError || isProxyError) {
            consecutiveNetworkFailures++;
            if (consecutiveNetworkFailures >= FAILURE_THRESHOLD) {
                window.dispatchEvent(new Event('backend-down'));
            }
        } else {
            // A successful HTTP error (4xx) means the backend IS responding
            consecutiveNetworkFailures = 0;
        }

        if (status === 401 && !originalRequestUrl.includes('/login') && !isMockToken) {
            localStorage.removeItem('token');
            window.location.href = '/logowanie';
        }
        return Promise.reject(error);
    }
);

export default api;