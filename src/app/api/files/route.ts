import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir, rm } from "fs/promises";
import { join, dirname } from "path";

const getProjectsDir = () => process.env.PROJECTS_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".projects");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const path = searchParams.get("path");

    if (!projectId || !path) {
      return NextResponse.json({ error: "Missing projectId or path" }, { status: 400 });
    }

    const filePath = join(getProjectsDir(), projectId, path);
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Read file error:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, path, content = "" } = await req.json();

    if (!projectId || !path) {
      return NextResponse.json({ error: "Missing projectId or path" }, { status: 400 });
    }

    const filePath = join(getProjectsDir(), projectId, path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create file error:", error);
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { projectId, path, content } = await req.json();

    if (!projectId || !path || content === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const filePath = join(getProjectsDir(), projectId, path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update file error:", error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { projectId, path } = await req.json();

    if (!projectId || !path) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const filePath = join(getProjectsDir(), projectId, path);
    // Use rm with recursive to handle both files and folders
    await rm(filePath, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
