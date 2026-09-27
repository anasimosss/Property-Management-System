import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5230';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every API request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  console.log('🔐 API REQUEST:', config.url);
  console.log('🔑 TOKEN EXISTS:', !!token);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    '📨 AUTH HEADER:',
    config.headers?.Authorization ? 'PRESENT' : 'MISSING'
  );

  return config;
});

// Handle expired or invalid JWT
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;