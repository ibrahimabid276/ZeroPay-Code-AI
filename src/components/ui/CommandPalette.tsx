"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useEditorStore } from "@/stores/editorStore";
import { useServerStore } from "@/stores/serverStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  Command,
  Terminal,
  LayoutPanelLeft,
  Search,
  GitBranch,
  Bot,
  Save,
  Play,
  Square,
  Palette,
  FilePlus,
  FolderPlus,
  FileText,
  Wand2,
  Code2,
  Globe,
  Settings,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatShortcut } from "@/lib/shortcuts";

interface CommandPaletteProps {
  onClose: () => void;
}

export type CommandCategory = "recent" | "file" | "edit" | "view" | "run" | "git" | "ai" | "settings";

interface CommandItem {
  id: string;
  label: string;
  category: CommandCategory;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  keywords?: string[]; // For fuzzy search
}

const RECENT_COMMANDS_KEY = "zeropay-recent-commands";

function CommandRow({
  cmd,
  idx,
  selectedIndex,
  setSelectedIndex,
}: {
  cmd: CommandItem;
  idx: number;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
}) {
  return (
    <button
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
          {formatShortcut(cmd.shortcut)}
        </span>
      )}
    </button>
  );
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const { setActiveSidebar, toggleTerminal, toggleChat, activeSidebar } = useUIStore();
  const { tabs, activeTabId, updateTabContent } = useEditorStore();
  const { currentProject, refreshFileTree } = useProjectStore();
  const { startServer, stopExecution, isExecuting } = useServerStore();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent commands from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
      if (stored) {
        setRecentCommands(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Save recent command
  const addRecentCommand = (commandId: string) => {
    const updated = [commandId, ...recentCommands.filter((id) => id !== commandId)].slice(0, 5);
    setRecentCommands(updated);
    try {
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(updated));
    } catch {}
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // All commands with categories
  const allCommands: CommandItem[] = [
    // File commands
    {
      id: "new-file",
      label: "New File",
      category: "file",
      icon: FilePlus,
      shortcut: "Ctrl+N",
      keywords: ["create", "file", "new"],
      action: () => {
        // Trigger file creation
        window.dispatchEvent(new CustomEvent("create-file"));
        addRecentCommand("new-file");
        onClose();
      },
    },
    {
      id: "new-folder",
      label: "New Folder",
      category: "file",
      icon: FolderPlus,
      keywords: ["create", "folder", "directory", "new"],
      action: () => {
        window.dispatchEvent(new CustomEvent("create-folder"));
        addRecentCommand("new-folder");
        onClose();
      },
    },
    {
      id: "save-file",
      label: "Save File",
      category: "file",
      icon: Save,
      shortcut: "Ctrl+S",
      keywords: ["save"],
      action: () => {
        // Save triggered by Monaco editor
        addRecentCommand("save-file");
        onClose();
      },
    },

    // Edit commands
    {
      id: "format-document",
      label: "Format Document",
      category: "edit",
      icon: Wand2,
      shortcut: "Shift+Alt+F",
      keywords: ["format", "prettify", "beautify"],
      action: () => {
        // Trigger format in Monaco
        addRecentCommand("format-document");
        onClose();
      },
    },
    {
      id: "change-language",
      label: "Change Language Mode",
      category: "edit",
      icon: Code2,
      keywords: ["language", "mode", "syntax"],
      action: () => {
        // Open language selector
        addRecentCommand("change-language");
        onClose();
      },
    },

    // View commands
    {
      id: "toggle-terminal",
      label: "Toggle Terminal",
      category: "view",
      icon: Terminal,
      shortcut: "Ctrl+`",
      keywords: ["terminal", "console", "bash"],
      action: () => {
        toggleTerminal();
        addRecentCommand("toggle-terminal");
        onClose();
      },
    },
    {
      id: "toggle-sidebar",
      label: "Toggle Sidebar",
      category: "view",
      icon: LayoutPanelLeft,
      shortcut: "Ctrl+B",
      keywords: ["sidebar", "explorer", "panel"],
      action: () => {
        setActiveSidebar(activeSidebar === "explorer" ? null : "explorer");
        addRecentCommand("toggle-sidebar");
        onClose();
      },
    },
    {
      id: "toggle-chat",
      label: "Toggle AI Chat",
      category: "view",
      icon: Bot,
      shortcut: "Ctrl+L",
      keywords: ["chat", "ai", "assistant"],
      action: () => {
        toggleChat();
        addRecentCommand("toggle-chat");
        onClose();
      },
    },
    {
      id: "focus-explorer",
      label: "Focus File Explorer",
      category: "view",
      icon: LayoutPanelLeft,
      shortcut: "Ctrl+Shift+E",
      keywords: ["explorer", "files", "focus"],
      action: () => {
        setActiveSidebar("explorer");
        addRecentCommand("focus-explorer");
        onClose();
      },
    },
    {
      id: "focus-search",
      label: "Focus Search",
      category: "view",
      icon: Search,
      shortcut: "Ctrl+Shift+F",
      keywords: ["search", "find", "focus"],
      action: () => {
        setActiveSidebar("search");
        addRecentCommand("focus-search");
        onClose();
      },
    },

    // Run commands
    {
      id: "run-code",
      label: "Run Code",
      category: "run",
      icon: Play,
      shortcut: "Ctrl+Enter",
      keywords: ["run", "execute", "start"],
      action: () => {
        startServer();
        addRecentCommand("run-code");
        onClose();
      },
    },
    {
      id: "stop-execution",
      label: "Stop Execution",
      category: "run",
      icon: Square,
      keywords: ["stop", "kill", "terminate"],
      action: () => {
        stopExecution();
        addRecentCommand("stop-execution");
        onClose();
      },
    },

    // Git commands
    {
      id: "git-commit",
      label: "Git Commit",
      category: "git",
      icon: GitBranch,
      shortcut: "Ctrl+Enter",
      keywords: ["commit", "save", "git"],
      action: () => {
        setActiveSidebar("git");
        addRecentCommand("git-commit");
        onClose();
      },
    },
    {
      id: "git-push",
      label: "Git Push",
      category: "git",
      icon: GitBranch,
      keywords: ["push", "upload", "git"],
      action: () => {
        setActiveSidebar("git");
        addRecentCommand("git-push");
        onClose();
      },
    },
    {
      id: "focus-git",
      label: "Focus Source Control",
      category: "git",
      icon: GitBranch,
      shortcut: "Ctrl+Shift+G",
      keywords: ["git", "source", "control", "focus"],
      action: () => {
        setActiveSidebar("git");
        addRecentCommand("focus-git");
        onClose();
      },
    },

    // AI commands
    {
      id: "focus-chat",
      label: "Focus AI Chat",
      category: "ai",
      icon: Bot,
      shortcut: "Ctrl+L",
      keywords: ["ai", "chat", "assistant", "focus"],
      action: () => {
        toggleChat();
        setActiveSidebar("chat");
        addRecentCommand("focus-chat");
        onClose();
      },
    },
    {
      id: "inline-chat",
      label: "AI Inline Chat",
      category: "ai",
      icon: Bot,
      shortcut: "Ctrl+K Ctrl+I",
      keywords: ["ai", "inline", "chat", "assistant"],
      action: () => {
        // Trigger inline chat
        addRecentCommand("inline-chat");
        onClose();
      },
    },

    // Settings commands
    {
      id: "change-theme",
      label: "Change Theme",
      category: "settings",
      icon: Palette,
      keywords: ["theme", "color", "appearance", "dark", "light"],
      action: () => {
        setActiveSidebar("settings");
        addRecentCommand("change-theme");
        onClose();
      },
    },
    {
      id: "open-settings",
      label: "Open Settings",
      category: "settings",
      icon: Settings,
      shortcut: "Ctrl+,",
      keywords: ["settings", "preferences", "config"],
      action: () => {
        setActiveSidebar("settings");
        addRecentCommand("open-settings");
        onClose();
      },
    },
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fuzzy search and categorize commands
  const filteredCommands = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    // Filter commands based on search
    let filtered = allCommands.filter((cmd) => {
      if (!searchLower) return true;
      
      const labelMatch = cmd.label.toLowerCase().includes(searchLower);
      const keywordMatch = cmd.keywords?.some((kw) => kw.includes(searchLower));
      return labelMatch || keywordMatch;
    });

    // Sort: recent commands first, then alphabetically
    return filtered.sort((a, b) => {
      const aRecent = recentCommands.indexOf(a.id);
      const bRecent = recentCommands.indexOf(b.id);
      
      if (aRecent !== -1 && bRecent === -1) return -1;
      if (bRecent !== -1 && aRecent === -1) return 1;
      if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
      
      return a.label.localeCompare(b.label);
    });
  }, [search, recentCommands]);

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
              <>
                {/* Recent Commands Section */}
                {!search && recentCommands.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Recent
                    </div>
                    {filteredCommands
                      .filter((cmd) => recentCommands.includes(cmd.id))
                      .slice(0, 3)
                      .map((cmd, idx) => (
                        <CommandRow
                          key={cmd.id}
                          cmd={cmd}
                          idx={idx}
                          selectedIndex={selectedIndex}
                          setSelectedIndex={setSelectedIndex}
                        />
                      ))}
                  </div>
                )}

                {/* All Commands */}
                {(!search || filteredCommands.length > (recentCommands.length > 0 ? 3 : 0)) && (
                  <>
                    {!search && recentCommands.length > 0 && (
                      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground mt-2">
                        All Commands
                      </div>
                    )}
                    {filteredCommands
                      .filter((cmd) => !recentCommands.includes(cmd.id) || search)
                      .map((cmd, idx) => {
                        const adjustedIdx = !search && recentCommands.length > 0 
                          ? idx + Math.min(3, recentCommands.length)
                          : idx;
                        return (
                          <CommandRow
                            key={cmd.id}
                            cmd={cmd}
                            idx={adjustedIdx}
                            selectedIndex={selectedIndex}
                            setSelectedIndex={setSelectedIndex}
                          />
                        );
                      })}
                  </>
                )}
              </>
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
