import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;

/**
 * GET /api/auth/github/callback
 * Handles GitHub OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/ide?auth=required', request.url));
    }

    const { userId } = authResult;
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth error
    if (error) {
      return NextResponse.redirect(new URL('/ide?github=error', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/ide?github=invalid', request.url));
    }

    // Verify state (CSRF protection)
    const storedState = request.cookies.get('github_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL('/ide?github=invalid', request.url));
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return NextResponse.redirect(new URL('/ide?github=config', request.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub token error:', tokenData);
      return NextResponse.redirect(new URL('/ide?github=error', request.url));
    }

    const accessToken = tokenData.access_token;

    // Get GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userResponse.json();

    if (!githubUser.id) {
      return NextResponse.redirect(new URL('/ide?github=error', request.url));
    }

    // Save or update GitHub account in database
    await prisma.githubAccount.upsert({
      where: { githubId: githubUser.id },
      update: {
        accessToken,
        refreshToken: tokenData.refresh_token || null,
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        updatedAt: new Date(),
      },
      create: {
        userId,
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
        accessToken,
        refreshToken: tokenData.refresh_token || null,
        avatarUrl: githubUser.avatar_url,
      },
    });

    // Clear state cookie
    const response = NextResponse.redirect(new URL('/ide?github=connected', request.url));
    response.cookies.set('github_oauth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/ide?github=error', request.url));
  }
}
