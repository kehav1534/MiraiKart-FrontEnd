import axios from 'axios';

export const AUTH_STORAGE_KEY = 'luxe_auth';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9956';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Attach the bearer token to every outgoing request, if we have one.
api.interceptors.request.use((config) => {
  const auth = getStoredAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// A session can go bad mid-conversation - the 1-day token expires, or the
// server rejects it for any other reason. Either way, the frontend has no
// business staying "logged in" once the API says the token is no good, so
// we clear the stored session and bounce to /login immediately. A full
// page redirect (rather than react-router navigate) is used deliberately:
// this interceptor runs outside the React tree, and a hard redirect
// guarantees every in-memory auth state gets reset along with it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?sessionExpired=1';
      }
    }
    return Promise.reject(error);
  }
);
