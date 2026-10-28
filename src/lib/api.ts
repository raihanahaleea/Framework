import axios from 'axios';
import { handleMockApi } from './mockApiHandler';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for fallback to mock data when backend is not connected
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Check if error is due to backend unavailable (Network Error, 502, 503, 504, or 404 on API)
    const isNetworkOrOffline =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      [502, 503, 504].includes(error.response?.status) ||
      (error.response?.status === 404 && config?.url?.startsWith('/api') || !error.response?.data?.message);

    if (isNetworkOrOffline && config) {
      console.warn(`[API Offline Fallback] Serving mock response for ${config.method?.toUpperCase()} ${config.url}`);
      try {
        let reqData = config.data;
        if (typeof reqData === 'string' && reqData.startsWith('{')) {
          try {
            reqData = JSON.parse(reqData);
          } catch {}
        }
        const mockResult = await handleMockApi(config.url || '', config.method || 'GET', reqData, config.params);
        return {
          data: mockResult.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      } catch (mockErr: any) {
        return Promise.reject(mockErr);
      }
    }

    if (error.response?.status === 401) {
      const token = sessionStorage.getItem('accessToken');
      if (token && token.startsWith('mock-')) {
        // If it's a mock token, don't clear unless intentional
        return Promise.reject(error);
      }

      // Try refresh token for real backend
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          sessionStorage.setItem('accessToken', accessToken);
          sessionStorage.setItem('refreshToken', newRefreshToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api(error.config);
        } catch {
          sessionStorage.clear();
          window.location.href = '/login';
        }
      } else {
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
