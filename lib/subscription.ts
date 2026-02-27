import { FREE_QUESTIONS_LIMIT, FREE_AUDIENCE } from './stripe';

interface SubscriptionInfo {
  plan: string;
  status: string;
}

export function isPremium(subscription: SubscriptionInfo | null | undefined): boolean {
  if (!subscription) return false;
  return (
    (subscription.plan === 'monthly' || subscription.plan === 'yearly') &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  );
}

export function canAccessAudience(
  audienceSlug: string,
  subscription: SubscriptionInfo | null | undefined
): boolean {
  if (isPremium(subscription)) return true;
  return audienceSlug === FREE_AUDIENCE;
}

export function canAccessSpicyCards(subscription: SubscriptionInfo | null | undefined): boolean {
  return isPremium(subscription);
}

export function getQuestionLimit(subscription: SubscriptionInfo | null | undefined): number {
  if (isPremium(subscription)) return Infinity;
  return FREE_QUESTIONS_LIMIT;
}

export function limitQuestions<T>(
  questions: T[],
  subscription: SubscriptionInfo | null | undefined
): T[] {
  const limit = getQuestionLimit(subscription);
  if (limit === Infinity) return questions;
  return questions.slice(0, limit);
}
