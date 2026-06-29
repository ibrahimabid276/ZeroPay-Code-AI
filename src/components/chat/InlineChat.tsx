"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineChatProps {
  position: { x: number; y: number };
  selectedCode: string;
  filename: string;
  onClose: () => void;
  onApply: (code: string) => void;
}

export function InlineChat({
  position,
  selectedCode,
  filename,
  onClose,
  onApply,
}: InlineChatProps) {
  const { isLoading, streamingMessageId } = useChatStore();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `${userMessage}\n\nSelected code from ${filename}:\n\`\`\`\n${selectedCode}\n\`\`\``,
            },
          ],
          context: `File: ${filename}\nSelected code:\n${selectedCode}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6).trim());
            if (data.type === "chunk") {
              accumulated += data.content;
              setResponse(accumulated);
            } else if (data.type === "done") {
              setResponse(data.content || accumulated);
            }
          } catch {}
        }
      }
    } catch (error) {
      setResponse("Error: Failed to get AI response");
    }
  };

  const handleApply = () => {
    // Extract code from response
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    const codeToApply = codeBlockMatch ? codeBlockMatch[1].trim() : response;
    setIsApplying(true);
    onApply(codeToApply);
    setTimeout(() => {
      setIsApplying(false);
      onClose();
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-[450px] animate-scale-in"
      style={{
        left: Math.min(position.x, window.innerWidth - 470),
        top: Math.min(position.y, window.innerHeight - 400),
      }}
    >
      <div className="glass-strong border border-white/20 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">AI Inline Chat</span>
            <span className="text-[10px] text-muted-foreground">
              {filename}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selected Code Preview */}
        <div className="px-3 py-2 border-b bg-muted/20">
          <div className="text-[10px] text-muted-foreground mb-1">
            Selected Code:
          </div>
          <pre className="text-[10px] font-mono bg-background/50 p-2 rounded max-h-[80px] overflow-auto">
            {selectedCode.length > 200
              ? selectedCode.slice(0, 200) + "..."
              : selectedCode}
          </pre>
        </div>

        {/* Response */}
        {response && (
          <div className="px-3 py-2 border-b max-h-[200px] overflow-auto">
            <div className="text-[10px] text-muted-foreground mb-1">
              AI Response:
            </div>
            <pre className="text-xs font-mono bg-background/50 p-2 rounded whitespace-pre-wrap">
              {response}
            </pre>
            {response.includes("```") && (
              <Button
                size="sm"
                className="w-full mt-2 h-7 text-xs"
                onClick={handleApply}
                disabled={isApplying}
              >
                {isApplying ? "Applying..." : "Apply to File"}
              </Button>
            )}
          </div>
        )}

        {/* Input */}
        <div className="p-2">
          <div className="flex items-end gap-2 rounded-md border bg-card p-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the selected code..."
              className="flex-1 bg-transparent text-xs resize-none outline-none min-h-[32px] max-h-[100px] px-2 py-1.5"
              rows={1}
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
