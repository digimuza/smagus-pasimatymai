"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";

function FAQItem({
	question,
	answer,
	isOpen,
	onToggle,
}: {
	question: string;
	answer: string;
	isOpen: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="border-primary/10 border-b last:border-b-0">
			<button
				aria-expanded={isOpen}
				className="group flex w-full items-center justify-between py-5 text-left"
				onClick={onToggle}
			>
				<span className="pr-4 font-medium text-text">{question}</span>
				<motion.span
					animate={{ rotate: isOpen ? 45 : 0 }}
					className="flex-shrink-0 text-primary text-xl"
					transition={{ duration: 0.2 }}
				>
					+
				</motion.span>
			</button>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						animate={{ height: "auto", opacity: 1 }}
						className="overflow-hidden"
						exit={{ height: 0, opacity: 0 }}
						initial={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<p className="pb-5 text-sm text-text-muted leading-relaxed">
							{answer}
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export function FAQ() {
	const t = useTranslations("landing.faq");
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const items = t.raw("items") as Array<{ question: string; answer: string }>;

	return (
		<section className="py-16 content-auto sm:py-24">
			<div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
				<motion.h2
					className="mb-12 text-center font-bold text-3xl text-text md:text-4xl"
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					{t("title")}
				</motion.h2>

				<motion.div
					className="rounded-2xl border border-primary/10 bg-background-lighter px-6"
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.1, duration: 0.6 }}
					viewport={{ once: true }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					{items.map((item, i) => (
						<FAQItem
							answer={item.answer}
							isOpen={openIndex === i}
							key={i}
							onToggle={() => setOpenIndex(openIndex === i ? null : i)}
							question={item.question}
						/>
					))}
				</motion.div>
			</div>
		</section>
	);
}
