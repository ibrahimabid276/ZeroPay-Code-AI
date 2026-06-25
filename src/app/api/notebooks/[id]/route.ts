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
      where: {
        id,
        userId,
      },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({ notebook: transformed });
  } catch (error) {
    console.error('Get notebook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Verify ownership
    const existing = await prisma.notebook.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    const notebook = await prisma.notebook.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.cells && { content: { cells: body.cells } }),
        ...(body.metadata && { metadata: body.metadata }),
        ...(body.runtimeType && { runtimeType: body.runtimeType }),
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

    return NextResponse.json({ notebook: transformed });
  } catch (error) {
    console.error('Update notebook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify ownership
    const existing = await prisma.notebook.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    await prisma.notebook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete notebook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
