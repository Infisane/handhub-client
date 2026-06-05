import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowDown,
	ArrowRight,
	Award,
	Check,
	CheckCircle2,
	Clock,
	Droplets,
	Hammer,
	Lock,
	MapPin,
	MessageCircle,
	Paintbrush,
	Play,
	Search,
	ShieldCheck,
	Sparkles,
	Star,
	Wind,
	Wrench,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { HHButton } from "#/components/hh/button";
import { Eyebrow, O } from "#/components/hh/primitives";
import { Reveal } from "#/components/hh/reveal";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_public/")({ component: Home });

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_STATS = [
	{ n: "12", suf: "k+", label: "Verified artisans" },
	{ n: "98", suf: "%", label: "Satisfaction rate" },
	{ n: "48", suf: "hr", label: "Avg. response time" },
	{ n: "6", suf: " cities", label: "Lagos, Abuja & more" },
];

const SEARCH_PILLS = [
	{ Icon: Droplets, label: "Plumber near me" },
	{ Icon: Zap, label: "Electrical emergency" },
	{ Icon: Hammer, label: "Carpentry" },
	{ Icon: Wind, label: "AC repair" },
	{ Icon: Paintbrush, label: "Painting" },
];

const HOW_STEPS = [
	{
		n: "01",
		Icon: MessageCircle,
		EndIcon: ArrowRight,
		endColor: "var(--hh-txt3)",
		title: "Describe your job",
		body: "Type naturally — our AI understands your request and extracts urgency, location, and trade type automatically.",
	},
	{
		n: "02",
		Icon: Sparkles,
		EndIcon: ArrowRight,
		endColor: "var(--hh-txt3)",
		title: "Get matched instantly",
		body: "Handhub surfaces the best verified artisans nearby, ranked by availability, rating, and proximity to you.",
	},
	{
		n: "03",
		Icon: Check,
		EndIcon: Lock,
		endColor: "var(--hh-or)",
		title: "Hire & pay safely",
		body: "Chat, confirm the quote, and pay securely — funds are held in escrow until the job is done to your satisfaction.",
	},
];

const FEATURES = [
	{
		Icon: Sparkles,
		title: "AI-powered search",
		body: "Plain language queries converted to prioritised local artisan matches in real time.",
	},
	{
		Icon: MessageCircle,
		title: "Real-time chat & quotes",
		body: "Chat directly with artisans. Receive binding quotes inline — no external apps needed.",
	},
	{
		Icon: ShieldCheck,
		title: "Verified artisans only",
		body: "Every artisan is ID-verified, background-checked, and rated by the community.",
	},
	{
		Icon: Lock,
		title: "Escrow-safe payments",
		body: "Your money is protected. Funds only release when you confirm the job is complete.",
	},
];

const TESTIMONIALS = [
	{
		initials: "AK",
		bg: "#0B2A4A",
		tc: "#60A5FA",
		name: "Adeola Kamara",
		city: "Lekki, Lagos",
		quote:
			"My inverter was smoking at midnight. I typed it into Handhub and had an electrician at my door in 40 minutes. Absolutely incredible service.",
	},
	{
		initials: "OB",
		bg: "#0D2333",
		tc: "#38BDF8",
		name: "Olumide Bello",
		city: "Wuse, Abuja",
		quote:
			"The AI search is mind-blowing. I described my leaking pipe in plain English and it matched me with a plumber less than 1km away within seconds.",
	},
	{
		initials: "NC",
		bg: "#10243B",
		tc: "#93C5FD",
		name: "Ngozi Chukwu",
		city: "GRA, Port Harcourt",
		quote:
			"I love that I can see the quote right in the chat and pay without leaving the app. The escrow payment gave me so much peace of mind.",
	},
];

// ─── Feature visual panels ────────────────────────────────────────────────────

function FeatVisual0() {
	return (
		<div className="flex flex-col gap-3">
			<div
				className="rounded-[14px] border px-4 py-3"
				style={{
					background: "var(--hh-bg2)",
					borderColor: "var(--hh-border2)",
				}}
			>
				<div className="flex items-center gap-2">
					<Sparkles size={16} style={{ color: "var(--hh-or)" }} aria-hidden />
					<span
						className="flex-1 text-[13px]"
						style={{ color: "var(--hh-txt2)" }}
					>
						Emergency electrician in Ikeja…
					</span>
					<span
						className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
						style={{
							background: "rgba(37,99,235,0.15)",
							border: "1px solid rgba(37,99,235,0.3)",
							color: "#93C5FD",
						}}
					>
						<Zap size={10} aria-hidden /> Matching
					</span>
				</div>
				<div className="flex gap-2 mt-2.5 flex-wrap">
					{[
						{ Icon: Zap, label: "Electrical" },
						{ Icon: Droplets, label: "Plumbing" },
						{ Icon: Wrench, label: "General repair" },
					].map(({ Icon, label }) => (
						<span
							key={label}
							className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]"
							style={{
								background: "rgba(255,255,255,0.05)",
								borderColor: "var(--hh-border2)",
								color: "var(--hh-txt2)",
							}}
						>
							<Icon size={11} aria-hidden /> {label}
						</span>
					))}
				</div>
			</div>
			<p
				className="text-[11px] uppercase tracking-[0.6px]"
				style={{ color: "var(--hh-txt3)" }}
			>
				3 matches found nearby
			</p>
			{[
				{
					init: "TJ",
					name: "Taiwo Johnson",
					role: "Licensed Electrician · 1.2km",
					rating: "4.9",
					bg: "#0B2A4A",
					tc: "#60A5FA",
				},
				{
					init: "KA",
					name: "Kunle Adeyemi",
					role: "Electrician · 2.4km",
					rating: "4.7",
					bg: "#0D2333",
					tc: "#38BDF8",
				},
			].map((a) => (
				<div
					key={a.init}
					className="flex items-center gap-3 rounded-[14px] border px-4 py-3"
					style={{
						background: "var(--hh-bg2)",
						borderColor: "var(--hh-border)",
					}}
				>
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0"
						style={{ background: a.bg, color: a.tc }}
					>
						{a.init}
					</div>
					<div>
						<p
							className="text-[13.5px] font-medium"
							style={{ color: "var(--hh-txt)" }}
						>
							{a.name}
						</p>
						<p className="text-[11.5px]" style={{ color: "var(--hh-txt3)" }}>
							{a.role}
						</p>
					</div>
					<div className="ml-auto flex flex-col items-end gap-1">
						<div
							className="flex items-center gap-1 text-[11px]"
							style={{ color: "#F59E0B" }}
						>
							<Star size={11} fill="#F59E0B" aria-hidden /> {a.rating}
						</div>
						<span
							className="text-[10.5px] rounded-full px-2 py-0.5"
							style={{ background: "rgba(74,222,128,0.1)", color: "#4ADE80" }}
						>
							Now
						</span>
					</div>
				</div>
			))}
		</div>
	);
}

function FeatVisual1() {
	return (
		<div className="flex flex-col gap-2">
			<div
				className="rounded-[14px] border p-4 flex flex-col gap-3"
				style={{ background: "var(--hh-bg2)", borderColor: "var(--hh-border)" }}
			>
				<div className="flex gap-2 items-start">
					<div
						className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
						style={{ background: "#0B2A4A", color: "#60A5FA" }}
					>
						TJ
					</div>
					<div
						className="flex-1 rounded-[10px_10px_10px_0] px-3 py-2 text-[12px] leading-relaxed"
						style={{
							background: "rgba(255,255,255,0.06)",
							color: "var(--hh-txt2)",
						}}
					>
						I can head over by 4:00 PM. Is that okay with you?
					</div>
				</div>
				<div className="flex flex-row-reverse">
					<div
						className="rounded-[10px_10px_0_10px] px-3 py-2 text-[12px] leading-relaxed"
						style={{ background: "rgba(59,130,246,0.18)", color: "#BFDBFE" }}
					>
						Sure, that works perfectly!
					</div>
				</div>
				<div className="flex gap-2 items-start">
					<div
						className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
						style={{ background: "#0B2A4A", color: "#60A5FA" }}
					>
						TJ
					</div>
					<div className="flex-1">
						<div
							className="rounded-[10px_10px_10px_0] px-3 py-2 text-[12px] mb-2"
							style={{
								background: "rgba(255,255,255,0.06)",
								color: "var(--hh-txt2)",
							}}
						>
							Here's my quote for the job:
						</div>
						<div
							className="rounded-[10px] border px-3 py-3"
							style={{
								background: "rgba(59,130,246,0.08)",
								borderColor: "rgba(59,130,246,0.2)",
							}}
						>
							<p
								className="text-[11px] mb-0.5"
								style={{ color: "var(--hh-txt3)" }}
							>
								Quote proposal
							</p>
							<p
								className="text-[18px] font-bold"
								style={{
									fontFamily: "var(--font-syne)",
									color: "var(--hh-or)",
								}}
							>
								₦45,000
							</p>
							<p
								className="text-[11px] mb-2"
								style={{ color: "var(--hh-txt3)" }}
							>
								Inverter inspection (fixed rate)
							</p>
							<button
								type="button"
								className="w-full rounded-[8px] py-1.5 text-[11.5px] font-medium text-white cursor-pointer"
								style={{ background: "var(--hh-or)", border: "none" }}
							>
								Review &amp; pay now
							</button>
						</div>
					</div>
				</div>
			</div>
			<div className="flex gap-2 flex-wrap">
				{["I'm on my way", "Can we reschedule?", "Got it, thanks!"].map((r) => (
					<span
						key={r}
						className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px]"
						style={{
							background: "rgba(255,255,255,0.05)",
							borderColor: "var(--hh-border2)",
							color: "var(--hh-txt2)",
						}}
					>
						{r}
					</span>
				))}
			</div>
		</div>
	);
}

function FeatVisual2() {
	return (
		<div className="flex flex-col gap-3">
			<div
				className="flex items-center gap-3 rounded-[14px] border px-4 py-3"
				style={{
					background: "var(--hh-bg2)",
					borderColor: "rgba(74,222,128,0.2)",
				}}
			>
				<div
					className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0"
					style={{ background: "#0D2D1A", color: "#4ADE80" }}
				>
					FA
				</div>
				<div>
					<p
						className="text-[13.5px] font-medium"
						style={{ color: "var(--hh-txt)" }}
					>
						Fatima Abubakar
					</p>
					<p className="text-[11.5px]" style={{ color: "var(--hh-txt3)" }}>
						Verified Carpenter
					</p>
				</div>
				<div className="ml-auto flex flex-col items-end gap-1">
					<div
						className="flex items-center gap-1 text-[11px]"
						style={{ color: "#F59E0B" }}
					>
						<Star size={11} fill="#F59E0B" aria-hidden /> 4.7
					</div>
					<span
						className="text-[10.5px] rounded-full px-2 py-0.5"
						style={{ background: "rgba(74,222,128,0.1)", color: "#4ADE80" }}
					>
						Verified
					</span>
				</div>
			</div>
			{[
				{ Icon: ShieldCheck, label: "Government ID verified" },
				{ Icon: Award, label: "Trade certification checked" },
				{ Icon: Star, label: "45 verified reviews" },
			].map(({ Icon, label }) => (
				<div
					key={label}
					className="flex items-center gap-3 rounded-[10px] border px-4 py-3"
					style={{
						background: "var(--hh-bg2)",
						borderColor: "var(--hh-border)",
					}}
				>
					<Icon size={16} style={{ color: "var(--hh-or)" }} aria-hidden />
					<span
						className="flex-1 text-[12.5px]"
						style={{ color: "var(--hh-txt2)" }}
					>
						{label}
					</span>
					<CheckCircle2 size={16} style={{ color: "#4ADE80" }} aria-hidden />
				</div>
			))}
		</div>
	);
}

function FeatVisual3() {
	return (
		<div className="flex flex-col gap-3">
			<div className="text-center py-5">
				<div
					className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3.5"
					style={{
						background: "rgba(74,222,128,0.1)",
						border: "1px solid rgba(74,222,128,0.2)",
					}}
				>
					<Lock size={22} style={{ color: "#4ADE80" }} aria-hidden />
				</div>
				<p
					className="text-[18px] font-bold mb-1.5"
					style={{ fontFamily: "var(--font-syne)", color: "var(--hh-txt)" }}
				>
					Funds held safely
				</p>
				<p className="text-[12.5px]" style={{ color: "var(--hh-txt3)" }}>
					Released only when job is confirmed complete
				</p>
			</div>
			<div
				className="flex items-center justify-between rounded-[10px] border px-4 py-3"
				style={{
					background: "rgba(74,222,128,0.06)",
					borderColor: "rgba(74,222,128,0.15)",
				}}
			>
				<span className="text-[12.5px]" style={{ color: "var(--hh-txt2)" }}>
					Payment captured
				</span>
				<span className="text-[12px] font-medium" style={{ color: "#4ADE80" }}>
					₦45,000
				</span>
			</div>
			<div
				className="flex items-center justify-center gap-1.5 text-[12px]"
				style={{ color: "var(--hh-txt3)" }}
			>
				<ArrowDown size={14} aria-hidden /> Held in escrow
			</div>
			<div
				className="flex items-center justify-between rounded-[10px] border px-4 py-3"
				style={{ background: "var(--hh-bg2)", borderColor: "var(--hh-border)" }}
			>
				<span className="text-[12.5px]" style={{ color: "var(--hh-txt3)" }}>
					Released to artisan
				</span>
				<span className="text-[12px]" style={{ color: "var(--hh-txt3)" }}>
					On job completion
				</span>
			</div>
		</div>
	);
}

const FEAT_VISUALS = [
	<FeatVisual0 />,
	<FeatVisual1 />,
	<FeatVisual2 />,
	<FeatVisual3 />,
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function Home() {
	const navigate = useNavigate();
	const [heroQuery, setHeroQuery] = useState("");
	const [activeFeature, setActiveFeature] = useState(0);

	const handleCTAFindArtisan = () => navigate({ to: "/find" });

	return (
		<>
			{/* ── Hero ───────────────────────────────────────────────────────── */}
			<section className="relative min-h-dvh flex flex-col items-center justify-center text-center px-[5%] pt-[120px] pb-20 overflow-hidden">
				<div
					className="absolute inset-0 pointer-events-none overflow-hidden"
					aria-hidden
				>
					<div
						className="absolute w-[600px] h-[600px] rounded-full -top-[100px] -left-[100px]"
						style={{
							background:
								"radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)",
							animation: "hhFloat1 8s ease-in-out infinite",
						}}
					/>
					<div
						className="absolute w-[500px] h-[500px] rounded-full -bottom-[80px] -right-[80px]"
						style={{
							background:
								"radial-gradient(circle,rgba(37,99,235,0.10) 0%,transparent 70%)",
							animation: "hhFloat2 10s ease-in-out infinite",
						}}
					/>
					<div
						className="absolute inset-0"
						style={{
							backgroundImage:
								"linear-gradient(var(--hh-border) 1px,transparent 1px),linear-gradient(90deg,var(--hh-border) 1px,transparent 1px)",
							backgroundSize: "60px 60px",
							maskImage:
								"radial-gradient(ellipse 80% 60% at 50% 50%,black 0%,transparent 100%)",
						}}
					/>
				</div>

				<div className="relative z-10 w-full max-w-[800px]">
					<div
						className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-[5px] text-[12px] font-semibold mb-7"
						style={{
							background: "rgba(245,158,11,0.12)",
							borderColor: "rgba(245,158,11,0.30)",
							color: "var(--hh-gold)",
							animation: "fadeUp .6s ease both",
						}}
					>
						<ShieldCheck size={13} aria-hidden /> Verified artisans, trusted by thousands
					</div>

					<h1
						className="font-extrabold leading-[1.05] tracking-[-2px] mb-5"
						style={{
							fontFamily: "var(--font-syne)",
							fontSize: "clamp(40px,5vw,78px)",
							color: "var(--hh-txt)",
							animation: "fadeUp .7s .1s ease both",
						}}
					>
						Skilled hands,
						<br />
						at your{" "}
						<span
							className="relative inline-block"
							style={{ color: "var(--hh-or)" }}
						>
							doorstep
							<span
								className="absolute left-0 right-0 h-[3px] rounded-sm opacity-50"
								style={{ bottom: "-4px", background: "var(--hh-or)" }}
								aria-hidden
							/>
						</span>
					</h1>

					<p
						className="text-[17px] max-w-[520px] mx-auto mb-10 font-light leading-[1.7]"
						style={{
							color: "var(--hh-txt2)",
							animation: "fadeUp .7s .2s ease both",
						}}
					>
						Handhub connects you with verified local artisans — electricians,
						plumbers, carpenters and more — in minutes, not days.
					</p>

					<div
						className="flex items-center justify-center gap-3.5 mb-16"
						style={{ animation: "fadeUp .7s .3s ease both" }}
					>
						<HHButton size="lg" onClick={handleCTAFindArtisan}>
							<Search size={17} aria-hidden /> Find an artisan
						</HHButton>
						<HHButton variant="ghost" size="lg">
							<Play size={17} aria-hidden /> See how it works
						</HHButton>
					</div>

					<div
						className="flex items-center justify-center mb-16"
						style={{ animation: "fadeUp .7s .4s ease both" }}
					>
						{HERO_STATS.map((s, i) => (
							<div key={s.label} className="flex items-center">
								{i > 0 && (
									<div
										className="w-px h-10 mx-12"
										style={{ background: "var(--hh-border2)" }}
										aria-hidden
									/>
								)}
								<div className="text-center">
									<div
										className="text-[32px] font-extrabold"
										style={{
											fontFamily: "var(--font-syne)",
											color: "var(--hh-txt)",
										}}
									>
										{s.n}
										<O>{s.suf}</O>
									</div>
									<div
										className="text-[12px] uppercase tracking-[0.8px] mt-0.5"
										style={{ color: "var(--hh-txt3)" }}
									>
										{s.label}
									</div>
								</div>
							</div>
						))}
					</div>

					<div
						className="max-w-[680px] mx-auto"
						style={{ animation: "fadeUp .7s .5s ease both" }}
					>
						<div
							className="relative rounded-[18px] border px-5 py-4"
							style={{
								background: "var(--hh-card)",
								borderColor: "var(--hh-border2)",
							}}
						>
							<div
								className="absolute inset-[-1px] rounded-[18px] -z-10"
								style={{
									background:
										"linear-gradient(135deg,rgba(59,130,246,0.3),rgba(37,99,235,0.2),transparent 60%)",
								}}
								aria-hidden
							/>
							<div className="flex items-center gap-2.5">
								<Sparkles
									size={18}
									style={{ color: "var(--hh-or)" }}
									aria-hidden
								/>
								<input
									value={heroQuery}
									onChange={(e) => setHeroQuery(e.target.value)}
									placeholder='Try "Emergency electrician in Lekki right now…"'
									className="hh-search-input flex-1 bg-transparent border-none outline-none text-[14px]"
									style={{
										color: "var(--hh-txt)",
										caretColor: "var(--hh-or)",
										fontFamily: "var(--font-dm)",
									}}
									aria-label="Search for artisans"
								/>
								<div
									className="flex items-center gap-1 rounded-full border px-2.5 py-[5px] text-[11px] font-medium"
									style={{
										background: "rgba(37,99,235,0.15)",
										borderColor: "rgba(37,99,235,0.3)",
										color: "#93C5FD",
									}}
								>
									<Zap size={11} aria-hidden /> AI Search
								</div>
							</div>
							<div className="flex gap-2 mt-3 flex-wrap">
								{SEARCH_PILLS.map(({ Icon, label }) => (
									<button
										key={label}
										type="button"
										onClick={() => setHeroQuery(label)}
										className="hh-spill inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] cursor-pointer transition-all duration-150"
										style={{
											background: "rgba(255,255,255,0.05)",
											borderColor: "var(--hh-border2)",
											color: "var(--hh-txt2)",
										}}
									>
										<Icon size={13} aria-hidden /> {label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── Trust bar ──────────────────────────────────────────────────── */}
			<Reveal
				className="flex items-center justify-center gap-10 flex-wrap px-[5%] py-10 border-t border-b"
				style={{ borderColor: "var(--hh-border)" }}
			>
				{[
					{ Icon: ShieldCheck, label: "Verified & background-checked" },
					{ Icon: Lock, label: "Secure escrow payments" },
					{ Icon: Clock, label: "24/7 emergency support" },
					{ Icon: Star, label: "Rated 4.9 on App Store" },
					{ Icon: MapPin, label: "Lagos · Abuja · Port Harcourt" },
				].map(({ Icon, label }) => (
					<div
						key={label}
						className="flex items-center gap-2 text-[13px]"
						style={{ color: "var(--hh-txt3)" }}
					>
						<Icon size={16} style={{ color: "var(--hh-txt2)" }} aria-hidden />{" "}
						{label}
					</div>
				))}
			</Reveal>

			{/* ── How it works ───────────────────────────────────────────────── */}
			<section className="py-[100px] px-[5%]">
				<Eyebrow>How it works</Eyebrow>
				<h2
					className="font-extrabold tracking-[-1.5px] leading-[1.1] max-w-[560px] mb-14"
					style={{
						fontFamily: "var(--font-syne)",
						fontSize: "clamp(32px,4vw,48px)",
						color: "var(--hh-txt)",
					}}
				>
					Booked, matched, and done — <O>in minutes</O>
				</h2>
				<Reveal
					className="grid sm:grid-cols-3 border rounded-[14px] overflow-hidden"
					style={{ borderColor: "var(--hh-border)" }}
				>
					{HOW_STEPS.map(({ n, Icon, EndIcon, endColor, title, body }, i) => (
						<div
							key={n}
							className={cn(
								"relative p-9 transition-colors duration-200",
								i > 0 && "border-t sm:border-t-0 sm:border-l",
							)}
							style={{
								background: "var(--hh-card)",
								borderColor: "var(--hh-border)",
							}}
							onMouseEnter={(e) => {
								(e.currentTarget as HTMLDivElement).style.background =
									"var(--hh-card2)";
							}}
							onMouseLeave={(e) => {
								(e.currentTarget as HTMLDivElement).style.background =
									"var(--hh-card)";
							}}
						>
							<div
								className="absolute top-4 right-5 text-[64px] font-extrabold leading-none pointer-events-none select-none"
								style={{
									fontFamily: "var(--font-syne)",
									color: "rgba(255,255,255,0.04)",
								}}
								aria-hidden
							>
								{n}
							</div>
							<div
								className="w-11 h-11 rounded-[8px] border flex items-center justify-center mb-5"
								style={{
									background: "rgba(59,130,246,0.12)",
									borderColor: "rgba(59,130,246,0.2)",
								}}
							>
								<Icon size={20} style={{ color: "var(--hh-or)" }} aria-hidden />
							</div>
							<h3
								className="text-[17px] font-bold mb-2"
								style={{
									fontFamily: "var(--font-syne)",
									color: "var(--hh-txt)",
								}}
							>
								{title}
							</h3>
							<p
								className="text-[13.5px] leading-[1.65] mb-5"
								style={{ color: "var(--hh-txt2)" }}
							>
								{body}
							</p>
							<div
								className={cn(
									"flex",
									i === 2 ? "justify-start" : "justify-end",
								)}
							>
								<EndIcon size={18} style={{ color: endColor }} aria-hidden />
							</div>
						</div>
					))}
				</Reveal>
			</section>

			{/* ── Features ───────────────────────────────────────────────────── */}
			<section className="px-[5%] pb-[100px]">
				<Eyebrow>Features</Eyebrow>
				<h2
					className="font-extrabold tracking-[-1.5px] leading-[1.1] max-w-[560px] mb-14"
					style={{
						fontFamily: "var(--font-syne)",
						fontSize: "clamp(32px,4vw,48px)",
						color: "var(--hh-txt)",
					}}
				>
					Everything you need, <O>built in</O>
				</h2>
				<Reveal className="grid lg:grid-cols-2 gap-10 items-center">
					<div className="flex flex-col gap-1.5">
						{FEATURES.map(({ Icon, title, body }, i) => (
							<button
								key={title}
								type="button"
								onClick={() => setActiveFeature(i)}
								className={cn(
									"hh-feat-item text-left rounded-[14px] border border-transparent p-5 cursor-pointer transition-all duration-200",
									activeFeature === i && "active",
								)}
							>
								<div className="flex items-center gap-3.5 mb-2">
									<div
										className="hh-feat-icon w-[38px] h-[38px] rounded-[8px] border flex items-center justify-center shrink-0 transition-all duration-200"
										style={{
											background: "rgba(255,255,255,0.05)",
											borderColor: "var(--hh-border)",
										}}
									>
										<Icon
											size={18}
											style={{
												color:
													activeFeature === i
														? "var(--hh-or)"
														: "var(--hh-txt3)",
											}}
											aria-hidden
										/>
									</div>
									<span
										className="hh-feat-title text-[15px] font-bold transition-colors duration-200"
										style={{
											fontFamily: "var(--font-syne)",
											color:
												activeFeature === i
													? "var(--hh-txt)"
													: "var(--hh-txt2)",
										}}
									>
										{title}
									</span>
								</div>
								<p
									className="text-[13px] leading-[1.6] pl-[52px]"
									style={{ color: "var(--hh-txt3)" }}
								>
									{body}
								</p>
							</button>
						))}
					</div>
					<div
						className="relative rounded-[20px] border p-7 min-h-[380px] overflow-hidden"
						style={{
							background: "var(--hh-card)",
							borderColor: "var(--hh-border2)",
						}}
					>
						<div
							className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full pointer-events-none"
							style={{
								background:
									"radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)",
							}}
							aria-hidden
						/>
						{FEAT_VISUALS[activeFeature]}
					</div>
				</Reveal>
			</section>

			{/* ── Testimonials ───────────────────────────────────────────────── */}
			<section className="px-[5%] pb-[100px]">
				<Eyebrow>What people say</Eyebrow>
				<h2
					className="font-extrabold tracking-[-1.5px] leading-[1.1] max-w-[560px] mb-14"
					style={{
						fontFamily: "var(--font-syne)",
						fontSize: "clamp(32px,4vw,48px)",
						color: "var(--hh-txt)",
					}}
				>
					Trusted across <O>Nigeria</O>
				</h2>
				<Reveal className="grid sm:grid-cols-3 gap-4">
					{TESTIMONIALS.map((t) => (
						<div
							key={t.initials}
							className="rounded-[14px] border p-6"
							style={{
								background: "var(--hh-card)",
								borderColor: "var(--hh-border)",
							}}
						>
							<div className="flex gap-0.5 mb-3.5" aria-label="5 stars">
								{Array.from({ length: 5 }).map((_, i) => (
									<Star
										key={i}
										size={14}
										fill="#F59E0B"
										style={{ color: "#F59E0B" }}
										aria-hidden
									/>
								))}
							</div>
							<p
								className="text-[13.5px] leading-[1.7] mb-4"
								style={{ color: "var(--hh-txt2)" }}
							>
								"{t.quote}"
							</p>
							<div className="flex items-center gap-2.5">
								<div
									className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
									style={{ background: t.bg, color: t.tc }}
								>
									{t.initials}
								</div>
								<div>
									<p
										className="text-[13px] font-medium"
										style={{ color: "var(--hh-txt)" }}
									>
										{t.name}
									</p>
									<p
										className="text-[11px]"
										style={{ color: "var(--hh-txt3)" }}
									>
										{t.city}
									</p>
								</div>
							</div>
						</div>
					))}
				</Reveal>
			</section>

			{/* ── Dual CTA ───────────────────────────────────────────────────── */}
			<section className="px-[5%] pb-[100px]">
				<Eyebrow>Get started</Eyebrow>
				<h2
					className="font-extrabold tracking-[-1.5px] leading-[1.1] max-w-[560px] mb-10"
					style={{
						fontFamily: "var(--font-syne)",
						fontSize: "clamp(32px,4vw,48px)",
						color: "var(--hh-txt)",
					}}
				>
					Join the <O>Handhub</O> community
				</h2>
				<Reveal className="grid sm:grid-cols-2 gap-4">
					<div
						className="relative rounded-[20px] border p-10 overflow-hidden"
						style={{
							background: "var(--hh-card)",
							borderColor: "var(--hh-border2)",
						}}
					>
						<p
							className="text-[11px] uppercase tracking-[1px] font-medium mb-3"
							style={{ color: "var(--hh-txt3)" }}
						>
							For customers
						</p>
						<h3
							className="text-[26px] font-extrabold tracking-[-0.8px] leading-[1.1] mb-2.5"
							style={{ fontFamily: "var(--font-syne)", color: "var(--hh-txt)" }}
						>
							Find skilled help today
						</h3>
						<p
							className="text-[13.5px] leading-[1.6] mb-6"
							style={{ color: "var(--hh-txt3)" }}
						>
							Post a job, get instant AI-matched artisans, and pay safely — all
							in one place.
						</p>
						<HHButton onClick={handleCTAFindArtisan}>
							<Search size={15} aria-hidden /> Find an artisan
						</HHButton>
						<div
							className="absolute bottom-[-10px] right-4 text-[120px] font-extrabold leading-none pointer-events-none select-none"
							style={{
								fontFamily: "var(--font-syne)",
								color: "rgba(255,255,255,0.05)",
							}}
							aria-hidden
						>
							C
						</div>
					</div>
					<div
						className="relative rounded-[20px] p-10 overflow-hidden"
						style={{ background: "var(--hh-or)" }}
					>
						<p
							className="text-[11px] uppercase tracking-[1px] font-medium mb-3"
							style={{ color: "rgba(255,255,255,0.8)" }}
						>
							For artisans
						</p>
						<h3
							className="text-[26px] font-extrabold tracking-[-0.8px] leading-[1.1] mb-2.5 text-white"
							style={{ fontFamily: "var(--font-syne)" }}
						>
							Grow your trade business
						</h3>
						<p
							className="text-[13.5px] leading-[1.6] mb-6"
							style={{ color: "rgba(255,255,255,0.8)" }}
						>
							Get matched with nearby customers, manage bookings, and get paid
							on time — every time.
						</p>
						<HHButton variant="white">
							<Wrench size={15} aria-hidden /> Join as artisan
						</HHButton>
						<div
							className="absolute bottom-[-10px] right-4 text-[120px] font-extrabold leading-none text-white pointer-events-none select-none"
							style={{ fontFamily: "var(--font-syne)", opacity: 0.05 }}
							aria-hidden
						>
							A
						</div>
					</div>
				</Reveal>
			</section>
		</>
	);
}
