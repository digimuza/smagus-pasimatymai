"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Header, PageContent, PageLayout } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { GAMES_HUB_ORDER, GAMES_META } from "@/lib/games/gamesMeta";

export default function GamesHubPage() {
	const router = useRouter();
	const t = useTranslations("games");

	return (
		<PageLayout>
			<Header showBack title={t("title")} />

			<PageContent>
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mb-6"
					initial={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.3 }}
				>
					<p className="text-text-muted">{t("intro")}</p>
				</motion.div>

				<motion.div
					animate="show"
					className="grid grid-cols-1 gap-4"
					initial="hidden"
					variants={staggerContainer}
				>
					{GAMES_HUB_ORDER.map((id) => {
						const meta = GAMES_META[id];
						return (
							<motion.button
								className="group flex items-center gap-4 rounded-2xl border-2 border-transparent bg-background-light p-5 text-left transition-all hover:border-primary/40 hover:bg-background-lighter"
								key={id}
								onClick={() => router.push(`/games/${id}`)}
								variants={staggerItem}
								whileHover={{ y: -2 }}
								whileTap={{ scale: 0.98 }}
							>
								<div
									className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-3xl"
									style={{
										background: `linear-gradient(135deg, ${meta.color}25, ${meta.color}08)`,
										boxShadow: `0 4px 16px ${meta.color}30`,
									}}
								>
									{meta.icon}
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="font-light text-lg text-primary">
										{t(`hub.${id}.title`)}
									</h3>
									<p className="text-sm text-text-muted">
										{t(`hub.${id}.description`)}
									</p>
								</div>
								<svg
									className="h-6 w-6 flex-shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M9 5l7 7-7 7"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
									/>
								</svg>
							</motion.button>
						);
					})}
				</motion.div>
			</PageContent>
		</PageLayout>
	);
}
