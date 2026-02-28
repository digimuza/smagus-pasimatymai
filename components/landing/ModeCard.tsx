"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

interface ModeCardProps {
	colorClass: "couples" | "family" | "friends";
	cta: string;
	delay?: number;
	description: string;
	href: string;
	icon: string;
	name: string;
}

const colorMap = {
	couples: {
		border: "border-l-mode-couples",
		boxShadow: "rgba(244, 63, 94, 0.3)",
		button: "from-mode-couples-dark via-mode-couples to-mode-couples-light",
		glow: "bg-mode-couples/10",
		glowHover: "bg-mode-couples/20",
		shadow: "shadow-mode-couples/25 hover:shadow-mode-couples/40",
	},
	family: {
		border: "border-l-mode-family",
		boxShadow: "rgba(251, 146, 60, 0.3)",
		button: "from-mode-family-dark via-mode-family to-mode-family-light",
		glow: "bg-mode-family/10",
		glowHover: "bg-mode-family/20",
		shadow: "shadow-mode-family/25 hover:shadow-mode-family/40",
	},
	friends: {
		border: "border-l-mode-friends",
		boxShadow: "rgba(59, 130, 246, 0.3)",
		button: "from-mode-friends-dark via-mode-friends to-mode-friends-light",
		glow: "bg-mode-friends/10",
		glowHover: "bg-mode-friends/20",
		shadow: "shadow-mode-friends/25 hover:shadow-mode-friends/40",
	},
};

export function ModeCard({
	icon,
	name,
	description,
	cta,
	colorClass,
	href,
	delay = 0,
}: ModeCardProps) {
	const colors = colorMap[colorClass];

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			transition={{ delay, duration: 0.6 }}
			viewport={{ margin: "-50px", once: true }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<motion.div
				className={`relative rounded-2xl border-l-[3px] bg-background-lighter ${colors.border} group flex flex-col gap-4 overflow-hidden p-6 transition-shadow sm:p-8`}
				whileHover={{ boxShadow: `0 0 30px ${colors.boxShadow}` }}
			>
				{/* Background glow */}
				<div
					className={`absolute -top-10 -right-10 h-32 w-32 ${colors.glow} rounded-full blur-[60px] transition-opacity duration-300 group-hover:opacity-200`}
				/>
				<div
					className={`absolute -top-10 -right-10 h-32 w-32 ${colors.glowHover} rounded-full opacity-0 blur-[60px] transition-opacity duration-300 group-hover:opacity-100`}
				/>

				<div className="relative z-10">
					<motion.span
						className="mb-2 block text-4xl"
						transition={{ damping: 10, stiffness: 400, type: "spring" }}
						whileHover={{ scale: 1.2, y: -4 }}
					>
						{icon}
					</motion.span>
					<h3 className="mb-2 font-semibold text-text text-xl">{name}</h3>
					<p className="mb-6 text-sm text-text-muted leading-relaxed">
						{description}
					</p>

					<Link href={href}>
						<motion.div
							className={`w-full rounded-xl bg-gradient-to-r px-6 py-3 ${colors.button} text-center font-medium text-sm text-white shadow-md ${colors.shadow} transition-shadow`}
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
						>
							{cta}
						</motion.div>
					</Link>
				</div>
			</motion.div>
		</motion.div>
	);
}
