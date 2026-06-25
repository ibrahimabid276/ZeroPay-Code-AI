"use client";

import { useState } from "react";
import { Database, Table, Plus, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function DatabasePanel() {
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTables = async () => {
    setIsLoading(true);
    // Placeholder - will be implemented when database API is ready
    setTimeout(() => {
      setTables([
        { name: "users", rows: 1234, size: "2.5 MB" },
        { name: "projects", rows: 567, size: "1.2 MB" },
        { name: "settings", rows: 89, size: "0.3 MB" },
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadTables}
            className="h-6 w-6"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Tables */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {tables.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground mb-2 px-1">
                Tables ({tables.length})
              </p>
              {tables.map((table, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-2 rounded hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Table className="h-3 w-3 text-primary" />
                    <span className="text-xs text-white font-medium">
                      {table.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{table.rows} rows</span>
                    <span>{table.size}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Database className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                No tables found
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Connect to a database to view tables
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          New Table
        </Button>
        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
          Execute Query
        </Button>
      </div>
    </div>
  );
}
