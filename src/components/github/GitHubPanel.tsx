"use client";

import { useState } from "react";
import { Code2, FolderOpen, RefreshCw, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function GitHubPanel() {
  const [isConnected, setIsConnected] = useState(false);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    // Placeholder - will implement OAuth flow
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      // Mock repositories
      setRepositories([
        { name: "my-react-app", description: "A React application", stars: 12, updated: "2h ago" },
        { name: "node-api", description: "REST API with Express", stars: 8, updated: "1d ago" },
        { name: "portfolio-site", description: "Personal portfolio", stars: 5, updated: "3d ago" },
      ]);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setRepositories([]);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Code2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-sm font-semibold text-white mb-2">Connect GitHub</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Connect your GitHub account to manage repositories
        </p>
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Code2 className="h-4 w-4 mr-2" />
              Connect GitHub
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            GitHub
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            className="h-6 text-[10px]"
          >
            Disconnect
          </Button>
        </div>
      </div>

      {/* Repositories */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <p className="text-[10px] text-muted-foreground mb-2 px-1">
            Your Repositories ({repositories.length})
          </p>
          <div className="space-y-1">
            {repositories.map((repo, index) => (
              <button
                key={index}
                className="w-full text-left px-2 py-2 rounded hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-white font-medium">
                    {repo.name}
                  </span>
                </div>
                {repo.description && (
                  <p className="text-[10px] text-muted-foreground truncate mb-1">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>⭐ {repo.stars}</span>
                  <span>Updated {repo.updated}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh Repositories
        </Button>
        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
          Create New Repository
        </Button>
      </div>
    </div>
  );
}
