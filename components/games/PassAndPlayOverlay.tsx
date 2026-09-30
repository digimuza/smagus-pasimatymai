"use client";

import { AnimatePresence, motion } from "framer-motion";

interface PassAndPlayOverlayProps {
	/** Short label for the next player: "A", "B", "Jonas", etc. */
	nextPlayer: string;
	/** Callback fired when user acknowledges pass. */
	onContinue: () => void;
	/** Long-form hint shown below the headline. */
	passHint?: string;
	/** When true, renders the overlay; otherwise null. */
	show: boolean;
}

/**
 * "Pass the phone" overlay used by all pass-and-play couple games. Renders a
 * large visual block the current player can use as a cue to hand over the
 * device, then a button to reveal the next player's content.
 */
export function PassAndPlayOverlay({
	show,
	nextPlayer,
	passHint,
	onContinue,
}: PassAndPlayOverlayProps) {
	return (
		<AnimatePresence>
			{show && (
				<motion.div
					animate={{ opacity: 1 }}
					className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-8 text-center"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
				>
					<motion.div
						animate={{ rotate: 0, scale: 1 }}
						className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
						initial={{ rotate: -20, scale: 0.5 }}
						transition={{ damping: 12, type: "spring" }}
					>
						<span className="font-bold text-5xl text-background">
							{nextPlayer.charAt(0).toUpperCase()}
						</span>
					</motion.div>
					<motion.h2
						animate={{ opacity: 1, y: 0 }}
						className="mb-2 font-light text-3xl text-primary"
						initial={{ opacity: 0, y: 10 }}
						transition={{ delay: 0.1 }}
					>
						Perduokite telefoną
					</motion.h2>
					<motion.p
						animate={{ opacity: 1, y: 0 }}
						className="mb-2 font-medium text-2xl text-text"
						initial={{ opacity: 0, y: 10 }}
						transition={{ delay: 0.18 }}
					>
						{nextPlayer}
					</motion.p>
					{passHint && (
						<motion.p
							animate={{ opacity: 1, y: 0 }}
							className="mb-10 max-w-xs text-sm text-text-muted"
							initial={{ opacity: 0, y: 10 }}
							transition={{ delay: 0.26 }}
						>
							{passHint}
						</motion.p>
					)}
					<motion.button
						animate={{ opacity: 1, scale: 1 }}
						className="rounded-xl bg-primary px-10 py-4 font-medium text-background text-lg transition-transform hover:scale-105 active:scale-95"
						initial={{ opacity: 0, scale: 0.9 }}
						onClick={onContinue}
						transition={{ damping: 15, delay: 0.34, type: "spring" }}
						type="button"
					>
						Aš esu {nextPlayer} — pradėti
					</motion.button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
