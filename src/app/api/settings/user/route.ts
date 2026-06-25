import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserSettings, updateUserSettings, UpdateSettingsInput } from '@/lib/services/SettingsService';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    
    if ('error' in authResult || 'status' in authResult) {
      return authResult as NextResponse;
    }

    const { userId } = authResult;
    const settings = await getUserSettings(userId);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
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
    const input: UpdateSettingsInput = body;

    const settings = await updateUserSettings(userId, input);

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
