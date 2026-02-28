import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
	if (!_stripe) {
		_stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
			apiVersion: "2026-02-25.clover",
		});
	}
	return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
	get(_, prop) {
		return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
	},
});

export const PLANS = {
	monthly: {
		amount: 499, // €4.99
		interval: "month" as const,
		name: "Premium Monthly",
		priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "",
	},
	yearly: {
		amount: 2999, // €29.99
		interval: "year" as const,
		name: "Premium Yearly",
		priceId: process.env.STRIPE_YEARLY_PRICE_ID || "",
	},
} as const;

export type PlanType = keyof typeof PLANS;

export const FREE_QUESTIONS_LIMIT = 50;
export const FREE_AUDIENCE = "romantic";
