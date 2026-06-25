import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/github/repos
 * Fetch user's GitHub repositories
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;

    // Get user's GitHub account
    const githubAccount = await prisma.githubAccount.findFirst({
      where: { userId },
    });

    if (!githubAccount) {
      return NextResponse.json(
        { error: 'GitHub account not connected' },
        { status: 401 }
      );
    }

    // Fetch repositories from GitHub API
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
      headers: {
        Authorization: `Bearer ${githubAccount.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const repos = await response.json();

    // Format repositories
    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updatedAt: repo.updated_at,
      private: repo.private,
      cloneUrl: repo.clone_url,
    }));

    return NextResponse.json({ repositories: formattedRepos });
  } catch (error) {
    console.error('Fetch repos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/github/disconnect
 * Disconnect GitHub account
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;

    // Delete GitHub account
    await prisma.githubAccount.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect GitHub error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect GitHub' },
      { status: 500 }
    );
  }
}
