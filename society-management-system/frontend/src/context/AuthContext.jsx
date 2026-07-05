import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '../api/endpoints';

const AuthContext = createContext(null);

const persistSession = (token, user) => {
  localStorage.setItem('sms_token', token);
  localStorage.setItem('sms_user', JSON.stringify(user));
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem('sms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('sms_token');
      localStorage.removeItem('sms_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    const { data } = await api.login({ email, password });
    persistSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  // Admin flow: creates a brand new society and becomes its admin immediately.
  const createSociety = async (payload) => {
    const { data } = await api.registerSociety(payload);
    persistSession(data.token, data.user);
    setUser(data.user);
    return data;
  };

  // Resident flow: requests to join an existing society by its code; no session
  // is created until an admin approves the account.
  const joinSociety = async (payload) => {
    const { data } = await api.registerJoinRequest(payload);
    return data;
  };

  // Continue with Google — the credential is the ID token from Google Identity
  // Services. `extra` carries { intent: 'create'|'join', societyName, societyCode, ... }
  // only when this is a brand-new sign-up.
  const loginWithGoogle = async (credential, extra = {}) => {
    const { data } = await api.googleAuth({ credential, ...extra });
    if (data.token) {
      persistSession(data.token, data.user);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await api.getMe();
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, createSociety, joinSociety, loginWithGoogle, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
