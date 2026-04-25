import axios from 'axios';

const api = axios.create({
  // Automatically use the Vercel env variable if deployed, otherwise fallback to local backend
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', 
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired / invalid token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: new_refresh_token } = response.data;
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', new_refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, check if we should redirect
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/signup') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
