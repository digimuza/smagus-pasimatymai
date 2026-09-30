"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { GamePicker, GameShell, PassAndPlayOverlay } from "@/components/games";
import { Button } from "@/components/ui";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useHaptic } from "@/hooks/useHaptic";
import { shuffle } from "@/lib/games/gameUtils";
import { THIS_OR_THAT_PAIRS } from "@/lib/games/thisOrThatData";
import type { PlayerSlot, ThisOrThatPair } from "@/types/games";

type Phase = "intro" | "pass" | "playing" | "result" | "summary";

type RoundResult = {
	pairId: string;
	a: 0 | 1;
	b: 0 | 1;
	matched: boolean;
};

type Session = {
	matches: number;
	rounds: RoundResult[];
	total: number;
};

const ANIMATION = {
	animate: { opacity: 1, scale: 1 },
	initial: { opacity: 0, scale: 0.5 },
	transition: { damping: 18, type: "spring" as const },
};

export default function ThisOrThatPage() {
	const t = useTranslations("games.thisOrThat");
	const { vibrate } = useHaptic();

	const [phase, setPhase] = useState<Phase>("intro");
	const [currentPlayer, setCurrentPlayer] = useState<PlayerSlot>("A");
	const [showPass, setShowPass] = useState(false);
	const [activePair, setActivePair] = useState<ThisOrThatPair | null>(null);
	const [roundPick, setRoundPick] = useState<{ A?: 0 | 1; B?: 0 | 1 }>({});

	const [session, setSession] = useGameStorage<Session>("this-or-that", {
		matches: 0,
		rounds: [],
		total: 0,
	});

	const queue = useMemo(() => shuffle(THIS_OR_THAT_PAIRS), []);

	const start = useCallback(() => {
		setSession({ matches: 0, rounds: [], total: 0 });
		setRoundPick({});
		setCurrentPlayer("A");
		setActivePair(queue[0]);
		setPhase("playing");
	}, [queue, setSession]);

	const nextRound = useCallback(() => {
		setSession((prev) => {
			const next: Session = {
				matches: prev.rounds.filter((r) => r.matched).length,
				rounds: [...prev.rounds],
				total: prev.total,
			};
			// recompute after push below — we'll patch via closure below
			return next;
		});

		// Compute new index and update results
		setSession((prev) => {
			const idx = prev.rounds.length;
			if (idx >= queue.length) return prev;
			const pair = queue[idx];
			setActivePair(pair);
			setRoundPick({});
			setCurrentPlayer("A");
			setPhase("playing");
			return prev;
		});
	}, [queue, setSession]);

	const handlePick = useCallback(
		(side: 0 | 1) => {
			if (!activePair) return;
			vibrate("medium");
			setRoundPick((prev) => ({ ...prev, [currentPlayer]: side }));

			// Reveal the round if both answered
			if (currentPlayer === "A") {
				setShowPass(true); // pass-and-play overlay to hand off
			} else {
				// Determine match and persist
				setSession((prev) => {
					const aPick = (roundPick.A ?? side === 0) ? 0 : side; // safety
					const bPick = side;
					const matched = aPick === bPick;
					const round: RoundResult = {
						a: aPick as 0 | 1,
						b: bPick as 0 | 1,
						matched,
						pairId: activePair.id,
					};
					const matches = prev.rounds.filter((r) => r.matched).length;
					return {
						matches: matched ? matches + 1 : matches,
						rounds: [...prev.rounds, round],
						total: prev.total + 1,
					};
				});
				setPhase("result");
			}
		},
		[activePair, currentPlayer, roundPick, setSession, vibrate],
	);

	const continueFromPass = () => {
		setShowPass(false);
		setCurrentPlayer("B");
	};

	const continueFromResult = () => {
		if (session.rounds.length >= queue.length) {
			setPhase("summary");
		} else {
			nextRound();
		}
	};

	// -- Render helpers --------------------------------------------------------

	const renderIntro = () => (
		<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
			<motion.div
				animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
				className="mb-6 text-8xl"
				transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
			>
				⚡
			</motion.div>
			<h2 className="mb-2 font-light text-3xl text-primary">{t("title")}</h2>
			<p className="mb-8 max-w-xs text-text-muted">{t("intro")}</p>
			<Button onClick={start} size="lg" variant="primary">
				{t("start")}
			</Button>
			<GamePicker />
		</div>
	);

	const renderPlaying = () => {
		if (!activePair) return null;
		return (
			<div className="flex flex-1 flex-col p-6">
				<div className="mb-2 flex items-center justify-between text-sm text-text-muted">
					<span>{t("playerTurn", { player: currentPlayer })}</span>
					<span>
						{session.rounds.length + 1} / {queue.length}
					</span>
				</div>
				<div className="mb-4 h-1 overflow-hidden rounded-full bg-background-lighter">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{
							width: `${((session.rounds.length + (currentPlayer === "B" ? 0.5 : 0)) / queue.length) * 100}%`,
						}}
					/>
				</div>

				<div className="flex flex-1 items-center justify-center">
					<div className="grid w-full max-w-sm grid-cols-2 gap-4">
						<motion.button
							{...ANIMATION}
							className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/10 p-4 text-center transition-colors hover:bg-primary/20"
							key={`a-${activePair.id}`}
							onClick={() => handlePick(0)}
							whileTap={{ scale: 0.95 }}
						>
							<span className="mb-2 text-5xl">{activePair.iconA || "🅰️"}</span>
							<span className="font-light text-text text-xl">
								{activePair.a}
							</span>
						</motion.button>
						<motion.button
							{...ANIMATION}
							className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-accent/30 bg-accent/10 p-4 text-center transition-colors hover:bg-accent/20"
							key={`b-${activePair.id}`}
							onClick={() => handlePick(1)}
							whileTap={{ scale: 0.95 }}
						>
							<span className="mb-2 text-5xl">{activePair.iconB || "🅱️"}</span>
							<span className="font-light text-text text-xl">
								{activePair.b}
							</span>
						</motion.button>
					</div>
				</div>

				<GamePicker />
			</div>
		);
	};

	const renderResult = () => {
		if (!activePair) return null;
		const lastRound = session.rounds[session.rounds.length - 1];
		const matched = lastRound?.matched ?? false;
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
				<motion.div
					animate={{ scale: [0.5, 1.2, 1] }}
					className="mb-6 text-8xl"
					transition={{ damping: 10, type: "spring" }}
				>
					{matched ? "💚" : "💔"}
				</motion.div>
				<h2 className="mb-2 font-bold text-3xl text-primary">
					{matched ? t("match") : t("noMatch")}
				</h2>
				<p className="mb-8 text-text-muted">
					{matched ? t("matchDesc") : t("noMatchDesc")}
				</p>
				<div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-3">
					<div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
						<p className="text-text-muted text-xs uppercase tracking-wide">
							{t("playerA")}
						</p>
						<p className="font-light text-lg text-text">
							{lastRound?.a === 0 ? activePair.a : activePair.b}
						</p>
					</div>
					<div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
						<p className="text-text-muted text-xs uppercase tracking-wide">
							{t("playerB")}
						</p>
						<p className="font-light text-lg text-text">
							{lastRound?.b === 0 ? activePair.a : activePair.b}
						</p>
					</div>
				</div>
				<Button
					fullWidth
					onClick={continueFromResult}
					size="lg"
					variant="primary"
				>
					{session.rounds.length >= queue.length
						? t("seeResults")
						: t("nextRound")}
				</Button>
			</div>
		);
	};

	const renderSummary = () => {
		const matches = session.rounds.filter((r) => r.matched).length;
		const total = session.rounds.length;
		const percent = total > 0 ? Math.round((matches / total) * 100) : 0;
		const message =
			percent >= 80
				? t("summaryHigh")
				: percent >= 50
					? t("summaryMedium")
					: t("summaryLow");

		return (
			<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
				<motion.div
					animate={{ scale: [1, 1.15, 1] }}
					className="mb-4 text-8xl"
					transition={{ duration: 0.8 }}
				>
					{percent >= 80 ? "🎉" : percent >= 50 ? "✨" : "🌱"}
				</motion.div>
				<h2 className="mb-2 font-light text-3xl text-primary">
					{t("summaryTitle")}
				</h2>
				<p className="mb-2 font-bold text-5xl text-accent">
					{matches} / {total}
				</p>
				<p className="mb-2 text-text-muted">
					{t("summaryPercent", { percent })}
				</p>
				<p className="mb-8 max-w-xs text-text">{message}</p>
				<div className="grid w-full max-w-sm gap-3">
					<Button fullWidth onClick={start} size="lg" variant="primary">
						{t("playAgain")}
					</Button>
				</div>
				<GamePicker />
			</div>
		);
	};

	return (
		<GameShell accentColor="#60a5fa" icon="⚡" title={t("title")}>
			<PassAndPlayOverlay
				nextPlayer="B"
				onContinue={continueFromPass}
				passHint={t("passHint")}
				show={showPass}
			/>

			<AnimatePresence mode="wait">
				<motion.div
					animate={{ opacity: 1 }}
					className="flex flex-1 flex-col"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key={phase}
				>
					{phase === "intro" && renderIntro()}
					{phase === "playing" && renderPlaying()}
					{phase === "result" && renderResult()}
					{phase === "summary" && renderSummary()}
				</motion.div>
			</AnimatePresence>
		</GameShell>
	);
}
