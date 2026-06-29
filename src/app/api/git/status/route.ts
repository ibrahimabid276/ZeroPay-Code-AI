import { NextRequest, NextResponse } from "next/server";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import path from "path";
import fs from "fs";

/**
 * GET /api/git/status
 * Returns current Git status of the project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), ".projects", projectId);

    if (!fs.existsSync(dir)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Initialize repo if it doesn't exist
    try {
      await git.currentBranch({ fs, dir, fullname: false });
    } catch {
      await git.init({ fs, dir, defaultBranch: "main" });
      await git.setConfig({ fs, dir, path: "user.name", value: "ZeroPay User" });
      await git.setConfig({ fs, dir, path: "user.email", value: "user@zeropay.dev" });
    }

    // Get current branch
    let currentBranch = "main";
    try {
      currentBranch = await git.currentBranch({ fs, dir, fullname: false }) || "main";
    } catch {
      // Repo might not have commits yet
    }

    // Get status
    const status = await git.statusMatrix({
      fs,
      dir,
      filepaths: ["."],
    });

    const changes: any[] = [];
    const stagedChanges: any[] = [];

    for (const [filepath, head, workdir, staged] of status) {
      if (filepath === ".") continue;

      let fileStatus: string | null = null;

      // File is new (untracked)
      if (head === 0 && workdir === 1 && staged === 0) {
        fileStatus = "untracked";
      }
      // File is new and staged
      else if (head === 0 && workdir === 1 && staged === 2) {
        fileStatus = "added";
      }
      // File is modified
      else if (head === 1 && workdir === 2 && staged === 1) {
        fileStatus = "modified";
      }
      // File is modified and staged
      else if (head === 1 && workdir === 2 && staged === 2) {
        fileStatus = "modified";
      }
      // File is deleted
      else if (head === 1 && workdir === 0 && staged === 1) {
        fileStatus = "deleted";
      }
      // File is deleted and staged
      else if (head === 1 && workdir === 0 && staged === 0) {
        fileStatus = "deleted";
      }

      if (fileStatus) {
        const change = {
          path: filepath,
          filename: path.basename(filepath),
          status: fileStatus,
          staged: staged === 2,
        };

        if (staged === 2) {
          stagedChanges.push(change);
        } else {
          changes.push(change);
        }
      }
    }

    return NextResponse.json({
      branch: currentBranch,
      changes,
      stagedChanges,
    });
  } catch (error) {
    console.error("Git status error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to get Git status" },
      { status: 500 }
    );
  }
}
