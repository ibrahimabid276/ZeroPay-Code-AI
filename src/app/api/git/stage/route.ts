import { NextRequest, NextResponse } from "next/server";
import git from "isomorphic-git";
import path from "path";
import fs from "fs";

/**
 * POST /api/git/stage
 * Stage a file for commit
 */
export async function POST(request: NextRequest) {
  try {
    const { projectId, path: filePath } = await request.json();

    if (!projectId || !filePath) {
      return NextResponse.json({ error: "Project ID and file path required" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), ".projects", projectId);

    await git.add({ fs, dir, filepath: filePath });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Git stage error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to stage file" },
      { status: 500 }
    );
  }
}
