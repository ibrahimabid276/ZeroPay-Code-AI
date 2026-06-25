"use client";

import { useUIStore } from "@/stores/uiStore";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { ExtensionsPanel } from "@/components/extensions/ExtensionsPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { NotebookPanel } from "@/components/notebook/NotebookPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { SearchPanel } from "@/components/search/SearchPanel";
import { GitPanel } from "@/components/git/GitPanel";
import { GitHubPanel } from "@/components/github/GitHubPanel";
import { DatabasePanel } from "@/components/database/DatabasePanel";

export function Sidebar() {
  const { activeSidebar, fileExplorerOpen } = useUIStore();

  if (!activeSidebar) {
    return null;
  }

  return (
    <div className="h-full glass border-r border-white/10 animate-slide-in">
      {activeSidebar === 'explorer' && fileExplorerOpen && <FileExplorer />}
      {activeSidebar === 'notebooks' && <NotebookPanel />}
      {activeSidebar === 'search' && <SearchPanel />}
      {activeSidebar === 'git' && <GitPanel />}
      {activeSidebar === 'run' && <TerminalPanel />}
      {activeSidebar === 'extensions' && <ExtensionsPanel />}
      {activeSidebar === 'github' && <GitHubPanel />}
      {activeSidebar === 'database' && <DatabasePanel />}
      {activeSidebar === 'chat' && <ChatPanel />}
      {activeSidebar === 'settings' && <SettingsPanel />}
    </div>
  );
}
