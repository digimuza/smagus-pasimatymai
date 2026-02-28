"use client";

import { motion } from "framer-motion";

const drift = (xRange: number, yRange: number, duration: number) => ({
	transition: { duration, ease: "easeInOut" as const, repeat: Infinity },
	x: [0, xRange, -xRange * 0.6, xRange * 0.3, 0],
	y: [0, -yRange, yRange * 0.5, -yRange * 0.8, 0],
});

export function BackgroundGlow() {
	return (
		<div className="pointer-events-none fixed inset-0">
			<motion.div
				animate={{
					...drift(30, 20, 18),
					scale: [1, 1.1, 1, 1.05, 1],
				}}
				className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]"
				transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
			/>
			<motion.div
				animate={drift(25, 15, 20)}
				className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[100px]"
			/>
			<motion.div
				animate={drift(-20, 25, 16)}
				className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-primary-dark/8 blur-[80px]"
			/>
			<motion.div
				animate={drift(15, -20, 15)}
				className="absolute top-[15%] left-1/3 h-[350px] w-[350px] rounded-full bg-accent/8 blur-[100px]"
			/>
		</div>
	);
}
