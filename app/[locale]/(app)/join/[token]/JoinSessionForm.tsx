"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { Button } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";

interface TokenData {
	audience: string;
	expired: boolean;
	initiatorName: string;
}

type JoinState =
	| "loading"
	| "ready"
	| "expired"
	| "ownLink"
	| "joining"
	| "error";

interface JoinSessionFormProps {
	token: string;
}

export function JoinSessionForm({ token }: JoinSessionFormProps) {
	const t = useTranslations("joinSession");
	const tCommon = useTranslations("common");
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { setPairedSession } = useQuestions();
	const router = useRouter();
	const [joinState, setJoinState] = useState<JoinState>("loading");
	const [tokenData, setTokenData] = useState<TokenData | null>(null);
	const [showLogin, setShowLogin] = useState(false);

	useEffect(() => {
		if (authLoading) return;

		fetch(`/api/sessions/pair/${token}/status`, { credentials: "include" })
			.then(async (res) => {
				if (!res.ok) {
					setJoinState("error");
					return;
				}
				const data: TokenData = await res.json();
				if (data.expired) {
					setJoinState("expired");
					return;
				}
				setTokenData(data);
				setJoinState("ready");
			})
			.catch(() => setJoinState("error"));
	}, [token, authLoading]);

	const handleJoin = async () => {
		if (!isAuthenticated) {
			setShowLogin(true);
			return;
		}

		setJoinState("joining");

		try {
			const res = await fetch(`/api/sessions/pair/${token}/join`, {
				credentials: "include",
				method: "POST",
			});

			if (!res.ok) {
				const data: { error?: string } = await res.json();
				if (data.error === "own_link") {
					setJoinState("ownLink");
					return;
				}
				setJoinState("error");
				return;
			}

			const data: { pairedSessionId: string } = await res.json();
			setPairedSession(data.pairedSessionId, token);

			router.push(
				tokenData?.audience
					? `/game?pairedToken=${encodeURIComponent(token)}`
					: "/game",
			);
		} catch {
			setJoinState("error");
		}
	};

	if (joinState === "loading" || authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-primary text-xl">{tCommon("loading")}</div>
			</div>
		);
	}

	if (joinState === "expired") {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<p className="text-center text-text-muted">{t("expired")}</p>
			</div>
		);
	}

	if (joinState === "ownLink") {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<p className="text-center text-text-muted">{t("ownLink")}</p>
			</div>
		);
	}

	if (joinState === "error") {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<p className="text-center text-text-muted">{t("networkError")}</p>
			</div>
		);
	}

	const title = t("title", {
		name: tokenData?.initiatorName || "Someone",
	});

	return (
		<>
			<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
				<h1 className="text-center font-bold text-2xl text-text">{title}</h1>
				<Button
					loading={joinState === "joining"}
					onClick={handleJoin}
					size="lg"
					type="button"
				>
					{t("join")}
				</Button>
			</div>
			<LoginSheet isOpen={showLogin} onClose={() => setShowLogin(false)} />
		</>
	);
}
