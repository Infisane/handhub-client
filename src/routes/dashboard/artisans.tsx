import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	SlidersHorizontal,
	MapPin,
	Star,
	Zap,
	Check,
	ChevronDown,
	X,
	Droplets,
	Hammer,
	Wind,
	Paintbrush,
	Plug,
	Wrench,
	Sparkles,
	Phone,
	MessageSquare,
	ShieldCheck,
	Filter,
	ThumbsUp,
	Clock,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { DashboardContext } from "./route";
import { useContext } from "react";
import {
	Dialog,
	DialogContent,
} from "#/components/ui/dialog.tsx";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/artisans")({
	component: FindPage,
});

/* ── Types ─────────────────────────────────────────────────── */
type Availability = "now" | "scheduled" | "busy";

interface Review {
	id: string;
	userName: string;
	userInitials: string;
	rating: number;
	comment: string;
	date: string;
}

interface Artisan {
	id: string;
	name: string;
	initials: string;
	trade: string;
	category: string;
	location: string;
	distance: string;
	rating: number;
	reviewCount: number;
	jobs: number;
	availability: Availability;
	rate: string;
	rateUnit: string;
	bio: string;
	skills: string[];
	avatarColor: string;
	verified: boolean;
	topRated: boolean;
	responseTime: string;
	repeatRate: string;
	reviews: Review[];
}

type SortKey = "recommended" | "rating" | "distance" | "rate_asc" | "rate_desc";

/* ── Data ───────────────────────────────────────────────────── */
const ALL_ARTISANS: Artisan[] = [
	{
		id: "a1",
		name: "Taiwo Johnson",
		initials: "TJ",
		trade: "Licensed Electrician",
		category: "Electrical",
		location: "Ikeja",
		distance: "1.2 km",
		rating: 4.9,
		reviewCount: 124,
		jobs: 83,
		availability: "now",
		rate: "₦8,500",
		rateUnit: "/hr",
		bio: "Certified electrical engineer with 8+ yrs handling residential & commercial wiring, inverter systems, and smart home installations.",
		skills: ["Inverter", "Wiring", "Smart Home", "Emergency"],
		avatarColor: "bg-[#DBEAFE] text-[#1D4ED8]",
		verified: true,
		topRated: true,
		responseTime: "< 10 mins",
		repeatRate: "95%",
		reviews: [
			{
				id: "r1_1",
				userName: "Bisi O.",
				userInitials: "BO",
				rating: 5,
				comment: "Taiwo was extremely prompt and professional. Installed our 5kVA solar inverter system flawlessly and even helped optimize our smart lights.",
				date: "2 days ago",
			},
			{
				id: "r1_2",
				userName: "Chidi N.",
				userInitials: "CN",
				rating: 4.8,
				comment: "Excellent service. Diagnosed a complex phase fault in our commercial building within minutes. Highly recommended!",
				date: "1 week ago",
			},
		],
	},
	{
		id: "a2",
		name: "Emeka Nwosu",
		initials: "EM",
		trade: "Master Plumber",
		category: "Plumbing",
		location: "Yaba",
		distance: "2.4 km",
		rating: 4.8,
		reviewCount: 97,
		jobs: 61,
		availability: "now",
		rate: "₦7,200",
		rateUnit: "/hr",
		bio: "Expert in pipe installation, leak detection, water pump repairs, and drainage systems. Fast response guaranteed.",
		skills: ["Leak Repair", "Water Pump", "Drainage", "Pipe Fitting"],
		avatarColor: "bg-[#E0F2FE] text-[#0369A1]",
		verified: true,
		topRated: false,
		responseTime: "< 20 mins",
		repeatRate: "92%",
		reviews: [
			{
				id: "r2_1",
				userName: "Kola A.",
				userInitials: "KA",
				rating: 5,
				comment: "Emeka fixed a major underground pipe leak that had been causing water pressure issues for weeks. Friendly and neat.",
				date: "3 days ago",
			},
			{
				id: "r2_2",
				userName: "Sarah D.",
				userInitials: "SD",
				rating: 4.6,
				comment: "Very responsive plumber. Fixed our bathroom faucet and water pump. Price was very fair.",
				date: "2 weeks ago",
			},
		],
	},
	{
		id: "a3",
		name: "Fatima Abubakar",
		initials: "FA",
		trade: "Carpenter & Joiner",
		category: "Carpentry",
		location: "Surulere",
		distance: "3.1 km",
		rating: 4.7,
		reviewCount: 56,
		jobs: 45,
		availability: "scheduled",
		rate: "₦6,000",
		rateUnit: "/hr",
		bio: "Skilled in custom furniture, wardrobes, door frames, and kitchen cabinets. Delivering precision craftsmanship.",
		skills: ["Furniture", "Wardrobes", "Door Frames", "Cabinets"],
		avatarColor: "bg-[#FDF4E3] text-[#B7791F]",
		verified: true,
		topRated: false,
		responseTime: "< 1 hr",
		repeatRate: "88%",
		reviews: [
			{
				id: "r3_1",
				userName: "Yemi S.",
				userInitials: "YS",
				rating: 5,
				comment: "The custom walk-in wardrobe Fatima built is stunning. Attention to detail is top-tier. Clean and precise carpenter!",
				date: "5 days ago",
			},
			{
				id: "r3_2",
				userName: "Tunde G.",
				userInitials: "TG",
				rating: 4.4,
				comment: "Excellent kitchen cabinets. Delivery was delayed by one day but the quality of craftsmanship made up for it.",
				date: "3 weeks ago",
			},
		],
	},
	{
		id: "a4",
		name: "Biodun Kareem",
		initials: "BK",
		trade: "AC Technician",
		category: "HVAC",
		location: "Victoria Island",
		distance: "4.7 km",
		rating: 4.9,
		reviewCount: 212,
		jobs: 102,
		availability: "now",
		rate: "₦9,000",
		rateUnit: "/hr",
		bio: "10+ years servicing, installing and repairing all major AC brands. Emergency call-outs available 24/7.",
		skills: ["AC Repair", "Installation", "Servicing", "24/7"],
		avatarColor: "bg-[#E2FBF0] text-[#0F766E]",
		verified: true,
		topRated: true,
		responseTime: "< 15 mins",
		repeatRate: "97%",
		reviews: [
			{
				id: "r4_1",
				userName: "Funke O.",
				userInitials: "FO",
				rating: 5,
				comment: "Emergency callout at 10 PM. Biodun arrived within 30 minutes and got our master bedroom AC working again. Outstanding!",
				date: "Yesterday",
			},
			{
				id: "r4_2",
				userName: "Dave U.",
				userInitials: "DU",
				rating: 4.8,
				comment: "Serviced all 6 AC units in our office. Very thorough job, neat cleaning, and fair pricing.",
				date: "1 week ago",
			},
		],
	},
	{
		id: "a5",
		name: "Chukwuemeka Obi",
		initials: "CO",
		trade: "House Painter",
		category: "Painting",
		location: "Lekki",
		distance: "5.3 km",
		rating: 4.6,
		reviewCount: 43,
		jobs: 38,
		availability: "scheduled",
		rate: "₦5,500",
		rateUnit: "/hr",
		bio: "Interior and exterior painting specialist. Uses premium paints and delivers clean, long-lasting finishes.",
		skills: ["Interior", "Exterior", "Texture", "Waterproofing"],
		avatarColor: "bg-[#DBEAFE] text-[#1D4ED8]",
		verified: false,
		topRated: false,
		responseTime: "< 2 hrs",
		repeatRate: "84%",
		reviews: [
			{
				id: "r5_1",
				userName: "Grace F.",
				userInitials: "GF",
				rating: 4.8,
				comment: "Repainted our 4-bedroom duplex. Beautiful textured wall finish and exceptionally clean borders. Happy client!",
				date: "4 days ago",
			},
			{
				id: "r5_2",
				userName: "Nneka A.",
				userInitials: "NA",
				rating: 4.4,
				comment: "Nice painting job, very reliable. Used premium materials and finished ahead of schedule.",
				date: "2 weeks ago",
			},
		],
	},
	{
		id: "a6",
		name: "Aminat Lawal",
		initials: "AL",
		trade: "Plumber",
		category: "Plumbing",
		location: "Maryland",
		distance: "1.8 km",
		rating: 4.5,
		reviewCount: 29,
		jobs: 22,
		availability: "now",
		rate: "₦5,800",
		rateUnit: "/hr",
		bio: "Handles all household plumbing emergencies promptly. Reliable, tidy, and affordable.",
		skills: ["Emergency", "Boreholes", "Bathrooms", "Kitchen"],
		avatarColor: "bg-[#EFF6FF] text-[#1D4ED8]",
		verified: true,
		topRated: false,
		responseTime: "< 30 mins",
		repeatRate: "89%",
		reviews: [
			{
				id: "r6_1",
				userName: "Uche K.",
				userInitials: "UK",
				rating: 4.6,
				comment: "Prompt response to a kitchen sink clog. Aminat cleared it quickly and left the place spotless.",
				date: "6 days ago",
			},
			{
				id: "r6_2",
				userName: "Femi R.",
				userInitials: "FR",
				rating: 4.4,
				comment: "Installed a new borehole pump. Good communication and very professional work.",
				date: "3 weeks ago",
			},
		],
	},
	{
		id: "a7",
		name: "Seun Adeleke",
		initials: "SA",
		trade: "Appliance Technician",
		category: "Repairs",
		location: "Agege",
		distance: "6.0 km",
		rating: 4.4,
		reviewCount: 18,
		jobs: 14,
		availability: "busy",
		rate: "₦4,500",
		rateUnit: "/hr",
		bio: "Repairs washing machines, fridges, cookers, and generators. Fair prices and transparent quotes.",
		skills: ["Washing Machine", "Fridge", "Generator", "Cooker"],
		avatarColor: "bg-[#EFF6FF] text-[#1D4ED8]",
		verified: false,
		topRated: false,
		responseTime: "< 45 mins",
		repeatRate: "81%",
		reviews: [
			{
				id: "r7_1",
				userName: "Ibrahim T.",
				userInitials: "IT",
				rating: 4.5,
				comment: "Fixed our washing machine's spinning problem. Clear diagnostic and reasonable repair cost.",
				date: "1 week ago",
			},
			{
				id: "r7_2",
				userName: "Joy O.",
				userInitials: "JO",
				rating: 4.3,
				comment: "Repaired our double-door fridge. Works perfectly now. Very honest technician.",
				date: "1 month ago",
			},
		],
	},
	{
		id: "a8",
		name: "Kemi Afolabi",
		initials: "KA",
		trade: "Tiler & Floor Layer",
		category: "Tiling",
		location: "Gbagada",
		distance: "3.9 km",
		rating: 4.8,
		reviewCount: 74,
		jobs: 59,
		availability: "scheduled",
		rate: "₦6,500",
		rateUnit: "/hr",
		bio: "Expert in ceramic, porcelain, marble, and vinyl flooring. Perfect finishes every time.",
		skills: ["Ceramic", "Marble", "Vinyl", "Waterproofing"],
		avatarColor: "bg-[#ECFDF5] text-[#065F46]",
		verified: true,
		topRated: false,
		responseTime: "< 30 mins",
		repeatRate: "91%",
		reviews: [
			{
				id: "r8_1",
				userName: "Sandra E.",
				userInitials: "SE",
				rating: 5,
				comment: "Kemi tiled our entire living room with large porcelain tiles. Absolute perfection, no uneven edges!",
				date: "4 days ago",
			},
			{
				id: "r8_2",
				userName: "Wale B.",
				userInitials: "WB",
				rating: 4.6,
				comment: "Did a great waterproofing and tiling job in our guest bathrooms. Highly skilled.",
				date: "2 weeks ago",
			},
		],
	},
];

const CATEGORIES = [
	{ label: "All Artisans", icon: Sparkles, value: "all" },
	{ label: "Electrical", icon: Plug, value: "Electrical" },
	{ label: "Plumbing", icon: Droplets, value: "Plumbing" },
	{ label: "Carpentry", icon: Hammer, value: "Carpentry" },
	{ label: "HVAC", icon: Wind, value: "HVAC" },
	{ label: "Painting", icon: Paintbrush, value: "Painting" },
	{ label: "Repairs", icon: Wrench, value: "Repairs" },
	{ label: "Tiling", icon: Hammer, value: "Tiling" },
];

const AVAILABILITY_OPTIONS = [
	{ label: "All Available", value: "all" },
	{ label: "Available Now", value: "now" },
	{ label: "Scheduled Only", value: "scheduled" },
];

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
	{ label: "Recommended", value: "recommended" },
	{ label: "Highest Rated", value: "rating" },
	{ label: "Nearest", value: "distance" },
	{ label: "Rate: Low → High", value: "rate_asc" },
	{ label: "Rate: High → Low", value: "rate_desc" },
];

/* ── Helpers ────────────────────────────────────────────────── */
const availabilityConfig: Record<Availability, { label: string; classes: string; dot: string }> = {
	now: { label: "Available now", classes: "bg-green-50 text-green-700 border-green-200/60 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20", dot: "bg-green-500 animate-pulse" },
	scheduled: { label: "Scheduled", classes: "bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", dot: "bg-amber-500" },
	busy: { label: "Currently busy", classes: "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700", dot: "bg-neutral-400" },
};

function getRateValue(artisan: Artisan): number {
	return parseInt(artisan.rate.replace(/[^0-9]/g, ""), 10);
}

function sortArtisans(list: Artisan[], key: SortKey): Artisan[] {
	const copy = [...list];
	switch (key) {
		case "rating":
			return copy.sort((a, b) => b.rating - a.rating);
		case "distance":
			return copy.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
		case "rate_asc":
			return copy.sort((a, b) => getRateValue(a) - getRateValue(b));
		case "rate_desc":
			return copy.sort((a, b) => getRateValue(b) - getRateValue(a));
		default:
			return copy.sort((a, b) => (b.topRated ? 1 : 0) - (a.topRated ? 1 : 0) || b.rating - a.rating);
	}
}

const renderStars = (rating: number) => {
	const stars = [];
	const floor = Math.floor(rating);
	for (let i = 0; i < 5; i++) {
		stars.push(
			<Star
				key={i}
				size={11}
				className={i < floor ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-700"}
			/>
		);
	}
	return <div className="flex items-center gap-0.5">{stars}</div>;
};

const getCoverGradient = (colorClass: string) => {
	if (colorClass.includes("C2410C")) return "from-blue-500/20 via-blue-500/5 to-transparent";
	if (colorClass.includes("0369A1")) return "from-sky-500/20 via-sky-500/5 to-transparent";
	if (colorClass.includes("B7791F")) return "from-amber-500/20 via-amber-500/5 to-transparent";
	if (colorClass.includes("0F766E")) return "from-teal-500/20 via-teal-500/5 to-transparent";
	if (colorClass.includes("7E22CE")) return "from-blue-500/20 via-blue-500/5 to-transparent";
	if (colorClass.includes("9D174D")) return "from-pink-500/20 via-pink-500/5 to-transparent";
	if (colorClass.includes("065F46")) return "from-emerald-500/20 via-emerald-500/5 to-transparent";
	return "from-[var(--dashboard-orange)]/15 via-[var(--dashboard-orange)]/5 to-transparent";
};

/* ── Component ──────────────────────────────────────────────── */
function FindPage() {
	const { hasActiveChat, setHasActiveChat } = useContext(DashboardContext);

	const [search, setSearch] = useState("");
	const [activeCategory, setActiveCategory] = useState("all");
	const [activeAvail, setActiveAvail] = useState("all");
	const [sortKey, setSortKey] = useState<SortKey>("recommended");
	const [sortOpen, setSortOpen] = useState(false);
	const [hiredIds, setHiredIds] = useState<Record<string, boolean>>({});
	const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [minRating, setMinRating] = useState(0);
	const [verifiedOnly, setVerifiedOnly] = useState(false);

	const searchRef = useRef<HTMLInputElement>(null);

	const clearAllFilters = () => {
		setSearch("");
		setActiveCategory("all");
		setActiveAvail("all");
		setMinRating(0);
		setVerifiedOnly(false);
	};

	const hasActiveFilters = 
		activeCategory !== "all" || 
		activeAvail !== "all" || 
		minRating > 0 || 
		verifiedOnly || 
		search.trim() !== "";

	const activeFiltersCount = 
		(activeCategory !== "all" ? 1 : 0) + 
		(activeAvail !== "all" ? 1 : 0) + 
		(minRating > 0 ? 1 : 0) + 
		(verifiedOnly ? 1 : 0);

	/* Filtered + sorted list */
	const filtered = useCallback(() => {
		let list = ALL_ARTISANS;

		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter(
				(a) =>
					a.name.toLowerCase().includes(q) ||
					a.trade.toLowerCase().includes(q) ||
					a.location.toLowerCase().includes(q) ||
					a.skills.some((s) => s.toLowerCase().includes(q))
			);
		}
		if (activeCategory !== "all") {
			list = list.filter((a) => a.category === activeCategory);
		}
		if (activeAvail !== "all") {
			list = list.filter((a) => a.availability === activeAvail);
		}
		if (minRating > 0) {
			list = list.filter((a) => a.rating >= minRating);
		}
		if (verifiedOnly) {
			list = list.filter((a) => a.verified);
		}
		return sortArtisans(list, sortKey);
	}, [search, activeCategory, activeAvail, sortKey, minRating, verifiedOnly]);

	const results = filtered();

	const handleHire = (id: string) => {
		setHiredIds((prev) => ({ ...prev, [id]: true }));
		setHasActiveChat(true);
	};

	const clearSearch = () => {
		setSearch("");
		searchRef.current?.focus();
	};

	/* motion variants */
	const container = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.04 } },
	};
	
	const item = {
		hidden: { opacity: 0, y: 12 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 130, damping: 18 } },
	};

	const currentSort = SORT_OPTIONS.find((o) => o.value === sortKey)!;

	const getCategoryCount = (catValue: string) => {
		if (catValue === "all") return ALL_ARTISANS.length;
		return ALL_ARTISANS.filter((a) => a.category === catValue).length;
	};

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			{/* ── Top Bar Header (Search and filters combined at the top) ─────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-3 space-y-4 border-b border-[var(--dashboard-border)]">
				{/* Title and stats */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5">
							Find Premium Artisans
						</h2>
						<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
							Discover <span className="text-[var(--dashboard-orange)] font-bold">{results.length}</span> verified professionals near <span className="font-semibold text-[var(--dashboard-text)]">Lekki, Lagos</span>
						</p>
					</div>
				</div>

				{/* Search, Sort and Advanced Filters row */}
				<div className="flex flex-col sm:flex-row gap-3">
					{/* Search field */}
					<div className="relative flex-1">
						<Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)] pointer-events-none" />
						<input
							ref={searchRef}
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by name, trade, skills..."
							className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[13px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-2 focus:ring-[var(--dashboard-orange)]/10 transition-all duration-150 shadow-xs"
						/>
						{search && (
							<button
								type="button"
								onClick={clearSearch}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-orange)] hover:text-white transition-all duration-150 cursor-pointer"
							>
								<X size={10} className="stroke-[3]" />
							</button>
						)}
					</div>

					<div className="flex gap-2">
						{/* Filters toggle button */}
						<button
							type="button"
							onClick={() => setFiltersExpanded(!filtersExpanded)}
							className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-[12.5px] font-bold cursor-pointer transition-all duration-150 shadow-xs ${
								filtersExpanded || activeFiltersCount > 0
									? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange)] text-[var(--dashboard-orange)]"
									: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-text)] hover:border-[var(--dashboard-orange-mid)]"
							}`}
						>
							<Filter size={13} />
							<span>Filters</span>
							{activeFiltersCount > 0 && (
								<span className="w-4.5 h-4.5 rounded-full bg-[var(--dashboard-orange)] text-white text-[9.5px] font-extrabold flex items-center justify-center shrink-0">
									{activeFiltersCount}
								</span>
							)}
						</button>

						{/* Sort dropdown */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setSortOpen((v) => !v)}
								className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-bold text-[var(--dashboard-text)] hover:border-[var(--dashboard-orange-mid)] transition-all duration-150 shadow-xs cursor-pointer select-none"
							>
								<SlidersHorizontal size={13} className="text-[var(--dashboard-muted)]" />
								<span>{currentSort.label}</span>
								<ChevronDown size={12} className={`text-[var(--dashboard-muted)] transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
							</button>

							<AnimatePresence>
								{sortOpen && (
									<motion.div
										initial={{ opacity: 0, y: -6, scale: 0.96 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -6, scale: 0.96 }}
										transition={{ duration: 0.15 }}
										className="absolute right-0 top-full mt-1.5 z-20 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl shadow-xl p-1 min-w-[195px]"
									>
										{SORT_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												type="button"
												onClick={() => { setSortKey(opt.value); setSortOpen(false); }}
												className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors duration-100 ${
													sortKey === opt.value
														? "bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] font-bold"
														: "text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)]"
												}`}
											>
												{opt.label}
												{sortKey === opt.value && <Check size={12} className="stroke-[3]" />}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				{/* Quick Categories chips */}
				<div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
					{CATEGORIES.map((cat) => {
						const CatIcon = cat.icon;
						const isActive = activeCategory === cat.value;
						const count = getCategoryCount(cat.value);

						return (
							<button
								key={cat.value}
								type="button"
								onClick={() => setActiveCategory(cat.value)}
								className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 border transition-all duration-150 cursor-pointer ${
									isActive
										? "bg-[var(--dashboard-orange)] border-[var(--dashboard-orange)] text-white shadow-sm shadow-blue-500/20 font-bold"
										: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-text)]"
								}`}
							>
								<CatIcon size={12} />
								<span>{cat.label}</span>
								<span className={`text-[9.5px] px-1.5 py-0.25 rounded-full font-bold ml-1 ${
									isActive ? "bg-white/20 text-white" : "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)]"
								}`}>
									{count}
								</span>
							</button>
						);
					})}
				</div>

				{/* Collapsible Advanced Filters dropdown grid */}
				<AnimatePresence initial={false}>
					{filtersExpanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.22, ease: "easeInOut" }}
							className="overflow-hidden"
						>
							<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 shadow-xs mb-1 mt-1">
								{/* Availability options */}
								<div className="space-y-2">
									<label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--dashboard-muted)]">Availability</label>
									<div className="flex flex-col gap-1.5">
										{AVAILABILITY_OPTIONS.map((opt) => (
											<button
												key={opt.value}
												type="button"
												onClick={() => setActiveAvail(opt.value)}
												className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all cursor-pointer ${
													activeAvail === opt.value
														? "border-[var(--dashboard-text)] bg-[var(--dashboard-text)] text-white"
														: "border-[var(--dashboard-border)] hover:border-[var(--dashboard-text)]/30 text-[var(--dashboard-muted)]"
												}`}
											>
												<span>{opt.label}</span>
												{activeAvail === opt.value && <Check size={11} className="stroke-[3.5]" />}
											</button>
										))}
									</div>
								</div>

								{/* Minimum ratings segment buttons */}
								<div className="space-y-2">
									<label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--dashboard-muted)]">Minimum Rating</label>
									<div className="flex gap-1.5">
										{[0, 4.5, 4.8].map((stars) => (
											<button
												key={stars}
												type="button"
												onClick={() => setMinRating(stars)}
												className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
													minRating === stars
														? "border-amber-400 bg-amber-50 text-amber-700"
														: "border-[var(--dashboard-border)] text-[var(--dashboard-muted)] hover:border-amber-300"
												}`}
											>
												{stars === 0 ? (
													"All"
												) : (
													<>
														<span>{stars}</span>
														<Star size={10} className="fill-amber-500 text-amber-500" />
													</>
												)}
											</button>
										))}
									</div>
								</div>

								{/* Verified status only toggle and reset buttons */}
								<div className="space-y-4 flex flex-col justify-between">
									<div className="space-y-2">
										<label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--dashboard-muted)]">Verified Badge</label>
										<div className="flex items-center justify-between px-3 py-2 bg-[var(--dashboard-bg)]/50 rounded-xl border border-[var(--dashboard-border)]/50">
											<span className="text-[12.5px] font-bold text-[var(--dashboard-text)] flex items-center gap-1.5">
												<ShieldCheck size={14} className="text-[var(--dashboard-orange)]" />
												Verified Only
											</span>
											<button
												type="button"
												onClick={() => setVerifiedOnly(!verifiedOnly)}
												className={`w-9 h-5 rounded-full relative p-0.5 transition-colors cursor-pointer ${
													verifiedOnly ? "bg-[var(--dashboard-orange)]" : "bg-[var(--dashboard-border)]"
												}`}
												aria-label="Toggle Verified Only"
											>
												<motion.div
													layout
													className="w-4 h-4 rounded-full bg-white shadow-sm"
													animate={{ x: verifiedOnly ? 16 : 0 }}
													transition={{ type: "spring", stiffness: 400, damping: 25 }}
												/>
											</button>
										</div>
									</div>

									{/* Reset active filters */}
									{hasActiveFilters && (
										<button
											type="button"
											onClick={clearAllFilters}
											className="w-full py-2 rounded-lg border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-orange-light)] hover:text-[var(--dashboard-orange)] hover:border-[var(--dashboard-orange-mid)] transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
										>
											<X size={12} className="stroke-[3.5]" />
											Reset Filters
										</button>
									)}
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* ── Grid/List view container ────────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 pb-24 md:pb-8 scrollbar-none">
				{results.length === 0 ? (
					/* Empty State */
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-8"
					>
						<div className="w-16 h-16 rounded-2xl bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)] flex items-center justify-center shadow-xs">
							<Search size={24} className="text-[var(--dashboard-muted)]" />
						</div>
						<div>
							<p className="font-syne font-extrabold text-[16px] text-[var(--dashboard-text)] mb-1">No artisans match your criteria</p>
							<p className="text-[12px] text-[var(--dashboard-muted)]">Try adjusting your filters or clearing search text.</p>
						</div>
						<button
							type="button"
							onClick={clearAllFilters}
							className="px-5 py-2.5 rounded-xl text-[12.5px] font-bold bg-[var(--dashboard-orange)] text-white cursor-pointer hover:bg-blue-600 active:scale-95 transition-all"
						>
							Clear All Filters
						</button>
					</motion.div>
				) : (
					/* Artisan Grid Layout */
					<motion.div
						key={`${activeCategory}-${activeAvail}-${sortKey}-${minRating}-${verifiedOnly}`}
						variants={container}
						initial="hidden"
						animate="show"
						className={cn(
							"grid gap-5",
							hasActiveChat
								? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
								: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
						)}
					>
						{results.map((artisan) => {
							const avail = availabilityConfig[artisan.availability];
							const isHired = !!hiredIds[artisan.id];

							return (
								<motion.div
									key={artisan.id}
									variants={item}
									layout
									onClick={() => setSelectedArtisan(artisan)}
									className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--dashboard-orange-mid)]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between group h-full relative"
								>
									{/* Availability floating badge */}
									<div className="absolute top-4 right-4 z-10">
										<span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs shadow-xs ${avail.classes}`}>
											<span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
											{avail.label}
										</span>
									</div>

									{/* Top Rated Accent line */}
									{artisan.topRated && (
										<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
									)}

									{/* Main Card Content */}
									<div className="p-5 flex-1 flex flex-col space-y-4">
										<div className="flex gap-3">
											{/* Initials Avatar */}
											<div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[13.5px] shrink-0 relative shadow-xs transition-transform duration-200 group-hover:scale-105 ${artisan.avatarColor}`}>
												{artisan.initials}
												{artisan.verified && (
													<div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-[var(--dashboard-orange)] border-2 border-white flex items-center justify-center shadow-xs">
														<Check size={8} className="text-white stroke-[4]" />
													</div>
												)}
											</div>

											{/* Meta Headers */}
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-1 flex-wrap pr-16">
													<span className="font-syne font-extrabold text-[14px] text-[var(--dashboard-text)] truncate leading-snug group-hover:text-[var(--dashboard-orange)] transition-colors">
														{artisan.name}
													</span>
												</div>
												<div className="text-[11.5px] text-[var(--dashboard-muted)] font-bold truncate mt-0.5">
													{artisan.trade}
												</div>
											</div>
										</div>

										{/* Star rating + distance/location metadata */}
										<div className="bg-[var(--dashboard-bg)]/60 rounded-xl p-3 flex flex-col gap-2 border border-[var(--dashboard-border)]/40">
											<div className="flex items-center justify-between text-[11.5px] gap-2 flex-wrap sm:flex-nowrap">
												<div className="flex items-center gap-1.5 shrink-0">
													{renderStars(artisan.rating)}
													<span className="font-extrabold text-[var(--dashboard-text)]">{artisan.rating}</span>
													<span className="text-[var(--dashboard-muted)]">({artisan.reviewCount})</span>
												</div>
												<span className="font-syne font-extrabold text-[13.5px] text-[var(--dashboard-text)] shrink-0">
													{artisan.rate}<span className="text-[10px] font-bold text-[var(--dashboard-muted)]">{artisan.rateUnit}</span>
												</span>
											</div>

											<div className="flex items-center gap-2 text-[11px] text-[var(--dashboard-muted)]">
												<MapPin size={12} className="text-[var(--dashboard-orange)]" />
												<span className="truncate">{artisan.location} · {artisan.distance} away</span>
											</div>
										</div>

										{/* Skills chip preview */}
										<div className="flex flex-wrap gap-1.5 pt-1">
											{artisan.skills.slice(0, 3).map((skill) => (
												<span
													key={skill}
													className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] border border-[var(--dashboard-border)]/50"
												>
													{skill}
												</span>
											))}
											{artisan.skills.length > 3 && (
												<span className="text-[10px] font-bold px-2 py-1 text-[var(--dashboard-muted)] bg-transparent">
													+{artisan.skills.length - 3} more
												</span>
											)}
										</div>
									</div>

									{/* Card CTA Footer */}
									<div className="px-5 pb-5 pt-0 flex gap-2" onClick={(e) => e.stopPropagation()}>
										<button
											type="button"
											onClick={() => setSelectedArtisan(artisan)}
											className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors cursor-pointer text-center"
										>
											View Profile
										</button>
										<button
											type="button"
											onClick={() => !isHired && handleHire(artisan.id)}
											disabled={isHired || artisan.availability === "busy"}
											className={`flex-1 py-2.5 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
												isHired
													? "bg-green-600 text-white cursor-default shadow-xs"
													: artisan.availability === "busy"
													? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
													: "bg-[var(--dashboard-text)] text-white hover:bg-[var(--dashboard-orange)] shadow-xs"
											}`}
										>
											{isHired ? (
												<><Check size={12} className="stroke-[3.5]" /> Hired ✓</>
											) : artisan.availability === "busy" ? (
												"Busy"
											) : (
												<><Zap size={11} className="stroke-[2.5]" /> Hire Now</>
											)}
										</button>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}

				{/* AI matching note */}
				{results.length > 0 && (
					<div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-[var(--dashboard-muted)]">
						<Sparkles size={11} className="text-[var(--dashboard-purple)] shrink-0" />
						<span>Results dynamically prioritized by AI matching in <span className="font-semibold text-[var(--dashboard-text)]">Lekki, Lagos</span></span>
					</div>
				)}
			</div>

			{/* ── Reusable Shadcn Dialog Profile Modal ────────────────────────────── */}
			<Dialog open={!!selectedArtisan} onOpenChange={(open) => !open && setSelectedArtisan(null)}>
				<DialogContent className="p-0 max-w-2xl sm:rounded-2xl border-none">
					{selectedArtisan && (
						<div className="relative">
							{/* Hero cover gradient */}
							<div className={`h-36 sm:h-44 w-full bg-gradient-to-r ${getCoverGradient(selectedArtisan.avatarColor)} relative`} />

							{/* Profile Main Header Layout */}
							<div className="px-6 sm:px-8 pb-4 relative">
								{/* Negative margin overlapping avatar */}
								<div className={`size-22 sm:size-24 rounded-2xl flex items-center justify-center font-black text-2xl border-4 border-[var(--dashboard-card)] shadow-md absolute -top-11 sm:-top-12 left-6 sm:left-8 ${selectedArtisan.avatarColor}`}>
									{selectedArtisan.initials}
									{selectedArtisan.verified && (
										<div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--dashboard-orange)] border-2 border-white flex items-center justify-center shadow-xs">
											<Check size={9} className="text-white stroke-[4]" />
										</div>
									)}
								</div>

								{/* Titles & badges */}
								<div className="pt-13 sm:pt-14 space-y-1.5">
									<div className="flex items-center gap-2 flex-wrap">
										<h2 className="font-syne font-extrabold text-[20px] sm:text-[23px] text-[var(--dashboard-text)] leading-none tracking-tight">
											{selectedArtisan.name}
										</h2>
										{selectedArtisan.topRated && (
											<span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 flex items-center gap-0.5">
												<Star size={9} className="fill-amber-500 text-amber-500" /> TOP RATED
											</span>
										)}
									</div>
									<div className="text-[12.5px] text-[var(--dashboard-muted)] font-bold">
										{selectedArtisan.trade}
									</div>
									<div className="flex items-center gap-3 text-[11px] text-[var(--dashboard-muted)] pt-0.5">
										<span className="flex items-center gap-1">
											<MapPin size={12} className="text-[var(--dashboard-orange)]" />
											{selectedArtisan.location} · {selectedArtisan.distance}
										</span>
										<span>·</span>
										<span className="flex items-center gap-1 text-[var(--dashboard-text)] font-extrabold">
											{selectedArtisan.rate}{selectedArtisan.rateUnit}
										</span>
									</div>
								</div>
							</div>

							{/* Dialog Scrollable metrics, bio, reviews */}
							<div className="max-h-[calc(80vh-270px)] sm:max-h-[50vh] overflow-y-auto px-6 sm:px-8 pb-22 space-y-5 scrollbar-none">
								{/* Stats row layout */}
								<div className="grid grid-cols-4 gap-2.5 pt-1">
									<div className="bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
										<div className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)]">
											{selectedArtisan.jobs}
										</div>
										<div className="text-[9px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider mt-0.5">Jobs</div>
									</div>
									<div className="bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
										<div className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)] flex items-center justify-center gap-0.5">
											{selectedArtisan.rating}
										</div>
										<div className="text-[9px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider mt-0.5">Rating</div>
									</div>
									<div className="bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
										<div className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)] flex items-center justify-center gap-0.5">
											{selectedArtisan.responseTime}
										</div>
										<div className="text-[9px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider mt-0.5">Response</div>
									</div>
									<div className="bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 rounded-xl p-2.5 text-center flex flex-col justify-center">
										<div className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)]">
											{selectedArtisan.repeatRate}
										</div>
										<div className="text-[9px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider mt-0.5">Repeat</div>
									</div>
								</div>

								{/* About/Bio section */}
								<div className="space-y-1.5">
									<h4 className="font-syne font-extrabold text-[12.5px] uppercase tracking-wider text-[var(--dashboard-text)]">Biography</h4>
									<p className="text-[12.5px] text-[var(--dashboard-muted)] leading-relaxed font-medium">
										{selectedArtisan.bio}
									</p>
								</div>

								{/* Skills Expertise tags */}
								<div className="space-y-2">
									<h4 className="font-syne font-extrabold text-[12.5px] uppercase tracking-wider text-[var(--dashboard-text)]">Skills & Expertise</h4>
									<div className="flex flex-wrap gap-1.5">
										{selectedArtisan.skills.map((skill) => (
											<span
												key={skill}
												className="text-[10.5px] font-bold px-3 py-1.5 rounded-full bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[var(--dashboard-text)] shadow-xs"
											>
												{skill}
											</span>
										))}
									</div>
								</div>

								{/* Client Reviews feed */}
								<div className="space-y-3.5 pt-1.5">
									<h4 className="font-syne font-extrabold text-[12.5px] uppercase tracking-wider text-[var(--dashboard-text)] flex items-center gap-1.5">
										<ThumbsUp size={13} className="text-[var(--dashboard-orange)]" />
										Recent Client Reviews
									</h4>
									
									<div className="space-y-3">
										{selectedArtisan.reviews.map((rev) => (
											<div key={rev.id} className="bg-[var(--dashboard-bg)]/45 border border-[var(--dashboard-border)]/45 rounded-xl p-3.5 space-y-2.5">
												<div className="flex justify-between items-start gap-2">
													<div className="flex items-center gap-2">
														<div className="w-7 h-7 rounded-full bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] text-[10px] font-bold flex items-center justify-center shrink-0">
															{rev.userInitials}
														</div>
														<div>
															<div className="text-[11.5px] font-bold text-[var(--dashboard-text)] leading-none">{rev.userName}</div>
															<div className="text-[9.5px] text-[var(--dashboard-muted)] mt-0.5 font-bold flex items-center gap-1">
																<Clock size={9} /> {rev.date}
															</div>
														</div>
													</div>
													{renderStars(rev.rating)}
												</div>
												<p className="text-[12px] text-[var(--dashboard-muted)] leading-relaxed italic font-medium">
													"{rev.comment}"
												</p>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Sticky Modal Action CTA Bar */}
							<div className="absolute bottom-0 left-0 right-0 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 flex gap-2.5 z-10 rounded-b-2xl shadow-xl">
								<button
									type="button"
									className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<Phone size={13} /> Call
								</button>
								<button
									type="button"
									onClick={() => { setHasActiveChat(true); setSelectedArtisan(null); }}
									className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[12px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
								>
									<MessageSquare size={13} /> Message
								</button>
								<button
									type="button"
									onClick={() => { handleHire(selectedArtisan.id); }}
									disabled={!!hiredIds[selectedArtisan.id] || selectedArtisan.availability === "busy"}
									className={`flex-2 py-2.5 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
										hiredIds[selectedArtisan.id]
											? "bg-green-600 text-white cursor-default"
											: selectedArtisan.availability === "busy"
											? "bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
											: "bg-[var(--dashboard-orange)] text-white hover:bg-blue-600 active:scale-95 shadow-md shadow-blue-500/15"
									}`}
								>
									{hiredIds[selectedArtisan.id] ? (
										<><Check size={13} className="stroke-[3.5]" /> Hired ✓</>
									) : selectedArtisan.availability === "busy" ? (
										"Busy"
									) : (
										<><Zap size={11} className="stroke-[2.5]" /> Hire · {selectedArtisan.rate}</>
									)}
								</button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</main>
	);
}
