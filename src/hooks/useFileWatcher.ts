"use client";

import { useEffect, useRef } from "react";
import { useServerStore } from "@/stores/serverStore";
import { useProjectStore } from "@/stores/projectStore";

/**
 * Hook to watch for file changes and trigger preview refresh
 * Polls the file tree API to detect changes
 */
export function useFileWatcher(refreshCallback: () => void) {
  const { currentProject } = useProjectStore();
  const { server } = useServerStore();
  const lastModifiedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentProject || !server || server.status !== "running") {
      return;
    }

    // Poll for file changes every 2 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/files/tree?projectId=${currentProject.id}`);
        if (res.ok) {
          const data = await res.json();
          // Calculate a simple hash of the file tree to detect changes
          const treeString = JSON.stringify(data.tree);
          const currentHash = treeString.length; // Simple change detection
          
          if (lastModifiedRef.current > 0 && currentHash !== lastModifiedRef.current) {
            // Files changed, trigger refresh
            refreshCallback();
          }
          
          lastModifiedRef.current = currentHash;
        }
      } catch (e) {
        // Ignore errors
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentProject, server?.status, refreshCallback]);
}

/**
 * Hook to automatically refresh preview when server starts
 */
export function useAutoRefreshPreview() {
  const { server } = useServerStore();
  const lastStatusRef = useRef<string>("");

  useEffect(() => {
    if (server?.status === "running" && lastStatusRef.current !== "running") {
      // Server just started
      lastStatusRef.current = "running";
    }
    
    if (server?.status !== "running") {
      lastStatusRef.current = server?.status || "";
    }
  }, [server?.status]);
}
