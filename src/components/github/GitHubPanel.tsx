"use client";

import { useState, useEffect } from "react";
import { Code2, FolderOpen, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
  private: boolean;
  cloneUrl: string;
}

export function GitHubPanel() {
  const { isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkGitHubConnection();
  }, [isAuthenticated]);

  const checkGitHubConnection = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/github/repos');
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories || []);
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setRepositories([]);
      }
    } catch (error) {
      console.error('Check connection error:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isAuthenticated) {
      setError('Please login first to connect GitHub');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Redirect to GitHub OAuth
      window.location.href = '/api/auth/github';
    } catch (error) {
      console.error('Connect error:', error);
      setError('Failed to connect to GitHub');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/github/repos', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIsConnected(false);
        setRepositories([]);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/github/repos');
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories || []);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Code2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-sm font-semibold text-white mb-2">Login Required</h3>
        <p className="text-xs text-muted-foreground">
          Please login to connect your GitHub account
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Code2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-sm font-semibold text-white mb-2">Connect GitHub</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Connect your GitHub account to manage repositories
        </p>
        {error && (
          <p className="text-xs text-red-400 mb-3">{error}</p>
        )}
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            disabled={isLoading}
            className="h-6 text-[10px]"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Disconnect'}
          </Button>
        </div>
      </div>

      {/* Repositories */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading && repositories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : repositories.length > 0 ? (
            <>
              <p className="text-[10px] text-muted-foreground mb-2 px-1">
                Your Repositories ({repositories.length})
              </p>
              <div className="space-y-1">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => window.open(repo.url, '_blank')}
                    className="w-full text-left px-2 py-2 rounded hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FolderOpen className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-white font-medium truncate">
                        {repo.fullName}
                      </span>
                      {repo.private && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                          Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-[10px] text-muted-foreground truncate mb-1">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>⭐ {repo.stars}</span>
                      <span>🍴 {repo.forks}</span>
                      {repo.language && <span>{repo.language}</span>}
                      <span className="ml-auto">Updated {formatDate(repo.updatedAt)}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                No repositories found
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Create a repository on GitHub first
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-7 text-xs" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Repositories
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-7 text-xs"
          onClick={() => window.open('https://github.com/new', '_blank')}
        >
          Create New Repository
        </Button>
      </div>
    </div>
  );
}
