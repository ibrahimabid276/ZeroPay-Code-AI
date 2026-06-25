import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const notebooks = await prisma.notebook.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform to frontend format
    const transformed = notebooks.map((nb: any) => ({
      id: nb.id,
      userId: nb.userId,
      projectId: nb.projectId,
      title: nb.title,
      description: nb.description,
      cells: (nb.content as any).cells || [],
      runtimeType: nb.runtimeType,
      createdAt: nb.createdAt.getTime(),
      updatedAt: nb.updatedAt.getTime(),
      lastExecutedAt: nb.lastExecutedAt?.getTime(),
      metadata: nb.metadata,
    }));

    return NextResponse.json({ notebooks: transformed });
  } catch (error) {
    console.error('Get notebooks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;
    const body = await request.json();
    const { title, projectId, runtimeType = 'python' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const notebook = await prisma.notebook.create({
      data: {
        userId,
        projectId,
        title,
        runtimeType,
        content: {
          cells: [
            {
              id: `cell-1`,
              type: 'code',
              language: runtimeType === 'python' ? 'python' : 'javascript',
              content: '',
              output: [],
            },
          ],
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
    console.error('Create notebook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
