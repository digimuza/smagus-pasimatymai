import withPWAInit from "@ducanh2912/next-pwa";
import withPayload from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

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
};

export default withPayload(withNextIntl(withPWA(nextConfig)));
