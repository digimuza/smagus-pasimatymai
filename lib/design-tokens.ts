// Design Tokens — single source of truth for the design system
// Referenced by tailwind.config.ts and used directly in components

export const colors = {
	accent: {
		DEFAULT: "#fb7185",
		dark: "#f43f5e",
		light: "#fda4af",
	},
	background: {
		DEFAULT: "#0f0818",
		light: "#1a1025",
		lighter: "#251832",
	},
	info: "#60a5fa",
	mode: {
		couples: {
			DEFAULT: "#9B59B6",
			dark: "#7D3C98",
			light: "#BB8FCE",
		},
		family: {
			DEFAULT: "#3498DB",
			dark: "#2471A3",
			light: "#7FB3D8",
		},
		friends: {
			DEFAULT: "#E67E22",
			dark: "#CA6F1E",
			light: "#F0B27A",
		},
	},
	primary: {
		DEFAULT: "#c084fc",
		dark: "#a855f7",
		light: "#d8b4fe",
	},
	success: "#34d399",
	text: {
		DEFAULT: "#f3e8ff",
		dimmed: "#a78bfa",
		muted: "#c4b5fd",
	},
	warning: "#fbbf24",
} as const;

export const spacing = {
	0: "0px",
	1: "4px",
	2: "8px",
	3: "12px",
	4: "16px",
	5: "20px",
	6: "24px",
	8: "32px",
	10: "40px",
	12: "48px",
	16: "64px",
	20: "80px",
} as const;

export const radii = {
	full: "9999px",
	lg: "16px",
	md: "12px",
	sm: "8px",
	xl: "24px",
} as const;

export const shadows = {
	glow: {
		accent: `0 4px 20px ${colors.accent.DEFAULT}25`,
		primary: `0 4px 20px ${colors.primary.DEFAULT}25`,
	},
	lg: "0 8px 32px rgba(0, 0, 0, 0.4)",
	md: "0 4px 16px rgba(0, 0, 0, 0.3)",
	sm: "0 2px 8px rgba(0, 0, 0, 0.2)",
} as const;

export const typography = {
	body: {
		fontSize: "1rem",
		fontWeight: "400",
		lineHeight: "1.6",
	},
	caption: {
		fontSize: "0.875rem",
		fontWeight: "400",
		lineHeight: "1.4",
	},
	heading: {
		fontSize: "2rem",
		fontWeight: "700",
		lineHeight: "1.2",
	},
	subheading: {
		fontSize: "1.5rem",
		fontWeight: "300",
		lineHeight: "1.3",
	},
} as const;
