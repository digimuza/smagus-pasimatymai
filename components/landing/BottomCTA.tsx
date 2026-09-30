"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function BottomCTA() {
	const t = useTranslations("landing.bottomCta");
	const prefersReducedMotion = useReducedMotion();

	return (
		<section className="bg-[#160e1e] px-5 py-16 content-auto sm:px-8 sm:py-24">
			<motion.div
				className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.2rem] border border-[#eab8a5]/25 bg-[radial-gradient(circle_at_85%_0%,#633850_0%,#352038_38%,#24172e_75%)] px-6 py-16 text-center shadow-[0_25px_75px_rgba(0,0,0,0.25)] sm:px-12 sm:py-20"
				initial={{ opacity: 0, y: 24 }}
				transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
				viewport={{ once: true }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-32 -right-16 h-80 w-80 rounded-full border border-[#f5c7a9]/15"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-20 -right-4 h-64 w-64 rounded-full border border-[#f5c7a9]/15"
				/>
				<span aria-hidden="true" className="font-serif text-3xl text-[#f5c7a9]">
					♥
				</span>
				<h2 className="relative mt-5 font-serif text-5xl text-[#fff2e8] sm:text-6xl">
					{t("title")}
				</h2>
				<p className="relative mx-auto mt-5 max-w-md text-[#e7d1d9] text-lg">
					{t("subtitle")}
				</p>
				<Link
					className="relative mt-9 inline-flex min-h-14 items-center justify-center rounded-full bg-[#f5c7a9] px-9 py-4 font-semibold text-[#281827] shadow-[0_14px_35px_rgba(245,165,153,0.22)] transition duration-200 hover:-translate-y-1 hover:bg-[#ffe0c4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
					href="/audience"
				>
					{t("cta")}
				</Link>
				<p className="relative mt-5 text-[#d0b9c8] text-sm">{t("noCta")}</p>
			</motion.div>
		</section>
	);
}
