import { expect, test } from "@playwright/test";

test.describe("Public question decks", () => {
	test("serves a playable English couples deck", async ({ request }) => {
		const response = await request.get(
			"/api/game-data?audience=romantic&locale=en",
		);
		expect(response.status()).toBe(200);
		const data = await response.json();
		expect(data.total_questions).toBe(30);
		expect(
			data.sections.flatMap(
				(section: { questions: unknown[] }) => section.questions,
			),
		).toHaveLength(30);
	});

	test("caps the complete free Lithuanian deck at 50 questions", async ({
		request,
	}) => {
		const response = await request.get(
			"/api/game-data?audience=romantic&locale=lt",
		);
		expect(response.status()).toBe(200);
		const data = await response.json();
		expect(data.total_questions).toBe(50);
		expect(data.isContentLimited).toBe(true);
	});

	test("requires premium access for family mode", async ({ request }) => {
		const response = await request.get(
			"/api/game-data?audience=family&locale=en",
		);
		expect(response.status()).toBe(403);
	});
});
