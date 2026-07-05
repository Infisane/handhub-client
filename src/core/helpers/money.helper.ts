/* Money helpers — API money fields are decimal strings (e.g. "11000.00"). */

export function parseMoney(value: string | number | null | undefined): number {
	if (value === null || value === undefined) return 0;
	const n = typeof value === "number" ? value : Number.parseFloat(value);
	return Number.isFinite(n) ? n : 0;
}

export function formatNaira(value: string | number | null | undefined): string {
	return `₦${parseMoney(value).toLocaleString()}`;
}
