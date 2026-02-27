import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { calculateStreak } from '@/lib/streaks';

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: req.headers });
  if (!user || user.collection !== 'players') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const streakData = calculateStreak({
    currentStreak: (user as Record<string, unknown>).currentStreak as number | undefined,
    longestStreak: (user as Record<string, unknown>).longestStreak as number | undefined,
    lastPlayedDate: (user as Record<string, unknown>).lastPlayedDate as string | undefined,
  });

  await payload.update({
    collection: 'players',
    id: user.id,
    data: streakData,
  });

  return NextResponse.json(streakData);
}

export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: req.headers });
  if (!user || user.collection !== 'players') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    currentStreak: (user as Record<string, unknown>).currentStreak || 0,
    longestStreak: (user as Record<string, unknown>).longestStreak || 0,
    lastPlayedDate: (user as Record<string, unknown>).lastPlayedDate || null,
  });
}
