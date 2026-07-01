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
