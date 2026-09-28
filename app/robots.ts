import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = (
		process.env.NEXT_PUBLIC_URL || "http://localhost:7743"
	).replace(/\/$/, "");
	return {
		rules: [
			{
				allow: "/",
				disallow: ["/admin", "/api/"],
				userAgent: "*",
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
