"use client";

import { useState, useEffect } from "react";
import { GitBranch, GitCommit, Plus, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function GitPanel() {
  const [changes, setChanges] = useState<any[]>([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    loadChanges();
  }, []);

  const loadChanges = async () => {
    // Placeholder - will be implemented when Git API is ready
    setChanges([
      { file: "src/components/App.tsx", status: "modified" },
      { file: "package.json", status: "modified" },
      { file: "src/utils/helpers.ts", status: "new" },
    ]);
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    setIsCommitting(true);
    // Placeholder - will be implemented when Git API is ready
    setTimeout(() => {
      setIsCommitting(false);
      setCommitMessage("");
      alert("Git commit feature will be fully functional soon!");
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "modified":
        return <span className="text-yellow-400 text-xs">M</span>;
      case "new":
        return <span className="text-green-400 text-xs">A</span>;
      case "deleted":
        return <span className="text-red-400 text-xs">D</span>;
      default:
        return <span className="text-muted-foreground text-xs">?</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Source Control
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            main
          </span>
        </div>
      </div>

      {/* Changes */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {changes.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-muted-foreground mb-2 px-1">
                Changes ({changes.length})
              </p>
              <div className="space-y-0.5">
                {changes.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
                  >
                    {getStatusIcon(change.status)}
                    <span className="text-xs text-white flex-1 truncate">
                      {change.file}
                    </span>
                    <Plus className="h-3 w-3 text-muted-foreground hover:text-white cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {changes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GitCommit className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                No changes detected
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                All files are up to date
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Commit Section */}
      {changes.length > 0 && (
        <div className="p-3 border-t border-white/10">
          <Textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            className="text-xs mb-2 min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || isCommitting}
              className="flex-1 h-7 text-xs"
              size="sm"
            >
              {isCommitting ? (
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
