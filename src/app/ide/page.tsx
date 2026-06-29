"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useProjectStore } from "@/stores/projectStore";
import { useExtensionStore } from "@/stores/extensionStore";
import { useAuthStore } from "@/stores/authStore";
import { useEditorStore } from "@/stores/editorStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { isFirstTimeUser, createDemoProject, DEMO_PROJECT_ID } from "@/lib/demo-project";

/**
 * Initializes the project and extensions on app load:
 * 1. Checks if first-time user
 * 2. Creates demo project for first-time users
 * 3. Loads projects from server
 * 4. Creates a default project if none exist
 * 5. Refreshes the file tree for the active project
 * 6. Loads extensions catalog
 */
function ProjectInitializer() {
  const { currentProject, refreshFileTree, loadProjectsFromServer, createProject, setCurrentProject, setFileTree } =
    useProjectStore();
  const { openTab } = useEditorStore();
  const { loadExtensions } = useExtensionStore();

  useEffect(() => {
    const initProject = async () => {
      // Check if this is a first-time user
      if (isFirstTimeUser()) {
        // Create demo project
        const demoProject = await createDemoProject();
        
        if (demoProject) {
          // Set demo project as current
          setCurrentProject({
            id: demoProject.id,
            name: demoProject.name,
            path: `.projects/${demoProject.id}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          
          // Refresh file tree to load demo files
          await refreshFileTree();
          
          // Open README.md by default
          setTimeout(() => {
            openTab({
              fileName: "README.md",
              filePath: "README.md",
              language: "markdown",
              content: "",
            });
          }, 500);
          
          return;
        }
      }

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
  }, [loadProjectsFromServer, createProject, loadExtensions, setCurrentProject, refreshFileTree, openTab]);

  // Refresh file tree whenever the current project changes
  useEffect(() => {
    if (currentProject) {
      refreshFileTree();
    }
  }, [currentProject, refreshFileTree]);

  return null;
}

export default function IDEPage() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    checkAuth();
  }, [checkAuth]);

  // Show auth modal if not authenticated (optional - can make auth optional for now)
  // Uncomment below to require authentication:
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     setShowAuthModal(true);
  //   }
  // }, [isAuthenticated]);

  return (
    <ThemeProvider>
      <ProjectInitializer />
      <DemoBanner />
      <MainLayout />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </ThemeProvider>
  );
}
