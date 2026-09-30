"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { GamePicker, GameShell, PassAndPlayOverlay } from "@/components/games";
import { Button } from "@/components/ui";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useHaptic } from "@/hooks/useHaptic";
import { shuffle } from "@/lib/games/gameUtils";
import { TWO_TRUTHS_ROUNDS } from "@/lib/games/twoTruthsData";
import type { PlayerSlot, TwoTruthsRound } from "@/types/games";

type Phase = "intro" | "pass" | "read" | "guess" | "reveal" | "summary";

type Score = { correct: number; total: number };
type Scores = Record<PlayerSlot, Score>;

type RoundLog = {
	pairId: string;
	reader: PlayerSlot;
	guesser: PlayerSlot;
	guessedIndex: number;
	lieIndex: number;
	correct: boolean;
};

const ROUND_COUNT = 5;

export default function TwoTruthsPage() {
	const t = useTranslations("games.twoTruths");
	const { vibrate } = useHaptic();

	const [phase, setPhase] = useState<Phase>("intro");
	const [roundIdx, setRoundIdx] = useState(0);
	const [reader, setReader] = useState<PlayerSlot>("A");
	const [guesser, setGuesser] = useState<PlayerSlot>("B");
	const [guess, setGuess] = useState<number | null>(null);
	const [showPass, setShowPass] = useState(false);
	const [, setLog] = useState<RoundLog[]>([]);

	const [scores, setScores] = useGameStorage<Scores>("two-truths-scores", {
		A: { correct: 0, total: 0 },
		B: { correct: 0, total: 0 },
	});

	const queue = useMemo(
		() => shuffle(TWO_TRUTHS_ROUNDS).slice(0, ROUND_COUNT),
		[],
	);
	const activeRound: TwoTruthsRound | undefined = queue[roundIdx];

	const start = () => {
		setLog([]);
		setRoundIdx(0);
		setReader("A");
		setGuesser("B");
		setGuess(null);
		setPhase("read");
	};

	const handleGuess = (idx: number) => {
		if (!activeRound || guess !== null) return;
		vibrate("light");
		setGuess(idx);
		setPhase("reveal");
	};

	const finalize = useCallback(() => {
		if (!activeRound || guess === null) return;
		const correct = guess === activeRound.lieIndex;
		setLog((prev) => [
			...prev,
			{
				correct,
				guessedIndex: guess,
				guesser,
				lieIndex: activeRound.lieIndex,
				pairId: activeRound.id,
				reader,
			},
		]);
		setScores((prev) => ({
			A:
				guesser === "A"
					? {
							correct: prev.A.correct + (correct ? 1 : 0),
							total: prev.A.total + 1,
						}
					: prev.A,
			B:
				guesser === "B"
					? {
							correct: prev.B.correct + (correct ? 1 : 0),
							total: prev.B.total + 1,
						}
					: prev.B,
		}));
		vibrate(correct ? "medium" : "light");
	}, [activeRound, guess, guesser, reader, setScores, vibrate]);

	const next = () => {
		finalize();
		const idx = roundIdx + 1;
		if (idx >= queue.length) {
			setPhase("summary");
		} else {
			setRoundIdx(idx);
			setReader(reader === "A" ? "B" : "A");
			setGuesser(guesser === "A" ? "B" : "A");
			setGuess(null);
			setShowPass(true);
		}
	};

	const renderIntro = () => (
		<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
			<motion.div
				animate={{ rotate: [0, -10, 10, -10, 0] }}
				className="mb-6 text-8xl"
				transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
			>
				🎭
			</motion.div>
			<h2 className="mb-2 font-light text-3xl text-primary">{t("title")}</h2>
			<p className="mb-8 max-w-xs text-text-muted">{t("intro")}</p>
			<Button onClick={start} size="lg" variant="primary">
				{t("start")}
			</Button>
			<GamePicker />
		</div>
	);

	const renderRead = () => {
		if (!activeRound) return null;
		return (
			<div className="flex flex-1 flex-col p-6">
				<div className="mb-2 flex items-center justify-between text-sm text-text-muted">
					<span>
						{t("round", { current: roundIdx + 1, total: queue.length })}
					</span>
					<span className="rounded-full bg-primary/20 px-3 py-1 font-medium text-primary text-xs">
						{reader} {t("readerLabel")}
					</span>
				</div>
				<div className="mb-6 h-1 overflow-hidden rounded-full bg-background-lighter">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{ width: `${(roundIdx / queue.length) * 100}%` }}
					/>
				</div>

				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4"
					initial={{ opacity: 0, y: 10 }}
				>
					<p className="text-primary text-sm">{t("readHint", { guesser, reader })}</p>
				</motion.div>

				<div className="mb-6 space-y-3">
					{activeRound.statements.map((statement, idx) => (
						<motion.div
							animate={{ opacity: 1, x: 0 }}
							className="rounded-xl border-2 border-primary/20 bg-background-light p-4"
							initial={{ opacity: 0, x: -10 }}
							key={statement}
							transition={{ delay: idx * 0.1 }}
						>
							<div className="flex items-start gap-3">
								<span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-background">
									{idx + 1}
								</span>
								<p className="font-light text-lg text-text">{statement}</p>
							</div>
						</motion.div>
					))}
				</div>

				<div className="mt-auto">
					<Button
						fullWidth
						onClick={() => {
							setShowPass(true);
						}}
						size="lg"
						variant="primary"
					>
						{t("readyToGuess")}
					</Button>
				</div>

				<GamePicker />
			</div>
		);
	};

	const renderGuess = () => {
		if (!activeRound) return null;
		return (
			<div className="flex flex-1 flex-col p-6">
				<div className="mb-2 flex items-center justify-between text-sm text-text-muted">
					<span>
						{t("round", { current: roundIdx + 1, total: queue.length })}
					</span>
					<span className="rounded-full bg-accent/20 px-3 py-1 font-medium text-accent text-xs">
						{guesser} {t("guesserLabel")}
					</span>
				</div>
				<div className="mb-6 h-1 overflow-hidden rounded-full bg-background-lighter">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{ width: `${(roundIdx / queue.length) * 100}%` }}
					/>
				</div>

				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-4"
					initial={{ opacity: 0, y: 10 }}
				>
					<p className="text-accent text-sm">{t("guessHint", { guesser })}</p>
				</motion.div>

				<p className="mb-2 text-sm text-text-muted">
					{t("questionForGuesser")}
				</p>
				<h3 className="mb-6 font-light text-2xl text-text">
					{t("whichIsLie")}
				</h3>

				<div className="space-y-3">
					{activeRound.statements.map((statement, idx) => (
						<motion.button
							animate={{ opacity: 1, x: 0 }}
							className="w-full rounded-xl border-2 border-primary/30 bg-background-light p-4 text-left transition-all hover:border-primary hover:bg-primary/10"
							initial={{ opacity: 0, x: -10 }}
							key={statement}
							onClick={() => handleGuess(idx)}
							transition={{ delay: idx * 0.1 }}
							whileTap={{ scale: 0.97 }}
						>
							<div className="flex items-start gap-3">
								<span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary font-bold text-background">
									{idx + 1}
								</span>
								<p className="font-light text-lg text-text">{statement}</p>
							</div>
						</motion.button>
					))}
				</div>

				<GamePicker />
			</div>
		);
	};

	const renderReveal = () => {
		if (!activeRound || guess === null) return null;
		const correct = guess === activeRound.lieIndex;
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
				<motion.div
					animate={{ scale: [0.5, 1.2, 1] }}
					className="mb-4 text-8xl"
					transition={{ damping: 10, type: "spring" }}
				>
					{correct ? "🎯" : "😅"}
				</motion.div>
				<h2 className="mb-2 font-bold text-3xl text-primary">
					{correct ? t("guesserWins") : t("readerWins")}
				</h2>
				<p className="mb-8 text-text-muted">
					{correct
						? t("guesserWinsDesc", { guesser })
						: t("readerWinsDesc", { reader })}
				</p>

				<div className="mb-6 w-full max-w-sm space-y-2">
					{activeRound.statements.map((statement, idx) => {
						const isLie = idx === activeRound.lieIndex;
						const isPicked = idx === guess;
						return (
							<div
								className={`rounded-xl border-2 p-3 text-left ${
									isLie
										? "border-accent bg-accent/10"
										: isPicked
											? "border-warning bg-warning/10"
											: "border-transparent bg-background-light opacity-60"
								}`}
								key={statement}
							>
								<div className="flex items-start gap-2">
									<span className="font-bold text-primary">{idx + 1}.</span>
									<p className="font-light text-text">{statement}</p>
								</div>
								{isLie && (
									<p className="mt-1 text-accent text-xs">
										🤥 {t("thisWasTheLie")}
									</p>
								)}
							</div>
						);
					})}
				</div>

				<Button fullWidth onClick={next} size="lg" variant="primary">
					{roundIdx + 1 >= queue.length ? t("seeResults") : t("nextRound")}
				</Button>
			</div>
		);
	};

	const renderSummary = () => {
		const aCorrect = scores.A.correct;
		const aTotal = scores.A.total;
		const bCorrect = scores.B.correct;
		const bTotal = scores.B.total;
		const aWin = aCorrect > bCorrect;
		const tie = aCorrect === bCorrect;
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
				<motion.div
					animate={{ scale: [1, 1.15, 1] }}
					className="mb-4 text-8xl"
					transition={{ duration: 0.8 }}
				>
					{tie ? "🤝" : aWin ? "🏆" : "🏆"}
				</motion.div>
				<h2 className="mb-2 font-light text-3xl text-primary">
					{tie ? t("tie") : aWin ? t("aWins") : t("bWins")}
				</h2>

				<div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-4">
					<div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
						<p className="text-primary text-xs uppercase tracking-wide">
							{t("playerA")}
						</p>
						<p className="my-1 font-bold text-3xl text-primary">{aCorrect}</p>
						<p className="text-text-muted text-xs">
							{t("ofTotal", { total: aTotal })}
						</p>
					</div>
					<div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
						<p className="text-accent text-xs uppercase tracking-wide">
							{t("playerB")}
						</p>
						<p className="my-1 font-bold text-3xl text-accent">{bCorrect}</p>
						<p className="text-text-muted text-xs">
							{t("ofTotal", { total: bTotal })}
						</p>
					</div>
				</div>

				<Button fullWidth onClick={start} size="lg" variant="primary">
					{t("playAgain")}
				</Button>
				<GamePicker />
			</div>
		);
	};

	return (
		<GameShell accentColor="#a78bfa" icon="🎭" title={t("title")}>
			<PassAndPlayOverlay
				nextPlayer={guesser}
				onContinue={() => {
					setShowPass(false);
					setPhase("guess");
				}}
				passHint={t("passHint", { player: guesser })}
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
					{phase === "read" && renderRead()}
					{phase === "guess" && renderGuess()}
					{phase === "reveal" && renderReveal()}
					{phase === "summary" && renderSummary()}
				</motion.div>
			</AnimatePresence>
		</GameShell>
	);
}
