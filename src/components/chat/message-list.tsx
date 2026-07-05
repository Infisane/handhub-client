import { useEffect, useRef } from "react";
import type { ChatSide } from "#/core/helpers/chat-phase.helper";
import type { Message } from "#/core/types/chat.types";
import { MessageBubble } from "./message-bubble";
import { SystemCard } from "./system-card";

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
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const counterpartInitials = initialsOf(counterpartName || "?");

	return (
		<div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-none">
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
			<div ref={endRef} />
		</div>
	);
}
