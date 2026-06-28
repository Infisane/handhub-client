import { isAxiosError } from "axios";
import { toast } from "sonner";

export class ErrorHandler {
	static parser(error: unknown) {
		const message = isAxiosError<{ message?: string }>(error)
			? error.response?.data?.message
			: undefined;
		toast.error(message ?? "Something went wrong. Please try again.");
	}
}
