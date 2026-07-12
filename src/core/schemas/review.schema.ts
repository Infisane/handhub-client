import { z } from "zod";

export const ReviewSchema = z.object({
	rating: z.coerce
		.number()
		.min(1, "Please select a rating")
		.max(5, "Rating cannot exceed 5"),
	comment: z.string().max(1000, "Comment is too long").optional(),
});
export type ReviewForm = z.infer<typeof ReviewSchema>;
