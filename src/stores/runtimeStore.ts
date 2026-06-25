"use client";

import { create } from 'zustand';
import { Runtime, RuntimeStatus } from '@/types';

interface RuntimeState {
  runtimes: Map<string, Runtime>;
  
  setRuntime: (notebookId: string, runtime: Runtime) => void;
  removeRuntime: (notebookId: string) => void;
  updateRuntimeStatus: (notebookId: string, status: RuntimeStatus) => void;
  
  startRuntime: (notebookId: string, type: 'python' | 'nodejs' | 'bash') => Promise<void>;
  stopRuntime: (notebookId: string) => Promise<void>;
  restartRuntime: (notebookId: string) => Promise<void>;
  checkRuntimeStatus: (notebookId: string) => Promise<void>;
}

export const useRuntimeStore = create<RuntimeState>((set, get) => ({
  runtimes: new Map(),

  setRuntime: (notebookId, runtime) => {
    set((s) => {
      const newRuntimes = new Map(s.runtimes);
      newRuntimes.set(notebookId, runtime);
      return { runtimes: newRuntimes };
    });
  },

  removeRuntime: (notebookId) => {
    set((s) => {
      const newRuntimes = new Map(s.runtimes);
      newRuntimes.delete(notebookId);
      return { runtimes: newRuntimes };
    });
  },

  updateRuntimeStatus: (notebookId, status) => {
    set((s) => {
      const runtime = s.runtimes.get(notebookId);
      if (!runtime) return s;
      
      const newRuntimes = new Map(s.runtimes);
      newRuntimes.set(notebookId, { ...runtime, status });
      return { runtimes: newRuntimes };
    });
  },

  startRuntime: async (notebookId, type) => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      
      get().updateRuntimeStatus(notebookId, 'starting');

      const res = await fetch('/api/runtime/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ notebookId, type }),
      });

      if (res.ok) {
        const data = await res.json();
        get().setRuntime(notebookId, data.runtime);
      } else {
        get().updateRuntimeStatus(notebookId, 'error');
      }
    } catch (error) {
      console.error('Start runtime error:', error);
      get().updateRuntimeStatus(notebookId, 'error');
    }
  },

  stopRuntime: async (notebookId) => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      
      const res = await fetch('/api/runtime/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ notebookId }),
      });

      if (res.ok) {
        get().removeRuntime(notebookId);
      }
    } catch (error) {
      console.error('Stop runtime error:', error);
    }
  },

  restartRuntime: async (notebookId) => {
    const runtime = get().runtimes.get(notebookId);
    if (!runtime) return;

    await get().stopRuntime(notebookId);
    await new Promise(resolve => setTimeout(resolve, 500));
    await get().startRuntime(notebookId, runtime.type);
  },

  checkRuntimeStatus: async (notebookId) => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      
      const res = await fetch(`/api/runtime/status?notebookId=${notebookId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        if (data.runtime) {
          get().setRuntime(notebookId, data.runtime);
        } else {
          get().removeRuntime(notebookId);
        }
      }
    } catch (error) {
      console.error('Check runtime status error:', error);
    }
  },
}));
