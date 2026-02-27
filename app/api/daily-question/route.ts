import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(req: NextRequest) {
  const audience = req.nextUrl.searchParams.get('audience') || 'romantic';
  const today = new Date().toISOString().slice(0, 10);
  const payload = await getPayload({ config });

  // Try to find today's daily question for this audience
  const existing = await payload.find({
    collection: 'daily-questions',
    where: {
      and: [
        { date: { equals: today } },
        { audience: { equals: audience } },
      ],
    },
    limit: 1,
    depth: 1,
  });

  if (existing.docs.length > 0) {
    const doc = existing.docs[0];
    const q = doc.question as { id: number; question: string } | number;
    if (typeof q === 'object' && q !== null) {
      return NextResponse.json({
        id: q.id,
        question: q.question,
        date: doc.date,
      });
    }
  }

  // Auto-generate: pick a random question for this audience
  const questions = await payload.find({
    collection: 'questions',
    where: {
      and: [
        { audience: { equals: audience } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 500,
    depth: 0,
  });

  if (questions.docs.length === 0) {
    return NextResponse.json({ error: 'No questions available' }, { status: 404 });
  }

  // Use date as seed for deterministic daily pick
  const seed = today.split('-').reduce((acc, n) => acc + parseInt(n, 10), 0);
  const index = seed % questions.docs.length;
  const picked = questions.docs[index];

  // Save for today
  try {
    await payload.create({
      collection: 'daily-questions',
      data: {
        date: today,
        question: picked.id,
        audience,
      },
    });
  } catch {
    // Might already exist from concurrent request
  }

  return NextResponse.json({
    id: picked.id,
    question: picked.question,
    date: today,
  });
}
