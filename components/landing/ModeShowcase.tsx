"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ModeCard } from "./ModeCard";

export function ModeShowcase() {
	const t = useTranslations("landing.modes");
	const prefersReducedMotion = useReducedMotion();
	const headerTransition = prefersReducedMotion
		? { duration: 0 }
		: { duration: 0.6 };

	return (
		<section className="relative border-white/5 border-t bg-[#160e1e] py-20 sm:py-28">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<motion.h2
					className="mx-auto mb-14 max-w-2xl text-center font-serif text-4xl text-[#fff1e7] leading-tight sm:text-5xl"
					initial={{ opacity: 0, y: 20 }}
					transition={headerTransition}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					{t("title")}
				</motion.h2>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					<ModeCard
						colorClass="couples"
						cta={t("couples.cta")}
						delay={0}
						description={t("couples.description")}
						href="/audience"
						icon="💜"
						name={t("couples.name")}
					/>
					<ModeCard
						colorClass="family"
						cta={t("family.cta")}
						delay={prefersReducedMotion ? 0 : 0.05}
						description={t("family.description")}
						href="/audience"
						icon="🏠"
						name={t("family.name")}
					/>
					<ModeCard
						colorClass="friends"
						cta={t("friends.cta")}
						delay={prefersReducedMotion ? 0 : 0.1}
						description={t("friends.description")}
						href="/audience"
						icon="🎉"
						name={t("friends.name")}
					/>
					<ModeCard
						colorClass="kids"
						cta={t("kids.cta")}
						delay={prefersReducedMotion ? 0 : 0.15}
						description={t("kids.description")}
						href="/audience"
						icon="🌈"
						name={t("kids.name")}
					/>
				</div>
			</div>
		</section>
	);
}
