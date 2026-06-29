"use client";

import { useState, useEffect } from "react";
import { X, Keyboard, Monitor, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SHORTCUT_REGISTRY, Shortcut, formatShortcut } from "@/lib/shortcuts";

interface ShortcutsModalProps {
  onClose: () => void;
}

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "ide" | "navigation">("editor");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const tabs = [
    { id: "editor" as const, label: "Editor", icon: Monitor },
    { id: "ide" as const, label: "IDE", icon: Keyboard },
    { id: "navigation" as const, label: "Navigation", icon: Navigation },
  ];

  const filteredShortcuts = SHORTCUT_REGISTRY.filter((s) => s.category === activeTab);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[700px] max-h-[80vh] bg-card border rounded-lg shadow-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Keyboard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === id
                  ? "bg-accent text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Shortcuts List */}
        <ScrollArea className="flex-1 max-h-[500px]">
          <div className="p-6">
            <div className="space-y-2">
              {filteredShortcuts.map((shortcut) => (
                <ShortcutRow key={shortcut.id} shortcut={shortcut} />
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground text-center">
          Press <kbd className="px-2 py-1 bg-background border rounded text-xs">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ shortcut }: { shortcut: Omit<Shortcut, "handler"> }) {
  return (
    <div className="flex items-center justify-between py-3 px-3 rounded-md hover:bg-accent/50 transition-colors group">
      <span className="text-sm font-medium">{shortcut.label}</span>
      <div className="flex gap-1">
        {formatShortcut(shortcut.shortcut).split("+").map((key, idx) => (
          <div key={idx} className="flex items-center gap-1">
            {idx > 0 && <span className="text-muted-foreground text-xs">+</span>}
            <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono min-w-[32px] text-center shadow-sm group-hover:border-primary/50 transition-colors">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
