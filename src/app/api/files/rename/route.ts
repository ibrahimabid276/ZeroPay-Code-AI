import { NextRequest, NextResponse } from "next/server";
import { rename, access } from "fs/promises";
import { join, dirname } from "path";

const getProjectsDir = () =>
  process.env.PROJECTS_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".projects");

/**
 * POST /api/files/rename
 * Body: { projectId: string, oldPath: string, newName: string }
 * Renames a file or folder within a project.
 */
export async function POST(req: NextRequest) {
  try {
    const { projectId, oldPath, newName } = await req.json();

    if (!projectId || !oldPath || !newName) {
      return NextResponse.json(
        { error: "Missing projectId, oldPath, or newName" },
        { status: 400 }
      );
    }

    // Validate newName doesn't contain path separators (only rename, not move)
    if (newName.includes("/") || newName.includes("\\")) {
      return NextResponse.json(
        { error: "New name cannot contain path separators" },
        { status: 400 }
      );
    }

    const projectDir = join(getProjectsDir(), projectId);
    const oldFullPath = join(projectDir, oldPath);
    const newFullPath = join(dirname(oldFullPath), newName);

    // Ensure source exists
    try {
      await access(oldFullPath);
    } catch {
      return NextResponse.json({ error: "Source file/folder not found" }, { status: 404 });
    }

    await rename(oldFullPath, newFullPath);

    return NextResponse.json({
      success: true,
      newPath: join(dirname(oldPath), newName).replace(/\\/g, "/"),
    });
  } catch (error) {
    console.error("Rename file error:", error);
    return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
  }
}
