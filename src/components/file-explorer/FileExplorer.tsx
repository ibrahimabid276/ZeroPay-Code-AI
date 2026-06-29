"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { useEditorStore } from "@/stores/editorStore";
import { FileNode } from "@/types";
import { cn, getFileLanguage } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  FolderPlus,
  Trash2,
  Pencil,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SearchResult {
  path: string;
  name: string;
  type: "file" | "folder";
  matches?: { line: number; text: string }[];
}

/**
 * Recursive file tree item with expand/collapse for folders.
 */
function FileTreeItem({
  node,
  depth = 0,
  onFileClick,
}: {
  node: FileNode;
  depth?: number;
  onFileClick: (node: FileNode) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { selectedFileId, setSelectedFileId } = useProjectStore();
  const isSelected = selectedFileId === node.id;

  const handleClick = () => {
    if (node.type === "folder") {
      setExpanded(!expanded);
    } else {
      setSelectedFileId(node.id);
      onFileClick(node);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1 w-full px-2 py-0.5 text-sm hover:bg-accent/50 rounded-sm transition-colors",
          isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {node.type === "folder" ? (
          <>
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            {expanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-blue-400" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-blue-400" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <File className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="truncate text-xs">{node.name}</span>
      </button>
      {node.type === "folder" && expanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === "folder" ? -1 : 1;
            })
            .map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                onFileClick={onFileClick}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer() {
  const { currentProject, fileTree, refreshFileTree } = useProjectStore();
  const { openTab } = useEditorStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dialog state for create file/folder and rename
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"file" | "folder" | "rename">("file");
  const [newItemName, setNewItemName] = useState("");
  const [creatingIn, setCreatingIn] = useState<string>("");
  const [renameNode, setRenameNode] = useState<FileNode | null>(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  /** Open file in editor when clicked */
  const handleFileClick = useCallback(
    async (node: FileNode) => {
      if (!currentProject) return;
      try {
        const res = await fetch(
          `/api/files?projectId=${currentProject.id}&path=${encodeURIComponent(node.path)}`
        );
        if (res.ok) {
          const data = await res.json();
          openTab({
            fileName: node.name,
            filePath: node.path,
            language: getFileLanguage(node.name),
            content: data.content || "",
          });
        }
      } catch (e) {
        console.error("Failed to open file:", e);
      }
    },
    [currentProject, openTab]
  );

  /** Open file from search results */
  const handleSearchResultClick = useCallback(
    async (result: SearchResult) => {
      if (!currentProject || result.type !== "file") return;
      try {
        const res = await fetch(
          `/api/files?projectId=${currentProject.id}&path=${encodeURIComponent(result.path)}`
        );
        if (res.ok) {
          const data = await res.json();
          const fileName = result.path.split("/").pop() || result.name;
          openTab({
            fileName,
            filePath: result.path,
            language: getFileLanguage(fileName),
            content: data.content || "",
          });
        }
      } catch (e) {
        console.error("Failed to open file from search:", e);
      }
    },
    [currentProject, openTab]
  );

  /** Create new file or folder */
  const handleCreate = async () => {
    if (!currentProject || !newItemName.trim()) return;
    const path = creatingIn ? `${creatingIn}/${newItemName}` : newItemName;
    try {
      if (dialogType === "file") {
        await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: currentProject.id,
            path,
            content: "",
          }),
        });
      } else {
        await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: currentProject.id,
            path: path + "/.gitkeep",
            content: "",
          }),
        });
      }
      await refreshFileTree();
      setDialogOpen(false);
      setNewItemName("");
    } catch (e) {
      console.error("Failed to create:", e);
    }
  };

  /** Rename file or folder */
  const handleRename = async () => {
    if (!currentProject || !renameNode || !newItemName.trim()) return;
    try {
      const res = await fetch("/api/files/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          oldPath: renameNode.path,
          newName: newItemName.trim(),
        }),
      });
      if (res.ok) {
        await refreshFileTree();
      }
      setDialogOpen(false);
      setNewItemName("");
      setRenameNode(null);
    } catch (e) {
      console.error("Failed to rename:", e);
    }
  };

  /** Delete file or folder */
  const handleDelete = async (node: FileNode) => {
    if (!currentProject) return;
    const confirmed = window.confirm(
      `Delete "${node.name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: currentProject.id,
          path: node.path,
        }),
      });
      await refreshFileTree();
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  /** Debounced file search */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      if (!currentProject) return;
      setSearching(true);
      try {
        const res = await fetch(
          `/api/files/search?projectId=${currentProject.id}&query=${encodeURIComponent(query)}&content=true`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
        Loading...
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
        No project selected
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Explorer
        </span>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search files (Ctrl+P)"
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setDialogType("file");
              setCreatingIn("");
              setNewItemName("");
              setDialogOpen(true);
            }}
            title="New file"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setDialogType("folder");
              setCreatingIn("");
              setNewItemName("");
              setDialogOpen(true);
            }}
            title="New folder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => refreshFileTree()}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="px-2 py-1.5 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-7 text-xs pl-7 pr-7"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search results or file tree */}
      <ScrollArea className="flex-1">
        {searchOpen && searchQuery ? (
          /* Search Results */
          <div className="py-1">
            {searching && (
              <div className="text-center text-muted-foreground text-xs py-4">
                Searching...
              </div>
            )}
            {!searching && searchResults.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-4">
                No results found
              </div>
            )}
            {searchResults.map((result) => (
              <button
                key={result.path}
                className="flex items-center gap-1.5 w-full px-3 py-1 text-xs hover:bg-accent/50 transition-colors text-left"
                onClick={() => handleSearchResultClick(result)}
              >
                {result.type === "folder" ? (
                  <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                ) : (
                  <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate">{result.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {result.path}
                  </span>
                  {result.matches && result.matches.length > 0 && (
                    <span className="text-[10px] text-blue-400 truncate">
                      Line {result.matches[0].line}: {result.matches[0].text}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* File Tree */
          <div className="py-1">
            {fileTree
              .sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === "folder" ? -1 : 1;
              })
              .map((node) => (
                <ContextMenu key={node.id}>
                  <ContextMenuTrigger asChild>
                    <div>
                      <FileTreeItem node={node} onFileClick={handleFileClick} />
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    {node.type === "folder" && (
                      <>
                        <ContextMenuItem
                          onClick={() => {
                            setDialogType("file");
                            setCreatingIn(node.path);
                            setNewItemName("");
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-2" /> New File
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            setDialogType("folder");
                            setCreatingIn(node.path);
                            setNewItemName("");
                            setDialogOpen(true);
                          }}
                        >
                          <FolderPlus className="h-3.5 w-3.5 mr-2" /> New Folder
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                      </>
                    )}
                    <ContextMenuItem
                      onClick={() => {
                        setDialogType("rename");
                        setRenameNode(node);
                        setNewItemName(node.name);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Rename
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleDelete(node)}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            {fileTree.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">
                Empty project
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Create / Rename Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "rename"
                ? `Rename ${renameNode?.type === "folder" ? "Folder" : "File"}`
                : `New ${dialogType === "file" ? "File" : "Folder"}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder={
                dialogType === "file"
                  ? "e.g. src/index.ts"
                  : dialogType === "folder"
                  ? "e.g. src/components"
                  : "Enter new name"
              }
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  dialogType === "rename" ? handleRename() : handleCreate();
                }
              }}
              autoFocus
            />
            {creatingIn && dialogType !== "rename" && (
              <p className="text-xs text-muted-foreground mt-1">
                Creating in: {creatingIn}/
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={dialogType === "rename" ? handleRename : handleCreate}>
              {dialogType === "rename" ? "Rename" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
