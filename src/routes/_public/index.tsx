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
	type LucideIcon,
	MapPin,
	MessageCircle,
	Paintbrush,
	Play,
	Plug,
	Search,
	ShieldCheck,
	Sparkles,
	Star,
	Users,
	Wind,
	Wrench,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { HHButton } from "#/components/hh/button";
import { Eyebrow, O } from "#/components/hh/primitives";
import { Reveal } from "#/components/hh/reveal";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_public/")({ component: Home });

// ─── Data ─────────────────────────────────────────────────────────────────────

const SEARCH_PILLS = [
	{ Icon: Droplets, label: "Plumber near me" },
	{ Icon: Zap, label: "Electrical emergency" },
	{ Icon: Hammer, label: "Carpentry" },
	{ Icon: Wind, label: "AC repair" },
	{ Icon: Paintbrush, label: "Painting" },
];

// Concrete services a Lagos home actually needs — so users instantly see their problem is covered
const SERVICES = [
	{ Icon: Droplets, label: "Plumbing", note: "Leaks, taps, toilets" },
	{ Icon: Zap, label: "Electrical", note: "Wiring, sockets, faults" },
	{ Icon: Sparkles, label: "Cleaning", note: "Homes & deep cleans" },
	{ Icon: Hammer, label: "Carpentry", note: "Furniture & repairs" },
	{ Icon: Wind, label: "AC & Cooling", note: "Service & repair" },
	{ Icon: Paintbrush, label: "Painting", note: "Interior & exterior" },
	{ Icon: Wrench, label: "Generator", note: "Service & fixes" },
	{ Icon: Plug, label: "Appliances", note: "Fridge, washer & more" },
];

// Faces in the hero social-proof strip (initials stand in for real artisan photos)
const HERO_FACES = [
	{ init: "TJ", bg: "#EFF6FF", tc: "#1E3A8A" },
	{ init: "FA", bg: "#FDF4E3", tc: "#B7791F" },
	{ init: "EM", bg: "#E0F2FE", tc: "#0369A1" },
	{ init: "BK", bg: "#E2FBF0", tc: "#0F766E" },
	{ init: "NC", bg: "#F5F3FF", tc: "#6D28D9" },
];

// Hero gallery artisan photos — TEMPORARY Unsplash stock; swap for real Lagos artisans.
// Each gracefully falls back to a labelled tile if the remote image fails to load.
const HERO_PHOTOS: { src: string; label: string; Icon: LucideIcon }[] = [
	{
		src: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=420&h=560&q=70",
		label: "Painter",
		Icon: Paintbrush,
	},
	{
		src: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=420&h=560&q=70",
		label: "Plumber",
		Icon: Droplets,
	},
	{
		src: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=520&h=680&q=72",
		label: "Electrician",
		Icon: Zap,
	},
	{
		src: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=420&h=560&q=70",
		label: "Carpenter",
		Icon: Hammer,
	},
	{
		src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=420&h=560&q=70",
		label: "Cleaner",
		Icon: Sparkles,
	},
];

const HOW_STEPS = [
	{
		n: "01",
		Icon: MessageCircle,
		EndIcon: ArrowRight,
		endColor: "var(--hh-txt3)",
		title: "Tell us what you need",
		body: "Describe the job in your own words — “leaking tap”, “AC not cooling”, “deep clean before guests”. No long forms, no fuss.",
	},
	{
		n: "02",
		Icon: Users,
		EndIcon: ArrowRight,
		endColor: "var(--hh-txt3)",
		title: "Meet trusted pros nearby",
		body: "We show you verified artisans close to you — with real ratings and honest reviews from neighbours who’ve used them.",
	},
	{
		n: "03",
		Icon: Check,
		EndIcon: Lock,
		endColor: "var(--hh-or)",
		title: "Relax — you’re covered",
		body: "Chat, agree a fair price, and pay safely. Your money is held securely and only released once the job is done right.",
	},
];

const FEATURES = [
	{
		Icon: ShieldCheck,
		title: "Verified artisans only",
		body: "Every artisan is ID-verified, background-checked and rated by real customers. The person at your door is exactly who they say they are.",
	},
	{
		Icon: Lock,
		title: "Your money stays safe",
		body: "Pay into secure escrow. Funds only reach the artisan once you confirm the job is finished to your satisfaction.",
	},
	{
		Icon: MessageCircle,
		title: "Chat & clear quotes",
		body: "Message artisans directly and get a clear, upfront price before anyone starts — no surprises, no haggling at your door.",
	},
	{
		Icon: Star,
		title: "Real reviews, real neighbours",
		body: "See honest ratings from people near you before you hire. Thousands of Lagos homes help each other choose well.",
	},
];

const TESTIMONIALS = [
	{
		initials: "AK",
		bg: "#EFF6FF",
		tc: "#1E3A8A",
		name: "Adeola Kamara",
		city: "Lekki, Lagos",
		quote:
			"My inverter was smoking at midnight. I typed it into Handhub and had an electrician at my door in 40 minutes. Absolutely incredible service.",
	},
	{
		initials: "OB",
		bg: "#E0F2FE",
		tc: "#0369A1",
		name: "Olumide Bello",
		city: "Wuse, Abuja",
		quote:
			"I needed an urgent plumber for a major leak. I described the problem and was matched with a professional in Wuse less than 1km away within minutes. Very reliable!",
	},
	{
		initials: "NC",
		bg: "#E2FBF0",
		tc: "#0F766E",
		name: "Ngozi Chukwu",
		city: "GRA, Port Harcourt",
		quote:
			"I love that I can see the quote right in the chat and pay without leaving the app. The escrow payment gave me so much peace of mind.",
	},
];

// Hero gallery card — stock image with a graceful labelled fallback (never breaks)
function HeroPhoto({
	src,
	label,
	Icon,
	className,
}: {
	src: string;
	label: string;
	Icon: LucideIcon;
	className?: string;
}) {
	const [failed, setFailed] = useState(false);
	return (
		<div
			className={cn(
				"relative rounded-[20px] overflow-hidden border shadow-sm shrink-0",
				className,
			)}
			style={{ borderColor: "var(--hh-border)", background: "var(--hh-bg3)" }}
		>
			{failed ? (
				<div
					className="absolute inset-0 flex items-center justify-center"
					style={{ background: "linear-gradient(160deg,var(--hh-bg3),#E7E0D5)" }}
				>
					<Icon size={26} style={{ color: "var(--hh-or)" }} aria-hidden />
				</div>
			) : (
				<img
					src={src}
					alt={`Verified ${label.toLowerCase()} in Lagos`}
					loading="lazy"
					onError={() => setFailed(true)}
					className="absolute inset-0 w-full h-full object-cover"
				/>
			)}
			<div
				className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
				style={{ background: "rgba(255,255,255,0.95)", color: "var(--hh-txt)" }}
			>
				<Icon size={10} style={{ color: "var(--hh-or)" }} aria-hidden /> {label}
			</div>
		</div>
	);
}

// Auto-rotating stacked carousel of artisan photos for the hero's right column
function HeroCarousel() {
	const [active, setActive] = useState(0);
	const len = HERO_PHOTOS.length;

	useEffect(() => {
		const id = setInterval(
			() => setActive((a) => (a + 1) % HERO_PHOTOS.length),
			3200,
		);
		return () => clearInterval(id);
	}, []);

	const STACK = [
		{ t: "translate(-50%,-50%) rotate(0deg) scale(1)", z: 30, op: 1 },
		{
			t: "translate(-50%,-50%) translateX(52px) translateY(-18px) rotate(6deg) scale(0.9)",
			z: 20,
			op: 0.85,
		},
		{
			t: "translate(-50%,-50%) translateX(92px) translateY(-34px) rotate(11deg) scale(0.8)",
			z: 10,
			op: 0.55,
		},
	];
	const HIDDEN = {
		t: "translate(-50%,-50%) translateX(120px) translateY(-46px) rotate(14deg) scale(0.68)",
		z: 0,
		op: 0,
	};

	return (
		<div
			className="relative w-full max-w-[460px] mx-auto"
			style={{ animation: "fadeUp .8s .3s ease both" }}
		>
			<div className="relative h-[360px] sm:h-[440px]">
				{HERO_PHOTOS.map((p, i) => {
					const o = (i - active + len) % len;
					const c = STACK[o] ?? HIDDEN;
					return (
						<div
							key={p.label}
							className="absolute left-1/2 top-1/2 w-[230px] h-[300px] sm:w-[268px] sm:h-[348px]"
							style={{
								transform: c.t,
								zIndex: c.z,
								opacity: c.op,
								transition:
									"transform .65s cubic-bezier(.22,1,.36,1), opacity .65s ease",
							}}
						>
							<HeroPhoto {...p} className="w-full h-full" />
						</div>
					);
				})}
			</div>
			<div className="flex items-center justify-center gap-1.5 mt-5">
				{HERO_PHOTOS.map((p, i) => (
					<button
						key={p.label}
						type="button"
						onClick={() => setActive(i)}
						aria-label={`Show ${p.label}`}
						className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
						style={{
							width: i === active ? 22 : 6,
							background: i === active ? "var(--hh-or)" : "var(--hh-border2)",
						}}
					/>
				))}
			</div>
		</div>
	);
}

// ─── Feature visual panels ────────────────────────────────────────────────────

function FeatVisual0() {
	return (
		<div className="flex flex-col gap-3">
			<div
				className="rounded-[14px] border px-4 py-3 bg-[var(--hh-bg)]"
				style={{
					borderColor: "var(--hh-border)",
				}}
			>
				<div className="flex items-center gap-2">
					<Sparkles size={16} style={{ color: "var(--hh-or)" }} aria-hidden />
					<span
						className="flex-1 text-[13px] font-semibold"
						style={{ color: "var(--hh-txt2)" }}
					>
						Emergency electrician in Ikeja…
					</span>
					<span
						className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
						style={{
							background: "rgba(30,58,138,0.12)",
							border: "1px solid rgba(30,58,138,0.22)",
							color: "var(--hh-or)",
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
							className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
							style={{
								background: "var(--hh-bg3)",
								borderColor: "var(--hh-border)",
								color: "var(--hh-txt2)",
							}}
						>
							<Icon size={11} aria-hidden /> {label}
						</span>
					))}
				</div>
			</div>
			<p
				className="text-[11px] uppercase tracking-[0.6px] font-extrabold"
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
					bg: "#EFF6FF",
					tc: "#1E3A8A",
				},
				{
					init: "KA",
					name: "Kunle Adeyemi",
					role: "Electrician · 2.4km",
					rating: "4.7",
					bg: "#FDF4E3",
					tc: "#B7791F",
				},
			].map((a) => (
				<div
					key={a.init}
					className="flex items-center gap-3 rounded-[14px] border px-4 py-3 bg-[var(--hh-bg2)]"
					style={{
						borderColor: "var(--hh-border)",
					}}
				>
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold shrink-0"
						style={{ background: a.bg, color: a.tc }}
					>
						{a.init}
					</div>
					<div>
						<p
							className="text-[13.5px] font-extrabold"
							style={{ color: "var(--hh-txt)" }}
						>
							{a.name}
						</p>
						<p className="text-[11.5px] font-medium" style={{ color: "var(--hh-txt3)" }}>
							{a.role}
						</p>
					</div>
					<div className="ml-auto flex flex-col items-end gap-1">
						<div
							className="flex items-center gap-1 text-[11px] font-bold"
							style={{ color: "#F59E0B" }}
						>
							<Star size={11} fill="#F59E0B" aria-hidden /> {a.rating}
						</div>
						<span
							className="text-[10.5px] font-bold rounded-full px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200/50"
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
				className="rounded-[14px] border p-4 flex flex-col gap-3 bg-[var(--hh-bg)]"
				style={{ borderColor: "var(--hh-border)" }}
			>
				<div className="flex gap-2 items-start">
					<div
						className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
						style={{ background: "#EFF6FF", color: "#1E3A8A" }}
					>
						TJ
					</div>
					<div
						className="flex-1 rounded-[10px_10px_10px_0] px-3 py-2 text-[12px] leading-relaxed border border-[var(--hh-border)]"
						style={{
							background: "var(--hh-bg2)",
							color: "var(--hh-txt2)",
						}}
					>
						I can head over by 4:00 PM. Is that okay with you?
					</div>
				</div>
				<div className="flex flex-row-reverse">
					<div
						className="rounded-[10px_10px_0_10px] px-3 py-2 text-[12px] leading-relaxed bg-[var(--hh-or-l)] text-[var(--hh-or-d)] font-bold border border-[var(--hh-or-m)]/30"
					>
						Sure, that works perfectly!
					</div>
				</div>
				<div className="flex gap-2 items-start">
					<div
						className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
						style={{ background: "#EFF6FF", color: "#1E3A8A" }}
					>
						TJ
					</div>
					<div className="flex-1">
						<div
							className="rounded-[10px_10px_10px_0] px-3 py-2 text-[12px] mb-2 border border-[var(--hh-border)]"
							style={{
								background: "var(--hh-bg2)",
								color: "var(--hh-txt2)",
							}}
						>
							Here's my quote for the job:
						</div>
						<div
							className="rounded-[10px] border px-3 py-3"
							style={{
								background: "rgba(30,58,138,0.04)",
								borderColor: "var(--hh-or-m)",
							}}
						>
							<p
								className="text-[11px] mb-0.5 font-semibold"
								style={{ color: "var(--hh-txt3)" }}
							>
								Quote proposal
							</p>
							<p
								className="text-[18px] font-extrabold"
								style={{
									fontFamily: "var(--font-syne)",
									color: "var(--hh-or)",
								}}
							>
								₦45,000
							</p>
							<p
								className="text-[11px] mb-2 font-medium"
								style={{ color: "var(--hh-txt3)" }}
							>
								Inverter inspection (fixed rate)
							</p>
							<button
								type="button"
								className="w-full rounded-[8px] py-1.5 text-[11.5px] font-bold text-white cursor-pointer"
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
						className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold"
						style={{
							background: "var(--hh-bg3)",
							borderColor: "var(--hh-border)",
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
				className="flex items-center gap-3 rounded-[14px] border px-4 py-3 bg-[var(--hh-bg2)]"
				style={{
					borderColor: "rgba(16,185,129,0.25)",
				}}
			>
				<div
					className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
					style={{ background: "#FDF4E3", color: "#B7791F" }}
				>
					FA
				</div>
				<div>
					<p
						className="text-[13.5px] font-extrabold"
						style={{ color: "var(--hh-txt)" }}
					>
						Fatima Abubakar
					</p>
					<p className="text-[11.5px] font-semibold" style={{ color: "var(--hh-txt3)" }}>
						Verified Carpenter · Surulere
					</p>
				</div>
				<div className="ml-auto flex flex-col items-end gap-1">
					<div
						className="flex items-center gap-1 text-[11px] font-bold"
						style={{ color: "#F59E0B" }}
					>
						<Star size={11} fill="#F59E0B" aria-hidden /> 4.7
					</div>
					<span
						className="text-[10.5px] font-bold rounded-full px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50"
					>
						Active
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
					className="flex items-center gap-3 rounded-[10px] border px-4 py-3 bg-[var(--hh-bg2)]"
					style={{
						borderColor: "var(--hh-border)",
					}}
				>
					<Icon size={16} style={{ color: "var(--hh-or)" }} aria-hidden />
					<span
						className="flex-1 text-[12.5px] font-semibold"
						style={{ color: "var(--hh-txt2)" }}
					>
						{label}
					</span>
					<CheckCircle2 size={16} style={{ color: "#10B981" }} aria-hidden />
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
						background: "rgba(16,185,129,0.08)",
						border: "1px solid rgba(16,185,129,0.2)",
					}}
				>
					<Lock size={22} style={{ color: "#10B981" }} aria-hidden />
				</div>
				<p
					className="text-[18px] font-extrabold mb-1.5"
					style={{ fontFamily: "var(--font-syne)", color: "var(--hh-txt)" }}
				>
					Funds held safely
				</p>
				<p className="text-[12.5px] font-semibold" style={{ color: "var(--hh-txt3)" }}>
					Released only when job is confirmed complete
				</p>
			</div>
			<div
				className="flex items-center justify-between rounded-[10px] border px-4 py-3 bg-[var(--hh-bg2)]"
				style={{
					borderColor: "rgba(16,185,129,0.15)",
				}}
			>
				<span className="text-[12.5px] font-bold" style={{ color: "var(--hh-txt2)" }}>
					Payment captured
				</span>
				<span className="text-[12px] font-bold text-emerald-600">
					₦45,000
				</span>
			</div>
			<div
				className="flex items-center justify-center gap-1.5 text-[12px] font-bold"
				style={{ color: "var(--hh-txt3)" }}
			>
				<ArrowDown size={14} aria-hidden /> Held in escrow
			</div>
			<div
				className="flex items-center justify-between rounded-[10px] border px-4 py-3 bg-[var(--hh-bg2)]"
				style={{ borderColor: "var(--hh-border)" }}
			>
				<span className="text-[12.5px] font-semibold" style={{ color: "var(--hh-txt3)" }}>
					Released to artisan
				</span>
				<span className="text-[12px] font-bold" style={{ color: "var(--hh-txt3)" }}>
					On job completion
				</span>
			</div>
		</div>
	);
}

// Order matches FEATURES: verified → escrow → chat/quote → matches & ratings
const FEAT_VISUALS = [
	<FeatVisual2 />,
	<FeatVisual3 />,
	<FeatVisual1 />,
	<FeatVisual0 />,
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function Home() {
	const navigate = useNavigate();
	const [heroQuery, setHeroQuery] = useState("");
	const [activeFeature, setActiveFeature] = useState(0);

	const handleCTAFindArtisan = () => navigate({ to: "/find" });

	return (
		<>
			{/* ── Hero (two-column: copy left, artisan carousel right) ──────── */}
			<section className="relative min-h-dvh flex items-center px-[5%] pt-[120px] pb-16 overflow-hidden">
				<div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
					<div
						className="absolute w-[600px] h-[600px] rounded-full -top-[120px] -right-[140px]"
						style={{
							background: "radial-gradient(circle,rgba(245,158,11,0.10) 0%,transparent 70%)",
							animation: "hhFloat1 8s ease-in-out infinite",
						}}
					/>
					<div
						className="absolute w-[480px] h-[480px] rounded-full -bottom-[80px] -left-[100px]"
						style={{
							background: "radial-gradient(circle,rgba(30,58,138,0.07) 0%,transparent 70%)",
							animation: "hhFloat2 10s ease-in-out infinite",
						}}
					/>
				</div>

				<div className="relative z-10 w-full max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
					{/* Left — copy */}
					<div className="text-center lg:text-left flex flex-col items-center lg:items-start">
						<div
							className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-[5px] text-[12px] font-bold mb-6"
							style={{ background: "var(--hh-or-l)", borderColor: "var(--hh-or-m)", color: "var(--hh-or)", animation: "fadeUp .6s ease both" }}
						>
							<ShieldCheck size={13} aria-hidden /> Verified and Trusted Artisans
						</div>

						<h1
							className="font-black leading-[1.08] tracking-[-1.8px] mb-5 text-[var(--hh-txt)] font-syne"
							style={{
								fontSize: "clamp(34px,3.9vw,56px)",
								animation: "fadeUp .7s .1s ease both",
								WebkitTextStroke: "0.7px currentColor",
							}}
						>
							Skilled hands {" "}
							<span className="relative inline-block" style={{ color: "var(--hh-or)" }}>
								one tap away
								<span
									className="absolute left-0 right-0 h-[3px] rounded-sm opacity-60"
									style={{ bottom: "-10px", background: "var(--hh-or)" }}
									aria-hidden
								/>
							</span>
						</h1>

						<p
							className="text-[16px] sm:text-[17px] max-w-[520px] mx-auto lg:mx-0 mb-8 font-medium leading-[1.7]"
							style={{ color: "var(--hh-txt2)", animation: "fadeUp .7s .2s ease both" }}
						>
							Generator won't start? Pipe leaking? Need a quick clean before guests arrive? There's a vetted artisan nearby, available now.
						</p>

						<div
							className="flex items-center justify-center lg:justify-start gap-3.5 mb-7 flex-wrap"
							style={{ animation: "fadeUp .7s .3s ease both" }}
						>
							<HHButton size="lg" onClick={handleCTAFindArtisan}>
								<Search size={17} aria-hidden /> Find help now
							</HHButton>
							<HHButton variant="ghost" size="lg">
								<Play size={17} aria-hidden /> See how it works
							</HHButton>
						</div>

						<div
							className="flex items-center justify-center lg:justify-start gap-3.5 mb-8 flex-wrap"
							style={{ animation: "fadeUp .7s .35s ease both" }}
						>
							<div className="flex -space-x-2.5">
								{HERO_FACES.map((f) => (
									<div
										key={f.init}
										className="w-9.5 h-9.5 rounded-full flex items-center justify-center text-[11px] font-bold ring-2 ring-[var(--hh-bg)]"
										style={{ background: f.bg, color: f.tc }}
									>
										{f.init}
									</div>
								))}
							</div>
							<div className="text-left">
								<div className="flex items-center gap-1">
									{["s1", "s2", "s3", "s4", "s5"].map((k) => (
										<Star key={k} size={13} fill="var(--hh-gold)" style={{ color: "var(--hh-gold)" }} aria-hidden />
									))}
									<span className="text-[13.5px] font-extrabold ml-1" style={{ color: "var(--hh-txt)" }}>
										4.9
									</span>
								</div>
								<p className="text-[12px] font-semibold" style={{ color: "var(--hh-txt3)" }}>
									Vetted pros serving 50,000+ homes across Lagos
								</p>
							</div>
						</div>

						<div
							className="w-full max-w-[520px] mx-auto lg:mx-0"
							style={{ animation: "fadeUp .7s .5s ease both" }}
						>
							<div
								className="relative rounded-[16px] border px-4 py-3.5"
								style={{ background: "var(--hh-card)", borderColor: "var(--hh-border)", boxShadow: "0 8px 24px rgba(26,23,20,0.06)" }}
							>
								<div className="flex items-center gap-2.5">
									<Sparkles size={18} style={{ color: "var(--hh-or)" }} aria-hidden />
									<input
										value={heroQuery}
										onChange={(e) => setHeroQuery(e.target.value)}
										placeholder='Try "Emergency plumber in Surulere…"'
										className="hh-search-input flex-1 bg-transparent border-none outline-none text-[14px]"
										style={{ color: "var(--hh-txt)", caretColor: "var(--hh-or)", fontFamily: "var(--font-dm)" }}
										aria-label="Search for artisans"
									/>
									<div
										className="hidden sm:flex items-center gap-1 rounded-full border px-2.5 py-[5px] text-[11px] font-bold shrink-0"
										style={{ background: "var(--hh-or-l)", borderColor: "var(--hh-or-m)", color: "var(--hh-or)" }}
									>
										<Zap size={11} aria-hidden /> Instant match
									</div>
								</div>
								<div className="flex gap-2 mt-3 flex-wrap">
									{SEARCH_PILLS.slice(0, 4).map(({ Icon, label }) => (
										<button
											key={label}
											type="button"
											onClick={() => setHeroQuery(label)}
											className="hh-spill inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] cursor-pointer transition-all duration-150 font-bold"
											style={{ background: "var(--hh-bg3)", borderColor: "var(--hh-border)", color: "var(--hh-txt2)" }}
										>
											<Icon size={13} aria-hidden /> {label}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Right — artisan carousel */}
					<div className="w-full">
						<HeroCarousel />
					</div>
				</div>
			</section>

			{/* ── Services ───────────────────────────────────────────────────── */}
			<section className="px-[5%] pb-[90px]">
				<Eyebrow>What we help with</Eyebrow>
				<div className="flex items-end justify-between gap-4 flex-wrap mb-10">
					<h2
						className="font-extrabold tracking-[-1.5px] leading-[1.1] max-w-[560px]"
						style={{
							fontFamily: "var(--font-syne)",
							fontSize: "clamp(32px,4vw,48px)",
							color: "var(--hh-txt)",
						}}
					>
						Whatever your home needs, <O>handled</O>
					</h2>
					<button
						type="button"
						onClick={handleCTAFindArtisan}
						className="inline-flex items-center gap-1.5 text-[14px] font-extrabold cursor-pointer transition-colors duration-150 hover:opacity-80"
						style={{ color: "var(--hh-or)" }}
					>
						Browse all services <ArrowRight size={16} aria-hidden />
					</button>
				</div>
				<Reveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
					{SERVICES.map(({ Icon, label, note }) => (
						<button
							key={label}
							type="button"
							onClick={handleCTAFindArtisan}
							className="hh-service-card group flex items-center gap-3.5 text-left rounded-[16px] border p-4 cursor-pointer transition-all duration-200 bg-[var(--hh-card)] border-[var(--hh-border)] hover:border-[var(--hh-or-m)] hover:bg-[var(--hh-or-l)]/25"
						>
							<div
								className="w-11 h-11 rounded-[12px] border flex items-center justify-center shrink-0 transition-colors duration-200 bg-[var(--hh-or-l)] border-[var(--hh-or-m)]"
							>
								<Icon size={20} style={{ color: "var(--hh-or)" }} aria-hidden />
							</div>
							<div className="min-w-0 flex-1">
								<p
									className="text-[14.5px] font-extrabold leading-tight"
									style={{
										fontFamily: "var(--font-syne)",
										color: "var(--hh-txt)",
									}}
								>
									{label}
								</p>
								<p
									className="text-[11.5px] mt-0.5 truncate font-semibold"
									style={{ color: "var(--hh-txt3)" }}
								>
									{note}
								</p>
							</div>
							<ArrowRight
								size={16}
								className="shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
								style={{ color: "var(--hh-or)" }}
								aria-hidden
							/>
						</button>
					))}
				</Reveal>
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
									color: "rgba(30,58,138,0.05)",
								}}
								aria-hidden
							>
								{n}
							</div>
							<div
								className="w-11 h-11 rounded-[8px] border flex items-center justify-center mb-5"
								style={{
									background: "var(--hh-or-l)",
									borderColor: "var(--hh-or-m)",
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
				<Eyebrow>Why trust us</Eyebrow>
				<h2
					className="font-extrabold tracking-[-1.5px] leading-[1.1] max-w-[560px] mb-14"
					style={{
						fontFamily: "var(--font-syne)",
						fontSize: "clamp(32px,4vw,48px)",
						color: "var(--hh-txt)",
					}}
				>
					Peace of mind, <O>built in</O>
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
											background: "var(--hh-bg3)",
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
									"radial-gradient(circle,rgba(30,58,138,0.06) 0%,transparent 70%)",
							}}
							aria-hidden
						/>
						{FEAT_VISUALS[activeFeature]}
					</div>
				</Reveal>
			</section>

			{/* ── Testimonials ───────────────────────────────────────────────── */}
			<section className="px-[5%] pb-[100px]">
				<Eyebrow>Real stories</Eyebrow>
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
							Tell us what you need, meet trusted pros nearby, and pay safely —
							all in one place.
						</p>
						<HHButton onClick={handleCTAFindArtisan}>
							<Search size={15} aria-hidden /> Find an artisan
						</HHButton>
						<div
							className="absolute bottom-[-10px] right-4 text-[120px] font-extrabold leading-none pointer-events-none select-none"
							style={{
								fontFamily: "var(--font-syne)",
								color: "var(--hh-bg3)",
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
