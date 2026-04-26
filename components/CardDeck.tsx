"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SwipeCard } from "@/components/SwipeCard";
import type { Question } from "@/types";

interface CardDeckProps {
	category?: string;
	difficulty?: "safe" | "intimate";
	onSwipeLeft: () => void;
	onSwipeRight: () => void;
	onSwipeUp: () => void;
	previewQuestions: Question[];
	question: Question | null;
}

// Visual offsets for each ghost layer (index 0 = directly behind current)
const GHOST_LAYERS = [
	{ opacity: 0.65, scale: 0.95, translateY: 8, zIndex: 10 },
	{ opacity: 0.45, scale: 0.9, translateY: 16, zIndex: 5 },
	{ opacity: 0.28, scale: 0.85, translateY: 24, zIndex: 0 },
];

interface GhostCardProps {
	depth: number;
	question: Question;
}

function GhostCard({ question, depth }: GhostCardProps) {
	const layer = GHOST_LAYERS[depth] ?? GHOST_LAYERS[GHOST_LAYERS.length - 1];
	return (
		<motion.div
			animate={{
				opacity: layer.opacity,
				scale: layer.scale,
				y: layer.translateY,
			}}
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-background-light to-background-lighter px-8 py-12 shadow-md"
			initial={{
				opacity: layer.opacity,
				scale: layer.scale,
				y: layer.translateY,
			}}
			style={{ zIndex: layer.zIndex }}
		>
			<p className="line-clamp-3 text-balance text-center font-light text-lg text-text/40 leading-relaxed">
				{question.question}
			</p>
		</motion.div>
	);
}

export function CardDeck({
	question,
	previewQuestions,
	category,
	difficulty,
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
}: CardDeckProps) {
	// Ghost cards rendered furthest-first so they appear behind the current card
	const ghosts = previewQuestions.slice(0, 3);

	return (
		<div className="relative h-96 w-full max-w-md">
			{/* Stacked ghost cards (rendered back to front) */}
			{[...ghosts].reverse().map((q, reverseIdx) => {
				const depth = ghosts.length - 1 - reverseIdx;
				return <GhostCard depth={depth} key={q.id} question={q} />;
			})}

			{/* Active question card */}
			<AnimatePresence mode="wait">
				{question ? (
					<SwipeCard
						category={category}
						difficulty={difficulty}
						key={question.id}
						onSwipeLeft={onSwipeLeft}
						onSwipeRight={onSwipeRight}
						onSwipeUp={onSwipeUp}
						question={question}
					/>
				) : (
					<DeckSkeleton key="skeleton" />
				)}
			</AnimatePresence>
		</div>
	);
}

function DeckSkeleton() {
	return (
		<motion.div
			animate={{ opacity: 1 }}
			aria-busy="true"
			aria-label="Loading question"
			className="absolute inset-0 rounded-2xl bg-gradient-to-br from-background-light to-background-lighter"
			exit={{ opacity: 0 }}
			initial={{ opacity: 0 }}
			role="status"
			style={{ zIndex: 20 }}
		>
			<div className="flex h-full items-center justify-center p-8">
				<div
					aria-hidden="true"
					className="h-4 w-3/4 animate-pulse rounded-full bg-text/10"
				/>
			</div>
		</motion.div>
	);
}
