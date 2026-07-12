import { useMutation, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import { createReviewService } from "#/core/services/review.service";
import type { CreateReviewPayload, Review } from "#/core/types/chat.types";

/** Customer — on success the ticket auto-transitions to `closed`. */
export const useCreateReviewQuery = ({
	threadId,
	ticketId,
	onSuccessCallback,
}: {
	threadId: string;
	ticketId: string;
	onSuccessCallback?: (review: Review) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateReviewPayload) =>
			createReviewService({ payload, signal: abortController.signal }),
		onSuccess: (review) => {
			queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
			queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
			queryClient.invalidateQueries({ queryKey: ["threads"] });
			onSuccessCallback?.(review);
		},
	});
};
