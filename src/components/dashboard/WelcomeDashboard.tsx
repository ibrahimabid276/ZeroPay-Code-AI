"use client";

import {
  FilePlus,
  FolderOpen,
  GitBranch,
  Download,
  Sparkles,
  MoreVertical,
  FolderOpen as FolderOpenIcon,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Color mapping for project icons
const PROJECT_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
  "from-yellow-500 to-orange-500",
];

// Get first letter of project name for icon
const getProjectIcon = (name: string) => name.charAt(0).toUpperCase();

// Calculate time ago from timestamp
const getTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export function WelcomeDashboard() {
  const { projects, loadProjectsFromServer, createProject } = useProjectStore();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState("");

  // Load projects from server on mount
  useEffect(() => {
    loadProjectsFromServer();
  }, [loadProjectsFromServer]);

  const handleOpenProject = (projectId: string) => {
    router.push(`/ide?projectId=${projectId}`);
  };

  const handleNewProject = async () => {
    if (!projectName.trim()) return;
    
    setIsCreating(true);
    const project = await createProject(projectName.trim());
    setIsCreating(false);
    
    if (project) {
      setShowCreateDialog(false);
      setProjectName("");
      router.push(`/ide?projectId=${project.id}`);
    }
  };

  const handleOpenFolder = async () => {
    // Open folder dialog - this will work in Electron/desktop app
    // For web version, we'll show a message
    alert("Open Folder feature is available in the desktop version.\n\nFor now, please use 'New Project' to create a project.");
  };

  const handleViewAll = () => {
    // Could navigate to a projects listing page
    alert("Projects page coming soon!");
  };

  return (
    <div className="h-full overflow-auto bg-background p-6">
      {/* Hero Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, Developer!{" "}
          <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-muted-foreground">
          Let's build something amazing today.
        </p>
      </div>

      {/* Banner */}
      <div className="glass rounded-xl p-6 mb-6 gradient-subtle border border-white/10 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl gradient-primary glow-purple flex items-center justify-center">
            <span className="text-white text-3xl font-bold">Z</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              ZeroPay Code AI
            </h2>
            <p className="text-muted-foreground mt-1">
              Your all-in-one AI-powered development environment for modern creators.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Removed as requested */}

      {/* Projects Section */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">
            {projects.length > 0 ? "Your Projects" : "No Projects Yet"}
          </h3>
          {projects.length > 0 && (
            <button 
              onClick={handleViewAll}
              className="text-xs text-primary hover:underline"
            >
              View All →
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          // Empty state - no projects
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <FolderOpenIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-white font-semibold mb-2">No projects yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FilePlus className="w-4 h-4" />
                New Project
              </button>
              <button 
                onClick={handleOpenFolder}
                className="px-4 py-2 rounded-lg glass border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Open Folder
              </button>
            </div>
          </div>
        ) : (
          // Show real user projects
          <div className="grid grid-cols-4 gap-3">
            {projects.map((project, index) => {
              const color = PROJECT_COLORS[index % PROJECT_COLORS.length];
              const icon = getProjectIcon(project.name);
              const timeAgo = getTimeAgo(project.updatedAt || project.createdAt);

              return (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className="glass rounded-xl p-4 border border-white/10 hover-lift cursor-pointer group transition-all hover:border-primary/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-lg">
                        {icon}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add project options menu (rename, delete, duplicate)
                        alert("Project options coming soon!");
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                      title="Project options"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1 truncate">
                    {project.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mb-2 truncate">
                    {project.path || "Local project"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                      Project
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions Grid - Removed as requested */}

      {/* Create Project Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass rounded-xl p-6 border border-white/10 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNewProject();
                  }
                }}
                placeholder="My Awesome Project"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setProjectName("");
                }}
                className="px-4 py-2 rounded-lg glass border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                disabled={!projectName.trim() || isCreating}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FilePlus className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
