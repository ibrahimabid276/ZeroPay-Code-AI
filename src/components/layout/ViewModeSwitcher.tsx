"use client";

import { useUIStore } from "@/stores/uiStore";
import { Code, Eye, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ViewModeSwitcher() {
  const { viewMode, setViewMode } = useUIStore();

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === "editor" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode("editor")}
          >
            <Code className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Editor Only</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === "split" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode("split")}
          >
            <Columns className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Split View</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode("preview")}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Preview Only</TooltipContent>
      </Tooltip>
    </div>
  );
}
