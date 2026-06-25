import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Note: Code execution via child_process is not supported on Vercel serverless
    // This would require a dedicated runtime server or external execution service
    return NextResponse.json({
      output: [{
        id: `output-${Date.now()}`,
        type: 'text',
        content: `Code execution is not available in cloud deployment.\n\nTo run notebooks locally:\n1. Clone the repository\n2. Run: npm run dev\n3. Notebooks will execute using your local Python/Node.js runtime`,
      }],
      executionTime: 0,
      error: 'Code execution requires local runtime or dedicated execution server',
    });

  } catch (error: any) {
    console.error('Execute cell error:', error);
    return NextResponse.json(
      { error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
