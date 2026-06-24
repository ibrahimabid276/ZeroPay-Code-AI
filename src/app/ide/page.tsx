"use client";

import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useProjectStore } from "@/stores/projectStore";
import { useExtensionStore } from "@/stores/extensionStore";

/**
 * Initializes the project and extensions on app load:
 * 1. Loads projects from server
 * 2. Creates a default project if none exist
 * 3. Refreshes the file tree for the active project
 * 4. Loads extensions catalog
 */
function ProjectInitializer() {
  const { currentProject, refreshFileTree, loadProjectsFromServer, createProject } =
    useProjectStore();
  const { loadExtensions } = useExtensionStore();

  useEffect(() => {
    const initProject = async () => {
      // Load projects from server (will restore persisted selection from localStorage)
      await loadProjectsFromServer();

      const { currentProject: loaded } = useProjectStore.getState();
      if (!loaded) {
        // No persisted project and none on server - create default
        await createProject("My Project");
      }
    };
    initProject();
    
    // Load extensions
    loadExtensions();
  }, [loadProjectsFromServer, createProject, loadExtensions]);

  // Refresh file tree whenever the current project changes
  useEffect(() => {
    if (currentProject) {
      refreshFileTree();
    }
  }, [currentProject, refreshFileTree]);

  return null;
}

export default function IDEPage() {
  return (
    <ThemeProvider>
      <ProjectInitializer />
      <MainLayout />
    </ThemeProvider>
  );
}
