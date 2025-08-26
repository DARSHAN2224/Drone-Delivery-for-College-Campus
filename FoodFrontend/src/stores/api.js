// src/stores/api.js
import axios from 'axios';

// =========================
// Axios instance
// =========================
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// =========================
// Request Interceptor for Auth Token
// =========================
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// Response Interceptor for Token Refresh
// =========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    const isRefreshCall = (originalRequest.url || '').includes('/refresh-token');
    if (isRefreshCall) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const deviceId = localStorage.getItem('deviceId');

        if (!refreshToken || !deviceId) {
          throw new Error('No refresh token or device ID');
        }

        const storedUser = JSON.parse(localStorage.getItem('auth-storage') || '{}');
        const persistedRole = storedUser.state?.user?.role || storedUser.user?.role || 'user';
        
        const refreshPath =
          persistedRole === 'admin'
            ? '/admin/refresh-token'
            : persistedRole === 'seller'
            ? '/seller/refresh-token'
            : '/users/refresh-token';

        const refreshResponse = await api.post(
          refreshPath,
          { deviceId, refreshToken },
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const { accessToken } = refreshResponse.data.data || {};
        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('deviceId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;