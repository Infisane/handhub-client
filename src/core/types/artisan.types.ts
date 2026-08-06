export interface ServiceCategory {
	id: string;
	name: string;
	icon: string;
	description: string;
}

export interface Category {
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
	accountType: "individual" | "business" | "agency" | null;
	hourlyRate: string;
	minCharge: string | null;
	averageRating: string;
	reviewCount: number;
	yearsExperience: number;
	isVerified: boolean;
	isPremium: boolean;
	approvalStatus: string;
	portfolioImages: string[];
	availability: Record<string, unknown>;
	address: string | null;
	city: string | null;
	latitude: string | null;
	longitude: string | null;
	serviceRadius: number | null;
	state: AiSearchProviderLocation | null;
	lga: AiSearchProviderLocation | null;
	ward: AiSearchProviderLocation | null;
	categoryId: string | null;
	services: AiSearchProviderService[];
	createdAt: string;
}

export interface AiSearchResponse {
	data: AiSearchProvider[];
	meta: { total: number; limit: number; offset: number };
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

export interface ProvidersResponse {
	data: AiSearchProvider[];
	meta: { total: number; limit: number; offset: number };
}

export interface GetProvidersParams {
	q?: string;
	categoryId?: string;
	serviceId?: string;
	lat?: number;
	lon?: number;
	radius?: number;
	verified?: boolean;
	minRating?: number;
	minRate?: number;
	maxRate?: number;
	sortBy?: string;
	limit?: number;
	offset?: number;
	stateId?: string;
	lgaId?: string;
}

export interface ProviderReview {
	id: string;
	rating: number;
	comment: string;
	createdAt: string;
	customer: { id: string; fullName: string };
}

export interface ProviderAvailabilitySlot {
	from: string;
	to: string;
}

export interface ProviderDetail extends Omit<AiSearchProvider, "availability"> {
	availability: Record<string, ProviderAvailabilitySlot>;
	ratingBreakdown: Record<string, number>;
	reviews: ProviderReview[];
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
