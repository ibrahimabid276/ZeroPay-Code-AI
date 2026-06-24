"use client";

import { useEffect } from "react";
import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
import { useUIStore } from "@/stores/uiStore";
import { useEditorStore } from "@/stores/editorStore";
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
    toggleChat,
    toggleTerminal,
  } = useUIStore();
  const { tabs, activeTabId } = useEditorStore();
  const hasOpenFiles = tabs.length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        // Toggle explorer via activity bar
        import("@/stores/uiStore").then(({ useUIStore }) => {
          useUIStore.getState().setActiveSidebar("explorer");
        });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        toggleChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "j") {
        e.preventDefault();
        toggleTerminal();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        // Trigger run - will be handled by serverStore
        import("@/stores/serverStore").then(({ useServerStore }) => {
          useServerStore.getState().startServer();
        });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Shift" && e.key.toLowerCase() === "x") {
        e.preventDefault();
        import("@/stores/uiStore").then(({ useUIStore }) => {
          useUIStore.getState().setActiveSidebar("extensions");
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleChat, toggleTerminal]);

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
      </div>
    </TooltipProvider>
  );
}
