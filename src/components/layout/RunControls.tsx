"use client";

import { useServerStore } from "@/stores/serverStore";
import { Play, Square, RotateCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function RunControls() {
  const { server, startServer, stopServer, restartServer } = useServerStore();
  const status = server?.status || "stopped";

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
            variant={status === "stopped" || status === "error" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={startServer}
            disabled={status === "starting" || status === "building"}
          >
            {status === "starting" || status === "building" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Run Project (Ctrl+Enter)</TooltipContent>
      </Tooltip>

      {/* Stop Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={status === "running" ? "destructive" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={stopServer}
            disabled={status !== "running"}
          >
            <Square className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Stop Project</TooltipContent>
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
