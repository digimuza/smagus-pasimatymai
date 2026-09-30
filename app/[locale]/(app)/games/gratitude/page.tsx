"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { GamePicker, GameShell } from "@/components/games";
import { Button } from "@/components/ui";
import { useGameStorage } from "@/hooks/useGameStorage";
import { useHaptic } from "@/hooks/useHaptic";
import { pickRandom, uid } from "@/lib/games/gameUtils";
import {
	DEFAULT_AUTHOR_A,
	DEFAULT_AUTHOR_B,
	GRATITUDE_PROMPTS,
} from "@/lib/games/gratitudeData";
import type { GratitudeNote, PlayerSlot } from "@/types/games";

type Phase = "compose" | "read" | "settings";

type Settings = {
	authorA: string;
	authorB: string;
};

const PROMPT_COLOR = "#f59e0b";

export default function GratitudePage() {
	const t = useTranslations("games.gratitude");
	const { vibrate } = useHaptic();

	const [notes, setNotes] = useGameStorage<GratitudeNote[]>(
		"gratitude-notes",
		[],
	);
	const [settings, setSettings] = useGameStorage<Settings>(
		"gratitude-settings",
		{
			authorA: DEFAULT_AUTHOR_A,
			authorB: DEFAULT_AUTHOR_B,
		},
	);

	const [phase, setPhase] = useState<Phase>("compose");
	const [draft, setDraft] = useState("");
	const [authorSlot, setAuthorSlot] = useState<PlayerSlot>("A");
	const [drawnNote, setDrawnNote] = useState<GratitudeNote | null>(null);

	const author = authorSlot === "A" ? settings.authorA : settings.authorB;

	const addNote = () => {
		const text = draft.trim();
		if (!text) return;
		vibrate("medium");
		const note: GratitudeNote = {
			author,
			authoredAt: new Date().toISOString(),
			id: uid(),
			text,
		};
		setNotes((prev) => [note, ...prev]);
		setDraft("");
	};

	const removeNote = (id: string) => {
		setNotes((prev) => prev.filter((n) => n.id !== id));
	};

	const drawRandom = () => {
		const n = pickRandom(notes);
		if (!n) return;
		vibrate("light");
		setDrawnNote(n);
	};

	const prompt = useMemo(() => pickRandom(GRATITUDE_PROMPTS), []);

	const renderCompose = () => (
		<div className="flex flex-1 flex-col p-6">
			{/* Author switcher */}
			<div className="mb-4 grid grid-cols-2 gap-3">
				{(["A", "B"] as PlayerSlot[]).map((slot) => {
					const isActive = authorSlot === slot;
					const name = slot === "A" ? settings.authorA : settings.authorB;
					return (
						<button
							className={`rounded-xl border-2 p-3 font-medium transition-all ${
								isActive
									? "border-accent bg-accent/20"
									: "border-primary/20 bg-background-light hover:border-primary/40"
							}`}
							key={slot}
							onClick={() => setAuthorSlot(slot)}
							type="button"
						>
							<div className="mb-1 text-2xl">{slot === "A" ? "🅰️" : "🅱️"}</div>
							<div className="text-sm text-text">{name}</div>
							{isActive && <div className="mt-1 text-accent text-xs">✓</div>}
						</button>
					);
				})}
			</div>

			{/* Prompt */}
			<div
				className="mb-3 rounded-xl border p-3 text-sm italic"
				style={{
					backgroundColor: `${PROMPT_COLOR}10`,
					borderColor: `${PROMPT_COLOR}40`,
					color: PROMPT_COLOR,
				}}
			>
				💡 {prompt}
			</div>

			{/* Textarea */}
			<textarea
				className="mb-4 min-h-[160px] w-full resize-none rounded-xl border-2 border-primary/30 bg-background-light p-4 font-light text-lg text-text leading-relaxed placeholder:text-text-muted/50 focus:border-primary focus:outline-none"
				maxLength={500}
				onChange={(e) => setDraft(e.target.value)}
				placeholder={t("placeholder", { author })}
				value={draft}
			/>

			<div className="mb-4 flex items-center justify-between text-text-muted text-xs">
				<span>{t("privateHint")}</span>
				<span>{draft.length} / 500</span>
			</div>

			<Button
				disabled={!draft.trim()}
				fullWidth
				onClick={addNote}
				size="lg"
				variant="primary"
			>
				💌 {t("save", { author })}
			</Button>

			{/* Tab switcher */}
			<div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-background-light p-1">
				{(["compose", "read", "settings"] as Phase[]).map((p) => (
					<button
						className={`rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
							phase === p
								? "bg-primary text-background"
								: "text-primary hover:bg-primary/10"
						}`}
						key={p}
						onClick={() => setPhase(p)}
						type="button"
					>
						{t(`tabs.${p}`)}
					</button>
				))}
			</div>

			<GamePicker />
		</div>
	);

	const renderRead = () => {
		const filtered = notes;
		return (
			<div className="flex flex-1 flex-col p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-light text-2xl text-primary">{t("jarTitle")}</h2>
					{notes.length > 0 && (
						<button
							className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-medium text-accent text-sm"
							onClick={drawRandom}
							type="button"
						>
							🎲 {t("drawRandom")}
						</button>
					)}
				</div>

				{notes.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center text-center">
						<div className="mb-4 text-6xl">🫙</div>
						<p className="mb-2 text-text">{t("empty")}</p>
						<p className="max-w-xs text-sm text-text-muted">{t("emptyHint")}</p>
					</div>
				) : (
					<div className="flex-1 space-y-3 overflow-y-auto pb-4">
						{filtered.map((note, i) => (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="rounded-xl border border-primary/20 bg-background-light p-4 shadow-sm"
								initial={{ opacity: 0, y: 10 }}
								key={note.id}
								transition={{ delay: i * 0.03 }}
							>
								<div className="mb-2 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="rounded-full bg-accent/20 px-2 py-0.5 font-medium text-accent text-xs">
											{note.author}
										</span>
										<span className="text-text-muted text-xs">
											{new Date(note.authoredAt).toLocaleDateString("lt-LT", {
												day: "numeric",
												month: "short",
											})}
										</span>
									</div>
									<button
										className="text-text-muted text-xs hover:text-accent"
										onClick={() => removeNote(note.id)}
										type="button"
									>
										✕
									</button>
								</div>
								<p className="whitespace-pre-wrap text-text">{note.text}</p>
							</motion.div>
						))}
					</div>
				)}

				<div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-background-light p-1">
					{(["compose", "read", "settings"] as Phase[]).map((p) => (
						<button
							className={`rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
								phase === p
									? "bg-primary text-background"
									: "text-primary hover:bg-primary/10"
							}`}
							key={p}
							onClick={() => setPhase(p)}
							type="button"
						>
							{t(`tabs.${p}`)}
						</button>
					))}
				</div>

				<GamePicker />
			</div>
		);
	};

	const renderSettings = () => (
		<div className="flex flex-1 flex-col p-6">
			<h2 className="mb-4 font-light text-2xl text-primary">
				{t("settingsTitle")}
			</h2>
			<p className="mb-6 text-sm text-text-muted">{t("settingsHint")}</p>

			<div className="mb-4">
				<label
					className="mb-2 block font-medium text-primary text-sm"
					htmlFor="authorA"
				>
					{t("authorALabel")}
				</label>
				<input
					className="w-full rounded-xl border-2 border-primary/30 bg-background-light p-3 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none"
					id="authorA"
					maxLength={20}
					onChange={(e) =>
						setSettings((prev) => ({ ...prev, authorA: e.target.value }))
					}
					placeholder={DEFAULT_AUTHOR_A}
					value={settings.authorA}
				/>
			</div>

			<div className="mb-6">
				<label
					className="mb-2 block font-medium text-primary text-sm"
					htmlFor="authorB"
				>
					{t("authorBLabel")}
				</label>
				<input
					className="w-full rounded-xl border-2 border-primary/30 bg-background-light p-3 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none"
					id="authorB"
					maxLength={20}
					onChange={(e) =>
						setSettings((prev) => ({ ...prev, authorB: e.target.value }))
					}
					placeholder={DEFAULT_AUTHOR_B}
					value={settings.authorB}
				/>
			</div>

			{notes.length > 0 && (
				<div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 p-4">
					<p className="mb-2 font-medium text-accent text-sm">
						{t("dangerZone")}
					</p>
					<Button
						fullWidth
						onClick={() => {
							if (confirm(t("confirmClear"))) setNotes([]);
						}}
						variant="danger"
					>
						{t("clearAll")}
					</Button>
				</div>
			)}

			<div className="mt-auto grid grid-cols-3 gap-2 rounded-xl bg-background-light p-1">
				{(["compose", "read", "settings"] as Phase[]).map((p) => (
					<button
						className={`rounded-lg px-3 py-2 font-medium text-sm transition-colors ${
							phase === p
								? "bg-primary text-background"
								: "text-primary hover:bg-primary/10"
						}`}
						key={p}
						onClick={() => setPhase(p)}
						type="button"
					>
						{t(`tabs.${p}`)}
					</button>
				))}
			</div>

			<GamePicker />
		</div>
	);

	return (
		<GameShell accentColor="#f59e0b" icon="🙏" title={t("title")}>
			<AnimatePresence mode="wait">
				<motion.div
					animate={{ opacity: 1 }}
					className="flex flex-1 flex-col"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key={phase}
				>
					{phase === "compose" && renderCompose()}
					{phase === "read" && renderRead()}
					{phase === "settings" && renderSettings()}
				</motion.div>
			</AnimatePresence>

			{/* Random draw modal */}
			<AnimatePresence>
				{drawnNote && (
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={() => setDrawnNote(null)}
					>
						<motion.div
							animate={{ rotateY: 0, scale: 1 }}
							className="w-full max-w-md rounded-2xl border-2 border-accent/40 bg-background-light p-8 text-center shadow-2xl"
							initial={{ rotateY: 180, scale: 0.5 }}
							onClick={(e) => e.stopPropagation()}
							transition={{ damping: 15, type: "spring" }}
						>
							<p className="mb-3 font-medium text-accent text-sm uppercase tracking-wider">
								{t("from")} {drawnNote.author}
							</p>
							<p className="whitespace-pre-wrap font-light text-2xl text-text leading-relaxed">
								“{drawnNote.text}”
							</p>
							<p className="mt-4 text-text-muted text-xs">
								{new Date(drawnNote.authoredAt).toLocaleDateString("lt-LT")}
							</p>
							<button
								className="mt-6 rounded-full border border-primary/30 px-6 py-2 font-medium text-primary text-sm hover:bg-primary/10"
								onClick={() => setDrawnNote(null)}
								type="button"
							>
								{t("close")}
							</button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</GameShell>
	);
}
