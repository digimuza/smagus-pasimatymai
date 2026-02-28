"use client";

interface PageLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
	return (
		<div className={`flex min-h-screen flex-col bg-background ${className}`}>
			{children}
		</div>
	);
}

interface PageContentProps {
	centered?: boolean;
	children: React.ReactNode;
	className?: string;
}

export function PageContent({
	children,
	centered = false,
	className = "",
}: PageContentProps) {
	return (
		<main
			className={`flex-1 overflow-y-auto p-6 ${
				centered ? "flex flex-col items-center justify-center" : ""
			} ${className}`}
		>
			<div className="mx-auto w-full max-w-2xl space-y-8">{children}</div>
		</main>
	);
}
