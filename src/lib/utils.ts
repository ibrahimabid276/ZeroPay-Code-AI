import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileLanguage(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    // JavaScript / TypeScript ecosystem
    ts: "typescript",
    tsx: "typescriptreact",
    js: "javascript",
    jsx: "javascriptreact",
    mjs: "javascript",
    cjs: "javascript",
    json: "json",
    jsonc: "json",
    // Web
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",
    styl: "stylus",
    svg: "xml",
    vue: "html",
    svelte: "html",
    // Systems languages
    c: "c",
    h: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    hpp: "cpp",
    hxx: "cpp",
    cs: "csharp",
    rs: "rust",
    go: "go",
    zig: "zig",
    // JVM languages
    java: "java",
    kt: "kotlin",
    kts: "kotlin",
    scala: "scala",
    sc: "scala",
    groovy: "groovy",
    gradle: "groovy",
    clj: "clojure",
    cljs: "clojure",
    // Scripting languages
    py: "python",
    pyw: "python",
    pyx: "python",
    rb: "ruby",
    erb: "ruby",
    php: "php",
    lua: "lua",
    pl: "perl",
    pm: "perl",
    r: "r",
    R: "r",
    dart: "dart",
    swift: "swift",
    m: "objective-c",
    mm: "objective-c",
    // Shell / DevOps
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
    ps1: "powershell",
    psm1: "powershell",
    bat: "bat",
    cmd: "bat",
    dockerfile: "dockerfile",
    tf: "hcl",
    hcl: "hcl",
    // Data / config formats
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    xsl: "xml",
    xslt: "xml",
    toml: "toml",
    ini: "ini",
    cfg: "ini",
    conf: "ini",
    properties: "ini",
    env: "plaintext",
    csv: "plaintext",
    // Markup / docs
    md: "markdown",
    mdx: "markdown",
    rst: "restructuredtext",
    tex: "latex",
    latex: "latex",
    asciidoc: "asciidoc",
    adoc: "asciidoc",
    // Database
    sql: "sql",
    psql: "sql",
    mysql: "sql",
    pgsql: "sql",
    graphql: "graphql",
    gql: "graphql",
    prisma: "prisma",
    // Functional
    hs: "haskell",
    lhs: "haskell",
    ex: "elixir",
    exs: "elixir",
    erl: "erlang",
    hrl: "erlang",
    ml: "ocaml",
    mli: "ocaml",
    fs: "fsharp",
    fsx: "fsharp",
    elm: "elm",
    // Other
    proto: "protobuf",
    sol: "solidity",
    v: "verilog",
    sv: "systemverilog",
    vhdl: "vhdl",
    makefile: "makefile",
    cmake: "cmake",
    diff: "diff",
    patch: "diff",
  };
  return map[ext] || "plaintext";
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
