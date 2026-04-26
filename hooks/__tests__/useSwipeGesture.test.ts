// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Minimal framer-motion stub so the hook works in jsdom without real animation
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
	return {
		useMotionValue: (initial: number) => makeMotionValue(initial),
		useTransform: () => makeMotionValue(0),
	};
});

import { useSwipeGesture } from "../useSwipeGesture";

describe("useSwipeGesture", () => {
	it("starts with isDismissed = false", () => {
		const { result } = renderHook(() => useSwipeGesture());
		expect(result.current.isDismissed).toBe(false);
	});

	it("starts with exitAnimate = null", () => {
		const { result } = renderHook(() => useSwipeGesture());
		expect(result.current.exitAnimate).toBeNull();
	});

	it("returns dragHandlers with expected shape", () => {
		const { result } = renderHook(() => useSwipeGesture());
		const { dragHandlers } = result.current;
		expect(dragHandlers).toHaveProperty("drag");
		expect(dragHandlers).toHaveProperty("dragConstraints");
		expect(dragHandlers).toHaveProperty("dragElastic");
		expect(dragHandlers).toHaveProperty("onDragEnd");
		expect(dragHandlers).toHaveProperty("onAnimationComplete");
	});

	it("returns x and y motion values", () => {
		const { result } = renderHook(() => useSwipeGesture());
		expect(result.current.x).toBeDefined();
		expect(result.current.y).toBeDefined();
	});

	// --- triggerSwipe ---

	it("triggerSwipe('left') sets isDismissed to true", () => {
		const { result } = renderHook(() => useSwipeGesture());
		act(() => result.current.triggerSwipe("left"));
		expect(result.current.isDismissed).toBe(true);
	});

	it("triggerSwipe('right') sets isDismissed to true", () => {
		const { result } = renderHook(() => useSwipeGesture());
		act(() => result.current.triggerSwipe("right"));
		expect(result.current.isDismissed).toBe(true);
	});

	it("triggerSwipe('up') sets isDismissed to true", () => {
		const { result } = renderHook(() => useSwipeGesture());
		act(() => result.current.triggerSwipe("up"));
		expect(result.current.isDismissed).toBe(true);
	});

	it("triggerSwipe('down') is ignored when down is not enabled", () => {
		const { result } = renderHook(() =>
			useSwipeGesture({ enabledDirections: ["left", "right", "up"] }),
		);
		act(() => result.current.triggerSwipe("down"));
		expect(result.current.isDismissed).toBe(false);
	});

	it("triggerSwipe('down') works when down is enabled", () => {
		const { result } = renderHook(() =>
			useSwipeGesture({ enabledDirections: ["down"] }),
		);
		act(() => result.current.triggerSwipe("down"));
		expect(result.current.isDismissed).toBe(true);
	});

	it("triggerSwipe on a disabled direction does not dismiss", () => {
		const { result } = renderHook(() =>
			useSwipeGesture({ enabledDirections: ["right"] }),
		);
		act(() => result.current.triggerSwipe("left"));
		expect(result.current.isDismissed).toBe(false);
	});

	// --- exitAnimate ---

	it("exitAnimate is non-null after triggerSwipe", () => {
		const { result } = renderHook(() => useSwipeGesture());
		act(() => result.current.triggerSwipe("left"));
		expect(result.current.exitAnimate).not.toBeNull();
	});

	// --- handleAnimationComplete / callbacks ---

	it("calls onSwipeLeft after left dismiss and animation complete", () => {
		const onSwipeLeft = vi.fn();
		const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft }));
		act(() => result.current.triggerSwipe("left"));
		act(() => result.current.dragHandlers.onAnimationComplete());
		expect(onSwipeLeft).toHaveBeenCalledOnce();
	});

	it("calls onSwipeRight after right dismiss and animation complete", () => {
		const onSwipeRight = vi.fn();
		const { result } = renderHook(() => useSwipeGesture({ onSwipeRight }));
		act(() => result.current.triggerSwipe("right"));
		act(() => result.current.dragHandlers.onAnimationComplete());
		expect(onSwipeRight).toHaveBeenCalledOnce();
	});

	it("calls onSwipeUp after up dismiss and animation complete", () => {
		const onSwipeUp = vi.fn();
		const { result } = renderHook(() => useSwipeGesture({ onSwipeUp }));
		act(() => result.current.triggerSwipe("up"));
		act(() => result.current.dragHandlers.onAnimationComplete());
		expect(onSwipeUp).toHaveBeenCalledOnce();
	});

	it("calls onSwipeDown after down dismiss and animation complete", () => {
		const onSwipeDown = vi.fn();
		const { result } = renderHook(() =>
			useSwipeGesture({ enabledDirections: ["down"], onSwipeDown }),
		);
		act(() => result.current.triggerSwipe("down"));
		act(() => result.current.dragHandlers.onAnimationComplete());
		expect(onSwipeDown).toHaveBeenCalledOnce();
	});

	it("does not call any callback when animation completes before dismiss", () => {
		const onSwipeLeft = vi.fn();
		const onSwipeRight = vi.fn();
		const { result } = renderHook(() =>
			useSwipeGesture({ onSwipeLeft, onSwipeRight }),
		);
		act(() => result.current.dragHandlers.onAnimationComplete());
		expect(onSwipeLeft).not.toHaveBeenCalled();
		expect(onSwipeRight).not.toHaveBeenCalled();
	});

	// --- handleDragEnd integration ---

	it("handleDragEnd triggers dismiss for a sufficient left swipe", () => {
		const { result } = renderHook(() => useSwipeGesture());
		const fakeEvent = new MouseEvent("pointerup");
		const panInfo = {
			delta: { x: 0, y: 0 },
			offset: { x: -100, y: 0 },
			point: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
		};
		act(() =>
			result.current.dragHandlers.onDragEnd(fakeEvent, panInfo as never),
		);
		expect(result.current.isDismissed).toBe(true);
	});

	it("handleDragEnd does not dismiss for a small swipe below threshold", () => {
		const { result } = renderHook(() => useSwipeGesture());
		const fakeEvent = new MouseEvent("pointerup");
		const panInfo = {
			delta: { x: 0, y: 0 },
			offset: { x: -20, y: 0 },
			point: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
		};
		act(() =>
			result.current.dragHandlers.onDragEnd(fakeEvent, panInfo as never),
		);
		expect(result.current.isDismissed).toBe(false);
	});
});
