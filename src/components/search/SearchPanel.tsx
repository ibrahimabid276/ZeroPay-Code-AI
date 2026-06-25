"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/files/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white mb-2">Search</h3>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search files..."
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isSearching ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-xs">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">{result.file}</p>
                    {result.line && (
                      <p className="text-[10px] text-muted-foreground">
                        Line {result.line}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-xs">
              No results found
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                Search across all files
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Type to start searching
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
