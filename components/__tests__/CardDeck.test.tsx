// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
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

	// Strip framer-motion-specific props so they don't land on real DOM elements
	// biome-ignore lint/suspicious/noExplicitAny: framer-motion mock needs spread props
	const stripMotionProps = ({ children, drag, dragConstraints, dragElastic, onDragEnd, onAnimationComplete, initial, animate, exit, transition, style, ...rest }: any) => ({ children, rest });
	// biome-ignore lint/suspicious/noExplicitAny: framer-motion mock needs spread props
	const MotionDiv = (props: any) => { const { children, rest } = stripMotionProps(props); return <div {...rest}>{children}</div>; };
	// biome-ignore lint/suspicious/noExplicitAny: framer-motion mock needs spread props
	const MotionButton = (props: any) => { const { children, rest } = stripMotionProps(props); return <button {...rest}>{children}</button>; };

	return {
		AnimatePresence: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
		motion: { button: MotionButton, div: MotionDiv },
		useMotionValue: (initial: number) => makeMotionValue(initial),
		useTransform: () => makeMotionValue(0),
	};
});

vi.mock("next-intl", () => ({
	useTranslations: () => (key: string) => key,
}));

import { CardDeck } from "../CardDeck";

const q = (id: number): Question => ({ id, question: `Question ${id}` });

const baseProps = {
	onSwipeLeft: vi.fn(),
	onSwipeRight: vi.fn(),
	onSwipeUp: vi.fn(),
};

// ---------------------------------------------------------------------------

describe("CardDeck", () => {
	// --- Active question card ---

	it("renders the active SwipeCard when question is provided", () => {
		render(<CardDeck {...baseProps} previewQuestions={[]} question={q(1)} />);
		expect(screen.getByTestId("swipe-card")).toBeTruthy();
	});

	it("renders the active question text", () => {
		render(<CardDeck {...baseProps} previewQuestions={[]} question={q(1)} />);
		expect(screen.getByText("Question 1")).toBeTruthy();
	});

	it("renders skeleton placeholder when question is null", () => {
		render(<CardDeck {...baseProps} previewQuestions={[]} question={null} />);
		expect(screen.queryByTestId("swipe-card")).toBeNull();
	});

	// --- Ghost / preview cards ---

	it("renders ghost cards for each preview question (up to 3)", () => {
		const previews = [q(2), q(3), q(4)];
		render(
			<CardDeck {...baseProps} previewQuestions={previews} question={q(1)} />,
		);
		expect(screen.getByText("Question 2")).toBeTruthy();
		expect(screen.getByText("Question 3")).toBeTruthy();
		expect(screen.getByText("Question 4")).toBeTruthy();
	});

	it("renders at most 3 ghost cards even when more previews are provided", () => {
		const previews = [q(2), q(3), q(4), q(5), q(6)];
		render(
			<CardDeck {...baseProps} previewQuestions={previews} question={q(1)} />,
		);
		// Only q(2), q(3), q(4) should be rendered as ghosts
		expect(screen.getByText("Question 2")).toBeTruthy();
		expect(screen.getByText("Question 3")).toBeTruthy();
		expect(screen.getByText("Question 4")).toBeTruthy();
		expect(screen.queryByText("Question 5")).toBeNull();
	});

	it("renders no ghost cards when previewQuestions is empty", () => {
		render(<CardDeck {...baseProps} previewQuestions={[]} question={q(1)} />);
		expect(screen.queryByText("Question 2")).toBeNull();
	});

	it("renders a single ghost card correctly", () => {
		render(
			<CardDeck {...baseProps} previewQuestions={[q(2)]} question={q(1)} />,
		);
		expect(screen.getByText("Question 2")).toBeTruthy();
	});

	// --- Category and difficulty pass-through ---

	it("passes category prop to the SwipeCard", () => {
		render(
			<CardDeck
				{...baseProps}
				category="Romance"
				previewQuestions={[]}
				question={q(1)}
			/>,
		);
		expect(screen.getByText("Romance")).toBeTruthy();
	});

	it("passes difficulty='safe' to the SwipeCard (shows translated badge key)", () => {
		render(
			<CardDeck
				{...baseProps}
				difficulty="safe"
				previewQuestions={[]}
				question={q(1)}
			/>,
		);
		expect(screen.getByText("difficultySafe")).toBeTruthy();
	});

	it("passes difficulty='intimate' to the SwipeCard", () => {
		render(
			<CardDeck
				{...baseProps}
				difficulty="intimate"
				previewQuestions={[]}
				question={q(1)}
			/>,
		);
		expect(screen.getByText("difficultyIntimate")).toBeTruthy();
	});

	// --- Deck container ---

	it("renders a container div wrapping the deck", () => {
		const { container } = render(
			<CardDeck {...baseProps} previewQuestions={[]} question={q(1)} />,
		);
		expect(container.firstChild).toBeTruthy();
	});
});
