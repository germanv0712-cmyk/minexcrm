import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: try to restore session from stored access token
  useEffect(() => {
    const restoreSession = async () => {
      if (!tokenStore.getAccess() && !tokenStore.getRefresh()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data);
      } catch {
        tokenStore.clearAll();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for forced logout (e.g., refresh token expired)
    const onLogout = () => { setUser(null); tokenStore.clearAll(); };
    window.addEventListener('mx:logout', onLogout);
    return () => window.removeEventListener('mx:logout', onLogout);
  }, []);

  const login = useCallback(async (email, password, tenantId) => {
    const { data } = await authApi.login({ email, password, tenantId });
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout(tokenStore.getRefresh());
    } finally {
      tokenStore.clearAll();
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partial) => {
    setUser(prev => prev ? { ...prev, ...partial } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
