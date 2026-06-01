import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Eye,
	EyeOff,
	Lock,
	Mail,
	ShieldCheck,
	Sparkles,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Nav } from "#/components/home/nav";

export const Route = createFileRoute("/_auth/signin")({
	component: SignInPage,
});

function SignInPage() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<"cust" | "art">("cust");
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(true);

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		// Mock authentication action - navigate to dashboard
		navigate({ to: "/dashboard" });
	};

	const rightElement = (
		<span className="nav-link">
			No account?{" "}
			<Link to="/signup" className="link font-medium">
				Sign up free
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
				type: "spring" as const,
				stiffness: 100,
				damping: 15,
			},
		},
	};

	return (
		<div className="hh-auth">
			<Nav showLinks={false} rightElement={rightElement} />
			<div className="page-wrap active" id="signin-page">
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
								<Sparkles size={15} aria-hidden="true" /> Nigeria's #1 artisan
								platform
							</motion.div>
							<motion.h2
								className="left-h text-[34px] md:text-[38px] lg:text-[44px] md:mb-0 leading-[1.15]"
								variants={itemVariants}
							>
								Welcome back to <em>Handhub</em>
							</motion.h2>
							<motion.p
								className="left-p text-[14px] md:text-[15.5px] lg:text-[16.5px] md:mb-0 opacity-90"
								variants={itemVariants}
							>
								Skilled artisans, safe payments, and real-time chat — all in one
								place. Sign back in to manage your jobs.
							</motion.p>
							<motion.div
								className="proof-cards flex flex-col gap-3.5"
								variants={itemVariants}
							>
								<div className="proof-card p-4.5 md:p-5 gap-4">
									<div className="pc-icon w-10 h-10 md:w-11 md:h-11 rounded-[10px]">
										<ShieldCheck size={20} aria-hidden="true" />
									</div>
									<div className="flex flex-col justify-center">
										<div className="pc-t text-[14px] md:text-[15.5px] font-semibold mb-1">
											Escrow-protected payments
										</div>
										<div className="pc-s text-[12px] md:text-[13px] opacity-80">
											Your money is held safely until the job is done
										</div>
									</div>
								</div>
								<div className="proof-card p-4.5 md:p-5 gap-4">
									<div className="pc-icon w-10 h-10 md:w-11 md:h-11 rounded-[10px]">
										<Zap size={20} aria-hidden="true" />
									</div>
									<div className="flex flex-col justify-center">
										<div className="pc-t text-[14px] md:text-[15.5px] font-semibold mb-1">
											AI-matched in minutes
										</div>
										<div className="pc-s text-[12px] md:text-[13px] opacity-80">
											Our AI finds the best artisan near you instantly
										</div>
									</div>
								</div>
							</motion.div>
							<motion.div
								className="testimonial p-5 md:p-6 mt-0"
								variants={itemVariants}
							>
								<div className="test-q text-[14px] md:text-[15.5px] italic mb-4 opacity-90">
									"My inverter was smoking at midnight. I had an electrician at
									my door in 40 minutes."
								</div>
								<div className="test-who flex items-center gap-3">
									<div className="test-av w-9 h-9 md:w-10 md:h-10 text-[11px] md:text-xs">
										AK
									</div>
									<div>
										<div className="test-name text-[13px] md:text-[14px] font-medium">
											Adeola Kamara
										</div>
										<div className="test-city text-[11.5px] md:text-[12.5px] opacity-80">
											Lekki, Lagos
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
							<h1 className="form-h">Sign in</h1>
							<p className="form-sub">
								New to Handhub?{" "}
								<Link to="/signup" className="link">
									Create a free account
								</Link>
							</p>

							<div className="tabs relative overflow-hidden">
								<button
									type="button"
									className={`tab relative z-10 ${activeTab === "cust" ? "!text-white !font-semibold" : "text-[var(--txt3)]"}`}
									onClick={() => setActiveTab("cust")}
								>
									{activeTab === "cust" && (
										<motion.div
											layoutId="activeTabIndicator"
											className="absolute inset-0 bg-[var(--or)] rounded-[var(--rs)] -z-10"
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 30,
											}}
										/>
									)}
									Customer
								</button>
								<button
									type="button"
									className={`tab relative z-10 ${activeTab === "art" ? "!text-white !font-semibold" : "text-[var(--txt3)]"}`}
									onClick={() => setActiveTab("art")}
								>
									{activeTab === "art" && (
										<motion.div
											layoutId="activeTabIndicator"
											className="absolute inset-0 bg-[var(--or)] rounded-[var(--rs)] -z-10"
											transition={{
												type: "spring",
												stiffness: 380,
												damping: 30,
											}}
										/>
									)}
									Artisan
								</button>
							</div>

							<form onSubmit={handleSignIn}>
								<div className="field">
									<label htmlFor="signin-email">Email address</label>
									<div className="inp-wrap">
										<Mail className="inp-icon" size={16} aria-hidden="true" />
										<input
											id="signin-email"
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

								<div className="field">
									<div className="forgot-row">
										<label htmlFor="signin-pw">Password</label>
										<a className="forgot-link" href="#forgot">
											Forgot password?
										</a>
									</div>
									<div className="inp-wrap">
										<Lock className="inp-icon" size={16} aria-hidden="true" />
										<input
											id="signin-pw"
											className="inp has-icon"
											type={showPassword ? "text" : "password"}
											required
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											placeholder="••••••••"
											aria-label="Password"
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
								</div>

								<div className="check-row">
									<input
										type="checkbox"
										id="remember"
										checked={rememberMe}
										onChange={(e) => setRememberMe(e.target.checked)}
									/>
									<label htmlFor="remember">
										Keep me signed in on this device
									</label>
								</div>

								<button type="submit" className="btn-full">
									<ArrowRight size={17} aria-hidden="true" /> Sign in
								</button>
							</form>

							<div className="divider">
								<span>or continue with</span>
							</div>
							<div className="social-btns">
								<button
									type="button"
									className="soc-btn"
									aria-label="Sign in with Google"
								>
									<svg className="soc-icon" viewBox="0 0 24 24" fill="none">
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
									aria-label="Sign in with Apple"
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
							<p className="terms">
								By signing in you agree to our{" "}
								<a href="#terms">Terms of Service</a> and{" "}
								<a href="#privacy">Privacy Policy</a>
							</p>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
