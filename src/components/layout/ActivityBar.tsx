"use client";

import { useUIStore } from "@/stores/uiStore";
import { useExtensionStore } from "@/stores/extensionStore";
import {
  FolderOpen,
  Search,
  GitBranch,
  Play,
  Puzzle,
  Database,
  MessageSquare,
  Settings,
  Code2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ActivityBar() {
  const { activeSidebar, setActiveSidebar } = useUIStore();
  const { getInstalledExtensions } = useExtensionStore();
  const installedCount = getInstalledExtensions().length;

  const activities = [
    {
      id: "explorer" as const,
      icon: FolderOpen,
      label: "Explorer",
      shortcut: "Ctrl+B",
    },
    {
      id: "search" as const,
      icon: Search,
      label: "Search",
      shortcut: "Ctrl+Shift+F",
    },
    {
      id: "git" as const,
      icon: GitBranch,
      label: "Source Control",
      shortcut: "Ctrl+Shift+G",
      badge: 3,
    },
    {
      id: "run" as const,
      icon: Play,
      label: "Run & Debug",
      shortcut: "Ctrl+Shift+D",
    },
    {
      id: "extensions" as const,
      icon: Puzzle,
      label: "Extensions",
      shortcut: "Ctrl+Shift+X",
      badge: installedCount > 0 ? installedCount : undefined,
    },
    {
      id: "github" as const,
      icon: Code2,
      label: "GitHub",
      shortcut: "Ctrl+Shift+H",
    },
    {
      id: "database" as const,
      icon: Database,
      label: "Database",
      shortcut: "Ctrl+Shift+V",
    },
    {
      id: "chat" as const,
      icon: MessageSquare,
      label: "AI Chat",
      shortcut: "Ctrl+L",
      badge: 2,
    },
    {
      id: "settings" as const,
      icon: Settings,
      label: "Settings",
      shortcut: "Ctrl+,",
    },
  ];

  return (
    <div className="w-[50px] glass border-r border-white/10 flex flex-col items-center py-2 gap-1">
      {activities.map(({ id, icon: Icon, label, shortcut, badge }) => (
        <Tooltip key={id} delayDuration={500}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setActiveSidebar(id)}
              className={`relative w-12 h-12 flex items-center justify-center transition-all rounded-lg ${
                activeSidebar === id
                  ? "bg-white/10 text-primary glow-purple"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
              title={label}
            >
              <Icon className="h-5 w-5" />
              {badge && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center gradient-primary text-white text-[10px] font-semibold rounded-full shadow-lg">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="glass-strong border-white/10">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-white">{label}</span>
              <span className="text-xs text-muted-foreground">{shortcut}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      ))}

      <div className="flex-1" />

      {/* Bottom icons */}
      <div className="flex flex-col items-center gap-1 pb-2">
        {/* Future: Add more bottom icons if needed */}
      </div>
    </div>
  );
}
