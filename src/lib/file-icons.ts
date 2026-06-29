/**
 * File icon mapping based on VS Code icon theme
 * Returns appropriate icon and color for files/folders
 */

export interface FileIconInfo {
  icon: string;
  color: string;
}

// File extension to icon mapping
const FILE_ICON_MAP: Record<string, FileIconInfo> = {
  // JavaScript/TypeScript
  js: { icon: "JS", color: "#f1e05a" },
  jsx: { icon: "⚛", color: "#61dafb" },
  ts: { icon: "TS", color: "#3178c6" },
  tsx: { icon: "⚛", color: "#3178c6" },
  mjs: { icon: "JS", color: "#f1e05a" },
  
  // Web
  html: { icon: "◇", color: "#e34c26" },
  htm: { icon: "◇", color: "#e34c26" },
  css: { icon: "◆", color: "#563d7c" },
  scss: { icon: "◆", color: "#c6538c" },
  sass: { icon: "◆", color: "#c6538c" },
  less: { icon: "◆", color: "#1d365d" },
  svg: { icon: "◇", color: "#ffb13b" },
  
  // Data formats
  json: { icon: "{}", color: "#f1e05a" },
  jsonc: { icon: "{}", color: "#f1e05a" },
  yaml: { icon: "◈", color: "#cb171e" },
  yml: { icon: "◈", color: "#cb171e" },
  xml: { icon: "◇", color: "#e34c26" },
  csv: { icon: "⊞", color: "#217346" },
  
  // Markdown/Docs
  md: { icon: "M↓", color: "#083fa1" },
  mdx: { icon: "M↓", color: "#083fa1" },
  txt: { icon: "☰", color: "#888888" },
  
  // Images
  png: { icon: "🖼", color: "#a074c4" },
  jpg: { icon: "🖼", color: "#a074c4" },
  jpeg: { icon: "🖼", color: "#a074c4" },
  gif: { icon: "🖼", color: "#a074c4" },
  ico: { icon: "🖼", color: "#a074c4" },
  webp: { icon: "🖼", color: "#a074c4" },
  
  // Python
  py: { icon: "🐍", color: "#3572A5" },
  pyw: { icon: "🐍", color: "#3572A5" },
  
  // Java/Kotlin
  java: { icon: "☕", color: "#b07219" },
  kt: { icon: "K", color: "#F18E33" },
  kts: { icon: "K", color: "#F18E33" },
  
  // C/C++
  c: { icon: "C", color: "#555555" },
  h: { icon: "H", color: "#555555" },
  cpp: { icon: "C+", color: "#f34b7d" },
  cc: { icon: "C+", color: "#f34b7d" },
  hpp: { icon: "H+", color: "#f34b7d" },
  
  // C#
  cs: { icon: "C#", color: "#178600" },
  
  // Go
  go: { icon: "Go", color: "#00ADD8" },
  
  // Rust
  rs: { icon: "R", color: "#dea584" },
  
  // PHP
  php: { icon: "PHP", color: "#4F5D95" },
  
  // Ruby
  rb: { icon: "◆", color: "#701516" },
  
  // Swift
  swift: { icon: "S", color: "#F05138" },
  
  // Shell scripts
  sh: { icon: "▶", color: "#89e051" },
  bash: { icon: "▶", color: "#89e051" },
  zsh: { icon: "▶", color: "#89e051" },
  fish: { icon: "🐟", color: "#89e051" },
  ps1: { icon: "PS", color: "#012456" },
  bat: { icon: "▶", color: "#C1F12E" },
  cmd: { icon: "▶", color: "#C1F12E" },
  
  // Config files
  env: { icon: "⚙", color: "#ecd53f" },
  ini: { icon: "⚙", color: "#ecd53f" },
  cfg: { icon: "⚙", color: "#ecd53f" },
  conf: { icon: "⚙", color: "#ecd53f" },
  toml: { icon: "⚙", color: "#ecd53f" },
  
  // Docker
  dockerfile: { icon: "🐳", color: "#384d54" },
  dockerignore: { icon: "🐳", color: "#384d54" },
  
  // Git
  gitignore: { icon: "◎", color: "#f44d27" },
  gitattributes: { icon: "◎", color: "#f44d27" },
  gitmodules: { icon: "◎", color: "#f44d27" },
  
  // Database
  sql: { icon: "DB", color: "#e38c00" },
  sqlite: { icon: "DB", color: "#003b57" },
  db: { icon: "DB", color: "#003b57" },
  
  // Package files
  lock: { icon: "🔒", color: "#cccccc" },
  
  // Archive
  zip: { icon: "📦", color: "#5c7c99" },
  tar: { icon: "📦", color: "#5c7c99" },
  gz: { icon: "📦", color: "#5c7c99" },
  rar: { icon: "📦", color: "#5c7c99" },
  
  // Font
  ttf: { icon: "Aa", color: "#e8a131" },
  otf: { icon: "Aa", color: "#e8a131" },
  woff: { icon: "Aa", color: "#e8a131" },
  woff2: { icon: "Aa", color: "#e8a131" },
  
  // Video
  mp4: { icon: "🎬", color: "#005a9c" },
  avi: { icon: "🎬", color: "#005a9c" },
  mov: { icon: "🎬", color: "#005a9c" },
  webm: { icon: "🎬", color: "#005a9c" },
  
  // Audio
  mp3: { icon: "🎵", color: "#f24e1e" },
  wav: { icon: "🎵", color: "#f24e1e" },
  ogg: { icon: "🎵", color: "#f24e1e" },
  flac: { icon: "🎵", color: "#f24e1e" },
};

// Special file names
const SPECIAL_FILES: Record<string, FileIconInfo> = {
  "package.json": { icon: "📦", color: "#cb3837" },
  "package-lock.json": { icon: "🔒", color: "#cb3837" },
  "yarn.lock": { icon: "🔒", color: "#2c8ebb" },
  "tsconfig.json": { icon: "TS", color: "#3178c6" },
  "tslint.json": { icon: "TS", color: "#3178c6" },
  ".eslintrc": { icon: "◆", color: "#4b32c3" },
  ".eslintrc.js": { icon: "◆", color: "#4b32c3" },
  ".eslintrc.json": { icon: "◆", color: "#4b32c3" },
  ".prettierrc": { icon: "P", color: "#c596c7" },
  ".prettierrc.js": { icon: "P", color: "#c596c7" },
  ".prettierrc.json": { icon: "P", color: "#c596c7" },
  "webpack.config.js": { icon: "📦", color: "#8dd6f9" },
  "vite.config.js": { icon: "⚡", color: "#646cff" },
  "vite.config.ts": { icon: "⚡", color: "#646cff" },
  "next.config.js": { icon: "▲", color: "#000000" },
  "next.config.ts": { icon: "▲", color: "#000000" },
  ".env": { icon: "⚙", color: "#ecd53f" },
  ".env.local": { icon: "⚙", color: "#ecd53f" },
  ".env.example": { icon: "⚙", color: "#ecd53f" },
  ".gitignore": { icon: "◎", color: "#f44d27" },
  "readme.md": { icon: "ℹ", color: "#083fa1" },
  "README.md": { icon: "ℹ", color: "#083fa1" },
  "license": { icon: "⚖", color: "#888888" },
  "LICENSE": { icon: "⚖", color: "#888888" },
  "changelog.md": { icon: "📝", color: "#083fa1" },
  "CHANGELOG.md": { icon: "📝", color: "#083fa1" },
};

// Special folder names
const SPECIAL_FOLDERS: Record<string, FileIconInfo> = {
  "node_modules": { icon: "📦", color: "#cb3837" },
  ".git": { icon: "◎", color: "#f44d27" },
  ".github": { icon: "🐙", color: "#ffffff" },
  ".vscode": { icon: "◆", color: "#007acc" },
  ".next": { icon: "▲", color: "#000000" },
  ".cache": { icon: "⚡", color: "#ffcc01" },
  "dist": { icon: "📤", color: "#888888" },
  "build": { icon: "📤", color: "#888888" },
  "out": { icon: "📤", color: "#888888" },
  "src": { icon: "📂", color: "#42a5f5" },
  "source": { icon: "📂", color: "#42a5f5" },
  "lib": { icon: "📚", color: "#7c4dff" },
  "libs": { icon: "📚", color: "#7c4dff" },
  "packages": { icon: "📦", color: "#cb3837" },
  "components": { icon: "🧩", color: "#61dafb" },
  "pages": { icon: "📄", color: "#42a5f5" },
  "api": { icon: "🔌", color: "#66bb6a" },
  "utils": { icon: "🔧", color: "#ffa726" },
  "helpers": { icon: "🔧", color: "#ffa726" },
  "hooks": { icon: "🪝", color: "#ab47bc" },
  "services": { icon: "⚙", color: "#26c6da" },
  "store": { icon: "🗄", color: "#ef5350" },
  "stores": { icon: "🗄", color: "#ef5350" },
  "assets": { icon: "🖼", color: "#a074c4" },
  "static": { icon: "📁", color: "#888888" },
  "public": { icon: "🌐", color: "#66bb6a" },
  "tests": { icon: "🧪", color: "#66bb6a" },
  "test": { icon: "🧪", color: "#66bb6a" },
  "__tests__": { icon: "🧪", color: "#66bb6a" },
  "coverage": { icon: "📊", color: "#ffa726" },
  "docs": { icon: "📖", color: "#42a5f5" },
  "documentation": { icon: "📖", color: "#42a5f5" },
  "config": { icon: "⚙", color: "#ffa726" },
  "configs": { icon: "⚙", color: "#ffa726" },
  "scripts": { icon: "📜", color: "#888888" },
  "styles": { icon: "🎨", color: "#c6538c" },
  "css": { icon: "🎨", color: "#c6538c" },
  "images": { icon: "🖼", color: "#a074c4" },
  "img": { icon: "🖼", color: "#a074c4" },
  "icons": { icon: "⭐", color: "#ffd54f" },
  "fonts": { icon: "Aa", color: "#e8a131" },
  "media": { icon: "🎬", color: "#005a9c" },
  "videos": { icon: "🎬", color: "#005a9c" },
  "audio": { icon: "🎵", color: "#f24e1e" },
};

/**
 * Get file icon and color based on file name and extension
 */
export function getFileIcon(fileName: string, isFolder: boolean = false): FileIconInfo {
  // Check special folder names first
  if (isFolder && SPECIAL_FOLDERS[fileName.toLowerCase()]) {
    return SPECIAL_FOLDERS[fileName.toLowerCase()];
  }

  // Check special file names
  if (SPECIAL_FILES[fileName]) {
    return SPECIAL_FILES[fileName];
  }

  // Get icon by extension
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (FILE_ICON_MAP[ext]) {
    return FILE_ICON_MAP[ext];
  }

  // Default icons
  if (isFolder) {
    return { icon: "📁", color: "#42a5f5" };
  }

  return { icon: "📄", color: "#888888" };
}

/**
 * Count files in a folder (recursively)
 */
export function countFilesInFolder(node: any): number {
  if (!node.children || node.children.length === 0) {
    return 0;
  }

  let count = 0;
  for (const child of node.children) {
    if (child.type === "file") {
      count++;
    } else {
      count += countFilesInFolder(child);
    }
  }
  return count;
}
