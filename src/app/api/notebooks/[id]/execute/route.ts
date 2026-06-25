import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;
    const { id } = await params;
    const body = await request.json();
    const { cellId, code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Verify notebook ownership
    const notebook = await prisma.notebook.findFirst({
      where: { id, userId },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    // Execute code based on language
    const output = await executeCode(code, language);

    // Save execution history
    await prisma.notebookExecution.create({
      data: {
        notebookId: id,
        cellId,
        cellIndex: 0,
        code,
        output: output.outputs || [],
        error: output.error,
        status: output.error ? 'error' : 'success',
        duration: output.duration,
      },
    });

    // Update notebook last executed time
    await prisma.notebook.update({
      where: { id },
      data: {
        lastExecutedAt: new Date(),
      },
    });

    return NextResponse.json({
      output: output.outputs || [],
      executionTime: output.duration,
      error: output.error,
    });
  } catch (error: any) {
    console.error('Execute cell error:', error);
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}

async function executeCode(code: string, language: string): Promise<{
  outputs: any[];
  error?: string;
  duration: number;
}> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    // Use explicit command mapping for Turbopack compatibility
    let execCommand = 'node';
    let args: string[] = ['-e', code];
    
    if (language === 'python') {
      execCommand = 'python3';
      args = ['-c', code];
    } else if (language === 'bash') {
      execCommand = 'bash';
      args = ['-c', code];
    }

    const childProcess = spawn(execCommand, args, {
      timeout: 30000, // 30 second timeout
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      const duration = Date.now() - startTime;
      const outputs: any[] = [];

      if (stdout) {
        outputs.push({
          id: `output-${Date.now()}`,
          type: 'text',
          content: stdout,
        });
      }

      if (stderr || code !== 0) {
        resolve({
          outputs,
          error: stderr || `Process exited with code ${code}`,
          duration,
        });
      } else {
        resolve({
          outputs,
          duration,
        });
      }
    });

    childProcess.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        outputs: [],
        error: error.message,
        duration,
      });
    });
  });
}
