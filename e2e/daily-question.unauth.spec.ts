import { expect, test } from "@playwright/test";

test("the English daily question comes from the English deck", async ({
	request,
}) => {
	const [dailyResponse, deckResponse] = await Promise.all([
		request.get("/api/daily-question?audience=romantic&locale=en"),
		request.get("/api/game-data?audience=romantic&locale=en"),
	]);
	expect(dailyResponse.status()).toBe(200);
	expect(deckResponse.status()).toBe(200);
	const daily = await dailyResponse.json();
	const deck = await deckResponse.json();
	const questions = deck.sections.flatMap(
		(section: { questions: Array<{ question: string }> }) =>
			section.questions.map((item) => item.question),
	);
	expect(questions).toContain(daily.question);
});
