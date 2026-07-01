import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	Sparkles,
	Droplets,
	Zap,
	Hammer,
	Wind,
	Paintbrush,
	Star,
	Check,
	Receipt,
	Briefcase,
	Users,
	CreditCard,
	ArrowUpRight,
	MessageSquare,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { DashboardHeader } from "#/components/dashboard/dashboard-header";
import { set_dashboard_flags } from "#/core/redux-store/slices/dashboard.slice";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardPage,
});

interface Artisan {
	id: string;
	name: string;
	trade: string;
	location: string;
	rating: number;
	jobs: number;
	availClass: "now" | "sched";
	availText: string;
	rate: string;
	avatarInitials: string;
	avatarBgClass: string;
}

function DashboardPage() {
	const dispatch = useAppDispatch();
	const hasActiveChat = useAppSelector((s) => s.dashboardStore.hasActiveChat);
	const [searchValue, setSearchValue] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const [hiredArtisans, setHiredArtisans] = useState<Record<string, boolean>>({});
	const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Suggestion pills data
	const pills = [
		{ label: "Plumber near me", icon: Droplets },
		{ label: "Electrical emergency", icon: Zap },
		{ label: "Carpentry", icon: Hammer },
		{ label: "AC repair", icon: Wind },
		{ label: "Painting", icon: Paintbrush },
	];

	// Artisans data
	const artisans: Artisan[] = [
		{
			id: "artisan-1",
			name: "Taiwo Johnson",
			trade: "Licensed Electrician",
			location: "Ikeja",
			rating: 4.9,
			jobs: 83,
			availClass: "now",
			availText: "Available now",
			rate: "₦8,500/hr",
			avatarInitials: "TJ",
			avatarBgClass: "bg-[#DBEAFE] text-[#1D4ED8]",
		},
		{
			id: "artisan-2",
			name: "Emeka Nwosu",
			trade: "Master Plumber",
			location: "Yaba",
			rating: 4.8,
			jobs: 61,
			availClass: "now",
			availText: "Available now",
			rate: "₦7,200/hr",
			avatarInitials: "EM",
			avatarBgClass: "bg-[#E0F2FE] text-[#0369A1]",
		},
		{
			id: "artisan-3",
			name: "Fatima Abubakar",
			trade: "Carpenter",
			location: "Surulere",
			rating: 4.7,
			jobs: 45,
			availClass: "sched",
			availText: "Sched. only",
			rate: "₦6,000/hr",
			avatarInitials: "FA",
			avatarBgClass: "bg-[#FDF4E3] text-[#B7791F]",
		},
		{
			id: "artisan-4",
			name: "Biodun Kareem",
			trade: "AC Technician",
			location: "VI",
			rating: 4.9,
			jobs: 102,
			availClass: "now",
			availText: "Available now",
			rate: "₦9,000/hr",
			avatarInitials: "BK",
			avatarBgClass: "bg-[#E2FBF0] text-[#0F766E]",
		},
	];

	// Handle typing search
	const handleSearchChange = (value: string) => {
		setSearchValue(value);

		if (searchTimerRef.current) {
			clearTimeout(searchTimerRef.current);
		}

		if (value.trim().length > 4) {
			setIsSearching(true);
			searchTimerRef.current = setTimeout(() => {
				setIsSearching(false);
			}, 3000);
		} else {
			setIsSearching(false);
		}
	};

	// Handle suggestion pill click
	const handlePillClick = (label: string) => {
		setSearchValue(label);
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}

		if (searchTimerRef.current) {
			clearTimeout(searchTimerRef.current);
		}

		setIsSearching(true);
		searchTimerRef.current = setTimeout(() => {
			setIsSearching(false);
		}, 3000);
	};

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (searchTimerRef.current) {
				clearTimeout(searchTimerRef.current);
			}
		};
	}, []);

	// Handle artisan hire click
	const handleHireClick = (artisanId: string) => {
		setHiredArtisans((prev) => ({
			...prev,
			[artisanId]: true,
		}));
		dispatch(set_dashboard_flags({ hasActiveChat: true }));
	};

	// Framer motion variants for cards entrance
	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.08,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 15 },
		show: {
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
		<main className="flex-1 p-4 sm:p-5 md:p-6 pb-24 md:pb-6 flex flex-col gap-4 md:gap-5 overflow-y-auto h-full max-h-screen bg-[var(--dashboard-bg)]">
			<DashboardHeader />

			{/* Statistics widgets grid */}
			<section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
				{/* Active Jobs (Signal Blue gradient) */}
				<div className="bg-gradient-to-br from-(--dashboard-blue) to-[#1D4ED8] border border-[#1D4ED8]/20 rounded-xl p-4 shadow-md shadow-blue-500/10 text-white relative overflow-hidden group hover:shadow-lg transition-all duration-350">
					<div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
					<div className="absolute right-3.5 bottom-3.5 text-white/12">
						<Briefcase size={36} className="stroke-[1.5]" />
					</div>
					
					<div className="relative z-10">
						<div className="text-[9px] uppercase font-extrabold tracking-wider text-white/70 mb-1.5">
							Active jobs
						</div>
						<div className="font-syne text-3xl font-black mb-0.5 leading-none">3</div>
						<div className="text-[10.5px] text-white/85 font-semibold flex items-center gap-1 mt-1">
							<span className="flex h-1.5 w-1.5 relative shrink-0">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
								<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
							</span>
							↑ 1 new today
						</div>
					</div>
				</div>

				{/* Artisans Nearby */}
				<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-300 text-[var(--dashboard-text)] relative overflow-hidden group">
					<div className="absolute -right-6 -top-6 w-20 h-20 bg-neutral-100 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
					<div className="absolute right-3.5 bottom-3.5 text-neutral-200/40">
						<Users size={36} className="stroke-[1.5]" />
					</div>
					
					<div className="relative z-10">
						<div className="text-[9px] uppercase font-extrabold tracking-wider text-[var(--dashboard-muted)] mb-1.5">
							Artisans nearby
						</div>
						<div className="font-syne text-3xl font-black mb-0.5 text-[var(--dashboard-text)] leading-none">48</div>
						<div className="text-[10.5px] text-[var(--dashboard-muted)] font-semibold mt-1">
							Within 5 km radius
						</div>
					</div>
				</div>

				{/* Total Spent */}
				<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl p-4 shadow-xs hover:shadow-sm transition-all duration-300 text-[var(--dashboard-text)] relative overflow-hidden group">
					<div className="absolute -right-6 -top-6 w-20 h-20 bg-neutral-100 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
					<div className="absolute right-3.5 bottom-3.5 text-neutral-200/40">
						<CreditCard size={36} className="stroke-[1.5]" />
					</div>
					
					<div className="relative z-10">
						<div className="text-[9px] uppercase font-extrabold tracking-wider text-[var(--dashboard-muted)] mb-1.5">
							Total spent
						</div>
						<div className="font-syne text-3xl font-black mb-0.5 text-[var(--dashboard-text)] leading-none">₦64k</div>
						<div className="text-[10.5px] text-green-600 font-bold flex items-center gap-0.5 mt-1">
							This month <ArrowUpRight size={11} className="stroke-[2.5]" />
						</div>
					</div>
				</div>
			</section>

			{/* AI Search input block */}
			<section className="bg-[var(--dashboard-card)] border-2 border-[var(--dashboard-purple-mid)] rounded-xl p-4 shadow-xs relative focus-within:ring-4 focus-within:ring-[var(--dashboard-purple-mid)]/15 focus-within:border-[var(--dashboard-purple)] transition-all duration-200 shadow-blue-50/15">
				<div className="flex items-center gap-2.5">
					<Sparkles size={16} className="text-[var(--dashboard-purple)] shrink-0" />
					<input
						ref={searchInputRef}
						type="text"
						className="flex-1 border-none outline-none font-dm text-[13.5px] text-[var(--dashboard-text)] bg-transparent placeholder-[var(--dashboard-muted)]"
						placeholder='Try "Emergency plumber in Ikeja right now…"'
						value={searchValue}
						onChange={(e) => handleSearchChange(e.target.value)}
						aria-label="AI-powered artisan search"
					/>
					<div className="flex items-center gap-1 bg-[var(--dashboard-purple-light)] border border-[var(--dashboard-purple-mid)] rounded-full px-2.5 py-0.5 text-[10px] text-[var(--dashboard-purple)] font-bold shrink-0 select-none animate-pulse">
						<Zap size={9} className="stroke-[3]" /> AI Search
					</div>
				</div>

				{/* Quick Suggestion Pills */}
				<div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-0.5 flex-wrap">
					{pills.map((pill) => {
						const IconComponent = pill.icon;
						return (
							<button
								key={pill.label}
								type="button"
								onClick={() => handlePillClick(pill.label)}
								className="flex items-center gap-1 bg-[var(--dashboard-purple-light)] border border-[var(--dashboard-purple-mid)]/20 rounded-full px-2.5 py-1 text-[11px] text-[var(--dashboard-purple)] cursor-pointer hover:bg-[var(--dashboard-purple)] hover:text-white hover:border-[var(--dashboard-purple)] hover:translate-y-[-1px] transition-all duration-200 whitespace-nowrap font-semibold"
							>
								<IconComponent size={10.5} />
								{pill.label}
							</button>
						);
					})}
				</div>

				{/* Computing Matches Loading Bar */}
				{isSearching && (
					<div
						className="flex items-center gap-2 mt-4 p-2.5 bg-[var(--dashboard-purple-light)] rounded-xl border border-[var(--dashboard-purple-mid)]/20 animate-fade-in"
						role="status"
						aria-live="polite"
					>
						<div className="flex gap-1 shrink-0 pl-1">
							<span className="w-1.5 h-1.5 bg-[var(--dashboard-purple)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
							<span className="w-1.5 h-1.5 bg-[var(--dashboard-purple)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
							<span className="w-1.5 h-1.5 bg-[var(--dashboard-purple)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
						</div>
						<span className="text-xs text-[var(--dashboard-purple)] font-bold">
							Finding best artisan matches in your area…
						</span>
					</div>
				)}
			</section>

			{/* Recommended Artisans Grid Section */}
			<section>
				<h3 className="font-syne font-bold text-sm text-[var(--dashboard-text)] mb-3.5 select-none">
					Recommended artisans near you
				</h3>
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="show"
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5"
				>
					{artisans.map((artisan) => {
						const isHired = hiredArtisans[artisan.id];
						return (
							<motion.div
								key={artisan.id}
								variants={itemVariants}
								className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl p-4 flex flex-col justify-between hover:border-[var(--dashboard-blue-mid)] hover:translate-y-[-2px] hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
							>
								<div>
									{/* Artisan Header info */}
									<div className="flex items-center gap-2.5 mb-3">
										<div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center font-extrabold text-[12.5px] shrink-0 border border-white/10 shadow-sm relative group-hover:scale-105 transition-transform duration-300 ${artisan.avatarBgClass}`}>
											{artisan.avatarInitials}
											<div className="absolute inset-0 rounded-full ring-2 ring-current opacity-10" />
										</div>
										<div className="min-w-0">
											<div className="text-[13.5px] font-extrabold text-[var(--dashboard-text)] truncate leading-snug">
												{artisan.name}
											</div>
											<div className="text-[11px] text-[var(--dashboard-muted)] truncate font-semibold">
												{artisan.trade}
											</div>
										</div>
									</div>

									{/* Rating and Availability */}
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center gap-1 text-[11px] text-[var(--dashboard-muted)] font-semibold">
											<Star size={11} className="fill-amber-500 text-amber-500 stroke-[2.5]" />
											<span className="text-[var(--dashboard-text)] font-extrabold">{artisan.rating}</span> 
											<span className="text-neutral-300 select-none">·</span> 
											<span>{artisan.jobs} jobs</span>
										</div>

										<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
											artisan.availClass === "now"
												? "bg-green-50 text-green-700 border-green-200/50"
												: "bg-amber-50 text-amber-800 border-amber-200/50"
										}`}>
											{artisan.availText}
										</span>
									</div>
								</div>

								{/* Hired Actions Trigger */}
								<button
									type="button"
									onClick={() => !isHired && handleHireClick(artisan.id)}
									className={`w-full py-2 px-3 rounded-xl text-[11px] font-extrabold font-dm cursor-pointer transition-all duration-300 hover:translate-y-[-1px] active:translate-y-0 ${
										isHired
											? "bg-green-600 text-white cursor-default shadow-sm shadow-green-500/10 hover:translate-y-0"
											: "bg-[var(--dashboard-blue)] text-white hover:bg-[var(--dashboard-blue-dark)] hover:shadow-sm hover:shadow-blue-500/20"
									}`}
									disabled={isHired}
								>
									{isHired ? (
										<span className="flex items-center justify-center gap-1 font-bold">
											<Check size={12} className="stroke-[3]" /> Requested
										</span>
									) : `Hire · ${artisan.rate}`}
								</button>
							</motion.div>
						);
					})}
				</motion.div>
			</section>

			{/* Recent Activities Section */}
			<section>
				<h3 className="font-syne font-bold text-sm text-[var(--dashboard-text)] mb-3.5 select-none">
					Recent activity
				</h3>
				<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 flex flex-col relative shadow-sm">
					{/* Vertical line indicator */}
					<div className="absolute left-[39px] top-6 bottom-6 w-[1.5px] bg-neutral-100" />
					
					{/* Activity Item 1 */}
					<div className="relative flex items-start gap-4 pb-5 last:pb-0">
						<div className="w-8.5 h-8.5 rounded-xl bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)]/40 flex items-center justify-center text-[var(--dashboard-orange)] shrink-0 z-10 shadow-sm">
							<Check size={14} className="stroke-[3]" />
						</div>
						<div className="min-w-0 pt-0.5">
							<p className="text-[13.5px] font-bold text-[var(--dashboard-text)] leading-snug">
								Taiwo Johnson accepted your booking
							</p>
							<span className="text-[11px] text-[var(--dashboard-muted)] font-medium">
								Inverter panel inspection · Today
							</span>
						</div>
						<span className="ml-auto text-[11px] text-[var(--dashboard-muted)] whitespace-nowrap font-semibold pl-2 pt-0.5">
							09:14
						</span>
					</div>

					{/* Activity Item 2 */}
					<div className="relative flex items-start gap-4 pb-5 last:pb-0">
						<div className="w-8.5 h-8.5 rounded-xl bg-[var(--dashboard-purple-light)] border border-[var(--dashboard-purple-mid)]/40 flex items-center justify-center text-[var(--dashboard-purple)] shrink-0 z-10 shadow-sm">
							<Sparkles size={14} />
						</div>
						<div className="min-w-0 pt-0.5">
							<p className="text-[13.5px] font-bold text-[var(--dashboard-text)] leading-snug">
								AI matched 3 plumbers for your pipe request
							</p>
							<span className="text-[11px] text-[var(--dashboard-muted)] font-medium">
								Based on location + urgency
							</span>
						</div>
						<span className="ml-auto text-[11px] text-[var(--dashboard-muted)] whitespace-nowrap font-semibold pl-2 pt-0.5">
							08:50
						</span>
					</div>

					{/* Activity Item 3 */}
					<div className="relative flex items-start gap-4 last:pb-0">
						<div className="w-8.5 h-8.5 rounded-xl bg-green-50 border border-green-200/50 flex items-center justify-center text-green-700 shrink-0 z-10 shadow-sm">
							<Receipt size={14} />
						</div>
						<div className="min-w-0 pt-0.5">
							<p className="text-[13.5px] font-bold text-[var(--dashboard-text)] leading-snug">
								Payment confirmed — ₦45,000
							</p>
							<span className="text-[11px] text-[var(--dashboard-muted)] font-medium">
								Fatima Abubakar · Carpentry work
							</span>
						</div>
						<span className="ml-auto text-[11px] text-[var(--dashboard-muted)] whitespace-nowrap font-semibold pl-2 pt-0.5">
							Yesterday
						</span>
					</div>
				</div>
			</section>

			{/* Floating Chat Drawer Re-opener Toggle */}
			{!hasActiveChat && (
				<button
					type="button"
					onClick={() => dispatch(set_dashboard_flags({ hasActiveChat: true }))}
					className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--dashboard-blue)] hover:bg-[var(--dashboard-blue-dark)] text-white flex items-center justify-center cursor-pointer shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 animate-in zoom-in-50 duration-200"
					aria-label="Open chat panel"
				>
					<div className="relative">
						<MessageSquare size={22} className="stroke-[2.2]" />
						{/* Double pulsing unread badge */}
						<span className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-red-500/10">
							5
						</span>
					</div>
				</button>
			)}

		</main>
	);
}
