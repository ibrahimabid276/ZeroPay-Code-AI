"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Users,
  Sparkles,
  Code2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RunControls } from "./RunControls";
import { ViewModeSwitcher } from "./ViewModeSwitcher";

const MENU_ITEMS = ["File", "Edit", "View", "Run", "Terminal", "Git", "Help"];

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const {
    chatOpen,
    terminalOpen,
    toggleChat,
    toggleTerminal,
  } = useUIStore();
  const { currentProject } = useProjectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-12 glass-strong border-b border-white/10 flex items-center justify-between px-4 select-none">
      {/* Left: Logo + Menus */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center glow-purple">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            ZeroPay Code AI
          </span>
          <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            v2.1.0
          </span>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center gap-0.5 ml-2">
          {MENU_ITEMS.map((menu) => (
            <button
              key={menu}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-white hover:bg-white/5 rounded transition-all"
            >
              {menu}
            </button>
          ))}
        </div>

        {mounted && currentProject && (
          <div className="flex items-center gap-1.5 ml-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Code2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              {currentProject.name}
            </span>
          </div>
        )}

        {/* Run Controls */}
        <RunControls />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* View Mode Switcher */}
        <ViewModeSwitcher />

        <div className="w-px h-5 bg-white/10" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5"
              onClick={toggleTerminal}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Terminal (Ctrl+J)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5"
              onClick={toggleChat}
            >
              {chatOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Chat (Ctrl+L)</TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-white/10" />

        <button className="px-3 py-1.5 text-xs text-muted-foreground hover:text-white flex items-center gap-2 transition-colors">
          <Users className="w-3.5 h-3.5" />
          Invite Team
        </button>

        <button className="px-4 py-1.5 text-xs font-medium text-white gradient-primary rounded-lg hover:opacity-90 transition-opacity glow-purple flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI
        </button>

        <button className="relative p-2 text-muted-foreground hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="w-px h-5 bg-white/10" />

        <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
          <SelectTrigger className="h-8 w-[90px] text-xs bg-white/5 border-white/10 hover:bg-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/10">
            <SelectItem value="dark">
              <div className="flex items-center gap-2">
                <Moon className="h-3.5 w-3.5" /> Dark
              </div>
            </SelectItem>
            <SelectItem value="light">
              <div className="flex items-center gap-2">
                <Sun className="h-3.5 w-3.5" /> Light
              </div>
            </SelectItem>
            <SelectItem value="system">
              <div className="flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5" /> System
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="w-8 h-8 rounded-full gradient-subtle border border-white/10 flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors">
          <span className="text-xs text-white font-medium">U</span>
        </div>
      </div>
    </div>
  );
}
