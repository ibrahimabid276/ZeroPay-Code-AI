"use client";

import { create } from 'zustand';

interface Settings {
  id?: string;
  userId?: string;
  theme: string;
  language: string;
  editorFontSize: number;
  editorTabSize: number;
  wordWrap: boolean;
  aiModel: string;
  autoSave: boolean;
  autoSaveDelay: number;
}

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  
  setSettings: (settings: Settings) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,

  setSettings: (settings) => set({ settings }),

  updateSetting: async (key, value) => {
    const current = get().settings;
    if (!current) return;

    // Optimistic update
    const updated = { ...current, [key]: value };
    set({ settings: updated });

    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch('/api/settings/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) {
        // Revert on failure
        set({ settings: current });
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Update setting error:', error);
    }
  },

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch('/api/settings/user', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        set({ settings: data.settings, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load settings error:', error);
      set({ isLoading: false });
    }
  },
}));
