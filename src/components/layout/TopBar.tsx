"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import { useAuthStore } from "@/stores/authStore";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Users,
  Sparkles,
  Code2,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  User,
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
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

        <div className="w-px h-5 bg-white/10" />

        {/* Auth Buttons or User Menu */}
        {!isAuthenticated ? (
          <>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-white flex items-center gap-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>
            <button
              onClick={() => {
                setShowAuthModal(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary/20 border border-primary/30 hover:bg-primary/30 rounded-lg transition-all flex items-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </button>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-xs text-white font-medium">
                {user?.name || user?.username}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-strong border border-white/10 rounded-lg shadow-xl animate-scale-in z-50">
                <div className="p-3 border-b border-white/10">
                  <p className="text-xs text-white font-medium">{user?.name || user?.username}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

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
          <span className="text-xs text-white font-medium">{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</span>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
