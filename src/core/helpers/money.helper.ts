/* Money helpers — API money fields are decimal strings (e.g. "11000.00"). */

import type { Payment } from "#/core/types/chat.types";

export function parseMoney(value: string | number | null | undefined): number {
	if (value === null || value === undefined) return 0;
	const n = typeof value === "number" ? value : Number.parseFloat(value);
	return Number.isFinite(n) ? n : 0;
}

export function formatNaira(value: string | number | null | undefined): string {
	return `₦${parseMoney(value).toLocaleString()}`;
}

/** Strips non-digits and adds thousands separators, for a live-typed
 *  currency amount input (whole naira, no kobo entry). */
export function formatAmountInput(raw: string): string {
	const digits = raw.replace(/\D/g, "");
	return digits ? Number(digits).toLocaleString() : "";
}

/** "materials"/"workmanship" rows → a readable settlement summary, e.g.
 *  "Materials ₦3,000 paid · Workmanship ₦7,000 held until job confirmed". */
export function summarizePaymentRows(result: Payment[] | Payment): string {
	const rows = Array.isArray(result) ? result : [result];
	return rows
		.map((r) => {
			const label = r.kind
				? r.kind[0].toUpperCase() + r.kind.slice(1)
				: "Payment";
			const state =
				r.status === "released" ? "paid" : "held until job confirmed";
			return `${label} ${formatNaira(r.amount)} ${state}`;
		})
		.join(" · ");
}
