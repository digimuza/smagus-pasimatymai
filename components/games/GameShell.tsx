"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Header, PageLayout } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";

interface GameShellProps {
	accentColor?: string;
	children: ReactNode;
	icon: string;
	rightAction?: ReactNode;
	showBack?: boolean;
	title: string;
}

/**
 * Reusable shell for all couple-games pages. Provides consistent dark layout
 * with a back button, header, and accent-colored icon.
 */
export function GameShell({
	title,
	icon,
	accentColor = "#c084fc",
	showBack = true,
	rightAction,
	children,
}: GameShellProps) {
	const router = useRouter();
	const t = useTranslations("common");

	return (
		<PageLayout>
			<Header
				leftAction={
					showBack ? (
						<button
							aria-label={t("back")}
							className="text-text-muted transition-colors hover:text-text"
							onClick={() => router.push("/games")}
							type="button"
						>
							<svg
								className="h-8 w-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M15 19l-7-7 7-7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
					) : undefined
				}
				rightAction={
					rightAction ?? (
						<span
							className="text-2xl"
							style={{ filter: `drop-shadow(0 0 8px ${accentColor}50)` }}
						>
							{icon}
						</span>
					)
				}
				title={title}
			/>
			<motion.main
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-1 flex-col"
				initial={{ opacity: 0, y: 8 }}
				transition={{ duration: 0.25 }}
			>
				{children}
			</motion.main>
		</PageLayout>
	);
}
