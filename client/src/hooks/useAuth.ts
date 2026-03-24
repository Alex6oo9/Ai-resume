import { useState, useEffect } from 'react';
import api from '../utils/api';
import { AuthState, User } from '../types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    api.get<{ user: User }>('/auth/me', { signal: controller.signal })
      .then(res => setAuthState({ user: res.data.user, loading: false }))
      .catch((err: unknown) => {
        if ((err as { code?: string }).code === 'ERR_CANCELED') return; // aborted — ignore
        setAuthState({ user: null, loading: false });
      });
    return () => controller.abort();
  }, []);

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
