"use client";

import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  Files,
  Search,
  GitBranch,
  Bot,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ActivityBar() {
  const { activeSidebar, setActiveSidebar } = useUIStore();
  const { fileTree } = useProjectStore();

  // Count git changes (placeholder - would come from git store)
  const gitChanges = 3; // TODO: Get from actual git status
  const aiNotifications = 2; // TODO: Get from chat store

  const topActivities = [
    {
      id: "explorer" as const,
      icon: Files,
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
      badge: gitChanges,
    },
    {
      id: "chat" as const,
      icon: Bot,
      label: "AI Chat",
      shortcut: "Ctrl+L",
      badge: aiNotifications,
    },
  ];

  const bottomActivities = [
    {
      id: "settings" as const,
      icon: Settings,
      label: "Settings",
      shortcut: "Ctrl+,",
    },
  ];

  const handleActivityClick = (id: typeof topActivities[number]["id"] | typeof bottomActivities[number]["id"]) => {
    // If clicking the active panel, collapse it (toggle off)
    setActiveSidebar(id);
  };

  return (
    <div className="w-[50px] bg-background border-r border-border flex flex-col items-center py-2">
      {/* Top icons */}
      <div className="flex flex-col items-center gap-1">
        {topActivities.map(({ id, icon: Icon, label, shortcut, badge }) => {
          const isActive = activeSidebar === id;
          
          return (
            <Tooltip key={id} delayDuration={400}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleActivityClick(id)}
                  className={`relative w-12 h-12 flex items-center justify-center transition-all duration-150 ${
                    isActive
                      ? "text-foreground border-l-2 border-primary bg-accent/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  }`}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {badge && badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-semibold rounded-full shadow-sm">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{shortcut}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Spacer to push bottom icons down */}
      <div className="flex-1" />

      {/* Bottom icons (Settings) */}
      <div className="flex flex-col items-center gap-1 pb-2">
        {/* Separator line */}
        <div className="w-6 h-px bg-border mb-1" />
        
        {bottomActivities.map(({ id, icon: Icon, label, shortcut }) => {
          const isActive = activeSidebar === id;
          
          return (
            <Tooltip key={id} delayDuration={400}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleActivityClick(id)}
                  className={`relative w-12 h-12 flex items-center justify-center transition-all duration-150 ${
                    isActive
                      ? "text-foreground border-l-2 border-primary bg-accent/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  }`}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{shortcut}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
