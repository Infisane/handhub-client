export interface ServiceCategory {
	id: string;
	name: string;
	icon: string;
	description: string;
}

export interface ServiceItem {
	id: string;
	name: string;
	categoryId: string;
	category: ServiceCategory;
	description: string | null;
	isActive: boolean;
	createdAt: string;
}

export interface AvailabilityOptions {
	days: string[];
	timeSlots: string[];
}

export interface AiSearchProviderLocation {
	id: string;
	code: string;
	name: string;
}

export interface AiSearchProviderService {
	id: string;
	name: string;
	categoryId: string;
}

export interface AiSearchProvider {
	id: string;
	title: string | null;
	businessName: string | null;
	bio: string | null;
	accountType: "individual" | "business" | "agency";
	hourlyRate: string;
	minCharge: string;
	averageRating: string;
	reviewCount: number;
	yearsExperience: number;
	isVerified: boolean;
	isPremium: boolean;
	approvalStatus: string;
	portfolioImages: string[];
	availability: Record<string, string[]>;
	address: string;
	city: string | null;
	latitude: string;
	longitude: string;
	serviceRadius: number | null;
	state: AiSearchProviderLocation;
	lga: AiSearchProviderLocation;
	ward: AiSearchProviderLocation;
	categoryId: string | null;
	services: AiSearchProviderService[];
	createdAt: string;
}

export interface AiSearchResponse {
	providers: AiSearchProvider[];
	total: number;
}

export interface AiSearchParams {
	q: string;
	lat: number;
	lon: number;
	radius: number;
}

export interface RecommendationsParams {
	lat?: number;
	lon?: number;
	radius?: number;
	city?: string;
}

export interface Recommendation {
	rank: number;
	providerId: string;
	provider: AiSearchProvider;
	reason: string;
	matchScore: number;
}

export interface RecommendationsResponse {
	recommendations: Recommendation[];
	summary: string;
}

export interface UpdateProviderPayload {
	fullName: string;
	phone: string;
	accountType: "individual" | "business" | "agency";
	stateCode: string;
	lgaCode: string;
	wardCode: string;
	address: string;
	serviceIds: string[];
	bio: string;
	experience: number;
	minCharge: number;
	latitude?: number;
	longitude?: number;
	availability?: Record<string, string[]>;
	businessName?: string;
	workHours?: string;
	idType?: string;
	idNumber?: string;
	idDocumentUrl?: string;
	preferredCommunication?: string[];
}
