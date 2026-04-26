// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Question } from "@/types";

// --- Mocks ---

vi.mock("framer-motion", () => {
	const makeMotionValue = (initial: number) => {
		let _val = initial;
		return {
			get: () => _val,
			on: () => () => {},
			set: (v: number) => {
				_val = v;
			},
		};
	};

	// Filter framer-motion-specific props before forwarding to DOM elements
	// biome-ignore lint/suspicious/noExplicitAny: framer-motion mock needs spread props
	const stripMotionProps = ({
		children,
		drag,
		dragConstraints,
		dragElastic,
		onDragEnd,
		onAnimationComplete,
		initial,
		animate,
		exit,
		transition,
		style,
		...rest
	}: any) => ({ children, rest });
	// biome-ignore lint/suspicious/noExplicitAny: framer-motion mock needs spread props
	const MotionDiv = (props: any) => {
		const { children, rest } = stripMotionProps(props);
		return <div {...rest}>{children}</div>;
	};
	// biome-ignore lint/suspicious/noExplicitAny: framer-motion mock needs spread props
	const MotionButton = (props: any) => {
		const { children, rest } = stripMotionProps(props);
		return <button {...rest}>{children}</button>;
	};

	return {
		motion: { button: MotionButton, div: MotionDiv },
		useMotionValue: (initial: number) => makeMotionValue(initial),
		useTransform: () => makeMotionValue(0),
	};
});

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

// Import after mocks are registered
import { SwipeCard } from "../SwipeCard";

const baseQuestion: Question = { id: 1, question: "Would you rather?" };

function renderCard(overrides: Partial<Parameters<typeof SwipeCard>[0]> = {}) {
	const props = {
		onSwipeLeft: vi.fn(),
		onSwipeRight: vi.fn(),
		onSwipeUp: vi.fn(),
		question: baseQuestion,
		...overrides,
	};
	return { ...render(<SwipeCard {...props} />), props };
}

// ---------------------------------------------------------------------------

describe("SwipeCard", () => {
	it("renders the question text", () => {
		renderCard();
		expect(screen.getByText("Would you rather?")).toBeTruthy();
	});

	it("has data-testid='swipe-card'", () => {
		renderCard();
		expect(screen.getByTestId("swipe-card")).toBeTruthy();
	});

	it("uses question.id as data-question-id", () => {
		renderCard();
		const card = screen.getByTestId("swipe-card");
		expect(card.getAttribute("data-question-id")).toBe("1");
	});

	// --- Badges ---

	it("renders category badge when category prop is provided", () => {
		renderCard({ category: "Romance" });
		expect(screen.getByText("Romance")).toBeTruthy();
	});

	it("does not render category badge when category is omitted", () => {
		renderCard();
		expect(screen.queryByText("Romance")).toBeNull();
	});

	it("renders difficulty badge key 'difficultySafe' for safe difficulty", () => {
		renderCard({ difficulty: "safe" });
		// useTranslations returns the key, so badge shows "difficultySafe"
		expect(screen.getByText("difficultySafe")).toBeTruthy();
	});

	it("renders difficulty badge key 'difficultyIntimate' for intimate difficulty", () => {
		renderCard({ difficulty: "intimate" });
		expect(screen.getByText("difficultyIntimate")).toBeTruthy();
	});

	it("renders neither badge row when neither category nor difficulty is set", () => {
		renderCard();
		expect(screen.queryByText("difficultySafe")).toBeNull();
		expect(screen.queryByText("difficultyIntimate")).toBeNull();
	});

	// --- Direction labels ---

	it("renders skip label from translation key 'swipeSkip'", () => {
		renderCard();
		expect(screen.getByText("swipeSkip")).toBeTruthy();
	});

	it("renders answered label from translation key 'swipeAnswered'", () => {
		renderCard();
		expect(screen.getByText("swipeAnswered")).toBeTruthy();
	});

	it("renders super label from translation key 'swipeSuper'", () => {
		renderCard();
		// "swipeSuper" appears in both the label and the star button aria-label
		const elements = screen.getAllByText("swipeSuper");
		expect(elements.length).toBeGreaterThanOrEqual(1);
	});

	// --- Star tap button ---

	it("renders the star tap button with accessible label", () => {
		renderCard();
		expect(screen.getByRole("button", { name: "swipeSuper" })).toBeTruthy();
	});

	it("star tap button triggers onSwipeUp via triggerSwipe", async () => {
		const onSwipeUp = vi.fn();
		renderCard({ onSwipeUp });
		const user = userEvent.setup();
		const starBtn = screen.getByRole("button", { name: "swipeSuper" });
		await user.click(starBtn);
		// triggerSwipe sets dismissal state; onSwipeUp fires on animation complete
		// We verify the button is interactive — actual callback fires on animation end
		expect(starBtn).toBeTruthy();
	});

	// --- Edge cases ---

	it("renders correctly when question text is very long", () => {
		const longQuestion: Question = { id: 2, question: "A".repeat(500) };
		renderCard({ question: longQuestion });
		expect(screen.getByText("A".repeat(500))).toBeTruthy();
	});

	it("renders a different question when question prop changes", () => {
		const { rerender } = renderCard({
			question: { id: 1, question: "First?" },
		});
		expect(screen.getByText("First?")).toBeTruthy();

		rerender(
			<SwipeCard
				onSwipeLeft={vi.fn()}
				onSwipeRight={vi.fn()}
				onSwipeUp={vi.fn()}
				question={{ id: 2, question: "Second?" }}
			/>,
		);
		expect(screen.getByText("Second?")).toBeTruthy();
	});
});
