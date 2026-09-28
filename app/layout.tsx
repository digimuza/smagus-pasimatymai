import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Santykių Klausimai",
	},
	manifest: "/manifest.json",
	metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:7743"),
};

export const viewport: Viewport = {
	initialScale: 1,
	themeColor: "#c084fc",
	width: "device-width",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
