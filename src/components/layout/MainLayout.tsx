"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
import { useUIStore } from "@/stores/uiStore";
import { useEditorStore } from "@/stores/editorStore";
import { useProjectStore } from "@/stores/projectStore";
import { EditorTabs } from "@/components/editor/EditorTabs";
import { MonacoEditorWrapper } from "@/components/editor/MonacoEditorWrapper";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { TopBar } from "@/components/layout/TopBar";
import { LivePreview } from "@/components/preview/LivePreview";
import { ActivityBar } from "@/components/layout/ActivityBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { WelcomeDashboard } from "@/components/dashboard/WelcomeDashboard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShortcutsModal } from "@/components/ui/ShortcutsModal";
import { QuickOpen } from "@/components/ui/QuickOpen";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { Code } from "lucide-react";

function ResizeHandle({ className }: { className?: string }) {
  return (
    <Separator
      className={`bg-border hover:bg-primary/50 active:bg-primary/50 transition-colors ${className || ""}`}
    />
  );
}

export function MainLayout() {
  const {
    chatOpen,
    terminalOpen,
    viewMode,
    activeSidebar,
    setActiveSidebar,
    toggleChat,
    toggleTerminal,
  } = useUIStore();
  const { tabs, activeTabId } = useEditorStore();
  const { fileTree } = useProjectStore();
  const hasOpenFiles = tabs.length > 0;

  // Modal states
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Comprehensive keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      
      // Ctrl+Shift+? - Show shortcuts (works everywhere)
      if (isCtrl && isShift && (e.key === "?" || e.key === "/")) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Don't trigger other shortcuts when in input fields (except quick open and command palette)
      if (isInput && !isCtrl) return;

      // Ctrl+P - Quick file open
      if (isCtrl && !isShift && e.key === "p") {
        e.preventDefault();
        setShowQuickOpen(true);
        return;
      }

      // Ctrl+Shift+P - Command palette
      if (isCtrl && isShift && e.key === "P") {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      // Ctrl+` - Toggle terminal
      if (isCtrl && e.key === "`") {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      // Ctrl+B - Toggle sidebar (explorer)
      if (isCtrl && !isShift && e.key === "b") {
        e.preventDefault();
        setActiveSidebar(activeSidebar === "explorer" ? null : "explorer");
        return;
      }

      // Ctrl+Shift+E - Focus file explorer
      if (isCtrl && isShift && e.key === "E") {
        e.preventDefault();
        setActiveSidebar("explorer");
        return;
      }

      // Ctrl+Shift+F - Global search
      if (isCtrl && isShift && e.key === "F") {
        e.preventDefault();
        setActiveSidebar("search");
        return;
      }

      // Ctrl+Shift+G - Focus git panel
      if (isCtrl && isShift && e.key === "G") {
        e.preventDefault();
        setActiveSidebar("git");
        return;
      }

      // Ctrl+L - Focus AI chat
      if (isCtrl && !isShift && e.key === "l") {
        e.preventDefault();
        toggleChat();
        return;
      }

      // Ctrl+Enter - Run code
      if (isCtrl && e.key === "Enter") {
        e.preventDefault();
        import("@/stores/serverStore").then(({ useServerStore }) => {
          useServerStore.getState().startServer();
        });
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSidebar, setActiveSidebar, toggleChat, toggleTerminal]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <TopBar />
        <div className="flex-1 overflow-hidden flex">
          {/* Activity Bar */}
          <ActivityBar />

          {/* Main resizable area */}
          <Group orientation="horizontal" id="main-layout" className="flex-1">
            {/* Sidebar Panel */}
            {activeSidebar && (
              <>
                <Panel
                  defaultSize="18%"
                  minSize="12%"
                  maxSize="30%"
                  id="sidebar"
                >
                  <Sidebar />
                </Panel>
                <ResizeHandle />
              </>
            )}

            {/* Center: Welcome Dashboard or Editor + Preview + Terminal */}
            <Panel defaultSize={chatOpen ? "52%" : activeSidebar ? "62%" : "82%"} id="editor">
            <Group orientation="vertical" id="opencode-editor">
              <Panel defaultSize={terminalOpen ? "70%" : "100%"} id="editor-top">
                <Group orientation="horizontal" id="opencode-center">
                  {/* Welcome Dashboard (shown when no file is open) */}
                  {!hasOpenFiles && (
                    <Panel defaultSize={100} id="dashboard-panel">
                      <div className="h-full overflow-hidden">
                        <WelcomeDashboard />
                      </div>
                    </Panel>
                  )}

                  {/* Editor Panel */}
                  {hasOpenFiles && (viewMode === "editor" || viewMode === "split") && (
                    <Panel
                      defaultSize={viewMode === "split" ? 50 : 100}
                      id="editor-panel"
                    >
                      <div className="h-full flex flex-col">
                        <EditorTabs />
                        <div className="flex-1 overflow-hidden">
                          <MonacoEditorWrapper />
                        </div>
                      </div>
                    </Panel>
                  )}

                  {/* Preview Panel */}
                  {(viewMode === "preview" || viewMode === "split") && (
                    <>
                      {viewMode === "split" && <ResizeHandle />}
                      <Panel
                        defaultSize={viewMode === "split" ? 50 : 100}
                        id="preview-panel"
                      >
                        <LivePreview />
                      </Panel>
                    </>
                  )}
                </Group>
              </Panel>
              {terminalOpen && (
                <>
                  <ResizeHandle />
                  <Panel defaultSize="30%" minSize="15%" maxSize="50%" id="terminal">
                    <TerminalPanel />
                  </Panel>
                </>
              )}
            </Group>
          </Panel>

          {/* Chat Panel */}
          {chatOpen && (
            <>
              <ResizeHandle />
              <Panel
                defaultSize="30%"
                minSize="20%"
                maxSize="45%"
                id="chat"
              >
                <div className="h-full glass border-l border-white/10">
                  <ChatPanel />
                </div>
              </Panel>
            </>
          )}
          </Group>
        </div>
        <StatusBar />

        {/* Modal Overlays */}
        {showShortcuts && (
          <ShortcutsModal onClose={() => setShowShortcuts(false)} />
        )}
        {showQuickOpen && (
          <QuickOpen onClose={() => setShowQuickOpen(false)} />
        )}
        {showCommandPalette && (
          <CommandPalette onClose={() => setShowCommandPalette(false)} />
        )}
      </div>
    </TooltipProvider>
  );
}
