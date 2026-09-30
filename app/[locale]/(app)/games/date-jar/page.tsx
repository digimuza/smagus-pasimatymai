"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { GamePicker, GameShell } from "@/components/games";
import { Button } from "@/components/ui";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useHaptic } from "@/hooks/useHaptic";
import { DATE_IDEAS } from "@/lib/games/dateIdeas";
import { pickRandom } from "@/lib/games/gameUtils";
import type { DateCategory, DateIdea } from "@/types/games";

type Filter = "all" | DateCategory;
type Stored = { completed: string[]; favorites: string[] };

const FILTERS: { id: Filter; label: string }[] = [
	{ id: "all", label: "Visi" },
	{ id: "home", label: "Namie" },
	{ id: "outdoor", label: "Lauke" },
	{ id: "food", label: "Maistas" },
	{ id: "romantic", label: "Romantiška" },
	{ id: "fun", label: "Linksma" },
];

const CATEGORY_COLOR: Record<DateCategory, string> = {
	food: "#f59e0b",
	fun: "#34d399",
	home: "#60a5fa",
	outdoor: "#84cc16",
	romantic: "#fb7185",
};

export default function DateJarPage() {
	const t = useTranslations("games.dateJar");
	const tc = useTranslations("common");
	const { vibrate } = useHaptic();

	const [stored, setStored] = useGameStorage<Stored>("date-jar", {
		completed: [],
		favorites: [],
	});
	const [filter, setFilter] = useState<Filter>("all");
	const [current, setCurrent] = useState<DateIdea | null>(null);
	const [showFinished, setShowFinished] = useState(false);

	const pool = useMemo(() => {
		if (filter === "all") return DATE_IDEAS;
		return DATE_IDEAS.filter((idea) => idea.category === filter);
	}, [filter]);

	const spin = useCallback(() => {
		vibrate("medium");
		setCurrent(pickRandom(pool));
		setShowFinished(false);
	}, [pool, vibrate]);

	const nextFromJar = useCallback(() => {
		const remaining = pool.filter((idea) => idea.id !== current?.id);
		setCurrent(pickRandom(remaining) ?? pickRandom(pool));
		setShowFinished(false);
	}, [pool, current]);

	const toggleFavorite = (id: string) => {
		vibrate("light");
		setStored((prev) => ({
			...prev,
			favorites: prev.favorites.includes(id)
				? prev.favorites.filter((f) => f !== id)
				: [...prev.favorites, id],
		}));
	};

	const toggleCompleted = (id: string) => {
		vibrate("light");
		setStored((prev) => ({
			...prev,
			completed: prev.completed.includes(id)
				? prev.completed.filter((c) => c !== id)
				: [...prev.completed, id],
		}));
	};

	const resetJar = () => {
		if (!confirm(tc("confirm"))) return;
		setStored({ completed: [], favorites: [] });
		setCurrent(null);
	};

	const isFavorite = current ? stored.favorites.includes(current.id) : false;
	const isCompleted = current ? stored.completed.includes(current.id) : false;

	return (
		<GameShell
			accentColor="#fb7185"
			icon="🎁"
			rightAction={
				<button
					className="text-text-muted transition-colors hover:text-text"
					onClick={resetJar}
					title={t("reset")}
					type="button"
				>
					<svg
						className="h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-3M20 14a8 8 0 01-14 3"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					</svg>
				</button>
			}
			title={t("title")}
		>
			<div className="flex flex-1 flex-col p-6">
				{/* Filter chips */}
				<div className="-mx-2 mb-4 flex gap-2 overflow-x-auto px-2 pb-2">
					{FILTERS.map((f) => {
						const isActive = filter === f.id;
						return (
							<button
								className={`flex-shrink-0 rounded-full border px-4 py-2 font-medium text-sm transition-all ${
									isActive
										? "border-primary bg-primary text-background"
										: "border-primary/30 bg-background-light text-primary"
								}`}
								key={f.id}
								onClick={() => {
									setFilter(f.id);
									setCurrent(null);
								}}
								type="button"
							>
								{t(`filter.${f.id}`)}
							</button>
						);
					})}
				</div>

				{/* Jar / Card area */}
				<div className="relative mb-6 flex flex-1 items-center justify-center">
					<AnimatePresence mode="wait">
						{current ? (
							<motion.div
								animate={{ opacity: 1, rotateY: 0, scale: 1 }}
								className="w-full max-w-sm rounded-2xl border-2 p-8 text-center shadow-lg"
								exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
								initial={{ opacity: 0, rotateY: -90, scale: 0.5 }}
								key={current.id}
								style={{
									background: `linear-gradient(135deg, ${CATEGORY_COLOR[current.category]}20, ${CATEGORY_COLOR[current.category]}08)`,
									borderColor: `${CATEGORY_COLOR[current.category]}60`,
									boxShadow: `0 8px 32px ${CATEGORY_COLOR[current.category]}30`,
								}}
								transition={{ damping: 15, type: "spring" }}
							>
								<motion.div
									animate={{ scale: [1, 1.15, 1] }}
									className="mb-4 text-6xl"
									transition={{ duration: 0.6 }}
								>
									{current.icon}
								</motion.div>
								<span
									className="mb-2 inline-block rounded-full px-3 py-1 font-medium text-background text-xs uppercase tracking-wide"
									style={{ backgroundColor: CATEGORY_COLOR[current.category] }}
								>
									{t(`filter.${current.category}`)}
								</span>
								<p className="my-4 font-light text-2xl text-text">
									{current.prompt}
								</p>
								<div className="flex items-center justify-center gap-4 text-sm text-text-muted">
									<span>⏱ {current.duration}</span>
									<span>•</span>
									<span>{t(`intensity.${current.intensity}`)}</span>
								</div>
								{isCompleted && (
									<div className="mt-3 inline-flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-success text-xs">
										✓ {t("completed")}
									</div>
								)}
							</motion.div>
						) : (
							<motion.button
								animate={{ opacity: 1, scale: 1 }}
								className="flex h-64 w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-primary/40 border-dashed bg-primary/5 transition-colors hover:border-primary hover:bg-primary/10"
								exit={{ opacity: 0, scale: 0.9 }}
								initial={{ opacity: 0, scale: 0.9 }}
								key="empty"
								onClick={spin}
								type="button"
								whileTap={{ scale: 0.97 }}
							>
								<motion.div
									animate={{ rotate: [0, -10, 10, -10, 0] }}
									className="mb-3 text-7xl"
									transition={{
										duration: 2,
										repeat: Infinity,
										repeatDelay: 1,
									}}
								>
									🎁
								</motion.div>
								<p className="font-light text-2xl text-primary">{t("empty")}</p>
								<p className="mt-2 text-sm text-text-muted">{t("emptyHint")}</p>
							</motion.button>
						)}
					</AnimatePresence>
				</div>

				{/* Action buttons */}
				<div className="mb-4 grid grid-cols-2 gap-3">
					<Button fullWidth onClick={spin} size="lg" variant="primary">
						{current ? t("spinAgain") : t("spin")}
					</Button>
					<Button fullWidth onClick={nextFromJar} size="lg" variant="secondary">
						{t("nextIdea")}
					</Button>
				</div>

				{current && (
					<div className="mb-4 grid grid-cols-2 gap-3">
						<Button
							fullWidth
							onClick={() => toggleFavorite(current.id)}
							variant={isFavorite ? "primary" : "secondary"}
						>
							{isFavorite ? `★ ${t("favorited")}` : `☆ ${t("favorite")}`}
						</Button>
						<Button
							fullWidth
							onClick={() => toggleCompleted(current.id)}
							variant={isCompleted ? "primary" : "ghost"}
						>
							{isCompleted ? `✓ ${t("completed")}` : t("markDone")}
						</Button>
					</div>
				)}

				{/* Stats / toggle history */}
				<div className="rounded-xl border border-primary/10 bg-background-light p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-text-muted">{t("statsCompleted")}</p>
							<p className="font-bold text-2xl text-primary">
								{stored.completed.length} / {DATE_IDEAS.length}
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-text-muted">{t("statsFavorites")}</p>
							<p className="font-bold text-2xl text-accent">
								★ {stored.favorites.length}
							</p>
						</div>
					</div>
					{showFinished && (
						<div className="mt-4 grid grid-cols-3 gap-2 text-2xl">
							{stored.completed.map((id) => {
								const idea = DATE_IDEAS.find((i) => i.id === id);
								if (!idea) return null;
								return (
									<div
										className="flex h-12 items-center justify-center rounded-lg bg-primary/10"
										key={id}
										title={idea.prompt}
									>
										{idea.icon}
									</div>
								);
							})}
						</div>
					)}
					{stored.completed.length > 0 && (
						<button
							className="mt-3 w-full text-center text-primary text-sm hover:underline"
							onClick={() => setShowFinished((v) => !v)}
							type="button"
						>
							{showFinished ? t("hideHistory") : t("showHistory")}
						</button>
					)}
				</div>

				<GamePicker />
			</div>
		</GameShell>
	);
}
