"use client";

import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { useEditorStore } from "@/stores/editorStore";
import { useProjectStore } from "@/stores/projectStore";
import { useTheme } from "@/components/providers/ThemeProvider";

export function MonacoEditorWrapper() {
  const { tabs, activeTabId, updateTabContent, markTabSaved } = useEditorStore();
  const { currentProject } = useProjectStore();
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Auto-save: debounced write to server when content changes
  const triggerAutoSave = useCallback(
    (tabId: string, content: string, filePath: string) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

      autoSaveTimer.current = setTimeout(async () => {
        if (!currentProject) return;
        try {
          const res = await fetch("/api/files", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: currentProject.id,
              path: filePath,
              content,
            }),
          });
          if (res.ok) {
            markTabSaved(tabId);
          }
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }, 1000);
    },
    [currentProject, markTabSaved]
  );

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor settings
    editor.getAction("editor.action.formatDocument")?.run;
    monaco.editor.defineTheme("opencode-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.lineHighlightBackground": "#1a1a2e10",
      },
    });
    monaco.editor.defineTheme("opencode-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
      },
    });
  };

  // Update editor theme when theme changes
  useEffect(() => {
    if (editorRef.current) {
      const monacoTheme = resolvedTheme === "dark" ? "opencode-dark" : "opencode-light";
      (editorRef.current as any).updateOptions({ theme: monacoTheme });
    }
  }, [resolvedTheme]);

  // Handle content changes
  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!activeTab || value === undefined) return;
      updateTabContent(activeTab.id, value);
      triggerAutoSave(activeTab.id, value, activeTab.filePath);
    },
    [activeTab, updateTabContent, triggerAutoSave]
  );

  // Handle Ctrl+S save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!activeTab || !currentProject) return;

        // Immediate save
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        fetch("/api/files", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: currentProject.id,
            path: activeTab.filePath,
            content: activeTab.content,
          }),
        }).then(() => markTabSaved(activeTab.id));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, currentProject, markTabSaved]);

  if (!activeTab) return null;

  const monacoTheme = resolvedTheme === "dark" ? "opencode-dark" : "opencode-light";

  return (
    <div className="h-full w-full">
      <Editor
        key={activeTab.filePath}
        height="100%"
        language={activeTab.language}
        value={activeTab.content}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme={monacoTheme}
        options={{
          minimap: { enabled: true },
          fontSize: 13,
          fontFamily: "var(--font-geist-mono), 'Fira Code', 'Cascadia Code', monospace",
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 8 },
          bracketPairColorization: { enabled: true },
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          smoothScrolling: true,
          formatOnPaste: true,
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
        }}
      />
    </div>
  );
}
