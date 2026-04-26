"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { SubmitQuestion } from "@/components/SubmitQuestion";
import { Button, Counter, Sheet } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";
import { AUDIENCE_DEFAULTS } from "@/types/audience";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
	const router = useRouter();
	const t = useTranslations("sidebar");
	const tc = useTranslations("common");
	const ta = useTranslations("auth");
	const { player, isAuthenticated, logout } = useAuth();
	const [showLogin, setShowLogin] = useState(false);
	const [showSubmit, setShowSubmit] = useState(false);
	const {
		sections,
		activeCategories,
		resetProgress,
		availableQuestionsCount,
		spicyCardsEnabled,
		audience,
		superlikedQuestions,
	} = useQuestions();

	const currentAudience = AUDIENCE_DEFAULTS.find((a) => a.slug === audience);

	return (
		<Sheet isOpen={isOpen} onClose={onClose} side="left">
			<div className="p-6">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<h2 className="font-light text-2xl text-primary">{t("title")}</h2>
					<button
						aria-label={tc("close")}
						className="rounded text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						onClick={onClose}
						type="button"
					>
						<svg
							aria-hidden="true"
							className="h-6 w-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M6 18L18 6M6 6l12 12"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
					</button>
				</div>

				<Counter
					className="mb-6 rounded-lg bg-background-lighter p-4"
					label={t("remaining")}
					total={availableQuestionsCount}
				/>

				<div className="mb-6 rounded-lg bg-background-lighter p-4">
					<p className="mb-2 text-sm text-text-muted">
						{t("activeCategories")}
					</p>
					<p className="font-light text-2xl text-primary">
						{activeCategories.length} / {sections.length}
					</p>
				</div>

				<div className="mb-8 space-y-3">
					<Button
						fullWidth
						icon={
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M4 6h16M4 10h16M4 14h16M4 18h16"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						}
						onClick={() => {
							router.push("/categories");
							onClose();
						}}
						variant="secondary"
					>
						{t("viewCategories")}
					</Button>

					<Button
						fullWidth
						icon={<span className="text-lg">🎲</span>}
						onClick={() => {
							router.push("/settings");
							onClose();
						}}
						variant="secondary"
					>
						<span className="flex-1 text-left">{t("spicyCards")}</span>
						{spicyCardsEnabled && (
							<svg
								aria-hidden="true"
								className="h-5 w-5 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M5 13l4 4L19 7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2.5}
								/>
							</svg>
						)}
					</Button>

					{superlikedQuestions.length > 0 && (
						<Button
							fullWidth
							icon={<span className="text-lg">⭐</span>}
							onClick={() => {
								router.push("/awesome");
								onClose();
							}}
							variant="secondary"
						>
							<span className="flex-1 text-left">{t("viewFavorites")}</span>
							<span className="text-sm text-text-dimmed">
								{superlikedQuestions.length}
							</span>
						</Button>
					)}

					<Button
						fullWidth
						icon={
							<span className="text-lg">{currentAudience?.icon || "🎮"}</span>
						}
						onClick={() => {
							router.push("/audience");
							onClose();
						}}
						variant="secondary"
					>
						{t("changeMode")}
					</Button>

					{isAuthenticated && (
						<Button
							fullWidth
							icon={<span className="text-lg">💡</span>}
							onClick={() => {
								setShowSubmit(true);
								onClose();
							}}
							variant="secondary"
						>
							{t("submitQuestion")}
						</Button>
					)}

					<Button
						fullWidth
						onClick={() => {
							if (confirm(tc("confirm"))) {
								resetProgress();
								onClose();
							}
						}}
						variant="danger"
					>
						{t("reset")}
					</Button>
				</div>

				{/* Auth section */}
				<div className="border-primary/10 border-t pt-6">
					{isAuthenticated && player ? (
						<div className="space-y-3">
							<div className="flex items-center gap-3 rounded-xl bg-background-lighter p-3">
								<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
									{player.avatar ? (
										<img
											alt=""
											className="h-full w-full object-cover"
											src={player.avatar}
										/>
									) : (
										<span className="font-semibold text-white text-xs">
											{(player.name || player.email).charAt(0).toUpperCase()}
										</span>
									)}
								</div>
								<div className="min-w-0">
									<p className="truncate font-medium text-sm text-text">
										{player.name || player.email}
									</p>
								</div>
							</div>
							<Button
								fullWidth
								onClick={() => {
									router.push("/profile");
									onClose();
								}}
								variant="secondary"
							>
								{ta("profile")}
							</Button>
							<Button
								fullWidth
								onClick={async () => {
									await logout();
									onClose();
								}}
								variant="secondary"
							>
								{ta("logout")}
							</Button>
						</div>
					) : (
						<Button
							fullWidth
							onClick={() => {
								setShowLogin(true);
								onClose();
							}}
							variant="primary"
						>
							{ta("loginButton")}
						</Button>
					)}
				</div>
			</div>
			<LoginSheet isOpen={showLogin} onClose={() => setShowLogin(false)} />
			<SubmitQuestion
				isOpen={showSubmit}
				onClose={() => setShowSubmit(false)}
			/>
		</Sheet>
	);
}
