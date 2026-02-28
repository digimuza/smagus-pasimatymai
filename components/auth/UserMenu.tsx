"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";

export function UserMenu() {
	const t = useTranslations("auth");
	const { player, logout } = useAuth();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!player) return null;

	const initials = (player.name || player.email)
		.split(/[\s@]/)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase())
		.join("");

	return (
		<div className="relative" ref={menuRef}>
			<button
				className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent ring-2 ring-primary/20 transition-all hover:ring-primary/40"
				onClick={() => setIsOpen(!isOpen)}
			>
				{player.avatar ? (
					<img
						alt=""
						className="h-full w-full object-cover"
						src={player.avatar}
					/>
				) : (
					<span className="font-semibold text-white text-xs">{initials}</span>
				)}
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						animate={{ opacity: 1, scale: 1, y: 0 }}
						className="absolute top-12 right-0 z-50 w-56 overflow-hidden rounded-xl border border-primary/10 bg-background-lighter shadow-xl"
						exit={{ opacity: 0, scale: 0.95, y: -5 }}
						initial={{ opacity: 0, scale: 0.95, y: -5 }}
						transition={{ duration: 0.15 }}
					>
						<div className="border-primary/10 border-b p-3">
							<p className="truncate font-medium text-sm text-text">
								{player.name || player.email}
							</p>
							{player.name && (
								<p className="truncate text-text-dimmed text-xs">
									{player.email}
								</p>
							)}
						</div>

						<div className="p-1">
							<button
								className="w-full rounded-lg px-3 py-2 text-left text-sm text-text transition-colors hover:bg-background-light"
								onClick={() => {
									router.push("/profile");
									setIsOpen(false);
								}}
							>
								{t("profile")}
							</button>
							<button
								className="w-full rounded-lg px-3 py-2 text-left text-red-400 text-sm transition-colors hover:bg-background-light"
								onClick={async () => {
									await logout();
									setIsOpen(false);
								}}
							>
								{t("logout")}
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
