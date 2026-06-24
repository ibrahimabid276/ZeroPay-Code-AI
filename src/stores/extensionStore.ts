"use client";

import { create } from "zustand";
import { Extension, ExtensionCategory } from "@/types";
import { extensionCatalog } from "@/lib/extensions/catalog";

const INSTALLED_KEY = "zeropay-installed-extensions";
const DISABLED_KEY = "zeropay-disabled-extensions";
const SETTINGS_KEY = "zeropay-extension-settings";

interface ExtensionState {
  extensions: Extension[];
  searchQuery: string;
  selectedCategory: ExtensionCategory | 'all';
  selectedExtension: Extension | null;
  installing: Set<string>;
  updating: Set<string>;
  
  // Actions
  loadExtensions: () => void;
  searchExtensions: (query: string) => void;
  setCategory: (category: ExtensionCategory | 'all') => void;
  selectExtension: (extension: Extension | null) => void;
  installExtension: (id: string) => Promise<void>;
  uninstallExtension: (id: string) => Promise<void>;
  enableExtension: (id: string) => void;
  disableExtension: (id: string) => void;
  updateExtension: (id: string) => Promise<void>;
  checkForUpdates: () => void;
  
  // Getters
  getInstalledExtensions: () => Extension[];
  getFeaturedExtensions: () => Extension[];
  getRecommendedExtensions: () => Extension[];
  getFilteredExtensions: () => Extension[];
}

function loadInstalledExtensions(): string[] {
  try {
    const stored = localStorage.getItem(INSTALLED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveInstalledExtensions(ids: string[]) {
  localStorage.setItem(INSTALLED_KEY, JSON.stringify(ids));
}

function loadDisabledExtensions(): string[] {
  try {
    const stored = localStorage.getItem(DISABLED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDisabledExtensions(ids: string[]) {
  localStorage.setItem(DISABLED_KEY, JSON.stringify(ids));
}

export const useExtensionStore = create<ExtensionState>((set, get) => ({
  extensions: [],
  searchQuery: "",
  selectedCategory: "all",
  selectedExtension: null,
  installing: new Set(),
  updating: new Set(),

  loadExtensions: () => {
    const installed = loadInstalledExtensions();
    const disabled = loadDisabledExtensions();
    
    // Mark installed/enabled status
    const extensions = extensionCatalog.map(ext => ({
      ...ext,
      installed: installed.includes(ext.id),
      enabled: !disabled.includes(ext.id),
      installedVersion: installed.includes(ext.id) ? ext.version : undefined,
    }));

    set({ extensions });
  },

  searchExtensions: (query) => {
    set({ searchQuery: query });
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
  },

  selectExtension: (extension) => {
    set({ selectedExtension: extension });
  },

  installExtension: async (id) => {
    set((s) => ({
      installing: new Set(s.installing).add(id)
    }));

    // Simulate installation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const installed = loadInstalledExtensions();
    if (!installed.includes(id)) {
      installed.push(id);
      saveInstalledExtensions(installed);
    }

    set((s) => ({
      installing: new Set(Array.from(s.installing).filter(i => i !== id)),
      extensions: s.extensions.map(ext =>
        ext.id === id
          ? { ...ext, installed: true, enabled: true, installedVersion: ext.version }
          : ext
      )
    }));
  },

  uninstallExtension: async (id) => {
    const installed = loadInstalledExtensions();
    const filtered = installed.filter(extId => extId !== id);
    saveInstalledExtensions(filtered);

    const disabled = loadDisabledExtensions();
    const filteredDisabled = disabled.filter(extId => extId !== id);
    saveDisabledExtensions(filteredDisabled);

    set((s) => ({
      extensions: s.extensions.map(ext =>
        ext.id === id
          ? { ...ext, installed: false, enabled: false, installedVersion: undefined }
          : ext
      ),
      selectedExtension: s.selectedExtension?.id === id ? null : s.selectedExtension
    }));
  },

  enableExtension: (id) => {
    const disabled = loadDisabledExtensions();
    const filtered = disabled.filter(extId => extId !== id);
    saveDisabledExtensions(filtered);

    set((s) => ({
      extensions: s.extensions.map(ext =>
        ext.id === id ? { ...ext, enabled: true } : ext
      )
    }));
  },

  disableExtension: (id) => {
    const disabled = loadDisabledExtensions();
    if (!disabled.includes(id)) {
      disabled.push(id);
      saveDisabledExtensions(disabled);
    }

    set((s) => ({
      extensions: s.extensions.map(ext =>
        ext.id === id ? { ...ext, enabled: false } : ext
      )
    }));
  },

  updateExtension: async (id) => {
    set((s) => ({
      updating: new Set(s.updating).add(id)
    }));

    // Simulate update delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    set((s) => ({
      updating: new Set(Array.from(s.updating).filter(i => i !== id)),
      extensions: s.extensions.map(ext =>
        ext.id === id
          ? { ...ext, installedVersion: ext.latestVersion }
          : ext
      )
    }));
  },

  checkForUpdates: () => {
    // In a real app, this would check against a server
    // For now, we'll just mark extensions as needing update if version differs
    set((s) => ({
      extensions: s.extensions.map(ext =>
        ext.installed && ext.installedVersion !== ext.latestVersion
          ? { ...ext, hasUpdate: true }
          : ext
      )
    }));
  },

  getInstalledExtensions: () => {
    return get().extensions.filter(ext => ext.installed);
  },

  getFeaturedExtensions: () => {
    return get().extensions.filter(ext => 
      ext.downloadCount > 1000000 || ext.rating >= 4.5
    ).slice(0, 10);
  },

  getRecommendedExtensions: () => {
    // In a real app, this would be based on project type
    return get().extensions.filter(ext =>
      ['ai-tools', 'code-formatters', 'linters', 'productivity-tools'].includes(ext.category)
    ).slice(0, 8);
  },

  getFilteredExtensions: () => {
    const { extensions, searchQuery, selectedCategory } = get();
    
    let filtered = extensions;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ext => ext.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ext =>
        ext.displayName.toLowerCase().includes(query) ||
        ext.description.toLowerCase().includes(query) ||
        ext.publisher.toLowerCase().includes(query) ||
        ext.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  },
}));
