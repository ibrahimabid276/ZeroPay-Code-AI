"use client";

import { useEffect, useState } from 'react';
import { useNotebookStore } from '@/stores/notebookStore';
import { useAuthStore } from '@/stores/authStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Trash2, FileText, Loader2 } from 'lucide-react';

export function NotebookPanel() {
  const { notebooks, activeNotebook, isLoading, loadNotebooks, createNotebook, deleteNotebook, setActiveNotebook } = useNotebookStore();
  const { isAuthenticated } = useAuthStore();
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotebooks();
    }
  }, [isAuthenticated, loadNotebooks]);

  const handleCreate = async () => {
    if (!newNotebookTitle.trim()) return;
    
    setIsCreating(true);
    await createNotebook(newNotebookTitle.trim());
    setNewNotebookTitle('');
    setIsCreating(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="mb-2">Sign in to use notebooks</p>
          <p className="text-[10px]">Notebooks are saved to your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Notebooks
          </h3>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newNotebookTitle}
            onChange={(e) => setNewNotebookTitle(e.target.value)}
            placeholder="New notebook title..."
            className="h-8 text-xs bg-white/5 border-white/10 text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={isCreating || !newNotebookTitle.trim()}
            className="h-8 px-2 gradient-primary"
          >
            {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {notebooks.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground text-xs">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notebooks yet</p>
              <p className="text-[10px]">Create one to get started</p>
            </div>
          )}

          {notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                activeNotebook?.id === notebook.id
                  ? 'bg-white/10 text-white'
                  : 'hover:bg-white/5 text-muted-foreground'
              }`}
              onClick={() => setActiveNotebook(notebook)}
            >
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{notebook.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {notebook.runtimeType} • {notebook.cells?.length || 0} cells
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotebook(notebook.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
