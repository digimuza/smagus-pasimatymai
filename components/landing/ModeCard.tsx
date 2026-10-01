"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface ModeCardProps {
	colorClass: "couples" | "family" | "friends" | "kids";
	cta: string;
	delay?: number;
	description: string;
	href: string;
	icon: string;
	name: string;
}

const colors = {
	couples: {
		glow: "bg-[#f1a99e]/15",
		icon: "bg-[#f1a99e]/15 text-[#f6c4b3]",
		line: "bg-[#f6c4b3]",
	},
	family: {
		glow: "bg-[#e8b979]/12",
		icon: "bg-[#e8b979]/15 text-[#f1d0a5]",
		line: "bg-[#f1d0a5]",
	},
	friends: {
		glow: "bg-[#aba1e7]/12",
		icon: "bg-[#aba1e7]/15 text-[#cfc3ff]",
		line: "bg-[#cfc3ff]",
	},
	kids: {
		glow: "bg-[#8bcfbb]/12",
		icon: "bg-[#8bcfbb]/15 text-[#aee5d1]",
		line: "bg-[#aee5d1]",
	},
};

const numbers = { couples: "01", family: "02", friends: "03", kids: "04" };

export function ModeCard({
	icon,
	name,
	description,
	cta,
	colorClass,
	href,
	delay = 0,
}: ModeCardProps) {
	const color = colors[colorClass];
	const prefersReducedMotion = useReducedMotion();

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			transition={
				prefersReducedMotion ? { duration: 0 } : { delay, duration: 0.35 }
			}
			viewport={{ margin: "-30px", once: true }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<div className="group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#201529] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/25 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:border-white/10">
				<div
					aria-hidden="true"
					className={`absolute -top-20 -right-20 h-52 w-52 rounded-full blur-[60px] ${color.glow}`}
				/>
				<div className="relative flex items-start justify-between">
					<span
						aria-hidden="true"
						className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 text-3xl ${color.icon}`}
					>
						{icon}
					</span>
					<span className="font-serif text-[#a98fa8] text-sm">
						{numbers[colorClass]}
					</span>
				</div>
				<div className="relative mt-7 flex-1">
					<h3 className="font-serif text-3xl text-[#fff1e7]">{name}</h3>
					<p className="mt-3 text-[#cdb9ca] text-sm leading-relaxed">
						{description}
					</p>
				</div>
				<Link
					className="relative mt-7 inline-flex min-h-11 items-center justify-between gap-3 border-white/15 border-t pt-4 font-medium text-[#f3d6c9] text-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5c7a9] focus-visible:outline-offset-4"
					href={href}
				>
					{cta}
					<span
						aria-hidden="true"
						className="text-lg transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
					>
						↗
					</span>
				</Link>
				<div
					aria-hidden="true"
					className={`absolute bottom-0 left-6 h-[2px] w-10 ${color.line}`}
				/>
			</div>
		</motion.div>
	);
}
