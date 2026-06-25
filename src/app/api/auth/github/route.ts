import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;

/**
 * GET /api/auth/github
 * Initiates GitHub OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    if (!GITHUB_CLIENT_ID) {
      return NextResponse.json(
        { error: 'GitHub OAuth not configured' },
        { status: 500 }
      );
    }

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(2);
    
    // Store state in cookie for verification
    const response = NextResponse.redirect(
      `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&state=${state}&scope=repo`
    );

    response.cookies.set('github_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('GitHub OAuth init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize GitHub OAuth' },
      { status: 500 }
    );
  }
}
