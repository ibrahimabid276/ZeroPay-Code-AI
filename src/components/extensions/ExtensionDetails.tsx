"use client";

import { useState } from "react";
import { Extension } from "@/types";
import { useExtensionStore } from "@/stores/extensionStore";
import { ArrowLeft, Star, Download, Calendar, Shield, Loader2, RefreshCw, Power, PowerOff, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ExtensionDetailsProps {
  extension: Extension;
  onBack: () => void;
}

function formatDownloads(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export function ExtensionDetails({ extension, onBack }: ExtensionDetailsProps) {
  const { installExtension, uninstallExtension, enableExtension, disableExtension, updateExtension, installing, updating } = useExtensionStore();
  const [activeTab, setActiveTab] = useState<'description' | 'changelog' | 'permissions'>('description');
  
  const isInstalling = installing.has(extension.id);
  const isUpdating = updating.has(extension.id);
  const hasUpdate = extension.installed && extension.installedVersion !== extension.latestVersion;

  const handleInstall = async () => {
    await installExtension(extension.id);
  };

  const handleUninstall = async () => {
    if (window.confirm(`Uninstall ${extension.displayName}?`)) {
      await uninstallExtension(extension.id);
      onBack();
    }
  };

  const handleEnable = () => enableExtension(extension.id);
  const handleDisable = () => disableExtension(extension.id);
  const handleUpdate = async () => await updateExtension(extension.id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium">Extension Details</span>
      </div>

      <ScrollArea className="flex-1">
        {/* Extension Info */}
        <div className="p-4">
          <div className="flex gap-4 mb-4">
            {/* Large Icon */}
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-primary">
                {extension.displayName.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold">{extension.displayName}</h2>
                {extension.installed && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{extension.publisher}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{extension.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDownloads(extension.downloadCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{extension.updatedAt}</span>
                </div>
              </div>

              {extension.installed && extension.installedVersion && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Version {extension.installedVersion} {hasUpdate && `(Update available: ${extension.latestVersion})`}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            {!extension.installed ? (
              <Button className="flex-1" onClick={handleInstall} disabled={isInstalling}>
                {isInstalling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Installing...
                  </>
                ) : (
                  'Install'
                )}
              </Button>
            ) : (
              <>
                {hasUpdate && (
                  <Button variant="outline" onClick={handleUpdate} disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Update
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={extension.enabled ? handleDisable : handleEnable}
                >
                  {extension.enabled ? (
                    <Power className="h-4 w-4 mr-2" />
                  ) : (
                    <PowerOff className="h-4 w-4 mr-2" />
                  )}
                  {extension.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="destructive" onClick={handleUninstall}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Uninstall
                </Button>
              </>
            )}
          </div>

          <Separator className="my-4" />

          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b">
            {(['description', 'changelog', 'permissions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div>
              <p className="text-sm leading-relaxed">{extension.description}</p>
              
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Category</h3>
                <span className="text-xs px-2 py-1 rounded bg-muted">
                  {extension.category.replace('-', ' ')}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Features</h3>
                <ul className="text-sm space-y-1">
                  <li>• IntelliSense and autocomplete</li>
                  <li>• Syntax highlighting</li>
                  <li>• Code navigation</li>
                  <li>• Error detection</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'changelog' && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Version {extension.latestVersion}</h3>
              <p className="text-sm text-muted-foreground mb-4">Released on {extension.updatedAt}</p>
              <ul className="text-sm space-y-2">
                <li>• Bug fixes and performance improvements</li>
                <li>• Enhanced compatibility with latest editor version</li>
                <li>• Updated dependencies</li>
              </ul>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Required Permissions</h3>
              </div>
              
              {extension.permissions.length > 0 ? (
                <ul className="text-sm space-y-2">
                  {extension.permissions.map((perm) => (
                    <li key={perm} className="flex items-start gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-muted font-mono">
                        {perm}
                      </span>
                      <span className="text-muted-foreground">
                        {perm === 'editor:read' && 'Read editor content'}
                        {perm === 'editor:write' && 'Modify editor content'}
                        {perm === 'filesystem:read' && 'Read project files'}
                        {perm === 'filesystem:write' && 'Write project files'}
                        {perm === 'terminal:execute' && 'Run terminal commands'}
                        {perm === 'network:access' && 'Make network requests'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">This extension requires no special permissions.</p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
