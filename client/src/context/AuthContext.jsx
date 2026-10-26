import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'turfbook_token';
const USER_KEY = 'turfbook_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    api('/auth/me')
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const saveSession = useCallback((session) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    setToken(session.token);
    setUser(session.user);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const session = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      saveSession(session);
      return session.user;
    },
    [saveSession],
  );

  const register = useCallback(
    async (payload) => {
      const session = await api('/auth/register', {
        method: 'POST',
        body: payload,
      });
      saveSession(session);
      return session.user;
    },
    [saveSession],
  );

  const updateProfile = useCallback(async (payload) => {
    const data = await api('/auth/me', { method: 'PATCH', body: payload });
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      updateProfile,
    }),
    [token, user, loading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
