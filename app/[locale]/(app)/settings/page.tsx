"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
	Button,
	Card,
	Header,
	PageContent,
	PageLayout,
	Select,
	Toggle,
} from "@/components/ui";
import { useQuestions } from "@/context/QuestionContext";
import { useRouter } from "@/i18n/navigation";
import { fadeInUp } from "@/lib/animations";
import { RARITY_LABELS, SPICY_CARD_TYPE_LABELS } from "@/lib/spicyCardsData";

export default function SettingsPage() {
	const router = useRouter();
	const t = useTranslations("settings");
	const {
		spicyCardsEnabled,
		spicyCardsRarity,
		enabledSpicyCardTypes,
		toggleSpicyCards,
		updateSpicyCardsRarity,
		toggleSpicyCardType,
	} = useQuestions();

	const rarityOptions = Object.entries(RARITY_LABELS).map(([value, label]) => ({
		label: label as string,
		value,
	}));

	return (
		<PageLayout>
			<Header showBack title={t("title")} />

			<PageContent>
				<Card {...fadeInUp}>
					<div className="space-y-6">
						<Toggle
							description={t("spicyToggleDescription")}
							enabled={spicyCardsEnabled}
							label={t("spicyToggleLabel")}
							onChange={toggleSpicyCards}
						/>

						{spicyCardsEnabled && (
							<>
								<Select
									label={t("rarityLabel")}
									onChange={updateSpicyCardsRarity}
									options={rarityOptions}
									value={spicyCardsRarity}
								/>
								<p className="text-text-muted text-xs">{t("rarityNote")}</p>

								<div className="space-y-3">
									<h3 className="font-normal text-text">{t("cardTypes")}</h3>
									<div className="grid grid-cols-2 gap-3">
										{Object.entries(SPICY_CARD_TYPE_LABELS).map(
											([type, label]) => {
												const isEnabled = enabledSpicyCardTypes.includes(type);
												const isDisabled =
													enabledSpicyCardTypes.length === 1 && isEnabled;

												return (
													<button
														className={`rounded-lg border-2 p-3 text-left transition-all ${
															isEnabled
																? "border-primary bg-primary/20"
																: "border-transparent bg-background-lighter hover:border-primary/30"
														} ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
														disabled={isDisabled}
														key={type}
														onClick={() => {
															if (!isDisabled) {
																toggleSpicyCardType(type);
															}
														}}
														type="button"
													>
														<p className="font-normal text-sm">{label}</p>
													</button>
												);
											},
										)}
									</div>
									{enabledSpicyCardTypes.length === 1 && (
										<p className="text-text-muted text-xs">
											{t("minTypeWarning")}
										</p>
									)}
								</div>
							</>
						)}
					</div>
				</Card>

				<motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
					<Card className="border-primary/30 bg-primary/10" variant="outlined">
						<p
							className="text-sm text-text-muted"
							dangerouslySetInnerHTML={{ __html: t("info") }}
						/>
					</Card>
				</motion.div>

				<div className="pt-4 pb-8">
					<Button
						fullWidth
						onClick={() => router.push("/game")}
						size="lg"
						variant="primary"
					>
						{t("backToGame")}
					</Button>
				</div>
			</PageContent>
		</PageLayout>
	);
}
