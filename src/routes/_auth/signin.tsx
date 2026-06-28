import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Loader2,
	Lock,
	Mail,
	ShieldCheck,
	Sparkles,
	Users,
} from "lucide-react";
import { useState } from "react";
import { AppInput } from "#/components/ui/app-input";
import { AuthLeftPanel } from "#/components/auth/auth-left-panel";
import { formBoxMotion, itemVariants } from "#/components/auth/auth-motion";
import { SocialAuthButtons } from "#/components/auth/social-auth-buttons";
import { Nav } from "#/components/home/nav";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useLoginQuery } from "#/core/queries/auth.q";
import { SignInSchema } from "#/core/schemas/auth.schema";
import { USER_TYPES } from "#/core/helpers/constants.helper";
import { writeStoredSession } from "#/core/helpers/auth-storage.helper";
import { useAppDispatch } from "#/core/hooks/useStore.hook";
import { set_auth_session } from "#/core/redux-store/slices/auth.slice";

export const Route = createFileRoute("/_auth/signin")({
	component: SignInPage,
});

function SignInPage() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<"cust" | "art">("cust");
	const [loginFormData, setLoginFormData] = useState({
		email: "",
		password: "",
	});
	const [rememberMe, setRememberMe] = useState(true);

	const { validate, revalidate, errors } = useValidator({
		schema: SignInSchema,
		store: loginFormData,
	});

	const dispatch = useAppDispatch();

	const { mutate: handleLoginRequest, isPending: isLoginPending } = useLoginQuery({
		onSuccessCallback: (session) => {
			dispatch(set_auth_session({ token: session.token, user: session.user }));
			writeStoredSession(session);
			navigate({ to: "/dashboard" });
		},
	});

	const handleSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		validate(() => {
			handleLoginRequest({
				credential: loginFormData.email,
				password: loginFormData.password,
				userType: activeTab === "cust" ? USER_TYPES.customer : USER_TYPES.artisan,
			});
		});
	};

	const rightElement = (
		<span className="nav-link">
			No account?{" "}
			<Link to="/signup" className="link font-medium">
				Sign up free
			</Link>
		</span>
	);

	return (
		<div className="hh-auth">
			<Nav showLinks={false} rightElement={rightElement} />
			<div className="page-wrap active" id="signin-page">
				<div className="split">
					{/* Left Panel */}
					<AuthLeftPanel
						eyebrowIcon={Sparkles}
						eyebrowText="Nigeria's #1 artisan platform"
						heading={
							<>
								Welcome back to <em>Handhub</em>
							</>
						}
						subheading="Skilled artisans, safe payments, and real-time chat — all in one place. Sign back in to manage your jobs."
						proofs={[
							{
								icon: ShieldCheck,
								title: "Escrow-protected payments",
								subtitle: "Your money is held safely until the job is done",
							},
							{
								icon: Users,
								title: "Vetted neighborhood pros",
								subtitle:
									"Connect with background-checked and trusted local professionals",
							},
						]}
					>
						<motion.div
							className="testimonial p-5 md:p-6 mt-0"
							variants={itemVariants}
						>
							<div className="test-q text-[14px] md:text-[15.5px] italic mb-4 opacity-90">
								"My inverter was smoking at midnight. I had an electrician at my
								door in 40 minutes."
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
					</AuthLeftPanel>

					{/* Right Panel */}
					<div className="panel-right">
						<motion.div className="form-box" {...formBoxMotion}>
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
									<AppInput
										id="signin-email"
										type="email"
										icon={<Mail size={16} aria-hidden="true" />}
										value={loginFormData.email}
										onChange={(e) => {
											setLoginFormData({ ...loginFormData, email: e.target.value });
											revalidate("email", e.target.value);
										}}
										placeholder="you@example.com"
										aria-label="Email address"
										error={errors.email}
									/>
								</div>

								<div className="field">
									<div className="forgot-row">
										<label htmlFor="signin-pw">Password</label>
										<a className="forgot-link" href="#forgot">
											Forgot password?
										</a>
									</div>
									<AppInput
										id="signin-pw"
										type="password"
										icon={<Lock size={16} aria-hidden="true" />}
										value={loginFormData.password}
										onChange={(e) => {
											setLoginFormData({ ...loginFormData, password: e.target.value });
											revalidate("password", e.target.value);
										}}
										placeholder="••••••••"
										aria-label="Password"
										error={errors.password}
									/>
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

								<button
									type="submit"
									className="btn-full"
									disabled={isLoginPending}
								>
									{isLoginPending ? (
										<Loader2
											size={17}
											className="animate-spin"
											aria-hidden="true"
										/>
									) : (
										<ArrowRight size={17} aria-hidden="true" />
									)}
									{isLoginPending ? "Signing in..." : "Sign in"}
								</button>
							</form>

							<SocialAuthButtons verb="Sign in" dividerLabel="or continue with" />
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
