"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GamePicker, GameShell } from "@/components/games";
import { Button } from "@/components/ui";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useHaptic } from "@/hooks/useHaptic";
import {
	daysBetween,
	formatDateKey,
	getTodaysChallenge,
} from "@/lib/games/challengeSelector";
import type { ChallengeCategory } from "@/types/games";

type Stored = {
	completedDays: string[]; // yyyy-mm-dd
	lastCompletedDate: string | null;
	longestStreak: number;
};

const CATEGORY_COLOR: Record<ChallengeCategory, string> = {
	connection: "#c084fc",
	fun: "#34d399",
	growth: "#60a5fa",
	kindness: "#fbbf24",
	romantic: "#fb7185",
};

export default function DailyChallengePage() {
	const t = useTranslations("games.dailyChallenge");
	const { vibrate } = useHaptic();

	const [stored, setStored] = useGameStorage<Stored>("daily-challenge", {
		completedDays: [],
		lastCompletedDate: null,
		longestStreak: 0,
	});

	const [now, setNow] = useState<Date | null>(null);
	useEffect(() => {
		setNow(new Date());
		// refresh at midnight so streak label updates
		const ms =
			24 * 60 * 60 * 1000 - (Date.now() % (24 * 60 * 60 * 1000)) + 1000;
		const t = setTimeout(() => setNow(new Date()), ms);
		return () => clearTimeout(t);
	}, []);

	const todayKey = now ? formatDateKey(now) : null;
	const todays = now ? getTodaysChallenge(now) : null;
	const completedToday = todayKey
		? stored.completedDays.includes(todayKey)
		: false;

	// Compute current streak (consecutive days from today going back)
	const currentStreak = (() => {
		if (!stored.lastCompletedDate || !now) return 0;
		const lastDate = new Date(stored.lastCompletedDate);
		const diff = daysBetween(lastDate, now);
		if (diff > 1) return 0; // streak broken
		if (diff === 0 && !completedToday) {
			// If today not yet completed but yesterday was — streak alive
			// walk backwards through completedDays starting from yesterday
			let count = 0;
			const cursor = new Date(now);
			cursor.setDate(cursor.getDate() - 1);
			while (stored.completedDays.includes(formatDateKey(cursor))) {
				count++;
				cursor.setDate(cursor.getDate() - 1);
			}
			return count;
		}
		if (diff === 0 && completedToday) {
			let count = 1;
			const cursor = new Date(now);
			cursor.setDate(cursor.getDate() - 1);
			while (stored.completedDays.includes(formatDateKey(cursor))) {
				count++;
				cursor.setDate(cursor.getDate() - 1);
			}
			return count;
		}
		return 0;
	})();

	const markCompleted = () => {
		if (!todayKey || completedToday) return;
		vibrate("heavy");
		setStored((prev) => {
			const completedDays = [...prev.completedDays, todayKey];
			const newStreak = computeNewStreak(
				completedDays,
				todayKey,
				prev.lastCompletedDate,
			);
			return {
				completedDays,
				lastCompletedDate: todayKey,
				longestStreak: Math.max(prev.longestStreak, newStreak),
			};
		});
	};

	const unmark = () => {
		if (!todayKey) return;
		setStored((prev) => ({
			completedDays: prev.completedDays.filter((d) => d !== todayKey),
			lastCompletedDate:
				prev.completedDays[prev.completedDays.length - 2] ?? null,
			longestStreak: prev.longestStreak,
		}));
	};

	const [showHistory, setShowHistory] = useState(false);

	if (!now || !todays) {
		return (
			<GameShell accentColor="#34d399" icon="🔥" title={t("title")}>
				<div className="flex flex-1 items-center justify-center text-primary">
					{t("loading")}
				</div>
			</GameShell>
		);
	}

	const accent = CATEGORY_COLOR[todays.challenge.category];

	return (
		<GameShell accentColor={accent} icon="🔥" title={t("title")}>
			<div className="flex flex-1 flex-col p-6">
				{/* Streak badge */}
				<motion.div
					animate={{ scale: [0.95, 1] }}
					className="mb-4 flex items-center justify-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4"
					initial={{ opacity: 0, y: -8 }}
					transition={{ damping: 15, type: "spring" }}
				>
					<motion.span
						animate={{ rotate: currentStreak > 0 ? [0, -10, 10, 0] : 0 }}
						className="text-3xl"
						key={currentStreak}
						transition={{ duration: 0.5 }}
					>
						🔥
					</motion.span>
					<div>
						<p className="font-bold text-2xl text-accent">{currentStreak}</p>
						<p className="text-text-muted text-xs">{t("streakDays")}</p>
					</div>
					{stored.longestStreak > 0 && (
						<div className="ml-auto text-right">
							<p className="text-text-muted text-xs">{t("best")}</p>
							<p className="font-bold text-primary text-sm">
								🏆 {stored.longestStreak}
							</p>
						</div>
					)}
				</motion.div>

				{/* Today's challenge card */}
				<AnimatePresence mode="wait">
					<motion.div
						animate={{ opacity: 1, rotateY: 0, scale: 1 }}
						className="mb-6 rounded-2xl border-2 p-6 shadow-lg"
						exit={{ opacity: 0, rotateY: -90 }}
						initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
						key={todays.challenge.id}
						style={{
							background: `linear-gradient(135deg, ${accent}25, ${accent}08)`,
							borderColor: `${accent}60`,
							boxShadow: `0 8px 32px ${accent}30`,
						}}
						transition={{ damping: 15, type: "spring" }}
					>
						<div className="mb-3 flex items-center justify-between">
							<span
								className="rounded-full px-3 py-1 font-medium text-background text-xs uppercase tracking-wide"
								style={{ backgroundColor: accent }}
							>
								{t(`category.${todays.challenge.category}`)}
							</span>
							<span className="text-sm text-text-muted">
								⏱ {todays.challenge.duration}
							</span>
						</div>
						<div className="mb-3 text-5xl">{todays.challenge.icon}</div>
						<h2 className="mb-3 font-bold text-2xl text-text">
							{todays.challenge.title}
						</h2>
						<p className="text-text-muted leading-relaxed">
							{todays.challenge.description}
						</p>
						{completedToday && (
							<motion.div
								animate={{ scale: 1 }}
								className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/20 px-4 py-2 font-medium text-sm text-success"
								initial={{ scale: 0 }}
								transition={{ damping: 12, type: "spring" }}
							>
								✓ {t("done")}
							</motion.div>
						)}
					</motion.div>
				</AnimatePresence>

				{/* Action button */}
				<div className="mb-6">
					{completedToday ? (
						<Button fullWidth onClick={unmark} size="lg" variant="ghost">
							{t("undo")}
						</Button>
					) : (
						<Button
							fullWidth
							onClick={markCompleted}
							size="lg"
							variant="primary"
						>
							✓ {t("markDone")}
						</Button>
					)}
				</div>

				{/* Stats + history */}
				<div className="rounded-xl border border-primary/10 bg-background-light p-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-text-muted">{t("totalCompleted")}</p>
							<p className="font-bold text-2xl text-primary">
								{stored.completedDays.length}
							</p>
						</div>
						{stored.completedDays.length > 0 && (
							<button
								className="text-primary text-sm hover:underline"
								onClick={() => setShowHistory((v) => !v)}
								type="button"
							>
								{showHistory ? t("hideHistory") : t("showHistory")}
							</button>
						)}
					</div>
					<AnimatePresence>
						{showHistory && (
							<motion.div
								animate={{ height: "auto", opacity: 1 }}
								className="mt-3 max-h-40 overflow-y-auto border-primary/10 border-t text-sm"
								exit={{ height: 0, opacity: 0 }}
								initial={{ height: 0, opacity: 0 }}
							>
								<ul className="divide-y divide-primary/10">
									{stored.completedDays
										.slice()
										.sort()
										.reverse()
										.slice(0, 30)
										.map((d) => (
											<li className="py-2 text-text-muted" key={d}>
												✓ {formatPrettyDate(d)}
											</li>
										))}
								</ul>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<GamePicker />
			</div>
		</GameShell>
	);
}

// Helpers --------------------------------------------------------------------

function computeNewStreak(
	completedDays: string[],
	today: string,
	lastCompletedDate: string | null,
): number {
	if (!lastCompletedDate) return 1;
	const last = new Date(lastCompletedDate);
	const tdy = new Date(today);
	const diff = daysBetween(last, tdy);
	if (diff === 0) return 1; // already counted today (shouldn't happen normally)
	if (diff === 1) {
		// Count back from today
		let count = 1;
		const cursor = new Date(tdy);
		cursor.setDate(cursor.getDate() - 1);
		while (completedDays.includes(formatDateKey(cursor))) {
			count++;
			cursor.setDate(cursor.getDate() - 1);
		}
		return count;
	}
	return 1; // streak broken — start fresh
}

function formatPrettyDate(d: string): string {
	const date = new Date(d);
	return date.toLocaleDateString("lt-LT", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}
