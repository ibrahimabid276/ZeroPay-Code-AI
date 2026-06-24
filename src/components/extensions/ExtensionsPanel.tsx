"use client";

import { useState, useEffect, useRef } from "react";
import { useExtensionStore } from "@/stores/extensionStore";
import { Extension, ExtensionCategory } from "@/types";
import { Search, Filter, Star, Download, ChevronDown, ChevronRight, Settings, Trash2, RefreshCw, Power, PowerOff, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExtensionCard } from "./ExtensionCard";
import { ExtensionDetails } from "./ExtensionDetails";

const CATEGORIES: { id: ExtensionCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Extensions' },
  { id: 'ai-tools', label: 'AI Tools' },
  { id: 'themes', label: 'Themes' },
  { id: 'language-support', label: 'Language Support' },
  { id: 'code-formatters', label: 'Code Formatters' },
  { id: 'linters', label: 'Linters' },
  { id: 'git-tools', label: 'Git Tools' },
  { id: 'database-tools', label: 'Database Tools' },
  { id: 'docker-tools', label: 'Docker Tools' },
  { id: 'testing-tools', label: 'Testing Tools' },
  { id: 'productivity-tools', label: 'Productivity' },
];

export function ExtensionsPanel() {
  const {
    extensions,
    searchQuery,
    selectedCategory,
    selectedExtension,
    searchExtensions,
    setCategory,
    selectExtension,
    loadExtensions,
    getInstalledExtensions,
    getFeaturedExtensions,
    getRecommendedExtensions,
    getFilteredExtensions,
  } = useExtensionStore();

  const [showInstalled, setShowInstalled] = useState(false);
  const [showFeatured, setShowFeatured] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadExtensions();
  }, [loadExtensions]);

  const installedExtensions = getInstalledExtensions();
  const featuredExtensions = getFeaturedExtensions();
  const recommendedExtensions = getRecommendedExtensions();
  const filteredExtensions = getFilteredExtensions();

  const handleExtensionClick = (ext: Extension) => {
    selectExtension(ext);
  };

  if (selectedExtension) {
    return (
      <ExtensionDetails
        extension={selectedExtension}
        onBack={() => selectExtension(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Extensions
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => searchExtensions(e.target.value)}
            className="h-8 text-xs pl-8"
          />
        </div>

        {/* Category Filter */}
        <div className="mt-2 flex items-center gap-1 overflow-x-auto">
          <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setCategory(e.target.value as ExtensionCategory | 'all')}
            className="flex-1 text-xs bg-transparent border-none outline-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* Installed Extensions */}
          {installedExtensions.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowInstalled(!showInstalled)}
                className="flex items-center gap-1.5 w-full px-3 py-1.5 text-xs font-semibold hover:bg-accent/50 transition-colors"
              >
                {showInstalled ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                <Package className="h-3.5 w-3.5" />
                <span>Installed ({installedExtensions.length})</span>
              </button>
              
              {showInstalled && (
                <div className="mt-1">
                  {installedExtensions.map((ext) => (
                    <ExtensionCard
                      key={ext.id}
                      extension={ext}
                      onClick={() => handleExtensionClick(ext)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Featured Extensions */}
          {showFeatured && featuredExtensions.length > 0 && !searchQuery && (
            <div className="mb-4">
              <button
                onClick={() => setShowFeatured(!showFeatured)}
                className="flex items-center gap-1.5 w-full px-3 py-1.5 text-xs font-semibold hover:bg-accent/50 transition-colors"
              >
                {showFeatured ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                <span>Featured</span>
              </button>
              
              {showFeatured && (
                <div className="mt-1">
                  {featuredExtensions.slice(0, 5).map((ext) => (
                    <ExtensionCard
                      key={ext.id}
                      extension={ext}
                      onClick={() => handleExtensionClick(ext)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommended */}
          {!searchQuery && selectedCategory === 'all' && recommendedExtensions.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1.5 text-xs font-semibold">Recommended</div>
              <div>
                {recommendedExtensions.slice(0, 4).map((ext) => (
                  <ExtensionCard
                    key={ext.id}
                    extension={ext}
                    onClick={() => handleExtensionClick(ext)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search Results / All Extensions */}
          <div>
            <div className="px-3 py-1.5 text-xs font-semibold">
              {searchQuery ? `Results (${filteredExtensions.length})` : 'All Extensions'}
            </div>
            {filteredExtensions.map((ext) => (
              <ExtensionCard
                key={ext.id}
                extension={ext}
                onClick={() => handleExtensionClick(ext)}
              />
            ))}
            {filteredExtensions.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8 px-4">
                {searchQuery ? 'No extensions found' : 'No extensions available'}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
