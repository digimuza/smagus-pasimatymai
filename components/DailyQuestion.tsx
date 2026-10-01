"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { fadeInUp } from "@/lib/animations";
import { shareQuestion } from "@/lib/share";

interface DailyQuestionData {
	date: string;
	id: number;
	question: string;
}

export function DailyQuestion({ audience }: { audience: string }) {
	const t = useTranslations("daily");
	const locale = useLocale();
	const [data, setData] = useState<DailyQuestionData | null>(null);

	useEffect(() => {
		fetch(
			`/api/daily-question?audience=${encodeURIComponent(audience)}&locale=${encodeURIComponent(locale)}`,
		)
			.then((r) => (r.ok ? r.json() : null))
			.then(setData)
			.catch(() => {});
	}, [audience, locale]);

	if (!data) return null;

	const handleShare = () => {
		shareQuestion(data.question, audience);
	};

	return (
		<motion.div
			{...fadeInUp}
			className="mx-auto w-full max-w-lg rounded-[1.6rem] border border-[#f5c7a9]/25 bg-[#2c1a31] p-6"
		>
			<div className="mb-3 flex items-center gap-2">
				<span aria-hidden="true" className="text-[#f5c7a9] text-lg">
					✦
				</span>
				<span className="font-semibold text-[#f5c7a9] text-xs uppercase tracking-wider">
					{t("label")}
				</span>
			</div>
			<p className="mb-5 font-serif text-2xl text-[#fff1e7] leading-snug">
				{data.question}
			</p>
			<button
				className="flex items-center gap-1.5 text-[#e0c6d1] text-sm transition-colors hover:text-white"
				onClick={handleShare}
				type="button"
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
				{t("share")}
			</button>
		</motion.div>
	);
}
