"use client";

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Palette, Code2, MessageSquare, Save } from 'lucide-react';

export function SettingsPanel() {
  const { settings, updateSetting, loadSettings } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated, loadSettings]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
        <div className="text-center">
          <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="mb-2">Sign in to access settings</p>
          <p className="text-[10px]">Settings are synced across devices</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </h3>
          <p className="text-xs text-muted-foreground">Customize your IDE experience</p>
        </div>

        <Separator />

        {/* Appearance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-medium">
            <Palette className="h-4 w-4" />
            <h4>Appearance</h4>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => updateSetting('theme', value)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Editor */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-medium">
            <Code2 className="h-4 w-4" />
            <h4>Editor</h4>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Font Size</Label>
            <Select
              value={settings.editorFontSize.toString()}
              onValueChange={(value) => updateSetting('editorFontSize', parseInt(value))}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[12, 13, 14, 15, 16, 18, 20].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Tab Size</Label>
            <Select
              value={settings.editorTabSize.toString()}
              onValueChange={(value) => updateSetting('editorTabSize', parseInt(value))}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 8].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} spaces
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Word Wrap</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSetting('wordWrap', !settings.wordWrap)}
              className={settings.wordWrap ? 'bg-primary/20 border-primary' : ''}
            >
              {settings.wordWrap ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* AI */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-medium">
            <MessageSquare className="h-4 w-4" />
            <h4>AI Settings</h4>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">AI Model</Label>
            <Select
              value={settings.aiModel}
              onValueChange={(value) => updateSetting('aiModel', value)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google/gemma-4-26b-a4b-it:free">Gemma 4 (Free)</SelectItem>
                <SelectItem value="google/gemma-4-31b-it:free">Gemma 4 31B (Free)</SelectItem>
                <SelectItem value="cohere/north-mini-code:free">Cohere Code (Free)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Auto-save</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSetting('autoSave', !settings.autoSave)}
              className={settings.autoSave ? 'bg-primary/20 border-primary' : ''}
            >
              {settings.autoSave ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground text-center">
          <Save className="h-3 w-3 inline mr-1" />
          Settings are automatically saved and synced
        </div>
      </div>
    </ScrollArea>
  );
}
