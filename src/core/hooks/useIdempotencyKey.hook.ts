import { useRef } from "react";

/** Idempotency-Key lifecycle for a payment-initiating POST.
 *
 *  Reusing a key is what makes a retry after a timeout/cancel safe — the API
 *  replays the first attempt instead of creating a second transaction. But a
 *  key must never outlive its request body: the same key with a different
 *  amount would silently hand back the old transaction. Hence the fingerprint.
 *
 *  Keys are created lazily from event handlers (never during render), so this
 *  is safe under SSR. */
export function useIdempotencyKey() {
	const current = useRef<{ fingerprint: string; key: string } | null>(null);

	return {
		/** Same key for an identical payload, a fresh one when the payload changes. */
		keyFor(payload: unknown): string {
			const fingerprint = JSON.stringify(payload);
			if (current.current?.fingerprint !== fingerprint) {
				current.current = { fingerprint, key: crypto.randomUUID() };
			}
			return current.current.key;
		},
		/** Call once the attempt has a definitive outcome. */
		reset() {
			current.current = null;
		},
	};
}
