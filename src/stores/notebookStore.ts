"use client";

import { create } from 'zustand';
import { Notebook, NotebookCell } from '@/types';
import { v4 as uuid } from 'uuid';

interface NotebookState {
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  isLoading: boolean;
  
  // Actions
  setNotebooks: (notebooks: Notebook[]) => void;
  setActiveNotebook: (notebook: Notebook | null) => void;
  setLoading: (loading: boolean) => void;
  
  // CRUD Operations
  loadNotebooks: (projectId?: string) => Promise<void>;
  createNotebook: (title: string, projectId?: string, runtimeType?: 'python' | 'nodejs' | 'bash') => Promise<Notebook | null>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  
  // Cell Operations
  addCell: (notebookId: string, cell: Partial<NotebookCell>) => Promise<void>;
  updateCell: (notebookId: string, cellId: string, updates: Partial<NotebookCell>) => Promise<void>;
  deleteCell: (notebookId: string, cellId: string) => Promise<void>;
  moveCell: (notebookId: string, cellId: string, direction: 'up' | 'down') => Promise<void>;
  duplicateCell: (notebookId: string, cellId: string) => Promise<void>;
  
  // Execution
  executeCell: (notebookId: string, cellId: string) => Promise<void>;
  executeAllCells: (notebookId: string) => Promise<void>;
  
  // Import/Export
  importNotebook: (content: any, title: string, projectId?: string) => Promise<Notebook | null>;
  exportNotebook: (notebookId: string) => Promise<void>;
  
  // Autosave
  saveNotebook: (notebookId: string) => Promise<void>;
}

const AUTOSAVE_DELAY = 5000;
let autosaveTimer: NodeJS.Timeout | null = null;

export const useNotebookStore = create<NotebookState>((set, get) => ({
  notebooks: [],
  activeNotebook: null,
  isLoading: false,

  setNotebooks: (notebooks) => set({ notebooks }),
  setActiveNotebook: (notebook) => set({ activeNotebook: notebook }),
  setLoading: (loading) => set({ isLoading: loading }),

  loadNotebooks: async (projectId) => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const url = projectId 
        ? `/api/notebooks?projectId=${projectId}`
        : '/api/notebooks';
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        set({ notebooks: data.notebooks || [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load notebooks error:', error);
      set({ isLoading: false });
    }
  },

  createNotebook: async (title, projectId, runtimeType = 'python') => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch('/api/notebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ title, projectId, runtimeType }),
      });

      if (res.ok) {
        const data = await res.json();
        const notebook = data.notebook;
        set((s) => ({
          notebooks: [...s.notebooks, notebook],
          activeNotebook: notebook,
        }));
        return notebook;
      }
    } catch (error) {
      console.error('Create notebook error:', error);
    }
    return null;
  },

  updateNotebook: async (id, updates) => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch(`/api/notebooks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.notebook;
        set((s) => ({
          notebooks: s.notebooks.map((nb) => nb.id === id ? updated : nb),
          activeNotebook: s.activeNotebook?.id === id ? updated : s.activeNotebook,
        }));
      }
    } catch (error) {
      console.error('Update notebook error:', error);
    }
  },

  deleteNotebook: async (id) => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch(`/api/notebooks/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        set((s) => ({
          notebooks: s.notebooks.filter((nb) => nb.id !== id),
          activeNotebook: s.activeNotebook?.id === id ? null : s.activeNotebook,
        }));
      }
    } catch (error) {
      console.error('Delete notebook error:', error);
    }
  },

  addCell: async (notebookId, cellData) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    const newCell: NotebookCell = {
      id: uuid(),
      type: cellData.type || 'code',
      language: cellData.language || (notebook.runtimeType === 'python' ? 'python' : 'javascript'),
      content: cellData.content || '',
      ...cellData,
    };

    const updated = {
      ...notebook,
      cells: [...notebook.cells, newCell],
      updatedAt: Date.now(),
    };

    set((s) => ({
      notebooks: s.notebooks.map((nb) => nb.id === notebookId ? updated : nb),
      activeNotebook: s.activeNotebook?.id === notebookId ? updated : s.activeNotebook,
    }));

    // Debounced autosave
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      get().saveNotebook(notebookId);
    }, AUTOSAVE_DELAY);
  },

  updateCell: async (notebookId, cellId, updates) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    const updated = {
      ...notebook,
      cells: notebook.cells.map((cell) =>
        cell.id === cellId ? { ...cell, ...updates } : cell
      ),
      updatedAt: Date.now(),
    };

    set((s) => ({
      notebooks: s.notebooks.map((nb) => nb.id === notebookId ? updated : nb),
      activeNotebook: s.activeNotebook?.id === notebookId ? updated : s.activeNotebook,
    }));
  },

  deleteCell: async (notebookId, cellId) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    const updated = {
      ...notebook,
      cells: notebook.cells.filter((cell) => cell.id !== cellId),
      updatedAt: Date.now(),
    };

    set((s) => ({
      notebooks: s.notebooks.map((nb) => nb.id === notebookId ? updated : nb),
      activeNotebook: s.activeNotebook?.id === notebookId ? updated : s.activeNotebook,
    }));

    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      get().saveNotebook(notebookId);
    }, AUTOSAVE_DELAY);
  },

  moveCell: async (notebookId, cellId, direction) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    const index = notebook.cells.findIndex((c) => c.id === cellId);
    if (index === -1) return;

    const newCells = [...notebook.cells];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= newCells.length) return;

    [newCells[index], newCells[swapIndex]] = [newCells[swapIndex], newCells[index]];

    const updated = {
      ...notebook,
      cells: newCells,
      updatedAt: Date.now(),
    };

    set((s) => ({
      notebooks: s.notebooks.map((nb) => nb.id === notebookId ? updated : nb),
      activeNotebook: s.activeNotebook?.id === notebookId ? updated : s.activeNotebook,
    }));
  },

  duplicateCell: async (notebookId, cellId) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    const cell = notebook.cells.find((c) => c.id === cellId);
    if (!cell) return;

    const index = notebook.cells.findIndex((c) => c.id === cellId);
    const newCell = { ...cell, id: uuid(), output: undefined, executionCount: 0 };

    const newCells = [...notebook.cells];
    newCells.splice(index + 1, 0, newCell);

    const updated = {
      ...notebook,
      cells: newCells,
      updatedAt: Date.now(),
    };

    set((s) => ({
      notebooks: s.notebooks.map((nb) => nb.id === notebookId ? updated : nb),
      activeNotebook: s.activeNotebook?.id === notebookId ? updated : s.activeNotebook,
    }));
  },

  executeCell: async (notebookId, cellId) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    const cell = notebook.cells.find((c) => c.id === cellId);
    if (!cell || !cell.content) return;

    // Mark cell as running
    await get().updateCell(notebookId, cellId, { isRunning: true });

    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch(`/api/notebooks/${notebookId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          cellId,
          code: cell.content,
          language: cell.language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await get().updateCell(notebookId, cellId, {
          isRunning: false,
          output: data.output || [],
          executionCount: (cell.executionCount || 0) + 1,
          executedAt: Date.now(),
        });
      } else {
        await get().updateCell(notebookId, cellId, { isRunning: false });
      }
    } catch (error) {
      console.error('Execute cell error:', error);
      await get().updateCell(notebookId, cellId, { isRunning: false });
    }
  },

  executeAllCells: async (notebookId) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    for (const cell of notebook.cells) {
      if (cell.type === 'code') {
        await get().executeCell(notebookId, cell.id);
      }
    }
  },

  importNotebook: async (content, title, projectId) => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch('/api/notebooks/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ content, title, projectId }),
      });

      if (res.ok) {
        const data = await res.json();
        const notebook = data.notebook;
        set((s) => ({
          notebooks: [...s.notebooks, notebook],
          activeNotebook: notebook,
        }));
        return notebook;
      }
    } catch (error) {
      console.error('Import notebook error:', error);
    }
    return null;
  },

  exportNotebook: async (notebookId) => {
    try {
      const token = localStorage.getItem('zeropay-auth-token');
      const res = await fetch(`/api/notebooks/${notebookId}/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${notebookId}.ipynb`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export notebook error:', error);
    }
  },

  saveNotebook: async (notebookId) => {
    const notebook = get().notebooks.find((nb) => nb.id === notebookId);
    if (!notebook) return;

    try {
      const token = localStorage.getItem('zeropay-auth-token');
      await fetch(`/api/notebooks/${notebookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          cells: notebook.cells,
          metadata: notebook.metadata,
        }),
      });
    } catch (error) {
      console.error('Save notebook error:', error);
    }
  },
}));
