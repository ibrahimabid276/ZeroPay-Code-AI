"use client";

import {
  FilePlus,
  FolderOpen,
  GitBranch,
  Download,
  Sparkles,
  Play,
  Bug,
  Terminal,
  MessageSquare,
  Puzzle,
  MoreVertical,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";

const RECENT_PROJECTS = [
  {
    id: "1",
    name: "E-Commerce App",
    path: "/Projects/ecommerce",
    framework: "Next.js",
    lastModified: "2m ago",
    icon: "N",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    name: "AI Chatbot",
    path: "/Projects/ai-chatbot",
    framework: "React",
    lastModified: "1h ago",
    icon: "🤖",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "3",
    name: "Portfolio Website",
    path: "/Projects/portfolio",
    framework: "Vue.js",
    lastModified: "3h ago",
    icon: "V",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "4",
    name: "Task Manager",
    path: "/Projects/task-manager",
    framework: "Node.js",
    lastModified: "Yesterday",
    icon: "✓",
    color: "from-orange-500 to-red-500",
  },
];

const QUICK_ACTIONS = [
  { icon: Play, label: "Run Project", description: "Start development server", action: "run" },
  { icon: Bug, label: "Debug", description: "Start debugging session", action: "debug" },
  { icon: Terminal, label: "Open Terminal", description: "Command line interface", action: "terminal" },
  { icon: MessageSquare, label: "AI Assistant", description: "Get AI help & suggestions", action: "ai" },
  { icon: Puzzle, label: "Extensions", description: "Manage your extensions", action: "extensions" },
];

export function WelcomeDashboard() {
  const { projects } = useProjectStore();

  return (
    <div className="h-full overflow-auto bg-background p-6">
      {/* Hero Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, Developer!{" "}
          <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-muted-foreground">
          Let's build something amazing today.
        </p>
      </div>

      {/* Banner */}
      <div className="glass rounded-xl p-6 mb-6 gradient-subtle border border-white/10 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl gradient-primary glow-purple flex items-center justify-center">
            <span className="text-white text-3xl font-bold">Z</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              ZeroPay Code AI
            </h2>
            <p className="text-muted-foreground mt-1">
              Your all-in-one AI-powered development environment for modern creators.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-5 gap-3 mb-6 animate-fade-in">
        <button className="glass p-4 rounded-xl hover-lift border border-white/10 flex flex-col items-center gap-2 transition-all">
          <FilePlus className="w-6 h-6 text-primary" />
          <span className="text-xs text-white font-medium">New File</span>
          <span className="text-[10px] text-muted-foreground">Ctrl+N</span>
        </button>
        <button className="glass p-4 rounded-xl hover-lift border border-white/10 flex flex-col items-center gap-2 transition-all">
          <FolderOpen className="w-6 h-6 text-primary" />
          <span className="text-xs text-white font-medium">Open Folder</span>
          <span className="text-[10px] text-muted-foreground">Ctrl+K</span>
        </button>
        <button className="glass p-4 rounded-xl hover-lift border border-white/10 flex flex-col items-center gap-2 transition-all">
          <GitBranch className="w-6 h-6 text-primary" />
          <span className="text-xs text-white font-medium">Clone Repo</span>
          <span className="text-[10px] text-muted-foreground">Ctrl+Shift+P</span>
        </button>
        <button className="glass p-4 rounded-xl hover-lift border border-white/10 flex flex-col items-center gap-2 transition-all">
          <Download className="w-6 h-6 text-primary" />
          <span className="text-xs text-white font-medium">Import Project</span>
          <span className="text-[10px] text-muted-foreground">Ctrl+Shift+I</span>
        </button>
        <button className="glass p-4 rounded-xl hover-lift border border-white/10 flex flex-col items-center gap-2 transition-all group">
          <Sparkles className="w-6 h-6 text-primary group-hover:animate-pulse" />
          <span className="text-xs text-white font-medium">AI Generate</span>
          <span className="text-[10px] text-muted-foreground">Ctrl+Shift+A</span>
        </button>
      </div>

      {/* Recent Projects */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Recent Projects</h3>
          <button className="text-xs text-primary hover:underline">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {RECENT_PROJECTS.map((project) => (
            <div
              key={project.id}
              className="glass rounded-xl p-4 border border-white/10 hover-lift cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${project.color} flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-lg">
                    {project.icon}
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">
                {project.name}
              </h4>
              <p className="text-[10px] text-muted-foreground mb-2">
                {project.path}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                  {project.framework}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {project.lastModified}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="animate-fade-in">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.action}
              className="glass p-4 rounded-xl hover-lift border border-white/10 flex flex-col items-center gap-2 transition-all group"
            >
              <action.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs text-white font-medium text-center">
                {action.label}
              </span>
              <span className="text-[10px] text-muted-foreground text-center">
                {action.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
