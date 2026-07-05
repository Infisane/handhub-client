import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import {
	connectChatSocket,
	disconnectChatSocket,
	type WsServerFrame,
} from "#/core/helpers/ws.helper";
import { useAppSelector } from "#/core/hooks/useStore.hook";
import type { Message, ThreadDetail } from "#/core/types/chat.types";

/** Append a live message into the cached thread, de-duped by id. If the ticket
 *  isn't in cache yet (a freshly opened ticket), fall back to a refetch. */
function patchThreadMessage(queryClient: QueryClient, message: Message) {
	const { threadId, ticketId } = message;
	if (!threadId) return;

	const existing = queryClient.getQueryData<ThreadDetail>(["thread", threadId]);
	if (!existing) return; // thread not open — inbox invalidation covers it

	const hasTicket = existing.tickets.some((t) => t.id === ticketId);
	if (!hasTicket) {
		queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
		return;
	}

	queryClient.setQueryData<ThreadDetail>(["thread", threadId], (old) => {
		if (!old) return old;
		return {
			...old,
			tickets: old.tickets.map((t) => {
				if (t.id !== ticketId) return t;
				if (t.messages.some((m) => m.id === message.id)) return t;
				return { ...t, messages: [...t.messages, message] };
			}),
		};
	});
}

function handleFrame(queryClient: QueryClient, frame: WsServerFrame) {
	switch (frame.type) {
		case "message":
			patchThreadMessage(queryClient, frame.payload);
			// Bump inbox preview/ordering + unread.
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			break;

		case "invoice":
			// Keep the interactive invoice card live, and refresh the open thread so
			// its invoice_issued system card appears.
			queryClient.setQueryData(["invoice", frame.payload.id], frame.payload);
			queryClient.invalidateQueries({ queryKey: ["thread"] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			break;

		case "booking_confirmed":
			queryClient.invalidateQueries({ queryKey: ["thread"] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			break;

		case "notification":
			if (frame.payload.type === "lead") {
				toast.message(frame.payload.title, { description: frame.payload.body });
			}
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			break;
	}
}

/**
 * Opens the chat WebSocket for the authenticated session and applies incoming
 * frames as cache patches. Mount once (dashboard shell). While the socket is
 * live, the thread/inbox queries suspend their REST polling (see thread.q.ts);
 * on reconnect we reconcile from REST since the DB is the source of truth.
 */
export function useChatSocket() {
	const token = useAppSelector((s) => s.authStore.token);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!token) return;

		connectChatSocket({
			token,
			onFrame: (frame) => handleFrame(queryClient, frame),
			onReady: () => {
				// REST wins on (re)connect — reconcile anything missed while offline.
				queryClient.invalidateQueries({ queryKey: ["threads"] });
				queryClient.invalidateQueries({ queryKey: ["thread"] });
			},
		});

		return () => disconnectChatSocket();
	}, [token, queryClient]);
}
