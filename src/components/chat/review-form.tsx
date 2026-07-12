import { Star, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateReviewQuery } from "#/core/queries/review.q";
import { ReviewSchema } from "#/core/schemas/review.schema";
import { cn } from "#/lib/utils.ts";

export function ReviewForm({
	bookingId,
	threadId,
	ticketId,
	onClose,
}: {
	bookingId: string;
	threadId: string;
	ticketId: string;
	onClose: () => void;
}) {
	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [comment, setComment] = useState("");
	const [error, setError] = useState<string | null>(null);

	const { mutate, isPending } = useCreateReviewQuery({
		threadId,
		ticketId,
		onSuccessCallback: () => {
			toast.success("Thanks for your review!");
			onClose();
		},
	});

	const handleSubmit = () => {
		const parsed = ReviewSchema.safeParse({ rating, comment });
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Please add a rating");
			return;
		}
		setError(null);
		mutate({ bookingId, rating: parsed.data.rating, comment: comment.trim() });
	};

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
			<div className="w-full sm:max-w-sm bg-[var(--dashboard-card)] rounded-t-2xl sm:rounded-2xl border border-[var(--dashboard-border)] shadow-2xl">
				<div className="flex items-center justify-between p-4 border-b border-[var(--dashboard-border)]">
					<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)]">
						Rate this job
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1.5 rounded-full hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]"
						aria-label="Close"
					>
						<X size={16} />
					</button>
				</div>

				<div className="p-4 space-y-4">
					<div className="flex justify-center gap-1.5">
						{[1, 2, 3, 4, 5].map((value) => (
							<button
								key={value}
								type="button"
								onClick={() => setRating(value)}
								onMouseEnter={() => setHover(value)}
								onMouseLeave={() => setHover(0)}
								aria-label={`${value} star${value > 1 ? "s" : ""}`}
							>
								<Star
									size={30}
									className={cn(
										"transition-colors",
										(hover || rating) >= value
											? "fill-amber-400 text-amber-400"
											: "text-[var(--dashboard-border)]",
									)}
								/>
							</button>
						))}
					</div>

					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Share how it went (optional)"
						rows={3}
						className="w-full px-3 py-2 rounded-lg bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-1 focus:ring-[var(--dashboard-orange)]/15 resize-none"
					/>

					{error && (
						<p className="text-[11.5px] text-red-500 font-medium">{error}</p>
					)}

					<button
						type="button"
						onClick={handleSubmit}
						disabled={isPending}
						className="w-full py-2.5 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white font-extrabold text-[12.5px] shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
					>
						{isPending ? "Submitting…" : "Submit Review"}
					</button>
				</div>
			</div>
		</div>
	);
}
