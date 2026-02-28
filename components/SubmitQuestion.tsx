"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button, Sheet } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useQuestions } from "@/context/QuestionContext";

interface SubmitQuestionProps {
	isOpen: boolean;
	onClose: () => void;
}

export function SubmitQuestion({ isOpen, onClose }: SubmitQuestionProps) {
	const t = useTranslations("submit");
	const { isAuthenticated } = useAuth();
	const { audience } = useQuestions();
	const [text, setText] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async () => {
		if (!text.trim() || text.trim().length < 10) return;

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/submit-question", {
				body: JSON.stringify({
					audience: audience || "romantic",
					text: text.trim(),
				}),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});

			if (res.ok) {
				setSubmitted(true);
				setText("");
				setTimeout(() => {
					setSubmitted(false);
					onClose();
				}, 2000);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isAuthenticated) return null;

	return (
		<Sheet isOpen={isOpen} onClose={onClose} side="bottom">
			<div className="mx-auto max-w-md p-6">
				{submitted ? (
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="py-8 text-center"
						initial={{ opacity: 0, scale: 0.8 }}
					>
						<span className="mb-4 block text-5xl">✅</span>
						<p className="font-semibold text-text">{t("success")}</p>
						<p className="mt-1 text-sm text-text-muted">{t("successNote")}</p>
					</motion.div>
				) : (
					<>
						<div className="mb-4 text-center">
							<span className="mb-2 block text-3xl">💡</span>
							<h2 className="font-bold text-text text-xl">{t("title")}</h2>
							<p className="mt-1 text-sm text-text-muted">{t("subtitle")}</p>
						</div>

						<textarea
							className="mb-2 w-full resize-none rounded-xl border border-primary/10 bg-background-lighter px-4 py-3 text-sm text-text placeholder:text-text-dimmed focus:border-primary/30 focus:outline-none"
							maxLength={300}
							onChange={(e) => setText(e.target.value)}
							placeholder={t("placeholder")}
							rows={3}
							value={text}
						/>

						<div className="mb-4 flex items-center justify-between">
							<span className="text-text-dimmed text-xs">
								{text.length}/300
							</span>
							<span className="text-text-dimmed text-xs">{t("minChars")}</span>
						</div>

						<Button
							disabled={isSubmitting || text.trim().length < 10}
							fullWidth
							onClick={handleSubmit}
							variant="primary"
						>
							{isSubmitting ? t("submitting") : t("submitButton")}
						</Button>
					</>
				)}
			</div>
		</Sheet>
	);
}
