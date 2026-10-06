import { useTranslations } from "next-intl";

export function FAQ() {
	const t = useTranslations("landing.faq");
	const items = t.raw("items") as Array<{ question: string; answer: string }>;
	return (
		<section className="bg-[#160e1e] py-20 sm:py-28">
			<div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
				<h2 className="mb-12 text-center font-serif text-4xl text-[#fff1e7] md:text-5xl">
					{t("title")}
				</h2>
				<div className="rounded-[1.6rem] border border-white/10 bg-[#23162d] px-6 sm:px-8">
					{items.map((item) => (
						<details
							className="group border-white/10 border-b last:border-b-0"
							key={item.question}
						>
							<summary className="flex min-h-14 cursor-pointer list-none items-center justify-between py-5 text-left [&::-webkit-details-marker]:hidden">
								<span className="pr-4 font-medium text-[#f5e6e3]">
									{item.question}
								</span>
								<span
									aria-hidden="true"
									className="shrink-0 text-[#f5c7a9] text-xl group-open:rotate-45"
								>
									+
								</span>
							</summary>
							<p className="pb-5 text-[#cdb9ca] text-sm leading-relaxed">
								{item.answer}
							</p>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
