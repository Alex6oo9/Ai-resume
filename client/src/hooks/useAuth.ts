import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { AuthState, User } from '../types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      setAuthState({ user: res.data.user, loading: false });
    } catch {
      setAuthState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User }>('/auth/login', {
      email,
      password,
    });
    setAuthState({ user: res.data.user, loading: false });
    return res.data.user;
  };

  const register = async (email: string, password: string) => {
    const res = await api.post<{ user: User }>('/auth/register', {
      email,
      password,
    });
    setAuthState({ user: res.data.user, loading: false });
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAuthState({ user: null, loading: false });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    login,
    register,
    logout,
  };
}
