"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { GamePicker, GameShell, PassAndPlayOverlay } from "@/components/games";
import { Button } from "@/components/ui";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useHaptic } from "@/hooks/useHaptic";
import { pickRandom, sample as sampleFrom } from "@/lib/games/gameUtils";
import { LOVE_MAP_QUESTIONS } from "@/lib/games/loveMapData";
import type {
	LoveMapDifficulty,
	LoveMapQuestion,
	PlayerSlot,
} from "@/types/games";

type Phase = "intro" | "pass" | "ask" | "reveal" | "summary";

type RoundResult = {
	pairId: string;
	pickedIndex: number;
	correctIndex: number;
	correct: boolean;
};

type Session = {
	matches: number;
	rounds: RoundResult[];
	total: number;
};

const DIFFICULTY_OPTIONS: { id: "all" | LoveMapDifficulty; label: string }[] = [
	{ id: "all", label: "Visi" },
	{ id: "easy", label: "Lengvi" },
	{ id: "medium", label: "Vidutiniai" },
	{ id: "deep", label: "Gylūs" },
];

export default function LoveMapPage() {
	const t = useTranslations("games.loveMap");
	const { vibrate } = useHaptic();

	const [phase, setPhase] = useState<Phase>("intro");
	const [difficulty, setDifficulty] = useState<"all" | LoveMapDifficulty>(
		"all",
	);
	const [showPass, setShowPass] = useState(false);
	const [currentPlayer, setCurrentPlayer] = useState<PlayerSlot>("A");
	const [activeQuestion, setActiveQuestion] = useState<LoveMapQuestion | null>(
		null,
	);
	const [pickedIndex, setPickedIndex] = useState<number | null>(null);

	const [session, setSession] = useGameStorage<Session>("love-map", {
		matches: 0,
		rounds: [],
		total: 0,
	});

	const pool = useMemo(() => {
		if (difficulty === "all") return LOVE_MAP_QUESTIONS;
		return LOVE_MAP_QUESTIONS.filter((q) => q.difficulty === difficulty);
	}, [difficulty]);

	// Pick question count: 8 rounds per session
	const ROUND_COUNT = 8;
	const [sessionQuestions, setSessionQuestions] = useState<LoveMapQuestion[]>(
		() => sampleFrom(pool, Math.min(ROUND_COUNT, pool.length)),
	);

	const start = useCallback(() => {
		setSession({ matches: 0, rounds: [], total: 0 });
		setPickedIndex(null);
		setCurrentPlayer("A");
		// Fresh shuffle for each new game session
		const fresh = sampleFrom(pool, Math.min(ROUND_COUNT, pool.length));
		setSessionQuestions(fresh);
		setActiveQuestion(fresh[0] ?? pickRandom(LOVE_MAP_QUESTIONS));
		setPhase("ask");
	}, [pool, setSession]);

	const handlePick = (idx: number) => {
		if (!activeQuestion || pickedIndex !== null) return;
		vibrate("light");
		setPickedIndex(idx);
		// Reveal immediately — both partners discuss on this screen
		setPhase("reveal");
	};

	const recordAndContinue = useCallback(() => {
		if (!activeQuestion || pickedIndex === null) return;
		const correct = pickedIndex === activeQuestion.correctIndex;
		setSession((prev) => ({
			matches: prev.rounds.filter((r) => r.correct).length + (correct ? 1 : 0),
			rounds: [
				...prev.rounds,
				{
					correct,
					correctIndex: activeQuestion.correctIndex,
					pairId: activeQuestion.id,
					pickedIndex,
				},
			],
			total: prev.total + 1,
		}));
		vibrate(correct ? "medium" : "light");

		const idx = session.rounds.length + 1;
		if (idx >= sessionQuestions.length) {
			setPhase("summary");
		} else {
			setActiveQuestion(sessionQuestions[idx]);
			setPickedIndex(null);
			setCurrentPlayer(currentPlayer === "A" ? "B" : "A");
			setPhase("ask");
		}
	}, [
		activeQuestion,
		currentPlayer,
		pickedIndex,
		session.rounds.length,
		sessionQuestions,
		setSession,
		vibrate,
	]);

	const renderIntro = () => (
		<div className="flex flex-1 flex-col p-6">
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<motion.div
					animate={{ rotate: [0, -5, 5, 0] }}
					className="mb-6 text-8xl"
					transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
				>
					🗺️
				</motion.div>
				<h2 className="mb-2 font-light text-3xl text-primary">{t("title")}</h2>
				<p className="mb-6 max-w-xs text-text-muted">{t("intro")}</p>

				<div className="mb-6 grid w-full max-w-sm grid-cols-4 gap-2">
					{DIFFICULTY_OPTIONS.map((opt) => (
						<button
							className={`rounded-full border px-2 py-2 font-medium text-xs transition-all ${
								difficulty === opt.id
									? "border-primary bg-primary text-background"
									: "border-primary/30 bg-background-light text-primary"
							}`}
							key={opt.id}
							onClick={() => setDifficulty(opt.id)}
							type="button"
						>
							{t(`difficulty.${opt.id}`)}
						</button>
					))}
				</div>

				<Button onClick={start} size="lg" variant="primary">
					{t("start")}
				</Button>
			</div>
			<GamePicker />
		</div>
	);

	const renderAsk = () => {
		if (!activeQuestion) return null;
		return (
			<div className="flex flex-1 flex-col p-6">
				<div className="mb-4 flex items-center justify-between text-sm text-text-muted">
					<span className="rounded-full bg-primary/20 px-3 py-1 font-medium text-primary text-xs">
						{t(`difficulty.${activeQuestion.difficulty}`)}
					</span>
					<span>
						{session.rounds.length + 1} / {sessionQuestions.length}
					</span>
				</div>
				<div className="mb-6 h-1 overflow-hidden rounded-full bg-background-lighter">
					<div
						className="h-full bg-primary transition-all duration-300"
						style={{
							width: `${(session.rounds.length / sessionQuestions.length) * 100}%`,
						}}
					/>
				</div>

				<div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
					<span>👤</span>
					<span>{t("playerTurn", { player: currentPlayer })}</span>
				</div>

				<motion.h3
					animate={{ opacity: 1, y: 0 }}
					className="mb-6 font-light text-2xl text-text"
					initial={{ opacity: 0, y: 10 }}
				>
					{activeQuestion.prompt}
				</motion.h3>

				<div className="space-y-3">
					{activeQuestion.options.map((opt, idx) => (
						<motion.button
							animate={{ opacity: 1, x: 0 }}
							className="w-full rounded-xl border-2 border-primary/30 bg-background-light p-4 text-left font-medium text-text transition-all hover:border-primary hover:bg-primary/10"
							initial={{ opacity: 0, x: -10 }}
							key={opt}
							onClick={() => handlePick(idx)}
							transition={{ delay: idx * 0.05 }}
							whileTap={{ scale: 0.98 }}
						>
							<span className="mr-3 text-primary">
								{String.fromCharCode(65 + idx)}.
							</span>
							{opt}
						</motion.button>
					))}
				</div>

				<div className="mt-auto pt-6">
					<GamePicker />
				</div>
			</div>
		);
	};

	const renderReveal = () => {
		if (!activeQuestion || pickedIndex === null) return null;
		const correct = pickedIndex === activeQuestion.correctIndex;
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
				<motion.div
					animate={{ scale: [0.5, 1.2, 1] }}
					className="mb-4 text-7xl"
					transition={{ damping: 10, type: "spring" }}
				>
					{correct ? "🎉" : "💭"}
				</motion.div>
				<h2 className="mb-2 font-bold text-2xl text-primary">
					{correct ? t("correct") : t("incorrect")}
				</h2>
				<p className="mb-6 text-text-muted">
					{correct ? t("correctDesc") : t("incorrectDesc")}
				</p>

				<div className="mb-6 space-y-2 text-left">
					{activeQuestion.options.map((opt, idx) => {
						const isCorrect = idx === activeQuestion.correctIndex;
						const isPicked = idx === pickedIndex;
						return (
							<div
								className={`rounded-xl border-2 p-3 ${
									isCorrect
										? "border-success bg-success/10"
										: isPicked
											? "border-accent bg-accent/10"
											: "border-transparent bg-background-light opacity-50"
								}`}
								key={opt}
							>
								<span className="font-medium text-text">{opt}</span>
								{isCorrect && <span className="ml-2 text-success">✓</span>}
								{isPicked && !isCorrect && (
									<span className="ml-2 text-accent">←</span>
								)}
							</div>
						);
					})}
				</div>

				<Button
					fullWidth
					onClick={recordAndContinue}
					size="lg"
					variant="primary"
				>
					{session.rounds.length + 1 >= sessionQuestions.length
						? t("seeSummary")
						: t("nextRound")}
				</Button>
			</div>
		);
	};

	const renderSummary = () => {
		const correct = session.rounds.filter((r) => r.correct).length;
		const total = session.rounds.length;
		const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
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
					{percent >= 80 ? "💞" : percent >= 50 ? "💜" : "🌱"}
				</motion.div>
				<h2 className="mb-2 font-light text-3xl text-primary">
					{t("summaryTitle")}
				</h2>
				<div className="mb-2">
					<span className="font-bold text-5xl text-accent">{correct}</span>
					<span className="text-2xl text-text-muted"> / {total}</span>
				</div>
				<p className="mb-2 text-text-muted">
					{t("summaryPercent", { percent })}
				</p>
				<p className="mb-8 max-w-xs text-text">{message}</p>
				<Button fullWidth onClick={start} size="lg" variant="primary">
					{t("playAgain")}
				</Button>
				<div className="mt-auto w-full">
					<GamePicker />
				</div>
			</div>
		);
	};

	return (
		<GameShell accentColor="#c084fc" icon="🗺️" title={t("title")}>
			<AnimatePresence mode="wait">
				<motion.div
					animate={{ opacity: 1 }}
					className="flex flex-1 flex-col"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key={phase}
				>
					{phase === "intro" && renderIntro()}
					{phase === "ask" && renderAsk()}
					{phase === "reveal" && renderReveal()}
					{phase === "summary" && renderSummary()}
				</motion.div>
			</AnimatePresence>

			<PassAndPlayOverlay
				nextPlayer={currentPlayer === "A" ? "B" : "A"}
				onContinue={() => setShowPass(false)}
				passHint={t("passHint")}
				show={showPass}
			/>
		</GameShell>
	);
}
