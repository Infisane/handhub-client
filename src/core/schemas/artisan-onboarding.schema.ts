import { z } from "zod";

export const AccountTypeSchema = z.object({
	accountType: z.enum(["individual", "business", "agency"], {
		message: "Please select an account type",
	}),
});
export type AccountTypeForm = z.infer<typeof AccountTypeSchema>;

export const LocationSchema = z.object({
	state: z.string().min(1, "State is required"),
	lga: z.string().min(1, "LGA is required"),
	wardCode: z.string().min(1, "Ward / area is required"),
	address: z.string().min(1, "Street address is required"),
});
export type LocationForm = z.infer<typeof LocationSchema>;

export const ServicesSchema = z.object({
	services: z.array(z.string()).min(1, "Select at least one service"),
	businessName: z.string().optional(),
	bio: z.string().min(1, "Bio is required"),
	experience: z.string().min(1, "Years of experience is required"),
	workHours: z.string().optional(),
	minCharge: z.string().min(1, "Minimum charge is required"),
});
export type ServicesForm = z.infer<typeof ServicesSchema>;

export const VerificationSchema = z.object({
	idType: z.string().optional(),
	idNumber: z.string().optional(),
	communication: z.array(z.string()).optional(),
	documentName: z.string().optional(),
});
export type VerificationForm = z.infer<typeof VerificationSchema>;
