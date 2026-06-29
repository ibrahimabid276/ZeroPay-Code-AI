"use client";

import { useServerStore } from "@/stores/serverStore";
import { useEditorStore } from "@/stores/editorStore";
import { useUIStore } from "@/stores/uiStore";
import { Play, Square, RotateCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RunControls() {
  const { server, startServer, stopServer, restartServer, executeCode, stopExecution, isExecuting } = useServerStore();
  const { tabs, activeTabId } = useEditorStore();
  const { toggleTerminal } = useUIStore();
  
  // Determine if we should execute code or start server
  const activeTab = tabs.find(t => t.id === activeTabId);
  const isCodeFile = activeTab && activeTab.language;
  
  const status = server?.status || "stopped";
  const isRunning = status === "running" || status === "starting";

  const handleRun = async () => {
    // If there's an active code file, execute it
    if (activeTab && activeTab.content) {
      // Open terminal if not already open
      const { terminalOpen } = useUIStore.getState();
      if (!terminalOpen) {
        toggleTerminal();
      }
      
      await executeCode(activeTab.content, activeTab.language, activeTab.filePath);
    } else {
      // Otherwise, start the project server
      await startServer();
    }
  };

  const handleStop = () => {
    if (isExecuting) {
      stopExecution();
    } else if (status === "running") {
      stopServer();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "starting":
      case "building":
        return "bg-yellow-500 animate-pulse";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    if (isExecuting) {
      return "Running...";
    }
    switch (status) {
      case "running":
        return "Running";
      case "starting":
        return "Starting...";
      case "building":
        return "Building...";
      case "error":
        return "Error";
      default:
        return "Stopped";
    }
  };

  return (
    <div className="flex items-center gap-2 ml-4">
      {/* Status Indicator */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs text-muted-foreground">{getStatusText()}</span>
        {server?.port && (
          <span className="text-xs text-muted-foreground ml-1">:{server.port}</span>
        )}
      </div>

      {/* Run Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={(status === "stopped" || status === "error") && !isExecuting ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={handleRun}
            disabled={status === "starting" || status === "building" || isExecuting}
          >
            {isExecuting || status === "starting" || status === "building" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isCodeFile ? `Run ${activeTab.language} (Ctrl+Enter)` : "Run Project (Ctrl+Enter)"}
        </TooltipContent>
      </Tooltip>

      {/* Stop Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={(isExecuting || status === "running") ? "destructive" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={handleStop}
            disabled={!isExecuting && status !== "running"}
          >
            <Square className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isExecuting ? "Stop Execution" : "Stop Project"}</TooltipContent>
      </Tooltip>

      {/* Restart Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={restartServer}
            disabled={status !== "running" && status !== "error"}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Restart Project</TooltipContent>
      </Tooltip>
    </div>
  );
}
