import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;
    const body = await request.json();
    const { content, title, projectId } = body;

    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' },
        { status: 400 }
      );
    }

    // Convert Jupyter notebook format to our format
    const cells = content.cells?.map((cell: any, index: number) => ({
      id: `cell-${index + 1}`,
      type: cell.cell_type === 'code' ? 'code' : 'markdown',
      language: cell.cell_type === 'code' ? 'python' : 'markdown',
      content: Array.isArray(cell.source) ? cell.source.join('') : cell.source,
      output: cell.outputs?.map((output: any, i: number) => ({
        id: `output-${index}-${i}`,
        type: output.output_type === 'error' ? 'error' : 'text',
        content: output.text || output.data?.['text/plain'] || '',
      })) || [],
    })) || [];

    const notebook = await prisma.notebook.create({
      data: {
        userId,
        projectId,
        title,
        runtimeType: 'python',
        content: { cells },
        metadata: {
          kernelspec: content.metadata?.kernelspec,
          languageInfo: content.metadata?.language_info,
        },
      },
    });

    const transformed = {
      id: notebook.id,
      userId: notebook.userId,
      projectId: notebook.projectId,
      title: notebook.title,
      description: notebook.description,
      cells: (notebook.content as any).cells || [],
      runtimeType: notebook.runtimeType,
      createdAt: notebook.createdAt.getTime(),
      updatedAt: notebook.updatedAt.getTime(),
      lastExecutedAt: notebook.lastExecutedAt?.getTime(),
      metadata: notebook.metadata,
    };

    return NextResponse.json({ notebook: transformed }, { status: 201 });
  } catch (error) {
    console.error('Import notebook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
