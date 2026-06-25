export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  isExpanded?: boolean;
}

export interface EditorTab {
  id: string;
  fileName: string;
  filePath: string;
  language: string;
  content: string;
  isDirty: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  createdAt: number;
  updatedAt: number;
}

export interface TerminalLine {
  id: string;
  content: string;
  type: "input" | "output" | "error";
  timestamp: number;
}

export type Theme = "dark" | "light" | "system";

// Notebook Types
export type CellType = 'code' | 'markdown' | 'sql' | 'bash';
export type CellLanguage = 'python' | 'javascript' | 'sql' | 'bash' | 'markdown';
export type RuntimeType = 'python' | 'nodejs' | 'bash';
export type RuntimeStatus = 'stopped' | 'starting' | 'running' | 'error' | 'busy';
export type OutputType = 'text' | 'html' | 'image' | 'dataframe' | 'chart' | 'error';

export interface CellOutput {
  id: string;
  type: OutputType;
  content: string;
  metadata?: Record<string, any>;
}

export interface NotebookCell {
  id: string;
  type: CellType;
  language: CellLanguage;
  content: string;
  output?: CellOutput[];
  executionCount?: number;
  executedAt?: number;
  isRunning?: boolean;
  metadata?: Record<string, any>;
}

export interface Notebook {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  cells: NotebookCell[];
  runtimeType: RuntimeType;
  createdAt: number;
  updatedAt: number;
  lastExecutedAt?: number;
  metadata?: {
    kernelspec?: Record<string, any>;
    languageInfo?: Record<string, any>;
  };
}

export interface Runtime {
  id: string;
  notebookId: string;
  type: RuntimeType;
  status: RuntimeStatus;
  processId?: number;
  port?: number;
  startedAt?: number;
  error?: string;
}

export interface DatasetColumn {
  name: string;
  type: string;
  nullable: boolean;
  uniqueValues?: number;
  missingValues?: number;
  statistics?: Record<string, any>;
}

export interface Dataset {
  id: string;
  userId: string;
  name: string;
  type: 'csv' | 'excel' | 'json' | 'image';
  path: string;
  size: number;
  columns?: DatasetColumn[];
  preview?: Record<string, any>[];
  uploadedAt: number;
}

export type ServerStatus = "stopped" | "starting" | "running" | "building" | "error";
export type PreviewMode = "desktop" | "tablet" | "mobile";
export type ViewMode = "editor" | "preview" | "split";
export type PackageManager = "npm" | "pnpm" | "yarn";
export type ProjectType = "nextjs" | "react" | "vue" | "node" | "html" | "unknown";
export type ExtensionCategory = 
  | 'ai-tools' | 'themes' | 'language-support' | 'code-formatters'
  | 'linters' | 'git-tools' | 'database-tools' | 'docker-tools'
  | 'testing-tools' | 'productivity-tools';
export type ExtensionStatus = 'installed' | 'available' | 'updating' | 'error';
export type ActiveSidebar = 'explorer' | 'search' | 'git' | 'run' | 'extensions' | 'github' | 'database' | 'notebooks' | 'chat' | 'settings' | null;

export interface ServerProcess {
  projectId: string;
  status: ServerStatus;
  port: number | null;
  previewUrl: string | null;
  command: string;
  logs: TerminalLine[];
  error: string | null;
  startedAt: number | null;
  processId?: number;
}

export interface ProjectDetection {
  type: ProjectType;
  packageManager: PackageManager;
  startCommand: string;
  defaultPort: number;
  hasDevScript: boolean;
}

export interface Extension {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  category: ExtensionCategory;
  rating: number;
  downloadCount: number;
  icon?: string;
  screenshots?: string[];
  readme?: string;
  changelog?: string;
  installed: boolean;
  enabled: boolean;
  installedVersion?: string;
  latestVersion: string;
  permissions: string[];
  activationEvents: string[];
  contributes?: {
    themes?: Array<{ id: string; label: string }>;
    languages?: Array<{ id: string; name: string }>;
    commands?: Array<{ id: string; title: string }>;
  };
  updatedAt: string;
}

export interface ThemeContribution {
  id: string;
  label: string;
  colors: Record<string, string>;
}

export interface UIState {
  fileExplorerOpen: boolean;
  chatOpen: boolean;
  terminalOpen: boolean;
  sidebarSide: "left" | "right";
  previewOpen: boolean;
  viewMode: ViewMode;
  previewMode: PreviewMode;
  activeSidebar: ActiveSidebar;
}
