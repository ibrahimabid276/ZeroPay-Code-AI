"use client";

import { useUIStore } from "@/stores/uiStore";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { ExtensionsPanel } from "@/components/extensions/ExtensionsPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { NotebookPanel } from "@/components/notebook/NotebookPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";

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
            <p className="mb-2">Global Search</p>
            <p className="text-[10px]">Press Ctrl+Shift+F to search across files</p>
          </div>
        </div>
      )}
      {activeSidebar === 'git' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">Source Control</p>
            <p className="text-[10px]">Git integration will be added soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'run' && <TerminalPanel />}
      {activeSidebar === 'extensions' && <ExtensionsPanel />}
      {activeSidebar === 'github' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">GitHub</p>
            <p className="text-[10px]">GitHub integration will be added soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'database' && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
          <div className="text-center">
            <p className="mb-2">Database</p>
            <p className="text-[10px]">Database tools will be added soon</p>
          </div>
        </div>
      )}
      {activeSidebar === 'chat' && <ChatPanel />}
      {activeSidebar === 'settings' && <SettingsPanel />}
    </div>
  );
}
