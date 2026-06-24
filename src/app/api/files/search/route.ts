import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import { join, relative } from "path";

const getProjectsDir = () =>
  process.env.PROJECTS_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".projects");

interface SearchResult {
  path: string;
  name: string;
  type: "file" | "folder";
  /** Line matches when searching file content */
  matches?: { line: number; text: string }[];
}

/**
 * Recursively search for files by name pattern or content match.
 */
async function searchFiles(
  dirPath: string,
  basePath: string,
  query: string,
  searchContent: boolean,
  results: SearchResult[],
  maxResults = 50
): Promise<void> {
  if (results.length >= maxResults) return;

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= maxResults) break;
      // Skip hidden files/folders (except .env.local)
      if (entry.name.startsWith(".") && entry.name !== ".env.local") continue;
      // Skip node_modules and .next for performance
      if (entry.name === "node_modules" || entry.name === ".next") continue;

      const fullPath = join(dirPath, entry.name);
      const relPath = relative(basePath, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        // Match folder name
        if (entry.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({ path: relPath, name: entry.name, type: "folder" });
        }
        await searchFiles(fullPath, basePath, query, searchContent, results, maxResults);
      } else {
        const nameMatch = entry.name.toLowerCase().includes(query.toLowerCase());
        let contentMatches: { line: number; text: string }[] = [];

        if (searchContent && !nameMatch) {
          // Search inside file content
          try {
            const fileStat = await stat(fullPath);
            // Skip files larger than 1MB to avoid performance issues
            if (fileStat.size < 1024 * 1024) {
              const content = await readFile(fullPath, "utf-8");
              const lines = content.split("\n");
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].toLowerCase().includes(query.toLowerCase())) {
                  contentMatches.push({ line: i + 1, text: lines[i].trim().slice(0, 120) });
                  if (contentMatches.length >= 5) break; // Limit matches per file
                }
              }
            }
          } catch {
            // Binary file or unreadable - skip
          }
        }

        if (nameMatch || contentMatches.length > 0) {
          results.push({
            path: relPath,
            name: entry.name,
            type: "file",
            matches: contentMatches.length > 0 ? contentMatches : undefined,
          });
        }
      }
    }
  } catch {
    // Directory inaccessible - skip
  }
}

/**
 * GET /api/files/search?projectId=xxx&query=yyy&content=true
 * Searches for files by name and optionally by content.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const query = searchParams.get("query");
    const searchContent = searchParams.get("content") === "true";

    if (!projectId || !query) {
      return NextResponse.json(
        { error: "Missing projectId or query" },
        { status: 400 }
      );
    }

    const projectDir = join(getProjectsDir(), projectId);
    const results: SearchResult[] = [];
    await searchFiles(projectDir, projectDir, query, searchContent, results);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search files error:", error);
    return NextResponse.json({ results: [] });
  }
}
