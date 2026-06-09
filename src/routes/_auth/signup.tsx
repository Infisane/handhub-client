import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	Hammer,
	LayoutDashboard,
	Mail,
	MapPin,
	Phone,
	Search,
	Star,
	Users,
} from "lucide-react";
import { useState } from "react";
import { AuthLeftPanel } from "#/components/auth/auth-left-panel";
import { formBoxMotion } from "#/components/auth/auth-motion";
import { PasswordField } from "#/components/auth/password-field";
import { SocialAuthButtons } from "#/components/auth/social-auth-buttons";
import { Nav } from "#/components/home/nav";

export const Route = createFileRoute("/_auth/signup")({
	component: SignUpPage,
});

function SignUpPage() {
	const navigate = useNavigate();
	const [step, setStep] = useState<1 | 2 | 3>(1);

	// Step 1 Form fields
	const [role, setRole] = useState<"customer" | "artisan">("customer");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");

	// Step 2 Form fields
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [city, setCity] = useState("");
	const [termsCk, setTermsCk] = useState(true);
	const [marketingCk, setMarketingCk] = useState(false);

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

	const strength = getPasswordStrength(password);

	const handleStep1Submit = (e: React.FormEvent) => {
		e.preventDefault();
		// Advance to next step
		setStep(2);
	};

	const handleStep2Submit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!termsCk) {
			alert("Please agree to our Terms of Service and Privacy Policy.");
			return;
		}
		if (password !== confirmPassword) {
			alert("Passwords do not match.");
			return;
		}
		// Create account completed, advance to success page
		setStep(3);
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
														role === "customer" ? "selected" : ""
													}`}
													onClick={() => setRole("customer")}
												>
													<Search size={22} aria-hidden="true" />
													<div className="rt">Find artisans</div>
													<div className="rs2">Post jobs & hire</div>
												</button>
												<button
													type="button"
													className={`role-card ${
														role === "artisan" ? "selected" : ""
													}`}
													onClick={() => setRole("artisan")}
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
												<input
													id="signup-fname"
													className="inp"
													type="text"
													required
													value={firstName}
													onChange={(e) => setFirstName(e.target.value)}
													placeholder="Adeola"
													aria-label="First name"
												/>
											</div>
											<div className="field">
												<label htmlFor="signup-lname">Last name</label>
												<input
													id="signup-lname"
													className="inp"
													type="text"
													required
													value={lastName}
													onChange={(e) => setLastName(e.target.value)}
													placeholder="Kamara"
													aria-label="Last name"
												/>
											</div>
										</div>

										<div className="field">
											<label htmlFor="signup-phone">Phone number</label>
											<div className="inp-wrap">
												<Phone className="inp-icon" size={16} aria-hidden="true" />
												<input
													id="signup-phone"
													className="inp has-icon"
													type="tel"
													required
													value={phone}
													onChange={(e) => setPhone(e.target.value)}
													placeholder="+234 800 000 0000"
													aria-label="Phone number"
												/>
											</div>
										</div>

										<div className="field">
											<label htmlFor="signup-email">Email address</label>
											<div className="inp-wrap">
												<Mail className="inp-icon" size={16} aria-hidden="true" />
												<input
													id="signup-email"
													className="inp has-icon"
													type="email"
													required
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													placeholder="you@example.com"
													aria-label="Email address"
												/>
											</div>
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
											<PasswordField
												id="signup-pw"
												value={password}
												onChange={setPassword}
												show={showPassword}
												onToggleShow={() => setShowPassword(!showPassword)}
												placeholder="At least 8 characters"
												ariaLabel="New password"
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
											<PasswordField
												id="signup-pwconfirm"
												value={confirmPassword}
												onChange={setConfirmPassword}
												show={showConfirmPassword}
												onToggleShow={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												placeholder="Repeat your password"
												ariaLabel="Confirm password"
											/>
										</div>

										<div className="field">
											<label htmlFor="signup-city">City</label>
											<div className="inp-wrap">
												<MapPin className="inp-icon" size={16} aria-hidden="true" />
												<select
													id="signup-city"
													className="select"
													required
													value={city}
													onChange={(e) => setCity(e.target.value)}
													style={{ paddingLeft: "40px" }}
													aria-label="Select city"
												>
													<option value="">Select your city</option>
													<option value="Lagos">Lagos</option>
													<option value="Abuja">Abuja</option>
													<option value="Port Harcourt">Port Harcourt</option>
													<option value="Ibadan">Ibadan</option>
													<option value="Kano">Kano</option>
													<option value="Enugu">Enugu</option>
												</select>
											</div>
										</div>

										<div className="check-row">
											<input
												type="checkbox"
												id="terms-ck"
												checked={termsCk}
												onChange={(e) => setTermsCk(e.target.checked)}
											/>
											<label htmlFor="terms-ck">
												I agree to the <a href="#terms">Terms of Service</a> and{" "}
												<a href="#privacy">Privacy Policy</a>
											</label>
										</div>
										<div className="check-row">
											<input
												type="checkbox"
												id="marketing-ck"
												checked={marketingCk}
												onChange={(e) => setMarketingCk(e.target.checked)}
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
											<button type="submit" className="btn-full">
												<ArrowRight size={16} aria-hidden="true" /> Create account
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
												onClick={() => navigate({ to: "/" })}
											>
												<LayoutDashboard size={17} aria-hidden="true" /> Go to
												dashboard
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
