"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { SubscriptionBadge } from "@/components/payments/SubscriptionBadge";
import { Button, Header } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";
import { isPremium } from "@/lib/subscription";

export default function ProfilePage() {
	const t = useTranslations("profile");
	const tc = useTranslations("common");
	const { player, subscription, logout, isAuthenticated, isLoading } =
		useAuth();
	const tp = useTranslations("payments");
	const { questionStates } = useQuestions();
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState("");

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-primary text-xl">{tc("loading")}</div>
			</div>
		);
	}

	if (!isAuthenticated || !player) {
		router.push("/");
		return null;
	}

	const stats = {
		answered: questionStates.filter((q) => q.status === "answered").length,
		skipped: questionStates.filter((q) => q.status === "skipped").length,
		superliked: questionStates.filter((q) => q.status === "superliked").length,
		total: questionStates.length,
	};

	const handleDelete = async () => {
		if (deleteConfirm !== player.email) return;
		setIsDeleting(true);

		try {
			// Delete all progress
			await fetch("/api/progress", {
				credentials: "include",
				method: "DELETE",
			});

			// Delete player account
			await fetch(`/api/players/${player.id}`, {
				credentials: "include",
				method: "DELETE",
			});

			await logout();
			router.push("/");
		} catch {
			setIsDeleting(false);
		}
	};

	const initials = (player.name || player.email)
		.split(/[\s@]/)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase())
		.join("");

	return (
		<div className="min-h-screen bg-background">
			<Header backHref="/game" title={t("title")} />

			<div className="mx-auto max-w-md space-y-6 px-4 py-6">
				{/* Player info */}
				<div className="flex items-center gap-4 rounded-2xl bg-background-lighter p-4">
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
						{player.avatar ? (
							<img
								alt=""
								className="h-full w-full object-cover"
								src={player.avatar}
							/>
						) : (
							<span className="font-semibold text-lg text-white">
								{initials}
							</span>
						)}
					</div>
					<div className="min-w-0">
						{player.name && (
							<p className="truncate font-semibold text-text">{player.name}</p>
						)}
						<p className="truncate text-sm text-text-muted">{player.email}</p>
						<div className="mt-1 flex items-center gap-2">
							<p className="text-text-dimmed text-xs">
								{player.provider === "google" ? "Google" : t("emailProvider")}
							</p>
							<SubscriptionBadge />
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-3 gap-3">
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-primary">
							{stats.answered}
						</p>
						<p className="mt-1 text-text-dimmed text-xs">
							{t("statsAnswered")}
						</p>
					</div>
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-accent">
							{stats.superliked}
						</p>
						<p className="mt-1 text-text-dimmed text-xs">
							{t("statsSuperliked")}
						</p>
					</div>
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-text-muted">
							{stats.total}
						</p>
						<p className="mt-1 text-text-dimmed text-xs">{t("statsTotal")}</p>
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-3">
					{isPremium(subscription) && (
						<Button
							fullWidth
							onClick={async () => {
								const res = await fetch("/api/billing/portal", {
									credentials: "include",
									method: "POST",
								});
								if (res.ok) {
									const { url } = await res.json();
									if (url) window.location.href = url;
								}
							}}
							variant="secondary"
						>
							{tp("manageSubscription")}
						</Button>
					)}
					<Button
						fullWidth
						onClick={async () => {
							await logout();
							router.push("/");
						}}
						variant="secondary"
					>
						{t("logout")}
					</Button>
				</div>

				{/* Danger zone */}
				<div className="rounded-2xl border border-red-500/20 bg-background-lighter p-4">
					<h3 className="mb-2 font-semibold text-red-400 text-sm">
						{t("dangerZone")}
					</h3>
					<p className="mb-3 text-text-dimmed text-xs">{t("deleteWarning")}</p>
					<input
						className="mb-3 w-full rounded-lg border border-red-500/20 bg-background px-3 py-2 text-sm text-text placeholder:text-text-dimmed focus:border-red-500/40 focus:outline-none"
						onChange={(e) => setDeleteConfirm(e.target.value)}
						placeholder={t("deleteConfirmPlaceholder")}
						type="text"
						value={deleteConfirm}
					/>
					<Button
						disabled={deleteConfirm !== player.email || isDeleting}
						fullWidth
						onClick={handleDelete}
						variant="danger"
					>
						{isDeleting ? t("deleting") : t("deleteButton")}
					</Button>
				</div>
			</div>
		</div>
	);
}
