import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import { isSocketLive } from "#/core/helpers/ws.helper";
import {
	getThreadByIdService,
	getThreadsService,
	sendThreadMessageService,
} from "#/core/services/thread.service";
import type { Message, SendMessagePayload } from "#/core/types/chat.types";

/** Inbox — fast fallback poll; while the WebSocket is live it drops to a slow
 *  heartbeat that keeps re-checking liveness (so a socket drop resumes fast
 *  polling) and reconciles anything a missed frame left stale. */
export const useGetThreadsQuery = () =>
	useQuery({
		queryKey: ["threads"],
		queryFn: ({ signal }) => getThreadsService({ signal }),
		staleTime: 1000 * 10,
		refetchInterval: () => (isSocketLive() ? 1000 * 60 : 1000 * 10),
		refetchOnWindowFocus: true,
	});

/** Open conversation — fast fallback poll; slow heartbeat while the socket is live. */
export const useGetThreadByIdQuery = (id: string | null) =>
	useQuery({
		queryKey: ["thread", id],
		queryFn: ({ signal }) => getThreadByIdService({ id: id!, signal }),
		enabled: !!id,
		staleTime: 1000 * 4,
		refetchInterval: () => (isSocketLive() ? 1000 * 60 : 1000 * 4),
		refetchOnWindowFocus: true,
	});

/** Send to a provider by provider-profile id (creates thread + ticket on
 *  first use). onSuccessCallback receives the persisted message so the caller
 *  can adopt the returned threadId/ticketId. */
export const useSendThreadMessageQuery = ({
	providerId,
	onSuccessCallback,
}: {
	providerId: string;
	onSuccessCallback?: (message: Message) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: SendMessagePayload) =>
			sendThreadMessageService({
				providerId,
				payload,
				signal: abortController.signal,
			}),
		onSuccess: (message) => {
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			if (message.threadId) {
				queryClient.invalidateQueries({
					queryKey: ["thread", message.threadId],
				});
			}
			onSuccessCallback?.(message);
		},
	});
};
