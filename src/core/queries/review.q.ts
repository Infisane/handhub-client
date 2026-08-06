import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	createReviewService,
	getMyReviewsService,
} from "#/core/services/review.service";
import type { CreateReviewPayload, Review } from "#/core/types/chat.types";

export const useGetMyReviewsQuery = () =>
	useQuery({
		queryKey: ["reviews", "me"],
		queryFn: ({ signal }) => getMyReviewsService({ signal }),
		staleTime: 1000 * 30,
	});

/** Customer — on success the ticket auto-transitions to `closed` (when the
 *  booking came from a chat ticket). threadId/ticketId are optional since a
 *  booking created directly via POST /api/bookings has neither. */
export const useCreateReviewQuery = ({
	threadId,
	ticketId,
	onSuccessCallback,
}: {
	threadId?: string;
	ticketId?: string;
	onSuccessCallback?: (review: Review) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateReviewPayload) =>
			createReviewService({ payload, signal: abortController.signal }),
		onSuccess: (review) => {
			if (threadId)
				queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			if (ticketId)
				queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			queryClient.invalidateQueries({ queryKey: ["reviews", "me"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			onSuccessCallback?.(review);
		},
	});
};
