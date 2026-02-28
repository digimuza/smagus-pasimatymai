import type { MetadataRoute } from "next";

const BASE_URL = "https://santykiuklausimai.lt";

const routes = [
	"",
	"/audience",
	"/game",
	"/categories",
	"/settings",
	"/awesome",
];

export default function sitemap(): MetadataRoute.Sitemap {
	const ltRoutes = routes.map((route) => ({
		changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
		lastModified: new Date(),
		priority: route === "" ? 1.0 : 0.7,
		url: `${BASE_URL}${route}`,
	}));

	const enRoutes = routes.map((route) => ({
		changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
		lastModified: new Date(),
		priority: route === "" ? 0.9 : 0.6,
		url: `${BASE_URL}/en${route}`,
	}));

	return [...ltRoutes, ...enRoutes];
}
