import withPWAInit from "@ducanh2912/next-pwa";
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const withPWA = withPWAInit({
	customWorkerSrc: "worker",
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
		{
			handler: "StaleWhileRevalidate",
			options: {
				cacheName: "static-assets",
				expiration: {
					maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
					maxEntries: 64,
				},
			},
			urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|otf)$/,
		},
		{
			handler: "NetworkFirst",
			options: {
				cacheName: "pages-cache",
				expiration: {
					maxAgeSeconds: 60 * 60 * 24, // 24 hours
					maxEntries: 32,
				},
				networkTimeoutSeconds: 10,
			},
			urlPattern: /^\/(lt|en)?\//,
		},
	],
	skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
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
				source: "/(.*)",
			},
		];
	},
	output: "standalone",
	reactStrictMode: true,
	async redirects() {
		return [
			{
				destination: "https://santykiuklausimai.lt/:path*",
				has: [{ type: "host", value: "www.santykiuklausimai.lt" }],
				permanent: true,
				source: "/:path*",
			},
		];
	},
};

export default withBundleAnalyzer(withNextIntl(withPWA(nextConfig)));
