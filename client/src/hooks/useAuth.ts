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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (!axiosErr.response) {
        // Network error — server may be starting up; don't redirect, just mark not loading
        setAuthState({ user: null, loading: false });
      } else {
        // 401 or other HTTP error — definitely not authenticated
        setAuthState({ user: null, loading: false });
      }
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

  const register = async (email: string, password: string, name?: string) => {
    await api.post('/auth/register', { email, password, name });
    // No auto-login — user must verify email first
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAuthState({ user: null, loading: false });
  };

  const setUser = (user: User) => {
    setAuthState({ user, loading: false });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    login,
    register,
    logout,
    setUser,
  };
}
