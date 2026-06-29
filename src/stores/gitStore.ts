"use client";

import { create } from "zustand";

export interface GitFileChange {
  path: string;
  filename: string;
  status: "modified" | "added" | "deleted" | "untracked" | "conflicted";
  staged: boolean;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
}

export interface GitState {
  currentBranch: string;
  changes: GitFileChange[];
  stagedChanges: GitFileChange[];
  commits: GitCommit[];
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  githubUser: { login: string; avatar: string } | null;

  // Actions
  loadStatus: () => Promise<void>;
  stageFile: (path: string) => Promise<void>;
  stageAll: () => Promise<void>;
  unstageFile: (path: string) => Promise<void>;
  unstageAll: () => Promise<void>;
  commit: (message: string) => Promise<void>;
  push: () => Promise<void>;
  pull: () => Promise<void>;
  loadCommits: (limit?: number) => Promise<void>;
  getDiff: (path: string) => Promise<string>;
  authenticateGitHub: () => Promise<void>;
  logoutGitHub: () => void;
  resolveConflict: (path: string, choice: "ours" | "theirs") => Promise<void>;
}

export const useGitStore = create<GitState>((set, get) => ({
  currentBranch: "main",
  changes: [],
  stagedChanges: [],
  commits: [],
  isLoading: false,
  error: null,
  isAuthenticated: false,
  githubUser: null,

  loadStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      const res = await fetch(`/api/git/status?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        set({
          currentBranch: data.branch || "main",
          changes: data.changes || [],
          stagedChanges: data.stagedChanges || [],
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  stageFile: async (path: string) => {
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      await fetch("/api/git/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, path }),
      });

      await get().loadStatus();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  stageAll: async () => {
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      await fetch("/api/git/stage-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      await get().loadStatus();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  unstageFile: async (path: string) => {
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      await fetch("/api/git/unstage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, path }),
      });

      await get().loadStatus();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  unstageAll: async () => {
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      await fetch("/api/git/unstage-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      await get().loadStatus();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  commit: async (message: string) => {
    set({ isLoading: true, error: null });
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      const res = await fetch("/api/git/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, message }),
      });

      if (res.ok) {
        await get().loadStatus();
        await get().loadCommits(10);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  push: async () => {
    set({ isLoading: true, error: null });
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      const res = await fetch("/api/git/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Push failed");
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  pull: async () => {
    set({ isLoading: true, error: null });
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      const res = await fetch("/api/git/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Pull failed");
      }

      await get().loadStatus();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadCommits: async (limit = 20) => {
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      const res = await fetch(`/api/git/commits?projectId=${project.id}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        set({ commits: data.commits || [] });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getDiff: async (path: string) => {
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return "";

      const res = await fetch(
        `/api/git/diff?projectId=${project.id}&path=${encodeURIComponent(path)}`
      );
      if (res.ok) {
        const data = await res.json();
        return data.diff || "";
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
    return "";
  },

  authenticateGitHub: async () => {
    try {
      // Redirect to GitHub OAuth
      window.location.href = "/api/github/auth";
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  logoutGitHub: () => {
    set({ isAuthenticated: false, githubUser: null });
  },

  resolveConflict: async (path: string, choice: "ours" | "theirs") => {
    try {
      const { useProjectStore } = await import("@/stores/projectStore");
      const project = useProjectStore.getState().currentProject;
      if (!project) return;

      await fetch("/api/git/resolve-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, path, choice }),
      });

      await get().loadStatus();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
