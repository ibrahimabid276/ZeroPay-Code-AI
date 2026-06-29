import { NextRequest, NextResponse } from "next/server";
import git from "isomorphic-git";
import path from "path";
import fs from "fs";

/**
 * POST /api/git/commit
 * Create a commit with staged changes
 */
export async function POST(request: NextRequest) {
  try {
    const { projectId, message } = await request.json();

    if (!projectId || !message) {
      return NextResponse.json({ error: "Project ID and commit message required" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), ".projects", projectId);

    const commitHash = await git.commit({
      fs,
      dir,
      message,
      author: {
        name: "ZeroPay User",
        email: "user@zeropay.dev",
      },
    });

    return NextResponse.json({ success: true, commitHash });
  } catch (error) {
    console.error("Git commit error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to commit" },
      { status: 500 }
    );
  }
}
