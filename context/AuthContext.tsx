"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

export interface PlayerSubscription {
	cancelAtPeriodEnd?: boolean;
	currentPeriodEnd?: string;
	plan: "free" | "monthly" | "yearly";
	status: "active" | "canceled" | "past_due" | "trialing" | "expired";
	trialEnd?: string;
}

export interface PlayerStreak {
	currentStreak: number;
	lastPlayedDate: string | null;
	longestStreak: number;
}

export interface Player {
	activeCategories?: string[];
	avatar?: string;
	email: string;
	id: number;
	locale?: string;
	name?: string;
	preferredAudience?: string;
	provider: "email" | "google" | "apple";
	spicySettings?: {
		enabled?: boolean;
		rarity?: string;
		enabledTypes?: string[];
	};
}

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (
		email: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>;
	loginWithGoogle: () => void;
	logout: () => Promise<void>;
	player: Player | null;
	refreshPlayer: () => Promise<void>;
	register: (
		email: string,
		password: string,
		name?: string,
	) => Promise<{ success: boolean; error?: string }>;
	streak: PlayerStreak;
	subscription: PlayerSubscription | null;
	updatePlayer: (data: Partial<Player>) => Promise<void>;
	updateStreak: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [player, setPlayer] = useState<Player | null>(null);
	const [subscription, setSubscription] = useState<PlayerSubscription | null>(
		null,
	);
	const [streak, setStreak] = useState<PlayerStreak>({
		currentStreak: 0,
		lastPlayedDate: null,
		longestStreak: 0,
	});
	const [isLoading, setIsLoading] = useState(true);

	// Check current session on mount
	useEffect(() => {
		checkSession();
	}, []);

	const fetchSubscription = async (playerId: number) => {
		try {
			const res = await fetch(
				`/api/subscriptions?where[player][equals]=${playerId}&limit=1`,
				{
					credentials: "include",
				},
			);
			if (res.ok) {
				const data = await res.json();
				if (data.docs?.[0]) {
					const sub = data.docs[0];
					setSubscription({
						cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
						currentPeriodEnd: sub.currentPeriodEnd,
						plan: sub.plan,
						status: sub.status,
						trialEnd: sub.trialEnd,
					});
					return;
				}
			}
		} catch {
			// ignore
		}
		setSubscription({ plan: "free", status: "active" });
	};

	const checkSession = async () => {
		try {
			const res = await fetch("/api/players/me", { credentials: "include" });
			if (res.ok) {
				const data = await res.json();
				if (data.user) {
					setPlayer(data.user);
					await fetchSubscription(data.user.id);
				}
			}
		} catch {
			// Not authenticated
		} finally {
			setIsLoading(false);
		}
	};

	const refreshPlayer = useCallback(async () => {
		try {
			const res = await fetch("/api/players/me", { credentials: "include" });
			if (res.ok) {
				const data = await res.json();
				if (data.user) {
					setPlayer(data.user);
				}
			}
		} catch {
			// ignore
		}
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		try {
			const res = await fetch("/api/players/login", {
				body: JSON.stringify({ email, password }),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});

			if (res.ok) {
				const data = await res.json();
				setPlayer(data.user);
				return { success: true };
			}

			const error = await res.json().catch(() => ({}));
			return { error: error.message || "Login failed", success: false };
		} catch {
			return { error: "Network error", success: false };
		}
	}, []);

	const register = useCallback(
		async (email: string, password: string, name?: string) => {
			try {
				const res = await fetch("/api/players", {
					body: JSON.stringify({ email, name, password, provider: "email" }),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});

				if (res.ok) {
					// Auto-login after registration
					const loginResult = await login(email, password);
					return loginResult;
				}

				const error = await res.json().catch(() => ({}));
				const errorMsg =
					error.errors?.[0]?.message || error.message || "Registration failed";
				return { error: errorMsg, success: false };
			} catch {
				return { error: "Network error", success: false };
			}
		},
		[login],
	);

	const loginWithGoogle = useCallback(() => {
		window.location.href = "/api/auth/google";
	}, []);

	const logout = useCallback(async () => {
		try {
			await fetch("/api/players/logout", {
				credentials: "include",
				method: "POST",
			});
		} catch {
			// ignore
		}
		setPlayer(null);
		setSubscription(null);
		setStreak({ currentStreak: 0, lastPlayedDate: null, longestStreak: 0 });
	}, []);

	const updateStreak = useCallback(async () => {
		try {
			const res = await fetch("/api/streak", {
				credentials: "include",
				method: "POST",
			});
			if (res.ok) {
				const data = await res.json();
				setStreak(data);
			}
		} catch {
			// ignore
		}
	}, []);

	const updatePlayer = useCallback(
		async (data: Partial<Player>) => {
			if (!player) return;
			try {
				const res = await fetch(`/api/players/${player.id}`, {
					body: JSON.stringify(data),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "PATCH",
				});
				if (res.ok) {
					const updated = await res.json();
					setPlayer(updated.doc);
				}
			} catch {
				// ignore
			}
		},
		[player],
	);

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated: !!player,
				isLoading,
				login,
				loginWithGoogle,
				logout,
				player,
				refreshPlayer,
				register,
				streak,
				subscription,
				updatePlayer,
				updateStreak,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
