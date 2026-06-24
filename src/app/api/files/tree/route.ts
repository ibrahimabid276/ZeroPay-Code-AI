import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join, relative } from "path";
import { v4 as uuid } from "uuid";

const getProjectsDir = () => process.env.PROJECTS_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".projects");

interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

async function buildTree(dirPath: string, basePath: string): Promise<TreeNode[]> {
  const nodes: TreeNode[] = [];
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".env.local") continue;
      const fullPath = join(dirPath, entry.name);
      const relPath = relative(basePath, fullPath);

      if (entry.isDirectory()) {
        const children = await buildTree(fullPath, basePath);
        nodes.push({
          id: uuid(),
          name: entry.name,
          path: relPath.replace(/\\/g, "/"),
          type: "folder",
          children,
        });
      } else {
        nodes.push({
          id: uuid(),
          name: entry.name,
          path: relPath.replace(/\\/g, "/"),
          type: "file",
        });
      }
    }
  } catch (e) {
    // Directory might not exist
  }
  return nodes;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const projectDir = join(getProjectsDir(), projectId);
    const tree = await buildTree(projectDir, projectDir);
    return NextResponse.json({ tree });
  } catch (error) {
    console.error("File tree error:", error);
    return NextResponse.json({ tree: [] });
  }
}
