"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { useEditorStore } from "@/stores/editorStore";
import { useProjectStore } from "@/stores/projectStore";
import { useTheme } from "@/components/providers/ThemeProvider";
import { InlineChat } from "@/components/chat/InlineChat";

export function MonacoEditorWrapper() {
  const { tabs, activeTabId, updateTabContent, markTabSaved } = useEditorStore();
  const { currentProject } = useProjectStore();
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [inlineChat, setInlineChat] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    selectedCode: string;
  }>({ visible: false, position: { x: 0, y: 0 }, selectedCode: "" });

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

  // Handle Ctrl+S save and Ctrl+K inline chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S - Save
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
      
      // Ctrl+K - Inline chat
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!editorRef.current || !activeTab) return;
        
        const editor = editorRef.current;
        const selection = editor.getSelection();
        
        if (selection && !selection.isEmpty()) {
          const selectedCode = editor.getModel()?.getValueInRange(selection) || "";
          
          if (selectedCode.trim()) {
            // Get cursor position for popup
            const position = selection.getStartPosition();
            const coords = editor.getScrolledVisiblePosition(position);
            
            if (coords) {
              const editorDomNode = editor.getDomNode();
              if (editorDomNode) {
                const rect = editorDomNode.getBoundingClientRect();
                
                setInlineChat({
                  visible: true,
                  position: {
                    x: rect.left + coords.left + 100,
                    y: rect.top + coords.top + 50,
                  },
                  selectedCode,
                });
              }
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, currentProject, markTabSaved]);

  // Handle applying inline chat changes
  const handleInlineChatApply = useCallback((code: string) => {
    if (!activeTab || !editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    if (selection) {
      // Replace selected code with AI response
      const editOperation = {
        range: selection,
        text: code,
        forceMoveMarkers: true,
      };
      
      editor.executeEdits("inline-chat", [editOperation]);
      
      // Update store
      const newContent = editor.getValue();
      updateTabContent(activeTab.id, newContent);
      
      // Trigger auto-save
      triggerAutoSave(activeTab.id, newContent, activeTab.filePath);
    }
  }, [activeTab, updateTabContent, triggerAutoSave]);

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
      
      {/* Inline Chat Popup */}
      {inlineChat.visible && activeTab && (
        <InlineChat
          position={inlineChat.position}
          selectedCode={inlineChat.selectedCode}
          filename={activeTab.fileName}
          onClose={() => setInlineChat({ visible: false, position: { x: 0, y: 0 }, selectedCode: "" })}
          onApply={handleInlineChatApply}
        />
      )}
    </div>
  );
}
