import { z } from "zod";

export const ProfileSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	phone: z.string().optional(),
	address: z.string().optional(),
	bio: z.string().optional(),
});
export type ProfileForm = z.infer<typeof ProfileSchema>;

export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(8, "New password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;
