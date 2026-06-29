"use client";

import { useState } from "react";
import { Check, X, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiffViewProps {
  original: string;
  modified: string;
  filename: string;
  onAccept: () => void;
  onReject: () => void;
}

export function DiffView({
  original,
  modified,
  filename,
  onAccept,
  onReject,
}: DiffViewProps) {
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");

  const originalLines = original.split("\n");
  const modifiedLines = modified.split("\n");

  // Simple line-by-line diff
  const getDiffLines = () => {
    const lines: Array<{
      type: "added" | "removed" | "unchanged";
      originalNum?: number;
      modifiedNum?: number;
      content: string;
    }> = [];

    const maxLines = Math.max(originalLines.length, modifiedLines.length);

    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i];
      const modLine = modifiedLines[i];

      if (origLine === modLine) {
        lines.push({
          type: "unchanged",
          originalNum: i + 1,
          modifiedNum: i + 1,
          content: origLine || "",
        });
      } else {
        if (origLine !== undefined) {
          lines.push({
            type: "removed",
            originalNum: i + 1,
            content: origLine,
          });
        }
        if (modLine !== undefined) {
          lines.push({
            type: "added",
            modifiedNum: i + 1,
            content: modLine,
          });
        }
      }
    }

    return lines;
  };

  const diffLines = getDiffLines();

  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;

  return (
    <div className="my-2 rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">{filename}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-600">
            +{addedCount}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-600">
            -{removedCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setViewMode(viewMode === "split" ? "unified" : "split")}
          >
            {viewMode === "split" ? "Unified" : "Split"}
          </Button>
        </div>
      </div>

      {/* Diff Content */}
      <div className="max-h-[400px] overflow-auto">
        {viewMode === "split" ? (
          <div className="grid grid-cols-2 divide-x">
            {/* Original */}
            <div className="bg-red-500/5">
              <div className="px-2 py-1 text-[10px] text-muted-foreground border-b bg-muted/30">
                Original
              </div>
              <pre className="p-2 text-xs font-mono">
                {originalLines.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2",
                      diffLines.find(
                        (d) => d.type === "removed" && d.originalNum === i + 1
                      ) && "bg-red-500/20"
                    )}
                  >
                    <span className="text-muted-foreground select-none w-8 text-right">
                      {i + 1}
                    </span>
                    <span className="flex-1">{line}</span>
                  </div>
                ))}
              </pre>
            </div>

            {/* Modified */}
            <div className="bg-green-500/5">
              <div className="px-2 py-1 text-[10px] text-muted-foreground border-b bg-muted/30">
                Modified
              </div>
              <pre className="p-2 text-xs font-mono">
                {modifiedLines.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2",
                      diffLines.find(
                        (d) => d.type === "added" && d.modifiedNum === i + 1
                      ) && "bg-green-500/20"
                    )}
                  >
                    <span className="text-muted-foreground select-none w-8 text-right">
                      {i + 1}
                    </span>
                    <span className="flex-1">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        ) : (
          <pre className="p-2 text-xs font-mono">
            {diffLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  line.type === "added" && "bg-green-500/20",
                  line.type === "removed" && "bg-red-500/20"
                )}
              >
                <span className="text-muted-foreground select-none w-8 text-right">
                  {line.originalNum || line.modifiedNum}
                </span>
                <span className="text-muted-foreground select-none w-4">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </span>
                <span className="flex-1">{line.content}</span>
              </div>
            ))}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={onReject}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Reject
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs bg-green-600 hover:bg-green-700"
          onClick={onAccept}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Accept Changes
        </Button>
      </div>
    </div>
  );
}
