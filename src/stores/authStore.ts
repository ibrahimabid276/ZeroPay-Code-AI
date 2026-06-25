"use client";

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  profileImage: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'zeropay-auth-token';

function loadToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {}
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  accessToken: loadToken(),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    saveToken(token);
    set({ accessToken: token });
  },
  setLoading: (loading) => set({ isLoading: loading }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await res.json();
      set({ user: data.user, isLoading: false, isAuthenticated: true });
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string, name?: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await res.json();
      set({ user: data.user, isLoading: false, isAuthenticated: true });
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors during logout
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
    saveToken(null);
  },

  checkAuth: async () => {
    const token = get().accessToken;
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
        saveToken(null);
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
