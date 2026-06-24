import { NextRequest, NextResponse } from "next/server";
import { readdir, mkdir, writeFile } from "fs/promises";
import { join } from "path";

const getProjectsDir = () => process.env.PROJECTS_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".projects");

export async function GET() {
  try {
    const projectsDir = getProjectsDir();
    await mkdir(projectsDir, { recursive: true });
    const entries = await readdir(projectsDir, { withFileTypes: true });
    const projects = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        projects.push({
          id: entry.name,
          name: entry.name,
          path: join(projectsDir, entry.name),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("List projects error:", error);
    return NextResponse.json({ projects: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing project name" }, { status: 400 });
    }

    const projectId = name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const projectDir = join(getProjectsDir(), projectId);
    await mkdir(projectDir, { recursive: true });

    // Create initial files
    await writeFile(
      join(projectDir, "README.md"),
      `# ${name}\n\nCreated with OpenCode Agent\n`,
      "utf-8"
    );

    const project = {
      id: projectId,
      name,
      path: projectDir,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
