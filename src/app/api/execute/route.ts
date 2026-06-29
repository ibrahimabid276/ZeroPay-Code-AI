import { NextRequest, NextResponse } from "next/server";

// Judge0 API configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

// Language ID mapping for Judge0
// Full list: https://ce.judge0.com/
const LANGUAGE_MAP: Record<string, number> = {
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 63, // TypeScript runs as JavaScript
  python: 71, // Python (3.8.1)
  python3: 71,
  java: 62, // Java (OpenJDK 13.0.1)
  cpp: 54, // C++ (GCC 9.2.0)
  c: 50, // C (GCC 9.2.0)
  csharp: 51, // C# (Mono 6.6.0.161)
  go: 60, // Go (1.13.5)
  rust: 73, // Rust (1.40.0)
  php: 68, // PHP (7.4.1)
  ruby: 72, // Ruby (2.7.0)
  swift: 83, // Swift (5.2.3)
  kotlin: 78, // Kotlin (1.3.70)
  sql: 82, // SQL (SQLite 3.27.2)
  bash: 46, // Bash (5.0.0)
  shell: 46,
};

/**
 * Detect language ID from file extension or language name
 */
function detectLanguageId(language: string, filePath?: string): number {
  // Try to detect from language name first
  const langLower = language.toLowerCase();
  if (LANGUAGE_MAP[langLower]) {
    return LANGUAGE_MAP[langLower];
  }

  // Try to detect from file extension
  if (filePath) {
    const ext = filePath.split(".").pop()?.toLowerCase();
    if (ext && LANGUAGE_MAP[ext]) {
      return LANGUAGE_MAP[ext];
    }
  }

  // Default to JavaScript
  return 63;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language, filePath } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Detect language ID
    const languageId = detectLanguageId(language || "javascript", filePath);

    // Prepare Judge0 submission
    const submission = {
      source_code: code,
      language_id: languageId,
      stdin: "",
      redirect_stderr_to_stdout: true,
    };

    // Submit code for execution
    const submitResponse = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": JUDGE0_API_HOST,
        },
        body: JSON.stringify(submission),
      }
    );

    if (!submitResponse.ok) {
      const errorData = await submitResponse.json();
      console.error("Judge0 API error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to execute code" },
        { status: 500 }
      );
    }

    const result = await submitResponse.json();

    // Process the result
    const output = result.stdout || "";
    const error = result.stderr || "";
    const compileOutput = result.compile_output || "";
    const statusId = result.status?.id;
    const statusDescription = result.status?.description;
    const time = result.time;
    const memory = result.memory;

    // Determine if execution was successful
    // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit, 6=Compilation Error, 7=Runtime Error, 8=Invalid Reference, 9=Runtime Error (SIGSEGV), 10=Runtime Error (SIGXFSZ), 11=Runtime Error (SIGFPE), 12=Runtime Error (SIGABRT), 13=Runtime Error (NZEC), 14=Runtime Error (Other), 15=Internal Error, 16=Exec Format Error
    const isSuccess = statusId === 3;
    const isCompileError = statusId === 6;
    const isRuntimeError = statusId >= 7 && statusId <= 14;

    return NextResponse.json({
      success: isSuccess,
      output: output || (isSuccess ? "" : null),
      error: error || compileOutput || (isRuntimeError ? statusDescription : null),
      status: statusDescription,
      statusCode: statusId,
      executionTime: time,
      memoryUsage: memory,
      languageId,
    });
  } catch (error: any) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute code" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Judge0 code execution endpoint",
    supportedLanguages: Object.keys(LANGUAGE_MAP),
  });
}
