import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	getThreadByIdService,
	getThreadsService,
	sendThreadMessageService,
} from "#/core/services/thread.service";
import type { Message, SendMessagePayload } from "#/core/types/chat.types";

/** Inbox — short-polls so new leads/messages surface without a WebSocket. */
export const useGetThreadsQuery = () =>
	useQuery({
		queryKey: ["threads"],
		queryFn: ({ signal }) => getThreadsService({ signal }),
		staleTime: 1000 * 10,
		refetchInterval: 1000 * 10,
		refetchOnWindowFocus: true,
	});

/** Open conversation — polls faster while mounted for a near-live feel. */
export const useGetThreadByIdQuery = (id: string | null) =>
	useQuery({
		queryKey: ["thread", id],
		queryFn: ({ signal }) => getThreadByIdService({ id: id!, signal }),
		enabled: !!id,
		staleTime: 1000 * 4,
		refetchInterval: id ? 1000 * 4 : false,
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
