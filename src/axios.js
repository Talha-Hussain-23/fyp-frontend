import axios from "axios";
import logger, { generateUUID } from "./utils/logger";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // ✅ ADDED: Request ID for tracing
  const requestId = generateUUID();
  config.headers['X-Request-ID'] = requestId;
  
  // Attach ID to config for response correlation if needed
  config.metadata = { requestId };
  
  return config;
});

// Response interceptor to handle 401 errors and timeouts
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ✅ FIXED: Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      logger.error('Request timeout', error);
      error.message = 'Request timed out. Please check your internet connection and try again.';
    }
    
    // ✅ FIXED: Handle network errors
    if (!error.response && error.message === 'Network Error') {
      logger.error('Network error', error, { url: error.config?.url });
      error.message = 'Network error. Please check your internet connection.';
    }
    
      const originalRequest = error.config;

      // Handle token expiration
      // check url to avoid infinite loop on refresh failure
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (refreshToken) {
            const response = await instance.post('/auth/refresh', {
              refresh_token: refreshToken
            });

            if (response.data.access_token) {
              const { access_token } = response.data;
              
              localStorage.setItem('token', access_token);
              // Also update refresh token if a new one was returned (rotation)
              if (response.data.refresh_token) {
                localStorage.setItem('refresh_token', response.data.refresh_token);
              }
              
              instance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
              originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
              
              return instance(originalRequest);
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // If refresh fails, fall through to logout
        }

        // Token expired or invalid, and refresh failed or not available
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        
        // Only redirect if not already on login/signup page
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/signup"
        ) {
          window.location.href = "/login";
        }
      }
    return Promise.reject(error);
  }
);

export default instance;
