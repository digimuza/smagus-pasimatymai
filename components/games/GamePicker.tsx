"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { GAMES_HUB_ORDER, GAMES_META } from "@/lib/games/gamesMeta";

/**
 * Compact, single-card "browse all games" footer used on each game page so
 * players can hop between games without using the back button twice.
 */
export function GamePicker() {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("games");

	const currentId = pathname.match(/\/games\/([^/?]+)/)?.[1] ?? null;

	return (
		<div className="border-primary/10 border-t bg-background-light/50 p-6">
			<p className="mb-3 text-center font-light text-sm text-text-muted">
				{t("tryAnother")}
			</p>
			<div className="flex flex-wrap justify-center gap-2">
				{GAMES_HUB_ORDER.filter((id) => id !== currentId).map((id) => {
					const meta = GAMES_META[id];
					return (
						<motion.button
							className="rounded-full border border-primary/20 bg-background-lighter px-4 py-2 font-medium text-primary text-sm transition-colors hover:bg-primary/20"
							key={id}
							onClick={() => router.push(`/games/${id}`)}
							whileTap={{ scale: 0.95 }}
						>
							<span className="mr-1">{meta.icon}</span>
							{meta.title}
						</motion.button>
					);
				})}
			</div>
		</div>
	);
}
