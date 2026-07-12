import { Sparkles } from "lucide-react";
import type { Message } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

function formatTime(iso: string) {
	return new Date(iso).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function MessageBubble({
	message,
	isMine,
	senderInitials,
}: {
	message: Message;
	isMine: boolean;
	senderInitials: string;
}) {
	const isAi = message.type === "ai";

	return (
		<div
			className={cn(
				"flex w-full mb-1 items-end gap-2.5",
				isMine ? "justify-end" : "justify-start",
			)}
		>
			{!isMine && (
				<div
					className={cn(
						"w-7 h-7 rounded-md flex items-center justify-center font-black text-[9.5px] shrink-0",
						isAi
							? "bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)]"
							: "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]",
					)}
				>
					{isAi ? <Sparkles size={13} /> : senderInitials}
				</div>
			)}

			<div
				className={cn(
					"max-w-[75%] rounded-2xl p-3.5 shadow-xs",
					isMine
						? "bg-[var(--dashboard-orange)] text-white rounded-br-none"
						: "bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[var(--dashboard-text)] rounded-bl-none",
				)}
			>
				{isAi && (
					<div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--dashboard-orange)] mb-1">
						<Sparkles size={10} /> HandHub Assistant
					</div>
				)}
				<p className="text-[12.5px] leading-relaxed font-medium whitespace-pre-wrap">
					{message.content}
				</p>
				<span
					className={cn(
						"text-[9px] block text-right mt-1.5 font-bold opacity-60",
						isMine ? "text-blue-100" : "text-[var(--dashboard-muted)]",
					)}
				>
					{formatTime(message.createdAt)}
				</span>
			</div>
		</div>
	);
}
