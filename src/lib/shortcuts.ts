"use client";

import { useEffect, useCallback } from "react";

export interface Shortcut {
  id: string;
  label: string;
  shortcut: string;
  category: "editor" | "ide" | "navigation";
  handler: () => void;
  enabled?: boolean;
}

/**
 * Global keyboard shortcuts registry for ZeroPay Code AI IDE.
 * Manages all keyboard shortcuts in one place with proper priority handling.
 */
export const SHORTCUT_REGISTRY: Omit<Shortcut, "handler">[] = [
  // Editor shortcuts
  {
    id: "save",
    label: "Save File",
    shortcut: "Ctrl+S",
    category: "editor",
  },
  {
    id: "undo",
    label: "Undo",
    shortcut: "Ctrl+Z",
    category: "editor",
  },
  {
    id: "redo",
    label: "Redo",
    shortcut: "Ctrl+Shift+Z",
    category: "editor",
  },
  {
    id: "toggle-comment",
    label: "Toggle Line Comment",
    shortcut: "Ctrl+/",
    category: "editor",
  },
  {
    id: "select-next",
    label: "Select Next Occurrence",
    shortcut: "Ctrl+D",
    category: "editor",
  },
  {
    id: "move-line-up",
    label: "Move Line Up",
    shortcut: "Alt+Up",
    category: "editor",
  },
  {
    id: "move-line-down",
    label: "Move Line Down",
    shortcut: "Alt+Down",
    category: "editor",
  },
  {
    id: "delete-line",
    label: "Delete Line",
    shortcut: "Ctrl+Shift+K",
    category: "editor",
  },
  {
    id: "inline-chat",
    label: "AI Inline Chat",
    shortcut: "Ctrl+K Ctrl+I",
    category: "editor",
  },

  // IDE shortcuts
  {
    id: "quick-open",
    label: "Quick File Open",
    shortcut: "Ctrl+P",
    category: "ide",
  },
  {
    id: "command-palette",
    label: "Command Palette",
    shortcut: "Ctrl+Shift+P",
    category: "ide",
  },
  {
    id: "toggle-terminal",
    label: "Toggle Terminal",
    shortcut: "Ctrl+`",
    category: "ide",
  },
  {
    id: "toggle-sidebar",
    label: "Toggle Sidebar",
    shortcut: "Ctrl+B",
    category: "navigation",
  },
  {
    id: "focus-explorer",
    label: "Focus File Explorer",
    shortcut: "Ctrl+Shift+E",
    category: "navigation",
  },
  {
    id: "focus-search",
    label: "Global Search",
    shortcut: "Ctrl+Shift+F",
    category: "navigation",
  },
  {
    id: "focus-git",
    label: "Focus Source Control",
    shortcut: "Ctrl+Shift+G",
    category: "navigation",
  },
  {
    id: "focus-chat",
    label: "Focus AI Chat",
    shortcut: "Ctrl+L",
    category: "navigation",
  },
  {
    id: "show-shortcuts",
    label: "Show Keyboard Shortcuts",
    shortcut: "Ctrl+Shift+?",
    category: "ide",
  },
];

/**
 * Hook to register and manage keyboard shortcuts globally.
 * Handles modifier keys, prevents conflicts, and ensures proper cleanup.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in input/textarea unless it's a specific shortcut
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      const isContentEditable = target.contentEditable === "true";

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const matches = matchShortcut(shortcut.shortcut, e);
        if (matches) {
          // Allow Ctrl+P, Ctrl+Shift+P even in inputs for quick open
          const allowInInput = ["Ctrl+P", "Ctrl+Shift+P", "Ctrl+Shift+?"].includes(shortcut.shortcut);
          
          if (!isInput || !isContentEditable || allowInInput) {
            e.preventDefault();
            shortcut.handler();
            break; // Only handle one shortcut per keypress
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Parse and match a keyboard shortcut string against a KeyboardEvent.
 */
function matchShortcut(shortcut: string, e: KeyboardEvent): boolean {
  const parts = shortcut.split(" ").filter(Boolean);
  
  // Handle chord shortcuts (e.g., "Ctrl+K Ctrl+I")
  if (parts.length > 1) {
    // For now, we'll handle simple chord detection
    // Advanced chord handling would require state management
    return false;
  }

  const keys = parts[0].split("+").map((k) => k.trim().toLowerCase());
  
  const hasCtrl = keys.includes("ctrl");
  const hasShift = keys.includes("shift");
  const hasAlt = keys.includes("alt");
  const hasMeta = keys.includes("meta");

  // Check modifiers
  if (hasCtrl && !(e.ctrlKey || e.metaKey)) return false;
  if (hasShift && !e.shiftKey) return false;
  if (hasAlt && !e.altKey) return false;
  if (hasMeta && !e.metaKey) return false;

  // Check main key
  const mainKey = keys.find(
    (k) => !["ctrl", "shift", "alt", "meta"].includes(k)
  );

  if (!mainKey) return false;

  // Handle special keys
  const keyMap: Record<string, string> = {
    "`": "Backquote",
    "/": "Slash",
    "?": "Slash", // Ctrl+Shift+? is actually Ctrl+Shift+/
  };

  const expectedKey = keyMap[mainKey] || mainKey;
  const actualKey = e.key.length === 1 ? e.key.toLowerCase() : e.code;

  return (
    actualKey === expectedKey.toLowerCase() ||
    e.code.toLowerCase() === expectedKey.toLowerCase()
  );
}

/**
 * Format shortcut for display (platform-aware).
 */
export function formatShortcut(shortcut: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  
  return shortcut
    .replace(/Ctrl/g, isMac ? "⌘" : "Ctrl")
    .replace(/Shift/g, isMac ? "⇧" : "Shift")
    .replace(/Alt/g, isMac ? "⌥" : "Alt")
    .replace(/Meta/g, isMac ? "⌘" : "Win");
}

/**
 * Get shortcuts by category.
 */
export function getShortcutsByCategory(category: Shortcut["category"]) {
  return SHORTCUT_REGISTRY.filter((s) => s.category === category);
}
