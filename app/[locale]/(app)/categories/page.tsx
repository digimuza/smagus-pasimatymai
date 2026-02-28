"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
	Button,
	Checkbox,
	Counter,
	Header,
	PageContent,
	PageLayout,
} from "@/components/ui";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function CategoriesPage() {
	const router = useRouter();
	const t = useTranslations("categories");
	const tc = useTranslations("common");
	const {
		sections,
		toggleCategory,
		isCategoryActive,
		activeCategories,
		audience,
	} = useQuestions();

	const safeCategories = sections.filter((s) => s.type === "safe");
	const intimateSections = sections.filter((s) => s.type === "intimate");

	return (
		<PageLayout>
			<Header showBack title={t("title")} />

			<PageContent>
				<Counter
					current={activeCategories.length}
					label={t("selectedCount")}
					total={sections.length}
				/>

				{/* Safe Categories */}
				<div>
					<h2 className="mb-4 font-light text-lg text-primary">{t("main")}</h2>
					<motion.div
						animate="show"
						className="space-y-3"
						initial="hidden"
						variants={staggerContainer}
					>
						{safeCategories.map((section) => {
							const isActive = isCategoryActive(section.name);
							const isDisabled = activeCategories.length === 1 && isActive;

							return (
								<motion.div key={section.name} variants={staggerItem}>
									<button
										className={`flex w-full items-center justify-between rounded-xl p-4 transition-all ${
											isActive
												? "border-2 border-primary bg-primary/20"
												: "border-2 border-transparent bg-background-light hover:border-primary/30"
										} ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
										disabled={isDisabled}
										onClick={() => !isDisabled && toggleCategory(section.name)}
									>
										<Checkbox
											checked={isActive}
											description={section.range}
											disabled={isDisabled}
											label={section.name}
											onChange={() => {}}
										/>
										<div className="text-right">
											<p className="font-light text-2xl text-primary">
												{section.questions.length}
											</p>
											<p className="text-text-muted text-xs">
												{tc("questions")}
											</p>
										</div>
									</button>
								</motion.div>
							);
						})}
					</motion.div>
				</div>

				{/* Intimate Categories — hidden for kids */}
				{audience !== "kids" && intimateSections.length > 0 && (
					<div>
						<h2 className="mb-2 font-light text-accent text-lg">
							{t("intimate")}
						</h2>
						<p className="mb-4 text-sm text-text-muted">{t("intimateNote")}</p>
						<motion.div
							animate="show"
							className="space-y-3"
							initial="hidden"
							variants={staggerContainer}
						>
							{intimateSections.map((section) => {
								const isActive = isCategoryActive(section.name);
								const isDisabled = activeCategories.length === 1 && isActive;

								return (
									<motion.div key={section.name} variants={staggerItem}>
										<button
											className={`flex w-full items-center justify-between rounded-xl p-4 transition-all ${
												isActive
													? "border-2 border-accent bg-accent/20"
													: "border-2 border-transparent bg-background-light hover:border-accent/30"
											} ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
											disabled={isDisabled}
											onClick={() =>
												!isDisabled && toggleCategory(section.name)
											}
										>
											<Checkbox
												checked={isActive}
												color="accent"
												description={section.range}
												disabled={isDisabled}
												label={section.name}
												onChange={() => {}}
											/>
											<div className="text-right">
												<p className="font-light text-2xl text-accent">
													{section.questions.length}
												</p>
												<p className="text-text-muted text-xs">
													{tc("questions")}
												</p>
											</div>
										</button>
									</motion.div>
								);
							})}
						</motion.div>
					</div>
				)}

				{activeCategories.length === 1 && (
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-center"
						initial={{ opacity: 0, scale: 0.95 }}
					>
						<p className="text-sm text-text-muted">{t("minWarning")}</p>
					</motion.div>
				)}

				<div className="pt-4 pb-8">
					<Button
						fullWidth
						onClick={() => router.push("/game")}
						size="lg"
						variant="primary"
					>
						{t("startGame")}
					</Button>
				</div>
			</PageContent>
		</PageLayout>
	);
}
