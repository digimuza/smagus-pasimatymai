import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

// Mock Next.js modules that aren't available outside the Next.js runtime
vi.mock("next/navigation", () => ({
	usePathname: () => "/",
	useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
	useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/headers", () => ({
	cookies: () => ({ get: () => null }),
	headers: () => new Headers(),
}));
