import { AuthLeftPanel } from "#/components/auth/auth-left-panel";
import { formBoxMotion } from "#/components/auth/auth-motion";
import { SocialAuthButtons } from "#/components/auth/social-auth-buttons";
import { Nav } from "#/components/home/nav";
import { AppInput } from "#/components/ui/app-input";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useRegisterQuery } from "#/core/queries/auth.q";
import {
	SignUpStep1Schema,
	SignUpStep2Schema,
} from "#/core/schemas/auth.schema";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	Hammer,
	LayoutDashboard,
	Loader2,
	Lock,
	Mail,
	MapPin,
	Phone,
	Search,
	Star,
	Users,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_auth/signup")({
	component: SignUpPage,
});

function SignUpPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState<1 | 2 | 3>(1);

	// Step 1 Form fields
	const [step1Data, setStep1Data] = useState({
		role: "customer" as "customer" | "artisan",
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
	});

	// Step 2 Form fields
	const [step2Data, setStep2Data] = useState({
		password: "",
		confirmPassword: "",
		termsCk: true,
		marketingCk: false,
	});

	const handleSetStep1Data = (field: keyof typeof step1Data, value: string) => {
		setStep1Data((prev) => ({ ...prev, [field]: value }));
	}
	const handleSetStep2Data = (field: keyof typeof step2Data, value: string | boolean) => {
		setStep2Data((prev) => ({ ...prev, [field]: value }));
	}

	const {
		validate: validateStep1,
		revalidate: revalidateStep1,
		errors: step1Errors,
	} = useValidator({
		schema: SignUpStep1Schema,
		store: step1Data,
	});

	const {
		validate: validateStep2,
		revalidate: revalidateStep2,
		errors: step2Errors,
	} = useValidator({
		schema: SignUpStep2Schema,
		store: step2Data,
	});

	// Password strength calculations
	const getPasswordStrength = (val: string) => {
		if (!val) return { score: 0, label: "", cls: "" };
		let score = 0;
		if (val.length >= 8) score++;
		if (/[A-Z]/.test(val)) score++;
		if (/[0-9]/.test(val)) score++;
		if (/[^A-Za-z0-9]/.test(val)) score++;

		const labels = ["", "Weak", "Fair", "Good", "Strong"];
		const classes = ["", "weak", "med", "med", "strong"];

		return {
			score,
			label: labels[score],
			cls: classes[score],
		};
	};

	const strength = getPasswordStrength(step2Data.password);

	const registerMutation = useRegisterQuery({
		onSuccessCallback: () => setStep(3),
	});

	const handleStep1Submit = (e: React.FormEvent) => {
		e.preventDefault();
		validateStep1(() => setStep(2));
	};

	const handleStep2Submit = (e: React.FormEvent) => {
		e.preventDefault();
		validateStep2(() => {
			registerMutation.mutate({
				fullName: `${step1Data.firstName} ${step1Data.lastName}`.trim(),
				email: step1Data.email,
				phone: step1Data.phone.replace(/\s+/g, ""),
				password: step2Data.password,
				userType: step1Data.role,
			});
		});
	};

	const rightElement = (
		<span className="nav-link">
			Already have an account?{" "}
			<Link to="/signin" className="link font-medium">
				Sign in
			</Link>
		</span>
	);

	return (
		<div className="hh-auth">
			<Nav showLinks={false} rightElement={rightElement} />
			<div className="page-wrap active" id="signup-page">
				<div className="split">
					{/* Left Panel */}
					<AuthLeftPanel
						eyebrowIcon={Users}
						eyebrowText="12,000+ artisans verified"
						heading={
							<>
								Join the <em>Handhub</em> community
							</>
						}
						subheading="Whether you need skilled help or you're a tradesperson ready to grow — Handhub connects you in minutes."
						proofs={[
							{
								icon: Check,
								title: "Free to join",
								subtitle: "No subscription fees. Pay only when you hire.",
							},
							{
								icon: MapPin,
								title: "6 cities and growing",
								subtitle: "Lagos, Abuja, Port Harcourt, Ibadan, Kano & Enugu",
							},
							{
								icon: Star,
								title: "98% satisfaction rate",
								subtitle: "Backed by thousands of verified customer reviews",
							},
						]}
					/>

					{/* Right Panel */}
					<div className="panel-right">
						<motion.div className="form-box" {...formBoxMotion}>
							<AnimatePresence mode="wait">
								{/* Step 1 View */}
								{step === 1 && (
									<motion.form
										key="step1"
										onSubmit={handleStep1Submit}
										id="step1-wrap"
										initial={{ opacity: 0, x: 15 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -15 }}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									>
										<div className="step-dots">
											<div className="dot active" />
											<div className="dot" />
											<div className="dot" />
										</div>
										<h1 className="form-h">Create your account</h1>
										<p className="form-sub" style={{ marginBottom: "20px" }}>
											Already have one?{" "}
											<Link to="/signin" className="link">
												Sign in
											</Link>
										</p>

										<div className="field">
											<label>I want to</label>
											<div className="role-grid" id="role-grid">
												<button
													type="button"
													className={`role-card ${
														step1Data.role === "customer" ? "selected" : ""
													}`}
													onClick={() => handleSetStep1Data("role", "customer")}
												>
													<Search size={22} aria-hidden="true" />
													<div className="rt">Find artisans</div>
													<div className="rs2">Post jobs & hire</div>
												</button>
												<button
													type="button"
													className={`role-card ${
														step1Data.role === "artisan" ? "selected" : ""
													}`}
													onClick={() => handleSetStep1Data("role", "artisan")}
												>
													<Hammer size={22} aria-hidden="true" />
													<div className="rt">Offer services</div>
													<div className="rs2">Get hired & earn</div>
												</button>
											</div>
										</div>

										<div className="row2">
											<div className="field">
												<label htmlFor="signup-fname">First name</label>
												<AppInput
													id="signup-fname"
													type="text"
													value={step1Data.firstName}
													onChange={(e) => {
														handleSetStep1Data("firstName", e.target.value);
														revalidateStep1("firstName", e.target.value);
													}}
													placeholder="Adeola"
													aria-label="First name"
													error={step1Errors.firstName}
												/>
											</div>
											<div className="field">
												<label htmlFor="signup-lname">Last name</label>
												<AppInput
													id="signup-lname"
													type="text"
													value={step1Data.lastName}
													onChange={(e) => {
														handleSetStep1Data("lastName", e.target.value);
														revalidateStep1("lastName", e.target.value);
													}}
													placeholder="Kamara"
													aria-label="Last name"
													error={step1Errors.lastName}
												/>
											</div>
										</div>

										<div className="field">
											<label htmlFor="signup-phone">Phone number</label>
											<AppInput
												id="signup-phone"
												type="tel"
												icon={<Phone size={16} aria-hidden="true" />}
												value={step1Data.phone}
												onChange={(e) => {
													handleSetStep1Data("phone", e.target.value);
													revalidateStep1("phone", e.target.value);
												}}
												placeholder="+234 800 000 0000"
												aria-label="Phone number"
												error={step1Errors.phone}
											/>
										</div>

										<div className="field">
											<label htmlFor="signup-email">Email address</label>
											<AppInput
												id="signup-email"
												type="email"
												icon={<Mail size={16} aria-hidden="true" />}
												value={step1Data.email}
												onChange={(e) => {
													handleSetStep1Data("email", e.target.value);
													revalidateStep1("email", e.target.value);
												}}
												placeholder="you@example.com"
												aria-label="Email address"
												error={step1Errors.email}
											/>
										</div>

										<button type="submit" className="btn-full">
											<ArrowRight size={17} aria-hidden="true" /> Continue
										</button>
										<SocialAuthButtons verb="Sign up" dividerLabel="or sign up with" />
									</motion.form>
								)}

								{/* Step 2 View */}
								{step === 2 && (
									<motion.form
										key="step2"
										onSubmit={handleStep2Submit}
										id="step2-wrap"
										initial={{ opacity: 0, x: 15 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -15 }}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									>
										<div className="step-dots">
											<div className="dot done" />
											<div className="dot active" />
											<div className="dot" />
										</div>
										<h1 className="form-h">Secure your account</h1>
										<p className="form-sub" style={{ marginBottom: "24px" }}>
											Choose a strong password to protect your account
										</p>

										<div className="field">
											<label htmlFor="signup-pw">Create password</label>
											<AppInput
												id="signup-pw"
												type="password"
												icon={<Lock size={16} aria-hidden="true" />}
												value={step2Data.password}
												onChange={(e) => {
													handleSetStep2Data("password", e.target.value);
													revalidateStep2("password", e.target.value);
												}}
												placeholder="At least 8 characters"
												aria-label="New password"
												error={step2Errors.password}
											/>
											<div className="strength" id="strength-bars">
												<div
													className={`strength-bar ${
														strength.score >= 1 ? strength.cls : ""
													}`}
												/>
												<div
													className={`strength-bar ${
														strength.score >= 2 ? strength.cls : ""
													}`}
												/>
												<div
													className={`strength-bar ${
														strength.score >= 3 ? strength.cls : ""
													}`}
												/>
												<div
													className={`strength-bar ${
														strength.score >= 4 ? strength.cls : ""
													}`}
												/>
											</div>
											{strength.label && (
												<div
													className="strength-lbl"
													id="strength-lbl"
													style={{
														color:
															strength.cls === "weak"
																? "#EF4444"
																: strength.cls === "med"
																	? "#F59E0B"
																	: "#22C55E",
													}}
												>
													{strength.label}
												</div>
											)}
										</div>

										<div className="field">
											<label htmlFor="signup-pwconfirm">Confirm password</label>
											<AppInput
												id="signup-pwconfirm"
												type="password"
												icon={<Lock size={16} aria-hidden="true" />}
												value={step2Data.confirmPassword}
												onChange={(e) => {
													handleSetStep2Data("confirmPassword", e.target.value);
													revalidateStep2("confirmPassword", e.target.value);
												}}
												placeholder="Repeat your password"
												aria-label="Confirm password"
												error={step2Errors.confirmPassword}
											/>
										</div>

										<div className="check-row">
											<input
												type="checkbox"
												id="terms-ck"
												checked={step2Data.termsCk}
												onChange={(e) => {
													handleSetStep2Data("termsCk", e.target.checked);
													revalidateStep2("termsCk", e.target.checked);
												}}
											/>
											<label htmlFor="terms-ck">
												I agree to the <a href="#terms">Terms of Service</a> and{" "}
												<a href="#privacy">Privacy Policy</a>
											</label>
										</div>
										{step2Errors.termsCk && (
											<p className="field-error">{step2Errors.termsCk}</p>
										)}
										<div className="check-row">
											<input
												type="checkbox"
												id="marketing-ck"
												checked={step2Data.marketingCk}
												onChange={(e) => handleSetStep2Data("marketingCk", e.target.checked)}
											/>
											<label htmlFor="marketing-ck">
												Send me updates about new artisans and features in my area
											</label>
										</div>

										<div style={{ display: "flex", gap: "10px" }}>
											<button
												type="button"
												className="btn-full"
												style={{
													background: "var(--bg2)",
													border: "1.5px solid var(--bdr2)",
													color: "var(--txt2)",
													flex: "0 0 auto",
													width: "auto",
													padding: "12px 20px",
												}}
												onClick={() => setStep(1)}
											>
												<ArrowLeft size={16} aria-hidden="true" />
											</button>
											<button
												type="submit"
												className="btn-full"
												disabled={registerMutation.isPending}
											>
												{registerMutation.isPending ? (
													<Loader2
														size={16}
														className="animate-spin"
														aria-hidden="true"
													/>
												) : (
													<ArrowRight size={16} aria-hidden="true" />
												)}
												{registerMutation.isPending
													? "Creating account..."
													: "Create account"}
											</button>
										</div>
									</motion.form>
								)}

								{/* Step 3 View (Success screen) */}
								{step === 3 && (
									<motion.div
										key="step3"
										id="step3-wrap"
										initial={{ opacity: 0, scale: 0.98 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.25, ease: "easeOut" }}
									>
										<div className="step-dots">
											<div className="dot done" />
											<div className="dot done" />
											<div className="dot active" />
										</div>
										<div className="success-screen">
											<div className="success-icon">
												<Check size={26} aria-hidden="true" />
											</div>
											<h1 className="form-h" style={{ marginBottom: "8px" }}>
												You're in!
											</h1>
											<p
												style={{
													fontSize: "13.5px",
													color: "var(--txt3)",
													marginBottom: "28px",
													lineHeight: "1.65",
												}}
											>
												Your Handhub account is ready. A verification link has been
												sent to your email.
											</p>
											<button
												type="button"
												className="btn-full"
												onClick={() => navigate({ to: "/signin" })}
											>
												<LayoutDashboard size={17} aria-hidden="true" /> Go to
												signin
											</button>
											<p className="terms" style={{ marginTop: "16px" }}>
												Didn't get the email?{" "}
												<a href="#resend" style={{ color: "var(--or)" }}>
													Resend verification
												</a>
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
