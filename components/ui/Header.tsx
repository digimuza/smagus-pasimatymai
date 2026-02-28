"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface HeaderProps {
	backHref?: string;
	className?: string;
	leftAction?: React.ReactNode;
	rightAction?: React.ReactNode;
	showBack?: boolean;
	title: string;
}

export function Header({
	title,
	showBack = false,
	backHref = "/game",
	leftAction,
	rightAction,
	className = "",
}: HeaderProps) {
	const router = useRouter();
	const t = useTranslations("common");

	const left =
		leftAction ??
		(showBack ? (
			<button
				aria-label={t("back")}
				className="text-text-muted transition-colors hover:text-text"
				onClick={() => router.push(backHref)}
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
		) : (
			<div className="w-8" />
		));

	return (
		<header
			className={`flex items-center justify-between bg-background-light p-6 ${className}`}
		>
			{left}
			<h1 className="font-light text-2xl text-primary">{title}</h1>
			{rightAction ?? <div className="w-8" />}
		</header>
	);
}
