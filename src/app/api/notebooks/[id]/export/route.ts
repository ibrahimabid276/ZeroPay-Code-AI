import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
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

    const notebook = await prisma.notebook.findFirst({
      where: { id, userId },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    const cells = (notebook.content as any).cells || [];

    // Convert to Jupyter notebook format
    const ipynb = {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: notebook.metadata || {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3',
        },
        language_info: {
          name: 'python',
          version: '3.8.0',
        },
      },
      cells: cells.map((cell: any) => ({
        cell_type: cell.type === 'markdown' ? 'markdown' : 'code',
        execution_count: cell.executionCount || null,
        source: cell.content.split('\n'),
        outputs: cell.output?.map((out: any) => ({
          output_type: out.type === 'error' ? 'error' : 'stream',
          name: 'stdout',
          text: out.content.split('\n'),
        })) || [],
        metadata: {},
      })),
    };

    return new Response(JSON.stringify(ipynb, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${notebook.title}.ipynb"`,
      },
    });
  } catch (error) {
    console.error('Export notebook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
