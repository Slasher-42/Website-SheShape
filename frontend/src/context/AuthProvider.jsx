import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { AuthContext } from './auth-context.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadSession = async () => {
      try {
        const response = await api.get('/auth/me', { signal: controller.signal });
        if (!controller.signal.aborted) setUser(response.data.data);
      } catch {
        if (!controller.signal.aborted) setUser(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadSession();

    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    setUser(response.data.data);
    return response.data.data;
  }, []);

  const register = useCallback(async (details) => {
    const response = await api.post('/auth/register', details);
    setUser(response.data.data);
    return response.data.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
