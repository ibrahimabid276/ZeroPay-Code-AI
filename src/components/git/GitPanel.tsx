"use client";

import { useState, useEffect } from "react";
import { useGitStore } from "@/stores/gitStore";
import {
  GitBranch,
  GitCommit,
  Plus,
  Check,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function GitPanel() {
  const {
    currentBranch,
    changes,
    stagedChanges,
    commits,
    isLoading,
    error,
    loadStatus,
    stageFile,
    stageAll,
    unstageFile,
    commit,
    push,
    pull,
    loadCommits,
  } = useGitStore();

  const [commitMessage, setCommitMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    loadCommits(10);
  }, []);

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    await commit(commitMessage);
    setCommitMessage("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "modified":
        return <span className="text-yellow-500 text-xs font-bold">M</span>;
      case "added":
      case "untracked":
        return <span className="text-green-500 text-xs font-bold">A</span>;
      case "deleted":
        return <span className="text-red-500 text-xs font-bold">D</span>;
      default:
        return <span className="text-muted-foreground text-xs font-bold">?</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Push/Pull */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="text-xs font-semibold">{currentBranch}</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => pull()}
              disabled={isLoading}
              title="Pull from remote"
            >
              <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
              Pull
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => push()}
              disabled={isLoading}
              title="Push to remote"
            >
              <ArrowUpCircle className="h-3.5 w-3.5 mr-1" />
              Push
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* Staged Changes */}
      {stagedChanges.length > 0 && (
        <div className="p-2 border-b">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-medium text-muted-foreground">
              Staged Changes ({stagedChanges.length})
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-[10px]"
              onClick={() => unstageFile(stagedChanges[0].path)}
            >
              Unstage All
            </Button>
          </div>
          <div className="space-y-0.5">
            {stagedChanges.map((change) => (
              <div
                key={change.path}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedFile(change.path)}
              >
                {getStatusIcon(change.status)}
                <span className="text-xs flex-1 truncate">{change.filename}</span>
                <X
                  className="h-3 w-3 text-muted-foreground hover:text-red-500 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    unstageFile(change.path);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Changes */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {changes.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Changes ({changes.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px]"
                  onClick={() => stageAll()}
                >
                  Stage All
                </Button>
              </div>
              <div className="space-y-0.5">
                {changes.map((change) => (
                  <div
                    key={change.path}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFile(change.path)}
                  >
                    {getStatusIcon(change.status)}
                    <span className="text-xs flex-1 truncate">{change.filename}</span>
                    <Plus
                      className="h-3 w-3 text-muted-foreground hover:text-green-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        stageFile(change.path);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {changes.length === 0 && stagedChanges.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GitCommit className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No changes detected</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                All files are up to date
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Commit History */}
      {commits.length > 0 && (
        <div className="border-t">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-accent/50 transition-colors"
          >
            {showHistory ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <span className="text-xs font-medium">Commit History</span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {commits.length}
            </span>
          </button>
          {showHistory && (
            <ScrollArea className="max-h-[200px] border-t">
              <div className="p-2 space-y-1">
                {commits.map((commit) => (
                  <div
                    key={commit.hash}
                    className="px-2 py-1.5 rounded hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-primary">
                        {commit.hash}
                      </span>
                      <span className="text-xs flex-1 truncate">
                        {commit.message}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {commit.author} • {new Date(commit.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Commit Section */}
      {(changes.length > 0 || stagedChanges.length > 0) && (
        <div className="p-3 border-t">
          <Textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            className="text-xs mb-2 min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || (stagedChanges.length === 0 && changes.length === 0) || isLoading}
              className="flex-1 h-7 text-xs"
              size="sm"
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                  Committing...
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Commit
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCommitMessage("")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
