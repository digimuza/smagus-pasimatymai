"use client";

import { type ReactElement, useEffect } from "react";

export interface ToastMessage {
	description?: string;
	id: string;
	title: string;
}

interface ToastItemProps {
	onDismiss: (id: string) => void;
	toast: ToastMessage;
}

function ToastItem({ onDismiss, toast }: ToastItemProps): ReactElement {
	useEffect(() => {
		const timer = setTimeout(() => onDismiss(toast.id), 4000);
		return () => clearTimeout(timer);
	}, [toast.id, onDismiss]);

	return (
		<button
			className="flex w-full max-w-sm cursor-pointer items-start gap-3 rounded-xl bg-primary px-4 py-3 text-left text-white shadow-lg transition-opacity"
			onClick={() => onDismiss(toast.id)}
			type="button"
		>
			<div>
				<p className="font-semibold text-sm">{toast.title}</p>
				{toast.description && (
					<p className="mt-0.5 text-sm opacity-80">{toast.description}</p>
				)}
			</div>
		</button>
	);
}

interface ToasterProps {
	onDismiss: (id: string) => void;
	toasts: ToastMessage[];
}

export function Toaster({
	onDismiss,
	toasts,
}: ToasterProps): ReactElement | null {
	if (toasts.length === 0) return null;

	return (
		<div className="pointer-events-none fixed right-0 bottom-6 left-0 z-50 flex flex-col items-center gap-2 px-4">
			<div className="pointer-events-auto flex flex-col items-center gap-2">
				{toasts.map((toast) => (
					<ToastItem key={toast.id} onDismiss={onDismiss} toast={toast} />
				))}
			</div>
		</div>
	);
}
