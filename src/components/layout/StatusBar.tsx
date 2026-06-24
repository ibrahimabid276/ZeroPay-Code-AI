"use client";

import {
  GitBranch,
  Circle,
  Zap,
  Save,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useProjectStore } from "@/stores/projectStore";
import { useServerStore } from "@/stores/serverStore";

export function StatusBar() {
  const { activeSidebar } = useUIStore();
  const { currentProject } = useProjectStore();
  const { server } = useServerStore();

  const isRunning = server?.status === "running";

  return (
    <div className="h-6 glass-strong border-t border-white/10 flex items-center justify-between px-3 text-[11px] select-none">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Git Branch */}
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3 text-primary" />
          <span className="text-white">main</span>
        </div>

        {/* Project Status */}
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <Circle
            className={`w-3 h-3 ${
              isRunning ? "text-green-500 fill-green-500" : "text-muted-foreground"
            }`}
          />
          <span className="text-white">
            {isRunning ? "Running" : "Stopped"}
          </span>
        </div>

        {/* Error/Warning Count */}
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <span className="text-red-400">✕ 0</span>
          <span className="text-yellow-400">⚠ 0</span>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-3">
        {currentProject && (
          <div className="flex items-center gap-1.5">
            <Code2 className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">
              {currentProject.name}
            </span>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Auto Save Status */}
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <Save className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Auto Save</span>
        </div>

        {/* Language */}
        <div className="hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <span className="text-muted-foreground">TypeScript</span>
        </div>

        {/* Encoding */}
        <div className="hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <span className="text-muted-foreground">UTF-8</span>
        </div>

        {/* Line Ending */}
        <div className="hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <span className="text-muted-foreground">LF</span>
        </div>

        {/* Prettier */}
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span className="text-muted-foreground">Prettier</span>
        </div>

        {/* AI Status */}
        <div className="flex items-center gap-1.5 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer transition-colors">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-white">AI Online</span>
        </div>
      </div>
    </div>
  );
}
