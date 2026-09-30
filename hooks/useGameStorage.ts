"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/**
 * Convenience wrapper around useLocalStorage for game state. Provides a
 * typed setter that also accepts a callback updater, similar to useState.
 */
export function useGameStorage<T>(key: string, initial: T) {
	const [value, setValue, isLoaded] = useLocalStorage<typeof initial>(
		`games_${key}`,
		initial,
	);

	// Avoid hydration mismatches by deferring to isLoaded
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setHydrated(true);
	}, []);

	const update = useCallback(
		(next: T | ((prev: T) => T)) => {
			setValue((prev) =>
				typeof next === "function" ? (next as (p: T) => T)(prev) : next,
			);
		},
		[setValue],
	);

	return [value, update, hydrated && isLoaded] as const;
}
