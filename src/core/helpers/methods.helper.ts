export class HelperMethods {
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
}
