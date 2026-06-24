"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useServerStore } from "@/stores/serverStore";
import { useUIStore } from "@/stores/uiStore";
import { useFileWatcher } from "@/hooks/useFileWatcher";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LivePreview() {
  const { server } = useServerStore();
  const { previewMode, setPreviewMode } = useUIStore();
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = server?.previewUrl;

  useEffect(() => {
    setIsLoading(true);
  }, [previewUrl, iframeKey]);

  const handleRefresh = useCallback(() => {
    setIframeKey((prev) => prev + 1);
    setIsLoading(true);
  }, []);

  // Watch for file changes and auto-refresh
  useFileWatcher(handleRefresh);

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  if (!previewUrl) {
    return (
      <div className="flex flex-col h-full bg-card border-l">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground">Preview</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Monitor className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">No preview available</p>
            <p className="text-xs text-muted-foreground">Click the Run button to start your project</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">Preview</span>
          {server?.port && (
            <span className="text-xs text-muted-foreground">- Port {server.port}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Device Mode Switcher */}
          <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5 mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={previewMode === "desktop" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Desktop</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={previewMode === "tablet" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setPreviewMode("tablet")}
                >
                  <Tablet className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tablet</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={previewMode === "mobile" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mobile</TooltipContent>
            </Tooltip>
          </div>

          {/* Refresh Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefresh}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Preview</TooltipContent>
          </Tooltip>

          {/* Open in New Tab */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in New Tab</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* URL Bar */}
      <div className="px-3 py-1.5 border-b bg-muted/20">
        <div className="flex items-center gap-2 px-2 py-1 rounded bg-background text-xs text-muted-foreground">
          <span className="truncate">{previewUrl}</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-background flex justify-center p-4">
        <div
          className="bg-background transition-all duration-300 ease-in-out"
          style={{
            width: getPreviewWidth(),
            height: "100%",
            maxWidth: "100%",
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0 rounded shadow-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
