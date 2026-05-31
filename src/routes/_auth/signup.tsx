import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	Eye,
	EyeOff,
	Hammer,
	LayoutDashboard,
	Lock,
	Mail,
	MapPin,
	Phone,
	Search,
	Star,
	Users,
} from "lucide-react";
import { useState } from "react";
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

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 15 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 100,
				damping: 15,
			},
		},
	};

	return (
		<div className="hh-auth">
			<Nav showLinks={false} rightElement={rightElement} />
			<div className="page-wrap active" id="signup-page">
				<div className="split">
					{/* Left Panel */}
					<div className="panel-left">
						<div className="orb orb1" />
						<div className="orb orb2" />
						<motion.div
							className="left-content max-w-[460px] w-full flex flex-col gap-6 md:gap-8"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							<motion.div
								className="left-eyebrow py-1.5 px-4 text-[13px] gap-2 mb-0 w-fit flex items-center"
								variants={itemVariants}
							>
								<Users size={15} aria-hidden="true" /> 12,000+ artisans verified
							</motion.div>
							<motion.h2
								className="left-h text-[34px] md:text-[38px] lg:text-[44px] md:mb-0 leading-[1.15]"
								variants={itemVariants}
							>
								Join the <em>Handhub</em> community
							</motion.h2>
							<motion.p
								className="left-p text-[14px] md:text-[15.5px] lg:text-[16.5px] md:mb-0 opacity-90"
								variants={itemVariants}
							>
								Whether you need skilled help or you're a tradesperson ready to
								grow — Handhub connects you in minutes.
							</motion.p>
							<motion.div
								className="proof-cards flex flex-col gap-3.5"
								variants={itemVariants}
							>
								<div className="proof-card p-4.5 md:p-5 gap-4">
									<div className="pc-icon w-10 h-10 md:w-11 md:h-11 rounded-[10px]">
										<Check size={20} aria-hidden="true" />
									</div>
									<div className="flex flex-col justify-center">
										<div className="pc-t text-[14px] md:text-[15.5px] font-semibold mb-1">
											Free to join
										</div>
										<div className="pc-s text-[12px] md:text-[13px] opacity-80">
											No subscription fees. Pay only when you hire.
										</div>
									</div>
								</div>
								<div className="proof-card p-4.5 md:p-5 gap-4">
									<div className="pc-icon w-10 h-10 md:w-11 md:h-11 rounded-[10px]">
										<MapPin size={20} aria-hidden="true" />
									</div>
									<div className="flex flex-col justify-center">
										<div className="pc-t text-[14px] md:text-[15.5px] font-semibold mb-1">
											6 cities and growing
										</div>
										<div className="pc-s text-[12px] md:text-[13px] opacity-80">
											Lagos, Abuja, Port Harcourt, Ibadan, Kano & Enugu
										</div>
									</div>
								</div>
								<div className="proof-card p-4.5 md:p-5 gap-4">
									<div className="pc-icon w-10 h-10 md:w-11 md:h-11 rounded-[10px]">
										<Star size={20} aria-hidden="true" />
									</div>
									<div className="flex flex-col justify-center">
										<div className="pc-t text-[14px] md:text-[15.5px] font-semibold mb-1">
											98% satisfaction rate
										</div>
										<div className="pc-s text-[12px] md:text-[13px] opacity-80">
											Backed by thousands of verified customer reviews
										</div>
									</div>
								</div>
							</motion.div>
						</motion.div>
					</div>

					{/* Right Panel */}
					<div className="panel-right">
						<motion.div
							className="form-box"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{
								type: "spring",
								stiffness: 90,
								damping: 15,
								delay: 0.15,
							}}
						>
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
												<Phone
													className="inp-icon"
													size={16}
													aria-hidden="true"
												/>
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
												<Mail
													className="inp-icon"
													size={16}
													aria-hidden="true"
												/>
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
										<div className="divider">
											<span>or sign up with</span>
										</div>
										<div className="social-btns">
											<button
												type="button"
												className="soc-btn"
												aria-label="Sign up with Google"
											>
												<svg
													className="soc-icon"
													viewBox="0 0 24 24"
													fill="none"
												>
													<path
														d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
														fill="#4285F4"
													/>
													<path
														d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
														fill="#34A853"
													/>
													<path
														d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
														fill="#FBBC05"
													/>
													<path
														d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
														fill="#EA4335"
													/>
												</svg>
												Google
											</button>
											<button
												type="button"
												className="soc-btn"
												aria-label="Sign up with Apple"
											>
												<svg
													className="soc-icon"
													viewBox="0 0 24 24"
													fill="currentColor"
													style={{ color: "var(--txt)" }}
												>
													<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
												</svg>
												Apple
											</button>
										</div>
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
											<div className="inp-wrap">
												<Lock
													className="inp-icon"
													size={16}
													aria-hidden="true"
												/>
												<input
													id="signup-pw"
													className="inp has-icon"
													type={showPassword ? "text" : "password"}
													required
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													placeholder="At least 8 characters"
													aria-label="New password"
													style={{ paddingRight: "40px" }}
												/>
												<button
													type="button"
													className="inp-trail"
													onClick={() => setShowPassword(!showPassword)}
													aria-label={
														showPassword ? "Hide password" : "Show password"
													}
												>
													{showPassword ? (
														<EyeOff size={15} aria-hidden="true" />
													) : (
														<Eye size={15} aria-hidden="true" />
													)}
												</button>
											</div>
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
											<div className="inp-wrap">
												<Lock
													className="inp-icon"
													size={16}
													aria-hidden="true"
												/>
												<input
													id="signup-pwconfirm"
													className="inp has-icon"
													type={showConfirmPassword ? "text" : "password"}
													required
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													placeholder="Repeat your password"
													aria-label="Confirm password"
													style={{ paddingRight: "40px" }}
												/>
												<button
													type="button"
													className="inp-trail"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
													aria-label={
														showConfirmPassword
															? "Hide password"
															: "Show password"
													}
												>
													{showConfirmPassword ? (
														<EyeOff size={15} aria-hidden="true" />
													) : (
														<Eye size={15} aria-hidden="true" />
													)}
												</button>
											</div>
										</div>

										<div className="field">
											<label htmlFor="signup-city">City</label>
											<div className="inp-wrap">
												<MapPin
													className="inp-icon"
													size={16}
													aria-hidden="true"
												/>
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
												Send me updates about new artisans and features in my
												area
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
												<ArrowRight size={16} aria-hidden="true" /> Create
												account
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
												Your Handhub account is ready. A verification link has
												been sent to your email.
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
