import { useMemo } from "react";
import { type ChatSide, deriveChat } from "#/core/helpers/chat-phase.helper";
import { useAppSelector } from "#/core/hooks/useStore.hook";
import {
	useGetThreadByIdQuery,
	useSendThreadMessageQuery,
} from "#/core/queries/thread.q";
import { useSendTicketMessageQuery } from "#/core/queries/ticket.q";
import type { Message, Ticket } from "#/core/types/chat.types";

interface UseChatThreadArgs {
	/** An existing thread to open. */
	threadId?: string | null;
	/** Provider-profile id for a fresh conversation (no thread yet). */
	providerId?: string | null;
	/** Called with the real threadId once a fresh conversation is created. */
	onThreadResolved?: (threadId: string) => void;
}

/**
 * The shared chat consumption hook — backs BOTH the full-page messages view
 * and the dashboard drawer. Because both read the same query keys, a mutation
 * on one surface refreshes the other automatically.
 */
export const useChatThread = ({
	threadId,
	providerId,
	onThreadResolved,
}: UseChatThreadArgs) => {
	const user = useAppSelector((s) => s.authStore.user);

	const threadQuery = useGetThreadByIdQuery(threadId ?? null);
	const thread = threadQuery.data ?? null;

	// Active (latest) ticket drives phase + actions; tickets are oldest-first.
	const activeTicket: Ticket | null = useMemo(
		() =>
			thread?.tickets.length ? thread.tickets[thread.tickets.length - 1] : null,
		[thread],
	);

	// Flatten every ticket's messages for a continuous conversation history.
	const messages: Message[] = useMemo(() => {
		if (!thread) return [];
		return thread.tickets
			.flatMap((t) => t.messages)
			.slice()
			.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
			);
	}, [thread]);

	// Resolve the viewer's side by user id (membership is by id, not role).
	const side: ChatSide = useMemo(() => {
		if (!thread || !user) return "none";
		if (user.id === thread.provider.userId) return "provider";
		if (user.id === thread.initiatorId) return "initiator";
		return "none";
	}, [thread, user]);

	const { phase, actions, activeInvoice } = useMemo(
		() => deriveChat(activeTicket, side),
		[activeTicket, side],
	);

	// Two send paths, both instantiated unconditionally (hooks rules): reply on
	// an existing ticket, or open a brand-new thread by provider id.
	const ticketSend = useSendTicketMessageQuery({
		ticketId: activeTicket?.id ?? "",
		threadId: thread?.id ?? "",
	});
	const threadSend = useSendThreadMessageQuery({
		providerId: providerId ?? "",
		onSuccessCallback: (message) => {
			if (message.threadId) onThreadResolved?.(message.threadId);
		},
	});

	const sendMessage = (content: string) => {
		const trimmed = content.trim();
		if (!trimmed) return;
		if (thread && activeTicket) {
			ticketSend.mutate({ content: trimmed });
		} else if (providerId) {
			threadSend.mutate({ content: trimmed });
		}
	};

	return {
		user,
		thread,
		provider: thread?.provider ?? null,
		activeTicket,
		activeInvoice,
		messages,
		side,
		phase,
		actions,
		isLoading: threadQuery.isLoading,
		isSending: ticketSend.isPending || threadSend.isPending,
		sendMessage,
	};
};
