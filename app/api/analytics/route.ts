import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/payload';

const VALID_EVENT_TYPES = ['viewed', 'skipped', 'answered', 'superliked', 'spicy_dismissed'];
const VALID_AUDIENCES = ['romantic', 'family', 'kids', 'friends'];
const VALID_LOCALES = ['lt', 'en'];

interface IncomingEvent {
  sessionId: string;
  questionId: number | string;
  eventType: string;
  timestamp: string;
  timeSpent?: number;
}

interface IncomingSession {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  audience?: string;
  locale?: string;
  questionsViewed: number;
  questionsSkipped: number;
  spicyCardsViewed: number;
  device?: string;
}

function validateEvent(e: unknown): e is IncomingEvent {
  if (!e || typeof e !== 'object') return false;
  const ev = e as Record<string, unknown>;
  return (
    typeof ev.sessionId === 'string' &&
    (typeof ev.questionId === 'number' || typeof ev.questionId === 'string') &&
    typeof ev.eventType === 'string' &&
    VALID_EVENT_TYPES.includes(ev.eventType) &&
    typeof ev.timestamp === 'string'
  );
}

function validateSession(s: unknown): s is IncomingSession {
  if (!s || typeof s !== 'object') return false;
  const sess = s as Record<string, unknown>;
  return (
    typeof sess.sessionId === 'string' &&
    typeof sess.startedAt === 'string' &&
    typeof sess.questionsViewed === 'number' &&
    typeof sess.questionsSkipped === 'number' &&
    typeof sess.spicyCardsViewed === 'number'
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { events, session } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'events must be an array' }, { status: 400 });
    }

    const payload = await getPayloadClient();

    // Validate and insert events
    const validEvents = events.filter(validateEvent);
    for (const event of validEvents) {
      await payload.create({
        collection: 'question-events',
        data: {
          sessionId: event.sessionId,
          questionId: typeof event.questionId === 'number' ? event.questionId : 0,
          eventType: event.eventType,
          timestamp: event.timestamp,
          timeSpent: event.timeSpent,
        },
      });
    }

    // Upsert session
    if (session && validateSession(session)) {
      const existing = await payload.find({
        collection: 'game-sessions',
        where: { sessionId: { equals: session.sessionId } },
        limit: 1,
      });

      const sessionData = {
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        audience: VALID_AUDIENCES.includes(session.audience ?? '')
          ? (session.audience as 'romantic' | 'family' | 'kids' | 'friends')
          : undefined,
        locale: VALID_LOCALES.includes(session.locale ?? '')
          ? (session.locale as 'lt' | 'en')
          : undefined,
        questionsViewed: session.questionsViewed,
        questionsSkipped: session.questionsSkipped,
        spicyCardsViewed: session.spicyCardsViewed,
        device: session.device,
      };

      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'game-sessions',
          id: existing.docs[0].id,
          data: sessionData,
        });
      } else {
        await payload.create({
          collection: 'game-sessions',
          data: sessionData,
        });
      }
    }

    return NextResponse.json({ ok: true, eventsProcessed: validEvents.length });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
