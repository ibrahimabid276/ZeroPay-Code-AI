"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useEditorStore } from "@/stores/editorStore";
import { useProjectStore } from "@/stores/projectStore";
import { ChatMessage } from "@/types";
import { cn, getFileLanguage } from "@/lib/utils";
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

/** Available free AI models via OpenRouter */
const MODELS = [
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3" },
  { id: "qwen/qwen3-235b-a22b", name: "Qwen 3 235B" },
  { id: "google/gemma-3-27b-it", name: "Gemma 3 27B" },
];

/**
 * Renders a code block extracted from AI response markdown.
 * Includes copy and "apply to editor" actions.
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
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          {onApply && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onApply(code)}
              title="Apply to editor"
            >
              <FileText className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <pre className="p-3 overflow-x-auto text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Parses message content to extract markdown code blocks and plain text segments.
 * Returns an array of React nodes for rendering.
 */
function parseMessageContent(
  content: string,
  onApplyCode?: (code: string, lang: string) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {content.slice(lastIndex, match.index)}
        </span>
      );
    }
    const lang = match[1] || "text";
    const code = match[2].trim();
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        code={code}
        language={lang}
        onApply={onApplyCode ? (c) => onApplyCode(c, lang) : undefined}
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
        {content.slice(lastIndex)}
      </span>
    );
  }

  return parts;
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
  const { tabs, activeTabId, openTab } = useEditorStore();
  const { currentProject } = useProjectStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Build project context string from currently open files */
  const buildContext = useCallback(() => {
    const parts: string[] = [];
    if (currentProject) {
      parts.push(`Project: ${currentProject.name}`);
    }
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      parts.push(`\nCurrently open file: ${activeTab.filePath}`);
      parts.push(`\nFile content:\n\`\`\`${activeTab.language}\n${activeTab.content.slice(0, 3000)}\n\`\`\``);
    }
    return parts.join("\n");
  }, [currentProject, tabs, activeTabId]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    sendMessage(text, buildContext());
  };

  /** Apply generated code to the active editor tab or create a new tab */
  const handleApplyCode = useCallback(
    (code: string, lang: string) => {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab) {
        const { updateTabContent } = useEditorStore.getState();
        updateTabContent(activeTab.id, code);
      } else {
        openTab({
          fileName: "generated.ts",
          filePath: "/generated.ts",
          language: lang === "text" ? "typescript" : lang,
          content: code,
        });
      }
    },
    [tabs, activeTabId, openTab]
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">AI Chat</span>
          {isLoading && (
            <span className="text-[10px] text-green-400 animate-pulse">Generating...</span>
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
        <div className="flex items-end gap-2 rounded-md border bg-card p-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code..."
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
        <p className="text-[10px] text-muted-foreground/60 text-center mt-1">
          OpenCode Agent uses free AI models via OpenRouter
        </p>
      </div>
    </div>
  );
}
