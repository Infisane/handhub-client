/** "08:00" → "8:00 AM". */
const formatTime = (t: string) => {
	const h = Number(t.split(":")[0]);
	if (h === 0) return "12:00 AM";
	if (h < 12) return `${h}:00 AM`;
	if (h === 12) return "12:00 PM";
	return `${h - 12}:00 PM`;
};

/** One stored day slot → [from, to]. Onboarding writes ["08:00-18:00"]; older/seed
 *  data writes { from, to }. */
const slotRange = (slot: unknown): [string, string] => {
	if (Array.isArray(slot)) {
		const [from = "", to = ""] = String(slot[0] ?? "").split("-");
		return [from, to];
	}
	if (slot && typeof slot === "object") {
		const { from = "", to = "" } = slot as { from?: string; to?: string };
		return [from, to];
	}
	return ["", ""];
};

export class HelperMethods {
	static formatTime = formatTime;

	static buildAvailabilityPayload(
		days: string[],
		from: string,
		to: string,
	): Record<string, string[]> | undefined {
		if (!days.length) return undefined;
		return days.reduce(
			(acc, day) => ({
				...acc,
				[day]: from && to ? [`${from}-${to}`] : [],
			}),
			{} as Record<string, string[]>,
		);
	}

	/** Reads a stored schedule back into the editor's shape: the selected days
	 *  (canonical names from `dayOptions`, matched case-insensitively) and one
	 *  from/to range taken from the first day that has one. Inverse of
	 *  buildAvailabilityPayload. */
	static parseAvailability(
		availability: Record<string, unknown> | null | undefined,
		dayOptions: string[],
	): { days: string[]; from: string; to: string } {
		const entries = Object.entries(availability ?? {});
		const days = dayOptions.filter((d) =>
			entries.some(([key]) => key.toLowerCase() === d.toLowerCase()),
		);
		const [from, to] = entries
			.map(([, slot]) => slotRange(slot))
			.find(([f, t]) => f && t) ?? ["", ""];
		return { days, from, to };
	}
}
