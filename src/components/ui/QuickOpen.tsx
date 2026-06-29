"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useEditorStore } from "@/stores/editorStore";
import { Search, File } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFileIcon } from "@/lib/file-icons";

interface QuickOpenProps {
  onClose: () => void;
}

export function QuickOpen({ onClose }: QuickOpenProps) {
  const { fileTree, currentProject } = useProjectStore();
  const { openTab } = useEditorStore();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get all files from tree
  const getAllFiles = useCallback((nodes: any[]): Array<{ name: string; path: string }> => {
    const files: Array<{ name: string; path: string }> = [];
    
    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === "file") {
          files.push({ name: node.name, path: node.path });
        } else if (node.children) {
          traverse(node.children);
        }
      }
    };
    
    if (nodes) traverse(nodes);
    return files;
  }, []);

  const allFiles = getAllFiles(fileTree || []);
  
  // Fuzzy search
  const files = allFiles.filter((file) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const nameMatch = file.name.toLowerCase().includes(searchLower);
    const pathMatch = file.path.toLowerCase().includes(searchLower);
    return nameMatch || pathMatch;
  }).slice(0, 20);

  const openFile = async (file: { name: string; path: string }) => {
    if (!currentProject) return;
    
    try {
      const res = await fetch(
        `/api/files?projectId=${currentProject.id}&path=${encodeURIComponent(file.path)}`
      );
      if (res.ok) {
        const data = await res.json();
        openTab({
          fileName: file.name,
          filePath: file.path,
          language: file.name.split(".").pop() || "plaintext",
          content: data.content || "",
        });
        onClose();
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, files.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && files[selectedIndex]) {
        e.preventDefault();
        openFile(files[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedIndex, files, openFile]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm">
      <div className="w-[600px] bg-card border rounded-lg shadow-2xl animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search files by name..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2" ref={scrollRef}>
            {files.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No files found
              </div>
            ) : (
              files.map((file, idx) => {
                const iconInfo = getFileIcon(file.name, false);
                return (
                  <button
                    key={file.path}
                    onClick={() => openFile(file)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-3 py-2 text-left flex items-center gap-3 rounded-md transition-colors ${
                      idx === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <span style={{ color: iconInfo.color }}>{iconInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{file.path}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↵</kbd> Open</span>
            <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Esc</kbd> Close</span>
          </div>
          <span>{files.length} file{files.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
