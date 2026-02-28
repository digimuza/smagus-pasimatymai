"use client";

import { AnimatePresence, motion } from "framer-motion";
import { springs } from "@/lib/animations";

interface SheetProps {
	children: React.ReactNode;
	className?: string;
	isOpen: boolean;
	onClose: () => void;
	side?: "left" | "bottom";
}

export function Sheet({
	isOpen,
	onClose,
	side = "left",
	children,
	className = "",
}: SheetProps) {
	const isLeft = side === "left";

	return (
		<>
			{/* Backdrop */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-40 bg-black/60"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					/>
				)}
			</AnimatePresence>

			{/* Panel */}
			<motion.div
				animate={
					isOpen
						? isLeft
							? { x: 0 }
							: { y: 0 }
						: isLeft
							? { x: "-100%" }
							: { y: "100%" }
				}
				className={`fixed z-50 overflow-y-auto bg-background-light shadow-2xl ${
					isLeft
						? "top-0 left-0 h-full w-80 max-w-full"
						: "right-0 bottom-0 left-0 max-h-[85vh] rounded-t-2xl"
				} ${className}`}
				initial={isLeft ? { x: "-100%" } : { y: "100%" }}
				transition={springs.snappy}
			>
				{children}
			</motion.div>
		</>
	);
}
