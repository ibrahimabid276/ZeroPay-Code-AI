"use client";

import { create } from "zustand";
import { ServerProcess, ServerStatus, TerminalLine, ProjectDetection, ProjectType, PackageManager } from "@/types";
import { useProjectStore } from "./projectStore";
import { v4 as uuid } from "uuid";

interface ServerState {
  server: ServerProcess | null;
  setServer: (server: ServerProcess | null) => void;
  updateStatus: (status: ServerStatus) => void;
  addLog: (content: string, type?: TerminalLine["type"]) => void;
  clearLogs: () => void;
  startServer: () => Promise<void>;
  stopServer: () => Promise<void>;
  restartServer: () => Promise<void>;
  detectProjectType: () => Promise<ProjectDetection>;
}

export const useServerStore = create<ServerState>((set, get) => ({
  server: null,

  setServer: (server) => set({ server }),

  updateStatus: (status) =>
    set((s) => ({
      server: s.server ? { ...s.server, status } : null,
    })),

  addLog: (content, type = "output") =>
    set((s) => ({
      server: s.server
        ? {
            ...s.server,
            logs: [...s.server.logs, { id: uuid(), content, type, timestamp: Date.now() }],
          }
        : null,
    })),

  clearLogs: () =>
    set((s) => ({
      server: s.server ? { ...s.server, logs: [] } : null,
    })),

  detectProjectType: async () => {
    const project = useProjectStore.getState().currentProject;
    if (!project) {
      return {
        type: "unknown" as ProjectType,
        packageManager: "npm" as PackageManager,
        startCommand: "npm run dev",
        defaultPort: 3000,
        hasDevScript: false,
      };
    }

    try {
      const res = await fetch(`/api/server/detect?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        return data.detection;
      }
    } catch (e) {
      console.error("Failed to detect project type:", e);
    }

    return {
      type: "unknown" as ProjectType,
      packageManager: "npm" as PackageManager,
      startCommand: "npm run dev",
      defaultPort: 3000,
      hasDevScript: false,
    };
  },

  startServer: async () => {
    const project = useProjectStore.getState().currentProject;
    if (!project) return;

    const detection = await get().detectProjectType();
    
    set({
      server: {
        projectId: project.id,
        status: "starting",
        port: null,
        previewUrl: null,
        command: detection.startCommand,
        logs: [],
        error: null,
        startedAt: null,
      },
    });

    get().addLog(`Detecting project type...`);
    get().addLog(`Project type: ${detection.type}`);
    get().addLog(`Package manager: ${detection.packageManager}`);
    get().addLog(`Starting server with: ${detection.startCommand}`);
    get().addLog("");

    try {
      const res = await fetch("/api/server/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          command: detection.startCommand,
          port: detection.defaultPort,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        set((s) => ({
          server: s.server
            ? {
                ...s.server,
                status: "running",
                port: data.port,
                previewUrl: data.previewUrl,
                startedAt: Date.now(),
                processId: data.processId,
              }
            : null,
        }));
        get().addLog(`✓ Server started successfully`);
        get().addLog(`Preview URL: ${data.previewUrl}`);
      } else {
        const error = await res.json();
        set((s) => ({
          server: s.server
            ? {
                ...s.server,
                status: "error",
                error: error.error || "Failed to start server",
              }
            : null,
        }));
        get().addLog(`✗ Error: ${error.error || "Failed to start server"}`, "error");
      }
    } catch (e: any) {
      set((s) => ({
        server: s.server
          ? {
              ...s.server,
              status: "error",
              error: e.message || "Failed to start server",
            }
          : null,
      }));
      get().addLog(`✗ Error: ${e.message || "Failed to start server"}`, "error");
    }
  },

  stopServer: async () => {
    const server = get().server;
    if (!server || !server.projectId) return;

    get().updateStatus("starting");
    get().addLog("Stopping server...");

    try {
      const res = await fetch("/api/server/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: server.projectId }),
      });

      if (res.ok) {
        set((s) => ({
          server: s.server
            ? { ...s.server, status: "stopped", port: null, previewUrl: null, processId: undefined }
            : null,
        }));
        get().addLog("✓ Server stopped");
      } else {
        get().addLog("✗ Failed to stop server", "error");
      }
    } catch (e: any) {
      get().addLog(`✗ Error: ${e.message}`, "error");
    }
  },

  restartServer: async () => {
    get().addLog("Restarting server...");
    await get().stopServer();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await get().startServer();
  },
}));
