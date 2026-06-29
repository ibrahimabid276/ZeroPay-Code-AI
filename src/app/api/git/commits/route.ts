import { NextRequest, NextResponse } from "next/server";
import git from "isomorphic-git";
import path from "path";
import fs from "fs";

/**
 * GET /api/git/commits
 * Get commit history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), ".projects", projectId);

    const commits = await git.log({
      fs,
      dir,
      depth: limit,
    });

    return NextResponse.json({
      commits: commits.map((commit: any) => ({
        hash: commit.oid.substring(0, 7),
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: new Date(commit.commit.author.timestamp).toISOString(),
        branch: "main",
      })),
    });
  } catch (error) {
    console.error("Git log error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to get commits" },
      { status: 500 }
    );
  }
}
