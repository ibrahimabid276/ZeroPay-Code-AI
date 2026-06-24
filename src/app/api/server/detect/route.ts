import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const getProjectsDir = () => process.env.PROJECTS_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".projects");

interface PackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const projectDir = join(getProjectsDir(), projectId);
    
    // Detect package manager
    let packageManager: "npm" | "pnpm" | "yarn" = "npm";
    if (existsSync(join(projectDir, "yarn.lock"))) {
      packageManager = "yarn";
    } else if (existsSync(join(projectDir, "pnpm-lock.yaml"))) {
      packageManager = "pnpm";
    }

    // Check for package.json
    const hasPackageJson = existsSync(join(projectDir, "package.json"));
    let detection = {
      type: "unknown",
      packageManager,
      startCommand: "npm run dev",
      defaultPort: 3000,
      hasDevScript: false,
    };

    if (hasPackageJson) {
      try {
        const packageJsonContent = await readFile(join(projectDir, "package.json"), "utf-8");
        const packageJson: PackageJson = JSON.parse(packageJsonContent);
        const scripts = packageJson.scripts || {};
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Check for dev script
        if (scripts.dev) {
          detection.hasDevScript = true;
          detection.startCommand = `${packageManager} run dev`;
        } else if (scripts.start) {
          detection.startCommand = `${packageManager} start`;
        }

        // Detect framework
        if (deps.next || deps["next"]) {
          detection.type = "nextjs";
          detection.defaultPort = 3000;
        } else if (deps.vite) {
          // Check if it's React or Vue
          if (deps.react || deps["react"]) {
            detection.type = "react";
            detection.defaultPort = 5173;
          } else if (deps.vue || deps["vue"]) {
            detection.type = "vue";
            detection.defaultPort = 5173;
          }
        } else if (deps.express || deps["express"] || deps.fastify || deps["fastify"]) {
          detection.type = "node";
          detection.defaultPort = 3000;
        }
      } catch (e) {
        console.error("Error reading package.json:", e);
      }
    } else if (existsSync(join(projectDir, "index.html"))) {
      // Static HTML project
      detection.type = "html";
      detection.startCommand = "static";
      detection.defaultPort = 8080;
    }

    return NextResponse.json({ detection });
  } catch (error) {
    console.error("Project detection error:", error);
    return NextResponse.json({
      detection: {
        type: "unknown",
        packageManager: "npm",
        startCommand: "npm run dev",
        defaultPort: 3000,
        hasDevScript: false,
      },
    });
  }
}
