"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useEditorStore } from "@/stores/editorStore";
import { useProjectStore } from "@/stores/projectStore";
import { ChatMessage } from "@/types";
import { cn, getFileLanguage } from "@/lib/utils";
import { getFileIcon } from "@/lib/file-icons";
import {
  Send,
  Square,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Code,
  FileText,
  Sparkles,
  File,
  AtSign,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiffView } from "./DiffView";

/** Available free AI models via OpenRouter */
const MODELS = [
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3" },
  { id: "qwen/qwen3-235b-a22b", name: "Qwen 3 235B" },
  { id: "google/gemma-3-27b-it", name: "Gemma 3 27B" },
];

/**
 * Renders a code block extracted from AI response markdown.
 * Includes copy and "apply to file" actions with diff view.
 */
function CodeBlock({
  code,
  language,
  onApply,
}: {
  code: string;
  language: string;
  onApply?: (code: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-md border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50">
        <span className="text-xs text-muted-foreground">{language}</span>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setShowDiff(!showDiff)}
            title="Preview changes"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          {onApply && (
            <Button
              variant="default"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onApply(code)}
              title="Apply to file"
            >
              <FileText className="h-3 w-3 mr-1" />
              Apply
            </Button>
          )}
        </div>
      </div>
      {showDiff && onApply ? (
        <div className="p-3">
          <p className="text-xs text-muted-foreground mb-2">Diff preview will be shown when you click Apply</p>
        </div>
      ) : (
        <pre className="p-3 overflow-x-auto text-xs">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

/**
 * Parses inline markdown formatting (bold, italic, inline code)
 * Returns an array of React nodes
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Regex for **bold**, *italic*, and `inline code`
  const inlineRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let match;
  
  while ((match = inlineRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const matched = match[0];
    
    // Bold: **text**
    if (matched.startsWith('**') && matched.endsWith('**')) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-foreground">
          {matched.slice(2, -2)}
        </strong>
      );
    }
    // Italic: *text*
    else if (matched.startsWith('*') && matched.endsWith('*')) {
      parts.push(
        <em key={`italic-${match.index}`} className="italic">
          {matched.slice(1, -1)}
        </em>
      );
    }
    // Inline code: `text`
    else if (matched.startsWith('`') && matched.endsWith('`')) {
      parts.push(
        <code key={`code-${match.index}`} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-primary">
          {matched.slice(1, -1)}
        </code>
      );
    }
    
    lastIndex = match.index + matched.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
}

/**
 * Parses a single line of text for inline markdown
 */
function parseLineContent(line: string): React.ReactNode {
  return <>{parseInlineMarkdown(line)}</>;
}

/**
 * Parses message content with full markdown support
 * Handles headings, paragraphs, lists, inline formatting, and code blocks
 */
function parseMessageContent(
  content: string,
  onApplyCode?: (code: string, lang: string) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let partIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      parts.push(
        <div key={`text-block-${partIndex++}`} className="mb-2">
          {parseBlockMarkdown(textBefore)}
        </div>
      );
    }
    const lang = match[1] || "text";
    const code = match[2].trim();
    parts.push(
      <CodeBlock
        key={`code-${partIndex++}`}
        code={code}
        language={lang}
        onApply={onApplyCode ? (c) => onApplyCode(c, lang) : undefined}
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    parts.push(
      <div key={`text-block-${partIndex++}`} className="mb-2">
        {parseBlockMarkdown(textAfter)}
      </div>
    );
  }

  return parts;
}

/**
 * Parses block-level markdown (headings, lists, paragraphs)
 */
function parseBlockMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let keyIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Empty line - skip
      continue;
    }

    // Headings: ###, ##, #
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`heading-${keyIndex++}`} className="text-base font-semibold text-foreground mt-3 mb-1">
          {parseInlineMarkdown(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`heading-${keyIndex++}`} className="text-lg font-semibold text-foreground mt-3 mb-1">
          {parseInlineMarkdown(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`heading-${keyIndex++}`} className="text-xl font-bold text-foreground mt-3 mb-2">
          {parseInlineMarkdown(line.slice(2))}
        </h1>
      );
    }
    // Unordered list items: - or *
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={`list-${keyIndex++}`} className="flex items-start gap-2 ml-4 my-1">
          <span className="text-primary mt-1">•</span>
          <span>{parseInlineMarkdown(line.slice(2))}</span>
        </div>
      );
    }
    // Ordered list items: 1. 2. 3.
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={`list-${keyIndex++}`} className="flex items-start gap-2 ml-4 my-1">
            <span className="text-primary font-medium">{match[1]}.</span>
            <span>{parseInlineMarkdown(match[2])}</span>
          </div>
        );
      }
    }
    // Horizontal rule: --- or ***
    else if (line === '---' || line === '***') {
      elements.push(
        <hr key={`hr-${keyIndex++}`} className="border-white/10 my-3" />
      );
    }
    // Regular paragraph text
    else {
      elements.push(
        <p key={`para-${keyIndex++}`} className="my-1 leading-relaxed">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  }

  return elements;
}

/**
 * Individual chat message bubble with user/bot avatar.
 */
function MessageBubble({
  message,
  isStreaming,
  onApplyCode,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
  onApplyCode?: (code: string, lang: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2 px-3 py-2", isUser && "flex-row-reverse")}>
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <User className="h-4 w-4 text-blue-400" />
        ) : (
          <Bot className="h-4 w-4 text-green-400" />
        )}
      </div>
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm max-w-[85%]",
          isUser
            ? "bg-primary/10 text-foreground"
            : "bg-muted/50 text-foreground"
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : message.content ? (
          <>
            {parseMessageContent(message.content, onApplyCode)}
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-primary/70 ml-0.5 animate-pulse rounded-sm" />
            )}
          </>
        ) : isStreaming ? (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Thinking...
          </span>
        ) : null}
        {message.model && !isUser && !isStreaming && (
          <div className="text-[10px] text-muted-foreground mt-1.5">
            {message.model}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const {
    messages,
    isLoading,
    selectedModel,
    streamingMessageId,
    setSelectedModel,
    sendMessage,
    stopGeneration,
    clearMessages,
  } = useChatStore();
  const { tabs, activeTabId, openTab, updateTabContent } = useEditorStore();
  const { currentProject, fileTree } = useProjectStore();
  const [input, setInput] = useState("");
  const [includeFile, setIncludeFile] = useState(true);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; path: string; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Build project context string from currently open files and attached files */
  const buildContext = useCallback(() => {
    const parts: string[] = [];
    if (currentProject) {
      parts.push(`Project: ${currentProject.name}`);
    }
    
    // Include current file if toggle is on
    if (includeFile) {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab) {
        parts.push(`\nCurrently open file: ${activeTab.filePath}`);
        parts.push(`\nFile content:\n\`\`\`${activeTab.language}\n${activeTab.content.slice(0, 3000)}\n\`\`\``);
      }
    }
    
    // Include attached files from @mentions
    if (attachedFiles.length > 0) {
      parts.push(`\n\nAttached files:`);
      attachedFiles.forEach((file) => {
        parts.push(`\n\nFile: ${file.path}`);
        parts.push(`\n\`\`\`${getFileLanguage(file.name)}\n${file.content.slice(0, 2000)}\n\`\`\``);
      });
    }
    
    return parts.join("\n");
  }, [currentProject, tabs, activeTabId, includeFile, attachedFiles]);

  /** Get all files from file tree for @mention autocomplete */
  const getAllFiles = useCallback((nodes: any[]): Array<{ name: string; path: string }> => {
    const files: Array<{ name: string; path: string }> = [];
    
    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.type === "file") {
          files.push({ name: node.name, path: node.path });
        } else if (node.children) {
          traverse(node.children);
        }
      }
    };
    
    traverse(nodes);
    return files;
  }, []);

  /** Handle @ mention selection */
  const handleMentionSelect = async (file: { name: string; path: string }) => {
    if (!currentProject) return;
    
    try {
      const res = await fetch(
        `/api/files?projectId=${currentProject.id}&path=${encodeURIComponent(file.path)}`
      );
      if (res.ok) {
        const data = await res.json();
        setAttachedFiles((prev) => [
          ...prev,
          { name: file.name, path: file.path, content: data.content || "" },
        ]);
        
        // Remove the @mention from input
        const inputEl = textareaRef.current;
        if (inputEl) {
          const value = inputEl.value;
          const atIndex = value.lastIndexOf("@");
          if (atIndex !== -1) {
            setInput(value.slice(0, atIndex));
          }
        }
      }
    } catch (error) {
      console.error("Failed to load file:", error);
    }
    
    setShowMentions(false);
    setMentionFilter("");
  };

  /** Handle input change with @mention detection */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
    
    // Check for @mention
    const lines = value.split("\n");
    const currentLine = lines[lines.length - 1];
    const atIndex = currentLine.lastIndexOf("@");
    
    if (atIndex !== -1) {
      const afterAt = currentLine.slice(atIndex + 1);
      if (/^[a-zA-Z0-9._/-]*$/.test(afterAt) && afterAt.length < 50) {
        setMentionFilter(afterAt);
        setShowMentions(true);
        
        // Calculate position
        const textarea = textareaRef.current;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          setMentionPosition({
            x: rect.left,
            y: rect.top - 200,
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setAttachedFiles([]); // Clear attached files after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendMessage(text, buildContext());
  };

  /** Apply generated code with diff preview */
  const handleApplyCode = useCallback(
    (code: string, lang: string) => {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab) {
        // Show diff view before applying
        const originalContent = activeTab.content;
        
        // For now, directly apply (in production, show DiffView modal)
        updateTabContent(activeTab.id, code);
      } else {
        openTab({
          fileName: `generated.${lang === "text" ? "txt" : lang}`,
          filePath: `/generated.${lang === "text" ? "txt" : lang}`,
          language: lang === "text" ? "typescript" : lang,
          content: code,
        });
      }
    },
    [tabs, activeTabId, openTab, updateTabContent]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">AI Chat</span>
            {isLoading && (
              <span className="text-[10px] text-green-400 animate-pulse">Generating...</span>
            )}
          </div>
          {activeTab && includeFile && (
            <span className="text-[10px] text-muted-foreground">
              Chatting about: {activeTab.fileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="h-7 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={clearMessages}
            title="Clear chat history"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
              <Bot className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about your code
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                I can generate files, fix bugs, refactor code, and more
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                {["Create a Todo App", "Fix this bug", "Refactor this code", "Explain this function"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      className="text-[11px] px-2.5 py-1 rounded-full border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => {
                        setInput(suggestion);
                        textareaRef.current?.focus();
                      }}
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={msg.id === streamingMessageId && isLoading}
              onApplyCode={handleApplyCode}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-2">
        {/* Attached files */}
        {attachedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-xs"
              >
                <AtSign className="h-3 w-3" />
                <span>{file.name}</span>
                <button
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2 rounded-md border bg-card p-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code... (use @ to mention files)"
            className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[32px] max-h-[150px] px-2 py-1.5"
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={stopGeneration}
              title="Stop generation"
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleSend}
              disabled={!input.trim()}
              title="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        {/* Include file toggle */}
        <div className="flex items-center justify-between mt-2 px-1">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeFile}
              onChange={(e) => setIncludeFile(e.target.checked)}
              className="w-3 h-3 rounded"
            />
            <span className="text-[10px] text-muted-foreground">
              Include current file
            </span>
          </label>
          <p className="text-[10px] text-muted-foreground/60">
            Use @filename to attach files
          </p>
        </div>
        
        {/* @mention autocomplete */}
        {showMentions && fileTree && (
          <div className="absolute bottom-20 left-2 right-2 max-h-[200px] overflow-auto bg-card border rounded-md shadow-lg z-50">
            {getAllFiles(fileTree)
              .filter((f) => f.name.toLowerCase().includes(mentionFilter.toLowerCase()))
              .slice(0, 10)
              .map((file) => {
                const iconInfo = getFileIcon(file.name, false);
                return (
                  <button
                    key={file.path}
                    className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 text-xs"
                    onClick={() => handleMentionSelect(file)}
                  >
                    <span style={{ color: iconInfo.color }}>{iconInfo.icon}</span>
                    <span>{file.name}</span>
                    <span className="text-muted-foreground text-[10px] ml-auto">
                      {file.path}
                    </span>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
