export interface GeoWard {
	id: string;
	code: string;
	name: string;
	latitude: string;
	longitude: string;
}

export interface ServiceZone {
	id: string;
	providerId: string;
	name: string;
	wardId: string | null;
	geoWard: GeoWard | null;
	latitude: string;
	longitude: string;
	coverageKm: number;
	isPrimary: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

/** Ward-based creation only — the server derives name/lat/lng from the ward. */
export interface CreateZonePayload {
	wardId: string;
	coverageKm?: number;
}

export interface UpdateZonePayload {
	name?: string;
	coverageKm?: number;
	isActive?: boolean;
}

export interface ZoneCategoryBreakdown {
	categoryId: string;
	name: string;
	count: number;
}

export interface ZoneInsights {
	artisanCount: number;
	breakdown: ZoneCategoryBreakdown[];
}

export interface AreaSummary {
	artisansNearby: number;
	activeZones: number;
}

export interface UpdateProviderAvailabilityPayload {
	isAvailable?: boolean;
	serviceRadius?: number;
}
