import type { Config } from "tailwindcss";
import { colors, radii, shadows } from "./lib/design-tokens";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	corePlugins: {
		preflight: false,
	},
	plugins: [],
	theme: {
		extend: {
			borderRadius: {
				full: radii.full,
				lg: radii.lg,
				md: radii.md,
				sm: radii.sm,
				xl: radii.xl,
			},
			boxShadow: {
				"glow-accent": shadows.glow.accent,
				"glow-primary": shadows.glow.primary,
				lg: shadows.lg,
				md: shadows.md,
				sm: shadows.sm,
			},
			colors,
		},
	},
};

export default config;
