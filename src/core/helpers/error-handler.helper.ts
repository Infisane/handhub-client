import { isAxiosError } from "axios";
import { toast } from "sonner";

/** Extract the API error message (string | string[]) without toasting — useful
 *  for surfacing a server error inline on a field. */
export function getApiErrorMessage(error: unknown): string | undefined {
	const raw = isAxiosError<{ message?: string | string[] }>(error)
		? error.response?.data?.message
		: undefined;
	return Array.isArray(raw) ? raw.join("\n") : raw;
}

export class ErrorHandler {
	static parser(error: unknown) {
		// 400 validation failures return `message` as an array of strings; the
		// global filter otherwise sends a single string. Handle both.
		const message = getApiErrorMessage(error);
		toast.error(message ?? "Something went wrong. Please try again.");
	}
}
