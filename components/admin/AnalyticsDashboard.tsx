"use client";

import type React from "react";
import { useState } from "react";

export type DateRange = "7d" | "30d" | "all";

export interface QuestionStat {
	id: number;
	question: string;
	views: number;
	skips: number;
	answers: number;
	superlikes: number;
	skipRate: number;
	answerRate: number;
}

type SortKey = keyof Omit<QuestionStat, "id">;
type SortDir = "asc" | "desc";

interface Props {
	data: QuestionStat[];
	currentRange: DateRange;
}

const COLUMNS: Array<{ key: SortKey; label: string }> = [
	{ key: "question", label: "Question" },
	{ key: "views", label: "Views" },
	{ key: "skips", label: "Skips" },
	{ key: "answers", label: "Answers" },
	{ key: "superlikes", label: "Super-likes" },
	{ key: "skipRate", label: "Skip Rate %" },
	{ key: "answerRate", label: "Answer Rate %" },
];

const RANGE_LABELS: Record<DateRange, string> = {
	"7d": "Last 7 days",
	"30d": "Last 30 days",
	all: "All time",
};

export default function AnalyticsDashboard({ data, currentRange }: Props) {
	const [sortKey, setSortKey] = useState<SortKey>("views");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir("desc");
		}
	};

	const sorted = [...data].sort((a, b) => {
		const av = a[sortKey];
		const bv = b[sortKey];
		if (typeof av === "string" && typeof bv === "string") {
			return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
		}
		return sortDir === "asc"
			? Number(av) - Number(bv)
			: Number(bv) - Number(av);
	});

	const exportCSV = () => {
		const headers = [
			"ID",
			"Question",
			"Views",
			"Skips",
			"Answers",
			"Super-likes",
			"Skip Rate %",
			"Answer Rate %",
		];
		const rows = sorted.map((r) => [
			r.id,
			`"${r.question.replace(/"/g, '""')}"`,
			r.views,
			r.skips,
			r.answers,
			r.superlikes,
			r.skipRate,
			r.answerRate,
		]);
		const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
			"\n",
		);
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `question-analytics-${currentRange}-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const arrow = (key: SortKey) =>
		sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

	return (
		<div>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-semibold">Question Analytics</h1>
					<p className="mt-1 text-sm text-gray-400">
						{data.length} question{data.length !== 1 ? "s" : ""} with recorded
						events
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{(["7d", "30d", "all"] as DateRange[]).map((r) => (
						<a
							key={r}
							href={`/admin/analytics?range=${r}`}
							className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
								currentRange === r
									? "bg-indigo-600 text-white"
									: "border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
							}`}
						>
							{RANGE_LABELS[r]}
						</a>
					))}

					<button
						onClick={exportCSV}
						type="button"
						disabled={data.length === 0}
						className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Export CSV
					</button>
				</div>
			</div>

			{data.length === 0 ? (
				<div className="rounded-lg border border-gray-800 p-10 text-center text-gray-500">
					No data available for the selected period.
				</div>
			) : (
				<div className="overflow-hidden rounded-lg border border-gray-800">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-800/50 text-left text-xs uppercase tracking-wider text-gray-400">
								<tr>
									{COLUMNS.map(({ key, label }) => (
										<th
											key={key}
											onClick={() => handleSort(key)}
											className={`cursor-pointer select-none px-4 py-3 whitespace-nowrap hover:text-gray-200 transition-colors ${
												sortKey === key ? "text-indigo-300" : ""
											}`}
										>
											{label}
											{arrow(key)}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-800">
								{sorted.map((row) => (
									<tr
										key={row.id}
										className="hover:bg-gray-800/40 transition-colors"
									>
										<td
											className="max-w-xs truncate px-4 py-3 text-gray-200"
											title={row.question}
										>
											{row.question}
										</td>
										<td className="px-4 py-3 text-gray-300">
											{row.views.toLocaleString()}
										</td>
										<td className="px-4 py-3 text-gray-300">
											{row.skips.toLocaleString()}
										</td>
										<td className="px-4 py-3 text-gray-300">
											{row.answers.toLocaleString()}
										</td>
										<td className="px-4 py-3 text-gray-300">
											{row.superlikes.toLocaleString()}
										</td>
										<td
											className={`px-4 py-3 font-medium ${
												row.skipRate > 50
													? "text-red-400"
													: row.skipRate > 25
														? "text-yellow-400"
														: "text-gray-300"
											}`}
										>
											{row.skipRate}%
										</td>
										<td
											className={`px-4 py-3 font-medium ${
												row.answerRate > 50
													? "text-emerald-400"
													: row.answerRate > 25
														? "text-yellow-400"
														: "text-gray-300"
											}`}
										>
											{row.answerRate}%
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
