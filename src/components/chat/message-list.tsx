import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatSide } from "#/core/helpers/chat-phase.helper";
import type { Message } from "#/core/types/chat.types";
import { MessageBubble } from "./message-bubble";
import { SystemCard } from "./system-card";

/** How close (px) to the bottom still counts as "stuck to bottom". */
const NEAR_BOTTOM_PX = 120;

function initialsOf(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");
}

export function MessageList({
	messages,
	currentUserId,
	counterpartName,
	threadId,
	ticketId,
	side,
}: {
	messages: Message[];
	currentUserId: string | null;
	counterpartName: string;
	threadId: string;
	ticketId: string;
	side: ChatSide;
}) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showJump, setShowJump] = useState(false);

	const isNearBottom = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return true;
		return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
	}, []);

	const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior });
		setShowJump(false);
	}, []);

	// Opening/switching a conversation: jump to the newest message instantly.
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset scroll per conversation
	useEffect(() => {
		scrollToBottom("auto");
	}, [threadId, ticketId, scrollToBottom]);

	// New message arrived (or one was sent): stick to the bottom when the viewer
	// is already there or sent it; otherwise surface a "jump to latest" pill so we
	// don't yank them away from history they're reading.
	const lastMessage = messages[messages.length - 1];
	const lastMessageId = lastMessage?.id;
	const lastIsMine = !!currentUserId && lastMessage?.senderId === currentUserId;
	// biome-ignore lint/correctness/useExhaustiveDependencies: fire on new last message
	useEffect(() => {
		if (!lastMessageId) return;
		if (lastIsMine || isNearBottom()) {
			scrollToBottom("smooth");
		} else {
			setShowJump(true);
		}
	}, [lastMessageId]);

	const counterpartInitials = initialsOf(counterpartName || "?");

	return (
		<div className="relative flex-1 min-h-0">
			<div
				ref={scrollRef}
				onScroll={() => {
					if (isNearBottom()) setShowJump(false);
				}}
				className="h-full overflow-y-auto p-5 space-y-3 scrollbar-none"
			>
				<div className="mx-auto max-w-sm bg-blue-50/70 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-3 text-center text-[11px] text-blue-700 dark:text-blue-400 font-medium">
					To protect your payment, always book and pay through Handhub. Keep
					communication on the app.
				</div>

				{messages.map((message) => {
					if (message.type === "system") {
						return (
							<SystemCard
								key={message.id}
								message={message}
								threadId={threadId}
								ticketId={ticketId}
								side={side}
							/>
						);
					}
					return (
						<MessageBubble
							key={message.id}
							message={message}
							isMine={!!currentUserId && message.senderId === currentUserId}
							senderInitials={counterpartInitials}
						/>
					);
				})}
			</div>

			{showJump && (
				<button
					type="button"
					onClick={() => scrollToBottom("smooth")}
					className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--dashboard-orange)] text-white text-[11px] font-bold shadow-md shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2"
				>
					<ChevronDown size={13} className="stroke-[2.5]" /> New messages
				</button>
			)}
		</div>
	);
}
