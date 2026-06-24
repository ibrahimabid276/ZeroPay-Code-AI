"use client";

import { Extension } from "@/types";
import { useExtensionStore } from "@/stores/extensionStore";
import { Star, Download, Settings, Trash2, RefreshCw, Power, PowerOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExtensionCardProps {
  extension: Extension;
  onClick: () => void;
}

function formatDownloads(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export function ExtensionCard({ extension, onClick }: ExtensionCardProps) {
  const { installExtension, uninstallExtension, enableExtension, disableExtension, updateExtension, installing, updating } = useExtensionStore();
  
  const isInstalling = installing.has(extension.id);
  const isUpdating = updating.has(extension.id);
  const hasUpdate = extension.installed && extension.installedVersion !== extension.latestVersion;

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await installExtension(extension.id);
  };

  const handleUninstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Uninstall ${extension.displayName}?`)) {
      await uninstallExtension(extension.id);
    }
  };

  const handleEnable = (e: React.MouseEvent) => {
    e.stopPropagation();
    enableExtension(extension.id);
  };

  const handleDisable = (e: React.MouseEvent) => {
    e.stopPropagation();
    disableExtension(extension.id);
  };

  const handleUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateExtension(extension.id);
  };

  return (
    <button
      onClick={onClick}
      className="flex gap-3 w-full px-3 py-2.5 hover:bg-accent/50 transition-colors text-left group"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
        <span className="text-lg font-bold text-primary">
          {extension.displayName.charAt(0)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold truncate">{extension.displayName}</span>
              {extension.installed && (
                <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{extension.publisher}</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-muted-foreground">{extension.rating}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Download className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{formatDownloads(extension.downloadCount)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!extension.installed ? (
              <Button
                size="sm"
                className="h-6 px-3 text-xs"
                onClick={handleInstall}
                disabled={isInstalling}
              >
                {isInstalling ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Install'
                )}
              </Button>
            ) : (
              <>
                {hasUpdate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleUpdate}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Update to {extension.latestVersion}</TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={extension.enabled ? handleDisable : handleEnable}
                    >
                      {extension.enabled ? (
                        <Power className="h-3 w-3" />
                      ) : (
                        <PowerOff className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{extension.enabled ? 'Disable' : 'Enable'}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleUninstall}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Uninstall</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {extension.description}
        </p>

        {/* Category Badge */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {extension.category.replace('-', ' ')}
          </span>
          {extension.installed && extension.installedVersion && (
            <span className="text-[10px] text-muted-foreground">
              v{extension.installedVersion}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
