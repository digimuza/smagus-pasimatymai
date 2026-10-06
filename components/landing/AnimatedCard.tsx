"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function AnimatedCard() {
	const t = useTranslations("landing");
	const [index, setIndex] = useState(0);
	const questions = t.raw("sampleQuestions") as string[];

	useEffect(() => {
		// Keep the preview still on touch devices and when motion is reduced.
		const media = window.matchMedia(
			"(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)",
		);
		let timer: ReturnType<typeof setInterval> | undefined;
		const update = () => {
			clearInterval(timer);
			if (media.matches && document.visibilityState === "visible") {
				timer = setInterval(
					() => setIndex((value) => (value + 1) % questions.length),
					7000,
				);
			}
		};
		update();
		media.addEventListener("change", update);
		document.addEventListener("visibilitychange", update);
		return () => {
			clearInterval(timer);
			media.removeEventListener("change", update);
			document.removeEventListener("visibilitychange", update);
		};
	}, [questions.length]);

	return (
		<div className="relative mx-auto h-[19rem] w-full max-w-sm sm:h-[22rem]">
			<div
				aria-hidden="true"
				className="absolute inset-0 translate-x-3 translate-y-4 rotate-[5deg] rounded-[2rem] border border-[#d6b9ba]/50 bg-[#c999a5]"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-0 -translate-x-2 translate-y-2 -rotate-[4deg] rounded-[2rem] border border-[#d8bcb0] bg-[#ead1be]"
			/>
			<div className="paper-card relative flex h-full flex-col rounded-[2rem] border border-[#fff9ec] p-7 text-[#3c293a] shadow-[0_28px_65px_rgba(0,0,0,0.32)] sm:p-9">
				<div className="flex items-center justify-between border-[#a57f83]/30 border-b pb-5 text-[10px] uppercase tracking-[0.22em]">
					<span>{t("cardLabel")}</span>
					<span className="shrink-0">
						{String(index + 1).padStart(2, "0")} /{" "}
						{String(questions.length).padStart(2, "0")}
					</span>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<p
						className="preview-question m-auto max-w-xs text-center font-serif text-[1.75rem] leading-[1.25] sm:text-[2rem]"
						key={index}
					>
						{questions[index % questions.length]}
					</p>
				</div>
				<div className="flex items-center justify-between border-[#a57f83]/30 border-t pt-5 text-[11px] uppercase tracking-[0.15em]">
					<span>{t("swipeLeft")}</span>
					<span
						aria-hidden="true"
						className="font-serif text-[#a15d6d] text-xl leading-none"
					>
						♥
					</span>
					<span>{t("swipeRight")}</span>
				</div>
			</div>
		</div>
	);
}
