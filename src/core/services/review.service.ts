import { getRequestData, request } from "#/core/helpers/axios.helper";
import type { CreateReviewPayload, Review } from "#/core/types/chat.types";

export const getMyReviewsService = ({
	signal,
}: {
	signal?: AbortSignal;
} = {}) => getRequestData<Review[]>(request.get("/api/reviews/me", { signal }));

/** Customer — requires booking `completed` and its invoice `paid`.
 *  On success the ticket auto-transitions to `closed`. */
export const createReviewService = ({
	payload,
	signal,
}: {
	payload: CreateReviewPayload;
	signal?: AbortSignal;
}) => getRequestData<Review>(request.post("/api/reviews", payload, { signal }));
