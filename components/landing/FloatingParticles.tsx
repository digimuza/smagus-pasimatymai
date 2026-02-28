"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const EMOJIS = ["💜", "💕", "✨", "🌹", "💫", "💗", "😘", "🦋", "💘"];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
	delay: i * 0.6,
	driftAmplitude: 20 + (i % 4) * 15,
	duration: 6 + (i % 5) * 1.5,
	emoji: EMOJIS[i % EMOJIS.length],
	id: i,
	left: `${5 + ((i * 5.3) % 90)}%`,
	size: 12 + (i % 5) * 5,
}));

function Particle({
	emoji,
	left,
	delay,
	duration,
	size,
	driftAmplitude,
}: {
	emoji: string;
	left: string;
	delay: number;
	duration: number;
	size: number;
	driftAmplitude: number;
}) {
	const travel = typeof window !== "undefined" ? window.innerHeight + 100 : 900;

	return (
		<motion.div
			animate={{
				opacity: [0, 1, 1, 0.6, 0],
				rotate: [0, 15, -10, 20, 0],
				x: [
					0,
					Math.sin(delay) * driftAmplitude,
					Math.cos(delay) * -driftAmplitude * 0.7,
					Math.sin(delay) * driftAmplitude * 0.5,
				],
				y: [0, -travel],
			}}
			className="pointer-events-none absolute select-none will-change-transform"
			style={{ bottom: -40, fontSize: size, left }}
			transition={{
				delay,
				duration,
				ease: "easeOut",
				repeat: Infinity,
			}}
		>
			{emoji}
		</motion.div>
	);
}

export function FloatingParticles() {
	const [mounted, setMounted] = useState(false);
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || prefersReducedMotion) return null;

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed inset-0 overflow-hidden"
		>
			{PARTICLES.map((p) => (
				<Particle key={p.id} {...p} />
			))}
		</div>
	);
}
