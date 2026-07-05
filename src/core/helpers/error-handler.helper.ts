import { isAxiosError } from "axios";
import { toast } from "sonner";

export class ErrorHandler {
	static parser(error: unknown) {
		// 400 validation failures return `message` as an array of strings; the
		// global filter otherwise sends a single string. Handle both.
		const raw = isAxiosError<{ message?: string | string[] }>(error)
			? error.response?.data?.message
			: undefined;
		const message = Array.isArray(raw) ? raw.join("\n") : raw;
		toast.error(message ?? "Something went wrong. Please try again.");
	}
}
