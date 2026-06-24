"use client";

import { create } from "zustand";
import { Project, FileNode } from "@/types";

const CURRENT_PROJECT_KEY = "opencode-current-project";
const PROJECTS_LIST_KEY = "opencode-projects-list";

/** Load persisted current project from localStorage */
function loadCurrentProject(): Project | null {
  try {
    const stored = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

/** Save current project to localStorage */
function saveCurrentProject(project: Project | null) {
  try {
    if (project) {
      localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(project));
    } else {
      localStorage.removeItem(CURRENT_PROJECT_KEY);
    }
  } catch {}
}

/** Load persisted projects list */
function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(PROJECTS_LIST_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

/** Save projects list to localStorage */
function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(projects));
  } catch {}
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  fileTree: FileNode[];
  selectedFileId: string | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  setSelectedFileId: (id: string | null) => void;
  refreshFileTree: () => Promise<void>;
  /** Fetch projects from server and sync with local state */
  loadProjectsFromServer: () => Promise<void>;
  /** Create a new project */
  createProject: (name: string) => Promise<Project | null>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadProjects(),
  currentProject: loadCurrentProject(),
  fileTree: [],
  selectedFileId: null,

  setProjects: (projects) => {
    set({ projects });
    saveProjects(projects);
  },

  setCurrentProject: (project) => {
    set({ currentProject: project, fileTree: [] });
    saveCurrentProject(project);
  },

  setFileTree: (tree) => set({ fileTree: tree }),
  setSelectedFileId: (id) => set({ selectedFileId: id }),

  refreshFileTree: async () => {
    const project = get().currentProject;
    if (!project) return;
    try {
      const res = await fetch(`/api/files/tree?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        set({ fileTree: data.tree || [] });
      }
    } catch (e) {
      console.error("Failed to refresh file tree:", e);
    }
  },

  loadProjectsFromServer: async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        const projects: Project[] = data.projects || [];
        set({ projects });
        saveProjects(projects);

        // If no current project, select the first one
        const current = get().currentProject;
        if (!current && projects.length > 0) {
          set({ currentProject: projects[0] });
          saveCurrentProject(projects[0]);
        } else if (current && !projects.find((p) => p.id === current.id)) {
          // Current project no longer exists on server
          set({ currentProject: projects[0] || null });
          saveCurrentProject(projects[0] || null);
        }
      }
    } catch (e) {
      console.error("Failed to load projects from server:", e);
    }
  },

  createProject: async (name: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        const project = data.project;
        if (project) {
          const updated = [...get().projects, project];
          set({ projects: updated, currentProject: project });
          saveProjects(updated);
          saveCurrentProject(project);
          return project;
        }
      }
    } catch (e) {
      console.error("Failed to create project:", e);
    }
    return null;
  },
}));
