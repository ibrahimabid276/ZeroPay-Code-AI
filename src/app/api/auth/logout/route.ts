import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { logout } from '@/lib/services/AuthService';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;
    const token = request.cookies.get('accessToken')?.value;

    if (token) {
      await logout(userId, token);
    }

    // Clear cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
