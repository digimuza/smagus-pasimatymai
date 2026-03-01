import bundleAnalyzer from "@next/bundle-analyzer";
import withPWAInit from "@ducanh2912/next-pwa";
import withPayload from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const withPWA = withPWAInit({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	register: true,
	runtimeCaching: [
		{
			handler: "NetworkFirst",
			options: {
				cacheName: "game-data-cache",
				expiration: {
					maxAgeSeconds: 300,
					maxEntries: 1,
				},
			},
			urlPattern: /\/api\/game-data/,
		},
	],
	skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Frame-Options", value: "DENY" },
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "Content-Security-Policy",
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
							"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
							"font-src 'self' https://fonts.gstatic.com",
							"img-src 'self' data: blob: https://*.googleusercontent.com",
							"connect-src 'self' https://api.stripe.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com",
							"frame-src https://js.stripe.com https://hooks.stripe.com",
							"object-src 'none'",
							"base-uri 'self'",
							"form-action 'self'",
						].join("; "),
					},
				],
			},
		];
	},
};

export default withBundleAnalyzer(withPayload(withNextIntl(withPWA(nextConfig))));
