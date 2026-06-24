"use client";

import { create } from "zustand";
import { EditorTab } from "@/types";

const EDITOR_TABS_KEY = "opencode-editor-tabs";
const ACTIVE_TAB_KEY = "opencode-active-tab";

/** Load persisted editor tabs from localStorage */
function loadEditorTabs(): EditorTab[] {
  try {
    const stored = localStorage.getItem(EDITOR_TABS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Mark all loaded tabs as not dirty (they were saved)
        return parsed.map((t: EditorTab) => ({ ...t, isDirty: false }));
      }
    }
  } catch {}
  return [];
}

/** Save editor tabs to localStorage */
function saveEditorTabs(tabs: EditorTab[]) {
  try {
    // Only persist metadata, not full content (content is saved to server)
    const toSave = tabs.map((t) => ({
      id: t.id,
      fileName: t.fileName,
      filePath: t.filePath,
      language: t.language,
      content: t.content,
      isDirty: false,
    }));
    localStorage.setItem(EDITOR_TABS_KEY, JSON.stringify(toSave));
  } catch {}
}

/** Load persisted active tab ID */
function loadActiveTabId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TAB_KEY);
  } catch {
    return null;
  }
}

/** Save active tab ID */
function saveActiveTabId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_TAB_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_TAB_KEY);
    }
  } catch {}
}

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
  setActiveTab: (id: string) => void;
  openTab: (tab: Omit<EditorTab, "id" | "isDirty"> & { id?: string }) => void;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepId: string) => void;
  updateTabContent: (id: string, content: string) => void;
  markTabSaved: (id: string) => void;
}

let tabCounter = 0;

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: loadEditorTabs(),
  activeTabId: loadActiveTabId(),

  setActiveTab: (id) => {
    set({ activeTabId: id });
    saveActiveTabId(id);
  },

  openTab: (tab) => {
    const existing = get().tabs.find((t) => t.filePath === tab.filePath);
    if (existing) {
      set({ activeTabId: existing.id });
      saveActiveTabId(existing.id);
      return;
    }
    const newTab: EditorTab = {
      id: tab.id || `tab-${++tabCounter}-${Date.now()}`,
      fileName: tab.fileName,
      filePath: tab.filePath,
      language: tab.language,
      content: tab.content,
      isDirty: false,
    };
    set((s) => {
      const updated = [...s.tabs, newTab];
      saveEditorTabs(updated);
      saveActiveTabId(newTab.id);
      return { tabs: updated, activeTabId: newTab.id };
    });
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex((t) => t.id === id);
    const newTabs = tabs.filter((t) => t.id !== id);
    let newActive = activeTabId;
    if (activeTabId === id) {
      if (newTabs.length === 0) {
        newActive = null;
      } else if (idx >= newTabs.length) {
        newActive = newTabs[newTabs.length - 1].id;
      } else {
        newActive = newTabs[idx].id;
      }
    }
    set({ tabs: newTabs, activeTabId: newActive });
    saveEditorTabs(newTabs);
    saveActiveTabId(newActive);
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
    saveEditorTabs([]);
    saveActiveTabId(null);
  },

  closeOtherTabs: (keepId) => {
    const tab = get().tabs.find((t) => t.id === keepId);
    const newTabs = tab ? [tab] : [];
    set({ tabs: newTabs, activeTabId: keepId });
    saveEditorTabs(newTabs);
    saveActiveTabId(keepId);
  },

  updateTabContent: (id, content) => {
    set((s) => {
      const updated = s.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: true } : t
      );
      saveEditorTabs(updated);
      return { tabs: updated };
    });
  },

  markTabSaved: (id) => {
    set((s) => {
      const updated = s.tabs.map((t) =>
        t.id === id ? { ...t, isDirty: false } : t
      );
      saveEditorTabs(updated);
      return { tabs: updated };
    });
  },
}));
