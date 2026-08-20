import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../api/axios';
import { isTokenExpired } from '../utils/jwt';

const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // The 1-day expiry lives inside the JWT itself (see JwtUtil on the
    // backend) - if it's already expired, don't resurrect the session just
    // because localStorage still has it lying around.
    if (isTokenExpired(parsed.token)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  // Keeps multiple tabs in sync: logging out in one tab logs out the others too.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === AUTH_STORAGE_KEY) {
        setAuth(readStoredAuth());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback((authResponse) => {
    // authResponse is AuthResponseDto: { token, role, email }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authResponse));
    setAuth(authResponse);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  const value = useMemo(
    () => ({
      token: auth?.token ?? null,
      role: auth?.role ?? null,
      email: auth?.email ?? null,
      isAuthenticated: Boolean(auth?.token) && !isTokenExpired(auth?.token),
      login,
      logout,
    }),
    [auth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
