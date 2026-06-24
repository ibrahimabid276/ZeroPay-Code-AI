"use client";

import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";
import { X, Circle } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeAllTabs, closeOtherTabs } =
    useEditorStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex h-9 items-center border-b bg-card overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="flex h-9 items-center">
          {tabs.map((tab) => (
            <ContextMenu key={tab.id}>
              <ContextMenuTrigger asChild>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group flex h-9 items-center gap-1.5 border-r px-3 text-xs shrink-0 transition-colors max-w-[180px]",
                    activeTabId === tab.id
                      ? "bg-background text-foreground border-b-2 border-b-primary"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  {tab.isDirty && (
                    <Circle className="h-2 w-2 fill-primary text-primary shrink-0" />
                  )}
                  <span className="truncate">{tab.fileName}</span>
                  <X
                    className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 hover:bg-accent rounded-sm transition-opacity cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  />
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => closeTab(tab.id)}>
                  Close
                </ContextMenuItem>
                <ContextMenuItem onClick={() => closeOtherTabs(tab.id)}>
                  Close Others
                </ContextMenuItem>
                <ContextMenuItem onClick={closeAllTabs}>
                  Close All
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
