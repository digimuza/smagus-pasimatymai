"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { PlayerStats } from "@/app/api/stats/me/route";
import { SubscriptionBadge } from "@/components/payments/SubscriptionBadge";
import type { ToastMessage } from "@/components/ui";
import { Button, Header, Toaster } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { detectNewMilestones } from "@/lib/milestones";
import { isPremium } from "@/lib/subscription";

const SEEN_MILESTONES_KEY = "seen_milestones_v1";

function getSeenMilestones(): Set<string> {
	try {
		const raw = localStorage.getItem(SEEN_MILESTONES_KEY);
		return new Set(raw ? (JSON.parse(raw) as string[]) : []);
	} catch {
		return new Set();
	}
}

function markMilestonesAsSeen(ids: string[]): void {
	try {
		const seen = getSeenMilestones();
		for (const id of ids) seen.add(id);
		localStorage.setItem(SEEN_MILESTONES_KEY, JSON.stringify([...seen]));
	} catch {
		// ignore storage errors
	}
}

export default function ProfilePage() {
	const t = useTranslations("profile");
	const tc = useTranslations("common");
	const { player, subscription, logout, isAuthenticated, isLoading } =
		useAuth();
	const tp = useTranslations("payments");
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [stats, setStats] = useState<PlayerStats | null>(null);
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const dismissToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((item) => item.id !== id));
	}, []);

	const playerId = player?.id;

	useEffect(() => {
		if (!playerId) return;

		fetch("/api/stats/me", { credentials: "include" })
			.then((r) => (r.ok ? r.json() : null))
			.then((data: PlayerStats | null) => {
				if (!data) return;
				setStats(data);

				const seen = getSeenMilestones();
				const hits = detectNewMilestones(data, seen);
				if (hits.length === 0) return;

				const milestoneMessages: Record<string, string> = {
					q10: t("milestones.questions10"),
					q50: t("milestones.questions50"),
					q100: t("milestones.questions100"),
					s7: t("milestones.streak7"),
					s30: t("milestones.streak30"),
				};

				const newToasts: ToastMessage[] = hits.map((hit) => ({
					description: milestoneMessages[hit.id] ?? "",
					id: hit.id,
					title: t("milestones.achieved"),
				}));

				markMilestonesAsSeen(hits.map((h) => h.id));
				setToasts(newToasts);
			})
			.catch(() => {});
	}, [playerId, t]);

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

	const handleDelete = async () => {
		if (deleteConfirm !== player.email) return;
		setIsDeleting(true);

		try {
			await fetch("/api/progress", {
				credentials: "include",
				method: "DELETE",
			});

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

				{/* Stats — questions */}
				<div className="grid grid-cols-3 gap-3">
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-primary">
							{stats?.totalAnswered ?? "—"}
						</p>
						<p className="mt-1 text-text-dimmed text-xs">
							{t("statsAnswered")}
						</p>
					</div>
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-accent">
							{stats?.totalSuperliked ?? "—"}
						</p>
						<p className="mt-1 text-text-dimmed text-xs">
							{t("statsSuperliked")}
						</p>
					</div>
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-text-muted">
							{stats?.totalSessions ?? "—"}
						</p>
						<p className="mt-1 text-text-dimmed text-xs">
							{t("statsSessions")}
						</p>
					</div>
				</div>

				{/* Stats — streaks */}
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-primary">
							{stats?.currentStreak ?? "—"} 🔥
						</p>
						<p className="mt-1 text-text-dimmed text-xs">
							{t("statsCurrentStreak")}
						</p>
					</div>
					<div className="rounded-xl bg-background-lighter p-4 text-center">
						<p className="font-semibold text-2xl text-accent">
							{stats?.bestStreak ?? "—"} ⭐
						</p>
						<p className="mt-1 text-text-dimmed text-xs">
							{t("statsBestStreak")}
						</p>
					</div>
				</div>

				{/* Completed category badges */}
				{stats && stats.completedCategories.length > 0 && (
					<div className="rounded-2xl bg-background-lighter p-4">
						<h3 className="mb-3 font-semibold text-sm text-text">
							{t("completedCategories")}
						</h3>
						<div className="flex flex-wrap gap-2">
							{stats.completedCategories.map((cat) => (
								<span
									className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs"
									key={cat.id}
								>
									✓ {cat.name}
								</span>
							))}
						</div>
					</div>
				)}

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

			<Toaster onDismiss={dismissToast} toasts={toasts} />
		</div>
	);
}
