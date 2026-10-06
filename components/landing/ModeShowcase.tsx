import { useTranslations } from "next-intl";
import { ModeCard } from "./ModeCard";

export function ModeShowcase() {
	const t = useTranslations("landing.modes");

	return (
		<section className="relative border-white/5 border-t bg-[#160e1e] py-20 sm:py-28">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<h2 className="mx-auto mb-14 max-w-2xl text-center font-serif text-4xl text-[#fff1e7] leading-tight sm:text-5xl">
					{t("title")}
				</h2>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					<ModeCard
						colorClass="couples"
						cta={t("couples.cta")}
						description={t("couples.description")}
						href="/audience"
						icon="💜"
						name={t("couples.name")}
					/>
					<ModeCard
						colorClass="family"
						cta={t("family.cta")}
						description={t("family.description")}
						href="/audience"
						icon="🏠"
						name={t("family.name")}
					/>
					<ModeCard
						colorClass="friends"
						cta={t("friends.cta")}
						description={t("friends.description")}
						href="/audience"
						icon="🎉"
						name={t("friends.name")}
					/>
					<ModeCard
						colorClass="kids"
						cta={t("kids.cta")}
						description={t("kids.description")}
						href="/audience"
						icon="🌈"
						name={t("kids.name")}
					/>
				</div>
			</div>
		</section>
	);
}
