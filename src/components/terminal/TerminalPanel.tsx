"use client";

import { useState, useRef, useEffect } from "react";
import { TerminalLine } from "@/types";
import { useProjectStore } from "@/stores/projectStore";
import { useServerStore } from "@/stores/serverStore";
import { Terminal as TermIcon, X, Maximize2, Minimize2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";
import { v4 as uuid } from "uuid";

const WELCOME_LINES: TerminalLine[] = [
  { id: "w1", content: "OpenCode Agent Terminal", type: "output", timestamp: Date.now() },
  { id: "w2", content: 'Type "help" for available commands.', type: "output", timestamp: Date.now() },
];

export function TerminalPanel() {
  const { currentProject } = useProjectStore();
  const { server } = useServerStore();
  const { terminalOpen, toggleTerminal } = useUIStore();
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_LINES);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("~");
  const [activeTab, setActiveTab] = useState<"terminal" | "output" | "problems">("terminal");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalOpen) {
      inputRef.current?.focus();
    }
  }, [terminalOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    if (currentProject) {
      setCwd(`~/projects/${currentProject.name}`);
    }
  }, [currentProject]);

  // Sync server logs to output tab
  useEffect(() => {
    if (server?.logs && server.logs.length > 0) {
      // Logs are managed by server store, displayed in output tab
    }
  }, [server?.logs]);

  const addLine = (content: string, type: TerminalLine["type"] = "output") => {
    setLines((prev) => [...prev, { id: uuid(), content, type, timestamp: Date.now() }]);
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    addLine(`${cwd} $ ${trimmed}`, "input");

    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        addLine("Available commands:");
        addLine("  help          - Show this help");
        addLine("  clear         - Clear terminal");
        addLine("  echo <text>   - Print text");
        addLine("  date          - Show current date");
        addLine("  whoami        - Show current user");
        addLine("  pwd           - Print working directory");
        addLine("  ls            - List files");
        addLine("  cd <dir>      - Change directory");
        addLine("  cat <file>    - Display file contents");
        addLine("  node -v       - Show Node.js version");
        addLine("  npm -v        - Show npm version");
        addLine("  git status    - Show git status");
        addLine("  npm run dev   - Start dev server (simulated)");
        addLine("  npm run build - Build project (simulated)");
        break;
      case "clear":
        setLines([]);
        break;
      case "echo":
        addLine(args.join(" "));
        break;
      case "date":
        addLine(new Date().toString());
        break;
      case "whoami":
        addLine("developer");
        break;
      case "pwd":
        addLine(cwd);
        break;
      case "ls":
        addLine("src/  public/  package.json  next.config.ts  tsconfig.json  .env.local");
        break;
      case "cd":
        if (args[0] === "..") {
          setCwd((prev) => prev.split("/").slice(0, -1).join("/") || "~");
        } else if (args[0]) {
          setCwd((prev) => `${prev}/${args[0]}`);
        }
        break;
      case "cat":
        addLine(`[File content would be displayed here for: ${args[0]}]`);
        break;
      case "node":
        if (args[0] === "-v") addLine("v20.11.0");
        else addLine(`node: command not understood: ${args.join(" ")}`);
        break;
      case "npm":
        if (args[0] === "-v") {
          addLine("10.2.4");
        } else if (args[0] === "run" && args[1] === "dev") {
          addLine("> opencode-agent@0.1.0 dev");
          addLine("> next dev");
          addLine("");
          addLine("  ▲ Next.js 15.0.0");
          addLine("  - Local:        http://localhost:3000");
          addLine("  - Ready in 2.3s");
        } else if (args[0] === "run" && args[1] === "build") {
          addLine("> opencode-agent@0.1.0 build");
          addLine("> next build");
          addLine("");
          addLine("  ▲ Next.js 15.0.0");
          addLine("  - Creating optimized production build...");
          addLine("  ✓ Build completed in 12.4s");
        } else if (args[0] === "install") {
          addLine("added 247 packages in 8.2s");
        } else {
          addLine(`npm: unknown command: ${args.join(" ")}`);
        }
        break;
      case "git":
        if (args[0] === "status") {
          addLine("On branch main");
          addLine("nothing to commit, working tree clean");
        } else if (args[0] === "log") {
          addLine("abc1234 Initial commit (HEAD -> main)");
        } else {
          addLine(`git: '${args[0]}' is not a recognized command`);
        }
        break;
      default:
        addLine(`command not found: ${command}`, "error");
    }
  };

  const handleClear = () => {
    if (activeTab === "terminal") {
      setLines([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      processCommand(input);
      setInput("");
    }
  };

  if (!terminalOpen) return null;

  return (
    <div className="flex flex-col h-full bg-card border-t">
      {/* Terminal Header with Tabs */}
      <div className="flex items-center justify-between px-3 py-1 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <TermIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeTab === "terminal"
                  ? "bg-background text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setActiveTab("output")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeTab === "output"
                  ? "bg-background text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Output
              {server?.logs && server.logs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                  {server.logs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("problems")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeTab === "problems"
                  ? "bg-background text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Problems
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleTerminal}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-2 font-mono text-xs cursor-text"
        onClick={() => activeTab === "terminal" && inputRef.current?.focus()}
      >
        {activeTab === "terminal" && (
          <>
            {lines.map((line) => (
              <div
                key={line.id}
                className={
                  line.type === "error"
                    ? "text-red-400"
                    : line.type === "input"
                    ? "text-blue-400"
                    : "text-foreground"
                }
              >
                {line.content}
              </div>
            ))}
            <div className="flex items-center gap-1">
              <span className="text-green-400 shrink-0">{cwd} $</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-foreground"
                spellCheck={false}
                autoFocus
              />
            </div>
          </>
        )}

        {activeTab === "output" && (
          <>
            {server?.logs && server.logs.length > 0 ? (
              server.logs.map((line) => (
                <div
                  key={line.id}
                  className={
                    line.type === "error"
                      ? "text-red-400"
                      : line.type === "input"
                      ? "text-blue-400"
                      : "text-foreground"
                  }
                >
                  {line.content}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No output yet. Start your project to see logs.</div>
            )}
          </>
        )}

        {activeTab === "problems" && (
          <>
            {server?.error ? (
              <div className="text-red-400">
                <div className="font-semibold mb-1">Error:</div>
                <div>{server.error}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">No problems detected.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
