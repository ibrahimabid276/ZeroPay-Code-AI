import { NextRequest, NextResponse } from "next/server";
import { spawn, ChildProcess } from "child_process";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const getProjectsDir = () => process.env.PROJECTS_DIR || join(/*turbopackIgnore: true*/ process.cwd(), ".projects");

// In-memory process tracking
interface ActiveServer {
  process: ChildProcess;
  projectId: string;
  port: number;
  previewUrl: string;
  command: string;
}

const activeServers = new Map<string, ActiveServer>();

// Find an available port
async function findAvailablePort(startPort: number): Promise<number> {
  const net = await import("net");
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = (server.address() as any).port;
      server.close(() => resolve(port));
    });
    server.on("error", () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, command, port } = body;

    if (!projectId || !command) {
      return NextResponse.json({ error: "Missing projectId or command" }, { status: 400 });
    }

    // Check if server is already running
    if (activeServers.has(projectId)) {
      return NextResponse.json({ error: "Server already running" }, { status: 400 });
    }

    const projectDir = join(getProjectsDir(), projectId);
    if (!existsSync(projectDir)) {
      return NextResponse.json({ error: "Project directory not found" }, { status: 404 });
    }

    // Find available port
    const availablePort = await findAvailablePort(port || 3000);

    // Determine how to run the command
    let execCommand: string;
    let args: string[];
    const isWindows = process.platform === "win32";

    if (command === "static") {
      // For static HTML, we'll use a simple approach
      return NextResponse.json({
        port: availablePort,
        previewUrl: `http://localhost:${availablePort}`,
        processId: 0,
        message: "Static projects will be served directly",
      });
    }

    // Parse the command (e.g., "npm run dev")
    const parts = command.split(" ");
    execCommand = isWindows ? "cmd.exe" : parts[0];
    args = isWindows ? ["/c", ...parts] : parts.slice(1);

    // Add port override if possible
    if (command.includes("next dev")) {
      args.push("-p", availablePort.toString());
    } else if (command.includes("vite")) {
      args.push("--port", availablePort.toString());
    }

    // Spawn the process
    const childProcess = spawn(execCommand, args, {
      cwd: projectDir,
      env: { ...process.env, PORT: availablePort.toString() },
      shell: isWindows,
    });

    const previewUrl = `http://localhost:${availablePort}`;

    activeServers.set(projectId, {
      process: childProcess,
      projectId,
      port: availablePort,
      previewUrl,
      command,
    });

    // Capture output
    childProcess.stdout?.on("data", (data) => {
      console.log(`[${projectId}]`, data.toString());
    });

    childProcess.stderr?.on("data", (data) => {
      console.error(`[${projectId}]`, data.toString());
    });

    childProcess.on("exit", (code) => {
      console.log(`[${projectId}] Process exited with code ${code}`);
      activeServers.delete(projectId);
    });

    childProcess.on("error", (error) => {
      console.error(`[${projectId}] Process error:`, error);
      activeServers.delete(projectId);
    });

    return NextResponse.json({
      port: availablePort,
      previewUrl,
      processId: childProcess.pid,
    });
  } catch (error: any) {
    console.error("Server start error:", error);
    return NextResponse.json({ error: error.message || "Failed to start server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const server = activeServers.get(projectId);
    if (!server) {
      return NextResponse.json({ error: "No running server found" }, { status: 404 });
    }

    // Kill the process
    if (server.process.pid) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", server.process.pid.toString(), "/f", "/t"]);
      } else {
        process.kill(-server.process.pid, "SIGTERM");
      }
    }

    activeServers.delete(projectId);

    return NextResponse.json({ message: "Server stopped" });
  } catch (error: any) {
    console.error("Server stop error:", error);
    return NextResponse.json({ error: error.message || "Failed to stop server" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      const server = activeServers.get(projectId);
      if (server) {
        return NextResponse.json({
          running: true,
          port: server.port,
          previewUrl: server.previewUrl,
          command: server.command,
        });
      }
      return NextResponse.json({ running: false });
    }

    // Return all active servers
    const servers = Array.from(activeServers.entries()).map(([id, server]) => ({
      projectId: id,
      port: server.port,
      previewUrl: server.previewUrl,
      command: server.command,
    }));

    return NextResponse.json({ servers });
  } catch (error: any) {
    console.error("Server status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
