"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button, Card, Header, PageContent, PageLayout } from "@/components/ui";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";
import {
	fadeInUp,
	scaleIn,
	staggerContainer,
	staggerItem,
} from "@/lib/animations";
import { shareQuestion } from "@/lib/share";
import type { Question } from "@/types";

export default function AwesomePage() {
	const router = useRouter();
	const t = useTranslations("awesome");
	const tc = useTranslations("common");
	const {
		superlikedQuestions,
		resetProgress,
		sections,
		updateQuestionState,
		audience,
	} = useQuestions();
	const [search, setSearch] = useState("");
	const [view, setView] = useState<"cards" | "list">("cards");
	const [currentIndex, setCurrentIndex] = useState(0);

	// Build category lookup from sections
	const questionCategoryMap = useMemo(() => {
		const map = new Map<number, string>();
		for (const section of sections) {
			for (const q of section.questions) {
				map.set(q.id, section.name);
			}
		}
		return map;
	}, [sections]);

	// Filter by search
	const filteredQuestions = useMemo(() => {
		if (!search.trim()) return superlikedQuestions;
		const term = search.toLowerCase();
		return superlikedQuestions.filter(
			(q) =>
				q.question.toLowerCase().includes(term) ||
				(questionCategoryMap.get(q.id) || "").toLowerCase().includes(term),
		);
	}, [superlikedQuestions, search, questionCategoryMap]);

	const currentQuestion = filteredQuestions[currentIndex];

	const handleNext = () => {
		if (currentIndex < filteredQuestions.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	const handleReset = () => {
		if (confirm(tc("confirm"))) {
			resetProgress();
			router.push("/game");
		}
	};

	const handleUnfavorite = (question: Question) => {
		updateQuestionState(question.id, "answered");
		if (currentIndex >= filteredQuestions.length - 1 && currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
	};

	if (superlikedQuestions.length === 0) {
		return (
			<PageLayout>
				<PageContent centered>
					<motion.div {...fadeInUp} className="space-y-6 text-center">
						<div className="mb-4 text-6xl">⭐</div>
						<h1 className="mb-4 font-light text-3xl text-primary">
							{t("empty")}
						</h1>
						<p className="mb-8 text-text-muted">{t("emptyDescription")}</p>
						<div className="mx-auto max-w-xs space-y-4">
							<Button
								fullWidth
								onClick={() => router.push("/game")}
								size="lg"
								variant="primary"
							>
								{t("goBack")}
							</Button>
							<Button
								fullWidth
								onClick={handleReset}
								size="lg"
								variant="danger"
							>
								{t("reset")}
							</Button>
						</div>
					</motion.div>
				</PageContent>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<Header showBack title={t("title")} />

			<div className="mx-auto w-full max-w-md space-y-3 px-4 pt-2 pb-4">
				{/* Search */}
				<input
					className="w-full rounded-xl border border-primary/10 bg-background-lighter px-4 py-2.5 text-sm text-text placeholder:text-text-dimmed focus:border-primary/30 focus:outline-none"
					onChange={(e) => {
						setSearch(e.target.value);
						setCurrentIndex(0);
					}}
					placeholder={t("search")}
					type="text"
					value={search}
				/>

				{/* View toggle + count */}
				<div className="flex items-center justify-between">
					<span className="text-sm text-text-dimmed">
						{filteredQuestions.length} {tc("questions")}
					</span>
					<div className="flex gap-1 rounded-lg bg-background-lighter p-0.5">
						<button
							className={`rounded-md px-3 py-1 text-xs transition-colors ${
								view === "cards"
									? "bg-primary text-background"
									: "text-text-muted"
							}`}
							onClick={() => setView("cards")}
						>
							{t("viewCards")}
						</button>
						<button
							className={`rounded-md px-3 py-1 text-xs transition-colors ${
								view === "list"
									? "bg-primary text-background"
									: "text-text-muted"
							}`}
							onClick={() => setView("list")}
						>
							{t("viewList")}
						</button>
					</div>
				</div>
			</div>

			{view === "cards" && filteredQuestions.length > 0 ? (
				<main className="flex flex-1 flex-col items-center justify-center p-6">
					<div className="relative mb-6 w-full max-w-md">
						<AnimatePresence mode="wait">
							{currentQuestion && (
								<Card
									className="h-80 w-full"
									key={currentQuestion.id}
									padding="lg"
									variant="elevated"
									{...scaleIn}
									transition={{ duration: 0.2 }}
								>
									<div className="flex h-full flex-col items-center justify-center">
										<p className="text-balance text-center font-light text-2xl text-text leading-relaxed md:text-3xl">
											{currentQuestion.question}
										</p>
										<p className="mt-4 text-text-dimmed text-xs">
											{questionCategoryMap.get(currentQuestion.id)}
										</p>
									</div>
								</Card>
							)}
						</AnimatePresence>
					</div>

					{/* Card actions */}
					<div className="mb-4 flex items-center gap-3">
						<button
							aria-label={t("share")}
							className="rounded-full bg-background-lighter p-2.5 text-text-muted transition-colors hover:text-primary"
							onClick={() =>
								currentQuestion &&
								shareQuestion(currentQuestion.question, audience || undefined)
							}
						>
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
						<button
							aria-label={t("unfavorite")}
							className="rounded-full bg-background-lighter p-2.5 text-text-muted transition-colors hover:text-accent"
							onClick={() =>
								currentQuestion && handleUnfavorite(currentQuestion)
							}
						>
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
							</svg>
						</button>
					</div>

					{/* Navigation */}
					<div className="flex items-center gap-4">
						<button
							aria-label={tc("previous")}
							className="rounded-full bg-background-light p-3 transition-colors hover:bg-background-lighter disabled:cursor-not-allowed disabled:opacity-30"
							disabled={currentIndex === 0}
							onClick={handlePrevious}
						>
							<svg
								className="h-6 w-6 text-text"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M15 19l-7-7 7-7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
						<div className="text-text-muted">
							{currentIndex + 1} / {filteredQuestions.length}
						</div>
						<button
							aria-label={tc("next")}
							className="rounded-full bg-background-light p-3 transition-colors hover:bg-background-lighter disabled:cursor-not-allowed disabled:opacity-30"
							disabled={currentIndex === filteredQuestions.length - 1}
							onClick={handleNext}
						>
							<svg
								className="h-6 w-6 text-text"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M9 5l7 7-7 7"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
								/>
							</svg>
						</button>
					</div>
				</main>
			) : (
				<main className="mx-auto w-full max-w-md flex-1 px-4 pb-8">
					<motion.div
						animate="show"
						className="space-y-2"
						initial="hidden"
						variants={staggerContainer}
					>
						{filteredQuestions.map((q) => (
							<motion.div
								className="flex items-start gap-3 rounded-xl bg-background-lighter p-4"
								key={q.id}
								variants={staggerItem}
							>
								<p className="flex-1 text-sm text-text leading-relaxed">
									{q.question}
								</p>
								<div className="flex flex-shrink-0 gap-1">
									<button
										className="p-1.5 text-text-dimmed transition-colors hover:text-primary"
										onClick={() =>
											shareQuestion(q.question, audience || undefined)
										}
									>
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
											/>
										</svg>
									</button>
									<button
										className="p-1.5 text-accent/60 transition-colors hover:text-accent"
										onClick={() => handleUnfavorite(q)}
									>
										<svg
											className="h-4 w-4"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
										</svg>
									</button>
								</div>
							</motion.div>
						))}
					</motion.div>
				</main>
			)}
		</PageLayout>
	);
}
