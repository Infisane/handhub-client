export interface StateItem {
	id: string;
	code: string;
	name: string;
}

export interface LgaItem {
	id: string;
	code: string;
	name: string;
	stateId: string;
}

export interface WardItem {
	id: string;
	code: string;
	name: string;
	lgaId: string;
	latitude: string;
	longitude: string;
}
