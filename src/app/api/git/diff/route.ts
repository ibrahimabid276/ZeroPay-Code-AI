import { NextRequest, NextResponse } from "next/server";
import git from "isomorphic-git";
import { createTwoFilesPatch } from "diff";
import path from "path";
import fs from "fs";

/**
 * GET /api/git/diff
 * Get diff for a specific file
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const filePath = searchParams.get("path");

    if (!projectId || !filePath) {
      return NextResponse.json({ error: "Project ID and file path required" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), ".projects", projectId);
    const fullPath = path.join(dir, filePath);

    // Get current content
    let currentContent = "";
    if (fs.existsSync(fullPath)) {
      currentContent = fs.readFileSync(fullPath, "utf-8");
    }

    // Get staged content or committed content
    let oldContent = "";
    try {
      const blob = await git.readBlob({
        fs,
        dir,
        oid: "HEAD",
        filepath: filePath,
      });
      oldContent = new TextDecoder().decode(blob.blob);
    } catch {
      // File might be new
    }

    // Generate diff
    const diff = createTwoFilesPatch(
      `a/${filePath}`,
      `b/${filePath}`,
      oldContent,
      currentContent,
      "Current",
      "Modified"
    );

    return NextResponse.json({ diff });
  } catch (error) {
    console.error("Git diff error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to get diff" },
      { status: 500 }
    );
  }
}
