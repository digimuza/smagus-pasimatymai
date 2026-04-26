import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Santykių Klausimai",
	},
	icons: {
		apple: "/apple-touch-icon.png",
		icon: [
			{ sizes: "192x192", url: "/icons/icon-192x192.png" },
			{ sizes: "512x512", url: "/icons/icon-512x512.png" },
		],
	},
	manifest: "/manifest.json",
};

export const viewport: Viewport = {
	initialScale: 1,
	maximumScale: 1,
	themeColor: "#c084fc",
	userScalable: false,
	width: "device-width",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
