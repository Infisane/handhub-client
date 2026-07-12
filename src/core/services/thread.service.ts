import { getRequestData, request } from "#/core/helpers/axios.helper";
import type {
	Message,
	SendMessagePayload,
	ThreadDetail,
	ThreadSummary,
} from "#/core/types/chat.types";

export const getThreadsService = ({ signal }: { signal?: AbortSignal } = {}) =>
	getRequestData<ThreadSummary[]>(request.get("/api/threads", { signal }));

export const getThreadByIdService = ({
	id,
	signal,
}: {
	id: string;
	signal?: AbortSignal;
}) =>
	getRequestData<ThreadDetail>(request.get(`/api/threads/${id}`, { signal }));

/** Send to a provider by provider-profile id. Creates the thread + first
 *  ticket on first use. Returns the persisted message (delivery receipt). */
export const sendThreadMessageService = ({
	providerId,
	payload,
	signal,
}: {
	providerId: string;
	payload: SendMessagePayload;
	signal?: AbortSignal;
}) =>
	getRequestData<Message>(
		request.post(`/api/threads/${providerId}/messages`, payload, { signal }),
	);
