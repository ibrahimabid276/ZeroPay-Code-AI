// Extension Runtime Types and Interfaces

// Permission types that extensions can request
export type ExtensionPermission = 
  | 'workspace:read'
  | 'workspace:write'
  | 'files:read'
  | 'files:write'
  | 'terminal:execute'
  | 'terminal:read'
  | 'github:read'
  | 'github:write'
  | 'database:read'
  | 'database:write'
  | 'ai:access'
  | 'network:http'
  | 'notebooks:read'
  | 'notebooks:write'
  | 'settings:read'
  | 'settings:write';

// Extension activation events
export type ActivationEvent =
  | 'onStartup'
  | 'onCommand'
  | 'onLanguage'
  | 'onView'
  | 'onUri'
  | 'onWebviewPanel'
  | 'onNotebook'
  | 'onFileSystem';

// Extension runtime states
export type ExtensionState = 
  | 'inactive'
  | 'activating'
  | 'active'
  | 'disabled'
  | 'error';

// Sandboxing security levels
export type SecurityLevel = 'low' | 'medium' | 'high' | 'strict';

// Extension manifest (package.json structure)
export interface ExtensionManifest {
  name: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  engines: {
    vscode?: string;
    zeropay?: string;
  };
  categories: string[];
  keywords?: string[];
  icon?: string;
  activationEvents?: ActivationEvent[];
  main?: string;
  contributes?: ExtensionContributions;
  permissions?: ExtensionPermission[];
  securityLevel?: SecurityLevel;
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  bugs?: {
    url: string;
  };
  dependencies?: Record<string, string>;
}

// What an extension can contribute to the editor
export interface ExtensionContributions {
  commands?: CommandContribution[];
  menus?: MenuContribution[];
  views?: ViewContribution[];
  languages?: LanguageContribution[];
  grammars?: GrammarContribution[];
  themes?: ThemeContribution[];
  configuration?: ConfigurationContribution[];
  keybindings?: KeybindingContribution[];
  snippets?: SnippetContribution[];
}

export interface CommandContribution {
  command: string;
  title: string;
  icon?: string;
  category?: string;
}

export interface MenuContribution {
  menu: string;
  command: string;
  when?: string;
  group?: string;
}

export interface ViewContribution {
  id: string;
  name: string;
  icon?: string;
  contextValue?: string;
}

export interface LanguageContribution {
  id: string;
  name: string;
  extensions?: string[];
  aliases?: string[];
  configuration?: string;
}

export interface GrammarContribution {
  language: string;
  scopeName: string;
  path: string;
}

export interface ThemeContribution {
  id: string;
  label: string;
  path: string;
  uiTheme?: string;
}

export interface ConfigurationContribution {
  title: string;
  properties: Record<string, ConfigurationProperty>;
}

export interface ConfigurationProperty {
  type: string;
  default?: any;
  description?: string;
  enum?: any[];
  enumDescriptions?: string[];
}

export interface KeybindingContribution {
  key: string;
  command: string;
  when?: string;
  mac?: string;
  linux?: string;
  win?: string;
}

export interface SnippetContribution {
  language: string;
  path: string;
}

// Extension instance (runtime representation)
export interface ExtensionInstance {
  id: string;
  manifest: ExtensionManifest;
  state: ExtensionState;
  activatedAt?: number;
  deactivatedAt?: number;
  error?: string;
  grantedPermissions: ExtensionPermission[];
  contributedCommands: CommandContribution[];
  contributedViews: ViewContribution[];
}

// API request from extension to editor
export interface ExtensionAPIRequest {
  id: string;
  extensionId: string;
  method: string;
  args: any[];
  permission?: ExtensionPermission;
}

// API response from editor to extension
export interface ExtensionAPIResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

// Extension activation context
export interface ExtensionContext {
  extensionId: string;
  extensionPath: string;
  globalState: ExtensionGlobalState;
  workspaceState: ExtensionWorkspaceState;
  subscriptions: Array<{ dispose: () => void }>;
  environmentVariableCollection: any;
  languageModelAccessInformation: any;
  secrets: ExtensionSecrets;
}

export interface ExtensionGlobalState {
  get(key: string): any;
  update(key: string, value: any): Promise<void>;
  keys(): readonly string[];
}

export interface ExtensionWorkspaceState {
  get(key: string): any;
  update(key: string, value: any): Promise<void>;
  keys(): readonly string[];
}

export interface ExtensionSecrets {
  get(key: string): Promise<string | undefined>;
  store(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

// Extension API surface
export interface ExtensionAPI {
  // Editor access
  editor: {
    getActiveDocument(): Promise<any>;
    getActiveSelection(): Promise<any>;
    setText(text: string): Promise<void>;
    insertText(text: string): Promise<void>;
    setDecorations(type: any, ranges: any[]): Promise<void>;
    onDidChangeActiveTextEditor(callback: (editor: any) => void): { dispose: () => void };
  };

  // File system access
  workspace: {
    readFile(path: string): Promise<string>;
    writeFile(path: string, content: string): Promise<void>;
    findFiles(include: string, exclude?: string): Promise<string[]>;
    createFileSystemWatcher(glob: string): { onDidCreate: any; onDidChange: any; onDidDelete: any; dispose: () => void };
    getWorkspaceFolders(): Promise<any[]>;
  };

  // Terminal access
  terminal: {
    createTerminal(name: string): Promise<any>;
    sendText(terminal: any, text: string): Promise<void>;
    getTerminals(): Promise<any[]>;
  };

  // GitHub access
  github: {
    getRepositories(): Promise<any[]>;
    getFileContent(repo: string, path: string): Promise<string>;
    createCommit(repo: string, message: string, changes: any[]): Promise<any>;
    getBranches(repo: string): Promise<any[]>;
  };

  // Notebook access
  notebooks: {
    getActiveNotebook(): Promise<any>;
    getCells(notebookId: string): Promise<any[]>;
    executeCell(notebookId: string, cellId: string): Promise<any>;
    updateCell(notebookId: string, cellId: string, updates: any): Promise<void>;
  };

  // AI access
  ai: {
    chat(prompt: string, context?: any): Promise<string>;
    complete(code: string, language: string): Promise<string>;
    explain(code: string): Promise<string>;
    refactor(code: string, instruction: string): Promise<string>;
  };

  // Database access
  database: {
    executeQuery(connectionId: string, query: string): Promise<any>;
    getTables(connectionId: string): Promise<any[]>;
    getSchema(connectionId: string, table: string): Promise<any>;
  };

  // Commands
  commands: {
    registerCommand(command: string, callback: (...args: any[]) => any): { dispose: () => void };
    executeCommand(command: string, ...args: any[]): Promise<any>;
  };

  // UI
  window: {
    showInformationMessage(message: string, ...items: string[]): Promise<string | undefined>;
    showErrorMessage(message: string, ...items: string[]): Promise<string | undefined>;
    showWarningMessage(message: string, ...items: string[]): Promise<string | undefined>;
    createStatusBarItem(): any;
    createOutputChannel(name: string): any;
    registerTreeDataProvider(viewId: string, provider: any): { dispose: () => void };
  };

  // Configuration
  configuration: {
    getConfiguration(section?: string): any;
    onDidChangeConfiguration(callback: (event: any) => void): { dispose: () => void };
  };

  // Environment
  env: {
    appName: string;
    appRoot: string;
    uriScheme: string;
    language: string;
    clipboard: {
      readText(): Promise<string>;
      writeText(value: string): Promise<void>;
    };
  };
}
