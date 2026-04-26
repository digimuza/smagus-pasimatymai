"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PairedSessionStatus {
	partnerFinished: boolean;
	partnerJoined: boolean;
	partnerOnline: boolean;
}

interface UsePairedSessionStatusResult {
	error: boolean;
	isLoading: boolean;
	status: PairedSessionStatus | null;
}

const POLL_INTERVAL_MS = 5000;

export function usePairedSessionStatus(
	token: string | null,
): UsePairedSessionStatusResult {
	const [status, setStatus] = useState<PairedSessionStatus | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const stopPolling = useCallback(() => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (!token) {
			stopPolling();
			setStatus(null);
			setError(false);
			return;
		}

		setIsLoading(true);
		setError(false);

		const poll = async () => {
			try {
				const res = await fetch(`/api/sessions/pair/${token}/status`, {
					credentials: "include",
				});
				if (!res.ok) {
					setError(true);
					setIsLoading(false);
					stopPolling();
					return;
				}
				const data: PairedSessionStatus = await res.json();
				setStatus(data);
				setIsLoading(false);

				if (data.partnerFinished) {
					stopPolling();
				}
			} catch {
				setError(true);
				setIsLoading(false);
				stopPolling();
			}
		};

		poll();
		intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

		return stopPolling;
	}, [token, stopPolling]);

	return { error, isLoading, status };
}
