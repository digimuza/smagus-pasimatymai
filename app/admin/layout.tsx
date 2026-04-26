import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { players } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "auth-token";

function getAdminEmails(): string[] {
	return (process.env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}

async function requireAdmin() {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_NAME)?.value;
	if (!token) redirect("/");

	try {
		const { id } = await verifyToken(token);
		const [player] = await db
			.select({ email: players.email })
			.from(players)
			.where(eq(players.id, id))
			.limit(1);

		if (!player) redirect("/");

		const adminEmails = getAdminEmails();
		if (!adminEmails.includes(player.email.toLowerCase())) redirect("/");
	} catch {
		redirect("/");
	}
}

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await requireAdmin();

	return (
		<div className="min-h-screen bg-gray-950 text-gray-100">
			<nav className="border-b border-gray-800 bg-gray-900 px-6 py-4">
				<div className="mx-auto flex max-w-7xl items-center gap-6">
					<span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
						Admin
					</span>
					<a
						href="/admin/questions"
						className="text-sm text-gray-300 hover:text-white transition-colors"
					>
						Questions
					</a>
					<a
						href="/admin/analytics"
						className="text-sm text-gray-300 hover:text-white transition-colors"
					>
						Analytics
					</a>
				</div>
			</nav>
			<main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
		</div>
	);
}
