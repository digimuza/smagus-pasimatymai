"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ModeCard } from "./ModeCard";

export function ModeShowcase() {
	const t = useTranslations("landing.modes");

	return (
		<section className="py-16 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<motion.h2
					className="mb-12 text-center font-bold text-3xl text-text md:text-4xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					{t("title")}
				</motion.h2>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
						delay={0.15}
						description={t("family.description")}
						href="/audience"
						icon="🏠"
						name={t("family.name")}
					/>
					<ModeCard
						colorClass="friends"
						cta={t("friends.cta")}
						delay={0.3}
						description={t("friends.description")}
						href="/audience"
						icon="🎉"
						name={t("friends.name")}
					/>
				</div>
			</div>
		</section>
	);
}
