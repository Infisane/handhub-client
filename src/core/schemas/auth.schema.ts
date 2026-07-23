import { z } from "zod";

export const SignInSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});
export type SignIn = z.infer<typeof SignInSchema>;

export const SignUpStep1Schema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	phone: z.string().min(7, "Enter a valid phone number"),
	email: z
		.string()
		.min(1, "Email is required")
		.email("Enter a valid email address"),
});
export type SignUpStep1 = z.infer<typeof SignUpStep1Schema>;

export const SignUpStep2Schema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		termsCk: z.boolean(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})
	.refine((data) => data.termsCk, {
		message: "You must agree to the Terms of Service and Privacy Policy",
		path: ["termsCk"],
	});
export type SignUpStep2 = z.infer<typeof SignUpStep2Schema>;

export const VerifyOtpSchema = z.object({
	otp: z.string().length(6, "Enter the 6-digit code"),
});
export type VerifyOtp = z.infer<typeof VerifyOtpSchema>;
