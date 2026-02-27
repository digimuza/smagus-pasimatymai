import { getSessionId } from './sessionId';

type EventType = 'viewed' | 'skipped' | 'answered' | 'superliked' | 'spicy_dismissed';

interface AnalyticsEvent {
  sessionId: string;
  questionId: number | string;
  eventType: EventType;
  timestamp: string;
  timeSpent?: number;
}

interface SessionData {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  audience?: string;
  locale?: string;
  questionsViewed: number;
  questionsSkipped: number;
  spicyCardsViewed: number;
  device: string;
}

class AnalyticsBuffer {
  private queue: AnalyticsEvent[] = [];
  private session: SessionData | null = null;
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  init(meta: { audience?: string; locale?: string }) {
    if (this.initialized) return;
    this.initialized = true;

    const sessionId = getSessionId();
    if (!sessionId) return;

    this.session = {
      sessionId,
      startedAt: new Date().toISOString(),
      audience: meta.audience,
      locale: meta.locale,
      questionsViewed: 0,
      questionsSkipped: 0,
      spicyCardsViewed: 0,
      device: navigator.userAgent,
    };

    this.flushInterval = setInterval(() => this.flush(), 10_000);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });

    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }

  track(eventType: EventType, questionId: number | string, timeSpent?: number) {
    const sessionId = getSessionId();
    if (!sessionId) return;

    this.queue.push({
      sessionId,
      questionId,
      eventType,
      timestamp: new Date().toISOString(),
      timeSpent,
    });

    if (this.session) {
      if (eventType === 'viewed') this.session.questionsViewed++;
      if (eventType === 'skipped') this.session.questionsSkipped++;
      if (eventType === 'spicy_dismissed') this.session.spicyCardsViewed++;
    }
  }

  flush(useSendBeacon = false) {
    if (this.queue.length === 0 && !this.session) return;

    const payload = JSON.stringify({
      events: this.queue,
      session: this.session
        ? { ...this.session, endedAt: new Date().toISOString() }
        : undefined,
    });

    this.queue = [];

    if (useSendBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/analytics',
        new Blob([payload], { type: 'application/json' })
      );
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }).catch(() => {
        // Silently ignore analytics failures
      });
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(true);
    this.initialized = false;
    this.session = null;
  }
}

export const analytics = new AnalyticsBuffer();

export function trackEvent(eventType: EventType, questionId: number | string, timeSpent?: number) {
  analytics.track(eventType, questionId, timeSpent);
}
