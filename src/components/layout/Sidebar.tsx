"use client";

import { useUIStore } from "@/stores/uiStore";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { ExtensionsPanel } from "@/components/extensions/ExtensionsPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { NotebookPanel } from "@/components/notebook/NotebookPanel";

export function Sidebar() {
  const { activeSidebar, fileExplorerOpen } = useUIStore();

  if (!activeSidebar) {
    return null;
  }

  return (
    <div className="h-full glass border-r border-white/10 animate-slide-in">
      {activeSidebar === 'explorer' && fileExplorerOpen && <FileExplorer />}
      {activeSidebar === 'notebooks' && <NotebookPanel />}
      {activeSidebar === 'search' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">Search coming soon</p>
            <p className="text-[10px]">Use Ctrl+P to search files</p>
          </div>
        </div>
      )}
      {activeSidebar === 'git' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">Source Control</p>
            <p className="text-[10px]">Git integration coming soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'run' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">Run & Debug</p>
            <p className="text-[10px]">Debug tools coming soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'extensions' && <ExtensionsPanel />}
      {activeSidebar === 'github' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">GitHub</p>
            <p className="text-[10px]">GitHub integration coming soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'database' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">Database</p>
            <p className="text-[10px]">Database tools coming soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'chat' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">AI Chat</p>
            <p className="text-[10px]">AI assistant coming soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'settings' && <SettingsPanel />}
    </div>
  );
}
