"use client";

import { create } from "zustand";
import { ViewMode, PreviewMode, ActiveSidebar } from "@/types";

const UI_STATE_KEY = "opencode-ui-state";

interface PersistedUIState {
  fileExplorerOpen: boolean;
  chatOpen: boolean;
  terminalOpen: boolean;
  previewOpen: boolean;
  viewMode: ViewMode;
  previewMode: PreviewMode;
  activeSidebar: ActiveSidebar;
}

/** Load persisted UI state */
function loadUIState(): PersistedUIState {
  try {
    const stored = localStorage.getItem(UI_STATE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { 
    fileExplorerOpen: true, 
    chatOpen: true, 
    terminalOpen: false,
    previewOpen: false,
    viewMode: "editor",
    previewMode: "desktop",
    activeSidebar: "explorer"
  };
}

/** Save UI state */
function saveUIState(state: PersistedUIState) {
  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(state));
  } catch {}
}

interface UIState {
  fileExplorerOpen: boolean;
  chatOpen: boolean;
  terminalOpen: boolean;
  previewOpen: boolean;
  viewMode: ViewMode;
  previewMode: PreviewMode;
  activeSidebar: ActiveSidebar;
  toggleFileExplorer: () => void;
  toggleChat: () => void;
  toggleTerminal: () => void;
  togglePreview: () => void;
  setActiveSidebar: (sidebar: ActiveSidebar) => void;
  setFileExplorerOpen: (v: boolean) => void;
  setChatOpen: (v: boolean) => void;
  setTerminalOpen: (v: boolean) => void;
  setPreviewOpen: (v: boolean) => void;
  setViewMode: (v: ViewMode) => void;
  setPreviewMode: (v: PreviewMode) => void;
}

const persisted = loadUIState();

export const useUIStore = create<UIState>((set) => ({
  fileExplorerOpen: persisted.fileExplorerOpen,
  chatOpen: persisted.chatOpen,
  terminalOpen: persisted.terminalOpen,
  previewOpen: persisted.previewOpen,
  viewMode: persisted.viewMode,
  previewMode: persisted.previewMode,
  activeSidebar: persisted.activeSidebar,

  toggleFileExplorer: () =>
    set((s) => {
      const next = { ...s, fileExplorerOpen: !s.fileExplorerOpen };
      saveUIState(next);
      return { fileExplorerOpen: next.fileExplorerOpen };
    }),

  toggleChat: () =>
    set((s) => {
      const next = { ...s, chatOpen: !s.chatOpen };
      saveUIState(next);
      return { chatOpen: next.chatOpen };
    }),

  toggleTerminal: () =>
    set((s) => {
      const next = { ...s, terminalOpen: !s.terminalOpen };
      saveUIState(next);
      return { terminalOpen: next.terminalOpen };
    }),

  setFileExplorerOpen: (v) =>
    set((s) => {
      const next = { ...s, fileExplorerOpen: v };
      saveUIState(next);
      return { fileExplorerOpen: v };
    }),

  setChatOpen: (v) =>
    set((s) => {
      const next = { ...s, chatOpen: v };
      saveUIState(next);
      return { chatOpen: v };
    }),

  setTerminalOpen: (v) =>
    set((s) => {
      const next = { ...s, terminalOpen: v };
      saveUIState(next);
      return { terminalOpen: v };
    }),

  togglePreview: () =>
    set((s) => {
      const next = { ...s, previewOpen: !s.previewOpen };
      saveUIState(next);
      return { previewOpen: next.previewOpen };
    }),

  setPreviewOpen: (v) =>
    set((s) => {
      const next = { ...s, previewOpen: v };
      saveUIState(next);
      return { previewOpen: v };
    }),

  setViewMode: (v) =>
    set((s) => {
      const next = { ...s, viewMode: v };
      saveUIState(next);
      return { viewMode: v };
    }),

  setPreviewMode: (v) =>
    set((s) => {
      const next = { ...s, previewMode: v };
      saveUIState(next);
      return { previewMode: v };
    }),

  setActiveSidebar: (sidebar) =>
    set((s) => {
      const nextActive = s.activeSidebar === sidebar ? null : sidebar;
      const next = { 
        ...s, 
        activeSidebar: nextActive,
        fileExplorerOpen: nextActive === 'explorer'
      };
      saveUIState(next);
      return { 
        activeSidebar: nextActive,
        fileExplorerOpen: next.fileExplorerOpen
      };
    }),
}));
