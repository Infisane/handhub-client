import { Send } from "lucide-react";
import { useState } from "react";
import { cn } from "#/lib/utils.ts";

const DEFAULT_QUICK_REPLIES = [
	"On my way now!",
	"Can we reschedule?",
	"Perfect, thank you!",
	"Please send details.",
];

export function MessageComposer({
	onSend,
	disabled = false,
	placeholder = "Type a message…",
	quickReplies = DEFAULT_QUICK_REPLIES,
	showQuickReplies = true,
}: {
	onSend: (text: string) => void;
	disabled?: boolean;
	placeholder?: string;
	quickReplies?: string[];
	showQuickReplies?: boolean;
}) {
	const [text, setText] = useState("");

	const submit = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed || disabled) return;
		onSend(trimmed);
		setText("");
	};

	return (
		<div className="bg-[var(--dashboard-card)] border-t border-[var(--dashboard-border)] p-4 space-y-3">
			{showQuickReplies && (
				<div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
					{quickReplies.map((reply) => (
						<button
							key={reply}
							type="button"
							onClick={() => submit(reply)}
							disabled={disabled}
							className="px-3.5 py-1.5 rounded-full bg-[var(--dashboard-bg)] hover:bg-[var(--dashboard-orange-light)] hover:text-[var(--dashboard-orange)] border border-[var(--dashboard-border)]/50 text-[11px] font-bold text-[var(--dashboard-muted)] whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50"
						>
							{reply}
						</button>
					))}
				</div>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault();
					submit(text);
				}}
				className="flex gap-2"
			>
				<input
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder={placeholder}
					className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-1 focus:ring-[var(--dashboard-orange)]/15 transition-all shadow-xs"
				/>
				<button
					type="submit"
					disabled={!text.trim() || disabled}
					className={cn(
						"w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 transition-all shadow-xs",
						text.trim() && !disabled
							? "bg-[var(--dashboard-orange)] hover:bg-blue-600 active:scale-95 cursor-pointer"
							: "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed border border-neutral-200 dark:border-neutral-700/50",
					)}
					aria-label="Send message"
				>
					<Send size={15} className="stroke-[2.5]" />
				</button>
			</form>
		</div>
	);
}
