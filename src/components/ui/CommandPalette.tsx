"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useEditorStore } from "@/stores/editorStore";
import { useServerStore } from "@/stores/serverStore";
import { Command, Terminal, LayoutPanelLeft, Search, GitBranch, Bot, Save, Play, Palette } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommandPaletteProps {
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const { setActiveSidebar, toggleTerminal, setChatOpen } = useUIStore();
  const { tabs, activeTabId } = useEditorStore();
  const { startServer } = useServerStore();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: "toggle-terminal",
      label: "Toggle Terminal",
      icon: Terminal,
      shortcut: "Ctrl+`",
      action: () => {
        toggleTerminal();
        onClose();
      },
    },
    {
      id: "toggle-sidebar",
      label: "Toggle Sidebar",
      icon: LayoutPanelLeft,
      shortcut: "Ctrl+B",
      action: () => {
        setActiveSidebar("explorer");
        onClose();
      },
    },
    {
      id: "focus-explorer",
      label: "Focus File Explorer",
      icon: LayoutPanelLeft,
      shortcut: "Ctrl+Shift+E",
      action: () => {
        setActiveSidebar("explorer");
        onClose();
      },
    },
    {
      id: "focus-search",
      label: "Focus Search",
      icon: Search,
      shortcut: "Ctrl+Shift+F",
      action: () => {
        setActiveSidebar("search");
        onClose();
      },
    },
    {
      id: "focus-git",
      label: "Focus Source Control",
      icon: GitBranch,
      shortcut: "Ctrl+Shift+G",
      action: () => {
        setActiveSidebar("git");
        onClose();
      },
    },
    {
      id: "focus-chat",
      label: "Focus AI Chat",
      icon: Bot,
      shortcut: "Ctrl+L",
      action: () => {
        setChatOpen(true);
        setActiveSidebar("chat");
        onClose();
      },
    },
    {
      id: "save-file",
      label: "Save File",
      icon: Save,
      shortcut: "Ctrl+S",
      action: () => {
        // Save will be triggered by Monaco editor
        onClose();
      },
    },
    {
      id: "run-code",
      label: "Run Code",
      icon: Play,
      shortcut: "Ctrl+Enter",
      action: () => {
        startServer();
        onClose();
      },
    },
    {
      id: "toggle-theme",
      label: "Toggle Theme",
      icon: Palette,
      action: () => {
        // Theme toggle logic here
        onClose();
      },
    },
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedIndex, filteredCommands]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm">
      <div className="w-[600px] bg-card border rounded-lg shadow-2xl animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Command className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Commands List */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No commands found
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3 py-2.5 text-left flex items-center gap-3 rounded-md transition-colors ${
                    idx === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <cmd.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                  {cmd.shortcut && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {cmd.shortcut}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↵</kbd> Execute</span>
            <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Esc</kbd> Close</span>
          </div>
          <span>{filteredCommands.length} command{filteredCommands.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
