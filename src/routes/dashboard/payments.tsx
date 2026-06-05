import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	CreditCard,
	ShieldCheck,
	ArrowUpRight,
	ArrowDownLeft,
	Search,
	X,
	Plus,
	Lock,
	Unlock,
	AlertCircle,
	Banknote,
	ChevronRight,
	Eye,
	EyeOff,
} from "lucide-react";
import { useState, useContext, useMemo } from "react";
import { DashboardContext } from "./route";
import { cn } from "#/lib/utils.ts";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";

export const Route = createFileRoute("/dashboard/payments")({
	component: PaymentsPage,
});

/* ── Types ─────────────────────────────────────────────────── */
type TxType = "payment" | "escrow_lock" | "escrow_release" | "refund" | "deposit";
type TxStatus = "successful" | "held" | "refunded" | "processing";

interface Transaction {
	id: string; // Tx ref e.g. TXN-8293-XP
	ticketId?: string; // Ticket Ref if any
	title: string;
	artisanName?: string;
	avatarInitials?: string;
	avatarBgClass?: string;
	type: TxType;
	status: TxStatus;
	date: string;
	time: string;
	amount: number;
}

interface SavedCard {
	id: string;
	brand: "visa" | "mastercard";
	last4: string;
	expiry: string;
	holder: string;
	isDefault: boolean;
	bgGradient: string;
}

/* ── Seed Data ──────────────────────────────────────────────── */
const INITIAL_SAVED_CARDS: SavedCard[] = [
	{
		id: "card-1",
		brand: "visa",
		last4: "4821",
		expiry: "09/29",
		holder: "Adeola Kamara",
		isDefault: true,
		bgGradient: "from-[#172554] via-[#1E3A8A] to-[#172554]",
	},
	{
		id: "card-2",
		brand: "mastercard",
		last4: "9012",
		expiry: "04/28",
		holder: "Adeola Kamara",
		isDefault: false,
		bgGradient: "from-[#0f172a] via-[#1e293b] to-[#334155]",
	},
];

const INITIAL_TRANSACTIONS: Transaction[] = [
	{
		id: "TXN-8293-XP",
		ticketId: "#1042",
		title: "Escrow Hold: Solar Inverter Diagnosis",
		artisanName: "Taiwo Johnson",
		avatarInitials: "TJ",
		avatarBgClass: "bg-[#DBEAFE] text-[#1D4ED8]",
		type: "escrow_lock",
		status: "held",
		date: "Today, May 31",
		time: "09:16 AM",
		amount: -45000,
	},
	{
		id: "TXN-7940-QL",
		title: "Wallet Funding via Card *4821",
		type: "deposit",
		status: "successful",
		date: "May 30, 2026",
		time: "03:40 PM",
		amount: 60000,
	},
	{
		id: "TXN-7182-MK",
		ticketId: "#1012",
		title: "Escrow Released: Sink Leak Repair",
		artisanName: "Emeka Nwosu",
		avatarInitials: "EM",
		avatarBgClass: "bg-[#E0F2FE] text-[#0369A1]",
		type: "escrow_release",
		status: "successful",
		date: "May 28, 2026",
		time: "04:12 PM",
		amount: -14400,
	},
	{
		id: "TXN-6591-WO",
		ticketId: "#0984",
		title: "Refund Processed: Wardrobe Alignment",
		artisanName: "Fatima Abubakar",
		avatarInitials: "FA",
		avatarBgClass: "bg-[#FDF4E3] text-[#B7791F]",
		type: "refund",
		status: "refunded",
		date: "May 15, 2026",
		time: "11:20 AM",
		amount: 6000,
	},
	{
		id: "TXN-5541-PA",
		title: "Wallet Funding via Card *4821",
		type: "deposit",
		status: "successful",
		date: "May 12, 2026",
		time: "08:15 AM",
		amount: 100000,
	},
];

const txConfig: Record<TxType, { label: string; icon: any; color: string; bg: string }> = {
	deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
	payment: { label: "Direct Payment", icon: ArrowUpRight, color: "text-neutral-700 dark:text-neutral-300", bg: "bg-neutral-100 dark:bg-neutral-800" },
	escrow_lock: { label: "Escrow Held", icon: Lock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
	escrow_release: { label: "Escrow Released", icon: Unlock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
	refund: { label: "Refund", icon: ArrowDownLeft, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
};

const statusConfig: Record<TxStatus, { label: string; text: string; bg: string; dot: string }> = {
	successful: { label: "Successful", text: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10", dot: "bg-green-500" },
	held: { label: "Escrow Held", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-500 animate-pulse" },
	refunded: { label: "Refunded", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-500" },
	processing: { label: "Processing", text: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-500 animate-pulse" },
};

/* ── Main Component ────────────────────────────────────────── */
function PaymentsPage() {
	const { setIsMobileSidebarOpen } = useContext(DashboardContext);

	// Balance & state variables
	const [balance, setBalance] = useState(124500);
	const [escrowFunds] = useState(45000);
	const [savedCards, setSavedCards] = useState<SavedCard[]>(INITIAL_SAVED_CARDS);
	const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"all" | "completed" | "held" | "refunds">("all");
	const [showCardNumber, setShowCardNumber] = useState(false);

	// Modal states
	const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
	const [fundingAmount, setFundingAmount] = useState("");
	const [fundingCardId, setFundingCardId] = useState(savedCards[0]?.id || "");

	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
	const [withdrawAmount, setWithdrawAmount] = useState("");
	const [withdrawBank, setWithdrawBank] = useState("011"); // First Bank
	const [withdrawAccount, setWithdrawAccount] = useState("");

	const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
	const [newCardNumber, setNewCardNumber] = useState("");
	const [newCardExpiry, setNewCardExpiry] = useState("");
	const [newCardCVV, setNewCardCVV] = useState("");
	const [newCardHolder, setNewCardHolder] = useState("");

	const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

	// Filtering
	const filteredTransactions = useMemo(() => {
		return transactions.filter((tx) => {
			// Tab checks
			if (activeTab === "completed" && tx.status !== "successful") return false;
			if (activeTab === "held" && tx.status !== "held") return false;
			if (activeTab === "refunds" && tx.status !== "refunded") return false;

			// Query checks
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				return (
					tx.title.toLowerCase().includes(q) ||
					tx.id.toLowerCase().includes(q) ||
					(tx.artisanName && tx.artisanName.toLowerCase().includes(q)) ||
					(tx.ticketId && tx.ticketId.toLowerCase().includes(q))
				);
			}

			return true;
		});
	}, [transactions, activeTab, searchQuery]);

	// Interactive fund wallet action
	const handleFundWallet = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = parseFloat(fundingAmount);
		if (isNaN(amount) || amount <= 0) return;

		const selectedCard = savedCards.find((c) => c.id === fundingCardId);
		const cardSuffix = selectedCard ? `Card *${selectedCard.last4}` : "Saved Card";

		const newTx: Transaction = {
			id: `TXN-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
			title: `Wallet Funding via ${cardSuffix}`,
			type: "deposit",
			status: "successful",
			date: "Today, Just now",
			time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			amount: amount,
		};

		setBalance((prev) => prev + amount);
		setTransactions((prev) => [newTx, ...prev]);
		setIsFundingModalOpen(false);
		setFundingAmount("");
	};

	// Interactive withdraw wallet action
	const handleWithdrawWallet = (e: React.FormEvent) => {
		e.preventDefault();
		const amount = parseFloat(withdrawAmount);
		if (isNaN(amount) || amount <= 0 || amount > balance) return;

		const bankNames: Record<string, string> = {
			"011": "First Bank",
			"058": "GTBank",
			"035": "Wema Bank",
			"044": "Access Bank",
		};
		const chosenBank = bankNames[withdrawBank] || "Bank Account";

		const newTx: Transaction = {
			id: `TXN-${Math.floor(1000 + Math.random() * 9000)}-WD`,
			title: `Withdrawal to ${chosenBank} (*${withdrawAccount.slice(-4) || "4321"})`,
			type: "payment",
			status: "successful",
			date: "Today, Just now",
			time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			amount: -amount,
		};

		setBalance((prev) => prev - amount);
		setTransactions((prev) => [newTx, ...prev]);
		setIsWithdrawModalOpen(false);
		setWithdrawAmount("");
		setWithdrawAccount("");
	};

	// Add card
	const handleAddCard = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newCardNumber || !newCardExpiry || !newCardHolder) return;

		const cardGradients = [
			"from-[#172554] via-[#1E3A8A] to-[#172554]",
			"from-[#030712] via-[#111827] to-[#1f2937]",
			"from-[#065f46] via-[#047857] to-[#065f46]",
		];
		const randomGradient = cardGradients[Math.floor(Math.random() * cardGradients.length)];

		const newCard: SavedCard = {
			id: `card-${Date.now()}`,
			brand: newCardNumber.startsWith("5") ? "mastercard" : "visa",
			last4: newCardNumber.replace(/\s+/g, "").slice(-4),
			expiry: newCardExpiry,
			holder: newCardHolder,
			isDefault: savedCards.length === 0,
			bgGradient: randomGradient,
		};

		setSavedCards((prev) => [...prev, newCard]);
		setIsAddCardModalOpen(false);
		setNewCardNumber("");
		setNewCardExpiry("");
		setNewCardCVV("");
		setNewCardHolder("");
	};

	// Card format helper
	const handleCardNumberChange = (val: string) => {
		const formatted = val
			.replace(/\D/g, "")
			.replace(/(.{4})/g, "$1 ")
			.trim()
			.slice(0, 19);
		setNewCardNumber(formatted);
	};

	const handleExpiryChange = (val: string) => {
		const formatted = val
			.replace(/\D/g, "")
			.replace(/(.{2})/, "$1/")
			.trim()
			.slice(0, 5);
		setNewCardExpiry(formatted);
	};

	const formattedCurrency = (val: number) => {
		const absolute = Math.abs(val);
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			maximumFractionDigits: 0,
		}).format(absolute);
	};

	// Layout animations
	const containerVariants = {
		hidden: { opacity: 0 },
		show: { opacity: 1, transition: { staggerChildren: 0.05 } },
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 12 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
	};

	return (
		<main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]">
			
			{/* ── Top Bar Header & Page Title ───────────────────────────────────────── */}
			<div className="shrink-0 bg-[var(--dashboard-bg)] px-5 sm:px-8 pt-5 sm:pt-7 pb-4 space-y-4 border-b border-[var(--dashboard-border)]">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setIsMobileSidebarOpen(true)}
							className="md:hidden w-9 h-9 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text)] hover:bg-[var(--dashboard-orange-light)] transition-all shrink-0 shadow-xs"
							aria-label="Open navigation"
						>
							<Plus size={16} className="rotate-45" />
						</button>
						<div>
							<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5 flex items-center gap-2">
								Payments &amp; Escrow
							</h2>
							<p className="text-[12px] text-[var(--dashboard-muted)] font-medium">
								Secure wallet infrastructure and active escrow fund tracking
							</p>
						</div>
					</div>
				</div>

				{/* ── Balance Cards ──────────────────────────────────────────────────── */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Card 1: Wallet Balance */}
					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 relative overflow-hidden shadow-xs group flex flex-col justify-between">
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
									<Banknote size={13} className="text-[var(--dashboard-orange)]" />
									Available Balance
								</span>
							</div>
							<div>
								<div className="font-syne font-black text-[28px] sm:text-[32px] text-[var(--dashboard-text)] tracking-tight leading-none">
									{formattedCurrency(balance)}
								</div>
								<p className="text-[11px] text-[var(--dashboard-muted)] mt-1.5 font-medium">
									Withdrawable funds instantly available to hire artisans
								</p>
							</div>
						</div>
						<div className="flex gap-2 mt-5">
							<button
								type="button"
								onClick={() => setIsFundingModalOpen(true)}
								className="flex-1 py-2 px-3 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 transition-all active:scale-95"
							>
								<Plus size={14} className="stroke-[3]" /> Fund Wallet
							</button>
							<button
								type="button"
								onClick={() => setIsWithdrawModalOpen(true)}
								className="flex-1 py-2 px-3 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
							>
								<ArrowUpRight size={14} /> Withdraw
							</button>
						</div>
					</div>

					{/* Card 2: Escrow Locked */}
					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 relative overflow-hidden shadow-xs group flex flex-col justify-between">
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl transition-all duration-300" />
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
									<Lock size={13} className="text-blue-500" />
									Funds in Escrow
								</span>
								<div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-blue-200/50 flex items-center gap-1 shrink-0">
									<ShieldCheck size={10} className="stroke-[2.5]" /> Secure
								</div>
							</div>
							<div>
								<div className="font-syne font-black text-[28px] sm:text-[32px] text-blue-600 dark:text-blue-400 tracking-tight leading-none">
									{formattedCurrency(escrowFunds)}
								</div>
								<p className="text-[11px] text-[var(--dashboard-muted)] mt-1.5 font-medium leading-relaxed">
									Held safely in neutral escrow during active tickets. Released only upon your approval.
								</p>
							</div>
						</div>
						<div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-900/10 p-2.5 rounded-xl">
							<AlertCircle size={14} className="shrink-0" />
							<span>Active Project: Solar Panel Diagnosis</span>
						</div>
					</div>

					{/* Card 3: Saved Methods Summary & Preview */}
					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 relative overflow-hidden shadow-xs flex flex-col justify-between group">
						<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl transition-all duration-300" />
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider flex items-center gap-1.5">
									<CreditCard size={13} className="text-blue-500" />
									Linked Cards
								</span>
								<span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-200/50 font-bold">
									{savedCards.length} Cards Saved
								</span>
							</div>

							{savedCards.length > 0 ? (
								<div className="flex items-center gap-3 bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)]/50 p-2.5 rounded-xl">
									<div className="w-10 h-6.5 rounded bg-gradient-to-br from-indigo-900 to-indigo-950 flex flex-col justify-between p-1.5 text-white shadow-sm shrink-0">
										<div className="text-[8px] font-black leading-none tracking-tighter">VISA</div>
										<div className="text-[8.5px] font-bold text-right self-end leading-none">
											*{savedCards[0].last4}
										</div>
									</div>
									<div className="min-w-0">
										<p className="text-[12px] font-bold text-[var(--dashboard-text)] leading-none mb-1 truncate">
											{savedCards[0].holder}
										</p>
										<span className="text-[10px] text-[var(--dashboard-muted)] font-medium">
											Expires {savedCards[0].expiry} · Default Pay
										</span>
									</div>
								</div>
							) : (
								<div className="text-center py-2 text-[11px] text-[var(--dashboard-muted)] font-medium">
									No saved credit or debit cards
								</div>
							)}
						</div>

						<button
							type="button"
							onClick={() => setIsAddCardModalOpen(true)}
							className="mt-5 py-2 px-3 border border-blue-200 dark:border-blue-900/30 hover:border-blue-400 bg-blue-50/20 dark:bg-blue-900/5 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
						>
							<Plus size={14} className="stroke-[3]" /> Add Payment Card
						</button>
					</div>
				</div>
			</div>

			{/* ── Main Panel Split Grid ────────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-7 scrollbar-none pb-24 sm:pb-8">
				
				{/* ── Subtitle Grid: Visual Credit Card & Escrow Workflow Split ─────── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					
					{/* Interactive Premium Credit Card Visualizer */}
					<div className="lg:col-span-5 space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] flex items-center gap-2">
								Active Digital Wallet
							</h3>
							{savedCards.length > 0 && (
								<button
									type="button"
									onClick={() => setShowCardNumber(!showCardNumber)}
									className="text-[11px] font-bold text-[var(--dashboard-orange)] hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-all"
								>
									{showCardNumber ? (
										<>
											<EyeOff size={13} /> Mask Details
										</>
									) : (
										<>
											<Eye size={13} /> Reveal Card
										</>
									)}
								</button>
							)}
						</div>

						{savedCards.length > 0 ? (
							<div className="space-y-4">
								<motion.div
									initial={{ scale: 0.95, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									className={cn(
										"w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br p-6 text-white flex flex-col justify-between relative shadow-xl overflow-hidden select-none border border-white/10 shrink-0",
										savedCards[0].bgGradient
									)}
								>
									{/* Visa Background Hologram Effect */}
									<div className="absolute inset-0 bg-radial-gradient from-transparent to-black/10 mix-blend-overlay pointer-events-none" />
									<div className="absolute -bottom-10 -right-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />

									{/* Card Top Row */}
									<div className="flex justify-between items-start">
										<div>
											<div className="text-[10px] uppercase font-black tracking-widest text-indigo-200/70 leading-none">
												Handhub Wallet
											</div>
											<div className="text-[13px] font-bold mt-1 text-white/95">
												Debit Card
											</div>
										</div>
										<div className="w-12 text-right">
											<span className="font-extrabold tracking-tighter text-[16px] italic">
												{savedCards[0].brand.toUpperCase()}
											</span>
										</div>
									</div>

									{/* Golden Smart Card Chip */}
									<div className="w-10.5 h-8.5 rounded-lg bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 p-1 border border-yellow-200/40 relative shadow-sm shrink-0">
										<div className="grid grid-cols-3 gap-0.5 h-full opacity-60">
											<div className="border-r border-b border-black/20" />
											<div className="border-r border-b border-black/20" />
											<div className="border-b border-black/20" />
											<div className="border-r border-b border-black/20" />
											<div className="border-r border-b border-black/20" />
											<div className="border-b border-black/20" />
											<div className="border-r border-black/20" />
											<div className="border-r border-black/20" />
											<div />
										</div>
									</div>

									{/* Card Number */}
									<div className="font-mono text-[16px] sm:text-[18px] text-white/90 font-medium tracking-[2.5px] leading-none my-2.5">
										{showCardNumber ? `4821 9048 1042 ${savedCards[0].last4}` : `•••• •••• •••• ${savedCards[0].last4}`}
									</div>

									{/* Card Bottom Row */}
									<div className="flex justify-between items-end">
										<div>
											<div className="text-[8px] uppercase font-black text-indigo-200/60 leading-none tracking-widest">
												Card Holder
											</div>
											<div className="text-[13px] font-bold text-white/90 mt-1 truncate max-w-[170px]">
												{savedCards[0].holder}
											</div>
										</div>
										<div className="flex gap-4">
											<div>
												<div className="text-[8px] uppercase font-black text-indigo-200/60 leading-none tracking-widest">
													Expires
												</div>
												<div className="text-[12px] font-bold text-white/90 mt-1">
													{savedCards[0].expiry}
												</div>
											</div>
											<div>
												<div className="text-[8px] uppercase font-black text-indigo-200/60 leading-none tracking-widest">
													CVV
												</div>
												<div className="text-[12px] font-bold text-white/90 mt-1">
													•••
												</div>
											</div>
										</div>
									</div>
								</motion.div>

								{/* Multiple Cards Select Track */}
								<div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
									{savedCards.map((card) => (
										<button
											key={card.id}
											type="button"
											className={cn(
												"flex-1 flex gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all shadow-xs shrink-0 max-w-[220px]",
												card.isDefault
													? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)]"
													: "bg-[var(--dashboard-card)] border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)]/80"
											)}
										>
											<div className="w-8 h-5.5 rounded bg-[#1e293b] flex items-center justify-center p-1 text-[7px] text-white shrink-0 self-center font-bold italic shadow-xs">
												{card.brand.toUpperCase()}
											</div>
											<div className="min-w-0">
												<p className="text-[11.5px] font-bold text-[var(--dashboard-text)] leading-none mb-1">
													Card •••• {card.last4}
												</p>
												<span className="text-[9.5px] text-[var(--dashboard-muted)] font-medium">
													Exp {card.expiry} {card.isDefault && "· Default"}
												</span>
											</div>
										</button>
									))}
								</div>
							</div>
						) : (
							<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl aspect-[1.586/1] flex flex-col items-center justify-center text-center p-6 text-[var(--dashboard-muted)] space-y-3">
								<CreditCard size={28} className="opacity-30" />
								<div>
									<h4 className="text-[12.5px] font-bold text-[var(--dashboard-text)]">No Saved Cards</h4>
									<p className="text-[11px] max-w-[200px] mt-0.5">
										Add a credit or debit card to quickly fund your wallet.
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Escrow Timeline Interactive Flow Visualizer */}
					<div className="lg:col-span-7 space-y-4">
						<div>
							<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] flex items-center gap-1.5">
								<ShieldCheck size={16} className="text-blue-500" />
								How Handhub Escrow Protects You
							</h3>
							<p className="text-[11.5px] text-[var(--dashboard-muted)] mt-0.5">
								Escrow transactions safeguard your payments against low quality work or abandonment
							</p>
						</div>

						<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-5 space-y-4 shadow-xs relative">
							
							{/* Step timeline lines */}
							<div className="absolute top-[42px] bottom-[42px] left-[27px] w-[2px] bg-[var(--dashboard-border)] pointer-events-none" />

							<div className="flex gap-4 relative">
								<div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm">
									1
								</div>
								<div className="min-w-0 flex-1">
									<h4 className="text-[12.5px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
										Authorize &amp; Lock Funds
									</h4>
									<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
										When a quote proposal is approved, handhub locks the exact project cost. Funds are taken from your balance but **not yet sent** to the artisan.
									</p>
								</div>
							</div>

							<div className="flex gap-4 relative">
								<div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm">
									2
								</div>
								<div className="min-w-0 flex-1">
									<h4 className="text-[12.5px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1">
										Artisan executes work
									</h4>
									<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
										Technician executes the repair knowing their service payment is completely verified and locked in handhub. Security for both parties is guaranteed.
									</p>
								</div>
							</div>

							<div className="flex gap-4 relative">
								<div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-2 border-green-400 flex items-center justify-center font-extrabold text-[10px] shrink-0 z-10 shadow-sm animate-pulse">
									3
								</div>
								<div className="min-w-0 flex-1">
									<h4 className="text-[12.5px] font-extrabold text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-1.5">
										Inspect &amp; Release
										<span className="bg-blue-50 dark:bg-blue-500/10 text-[9px] text-[var(--dashboard-orange)] px-2 py-0.5 border border-[var(--dashboard-orange-mid)]/40 rounded-full font-bold">
											Current Step
										</span>
									</h4>
									<p className="text-[11px] text-[var(--dashboard-muted)] leading-relaxed">
										Once satisfied with the repair, tap **Approve &amp; Pay** on your dashboard to instantly release funds directly to the expert. Handhub handles all security keys.
									</p>
								</div>
							</div>
						</div>
					</div>

				</div>

				{/* ── Transaction History Block ────────────────────────────────────────── */}
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div>
							<h3 className="font-syne font-extrabold text-[15px] sm:text-[17px] text-[var(--dashboard-text)] leading-none mb-1">
								Transaction History
							</h3>
							<p className="text-[11.5px] text-[var(--dashboard-muted)] font-medium">
								Verify wallet statements, direct settlements, and pending locks
							</p>
						</div>

						{/* Transaction searching & filters */}
						<div className="flex items-center gap-2 max-w-sm w-full sm:w-60 relative self-end shrink-0">
							<Search size={13} className="absolute left-3 text-[var(--dashboard-muted)] pointer-events-none" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search transaction, ID..."
								className="w-full pl-8.5 pr-8 py-1.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] transition-colors shadow-xs"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery("")}
									className="absolute right-2 text-[var(--dashboard-muted)] hover:text-[var(--dashboard-orange)]"
								>
									<X size={12} className="stroke-[3.5]" />
								</button>
							)}
						</div>
					</div>

					{/* Category Tabs row */}
					<div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5 border-b border-[var(--dashboard-border)]/40">
						{(["all", "completed", "held", "refunds"] as const).map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setActiveTab(tab)}
								className={cn(
									"px-3.5 py-1.5 rounded-t-xl text-[12px] font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
									activeTab === tab
										? "border-[var(--dashboard-orange)] text-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)]/10"
										: "border-transparent text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]"
								)}
							>
								<span className="capitalize">{tab === "all" ? "All Logs" : tab === "held" ? "Escrow Held" : tab}</span>
							</button>
						))}
					</div>

					{/* Transactions Table/List Panel */}
					<div className="bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl overflow-hidden shadow-xs">
						{filteredTransactions.length === 0 ? (
							<div className="text-center py-12 text-[var(--dashboard-muted)] space-y-2">
								<CreditCard className="mx-auto size-7 opacity-35" />
								<p className="text-[12px] font-bold">No transaction records found</p>
							</div>
						) : (
							<motion.div
								variants={containerVariants}
								initial="hidden"
								animate="show"
								className="divide-y divide-[var(--dashboard-border)]/50"
							>
								{filteredTransactions.map((tx) => {
									const isNegative = tx.amount < 0;
									const config = txConfig[tx.type];
									const IconComponent = config.icon;
									const statusDetail = statusConfig[tx.status];

									return (
										<motion.button
											key={tx.id}
											variants={itemVariants}
											onClick={() => setSelectedTx(tx)}
											className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--dashboard-bg)]/60 transition-all cursor-pointer outline-none gap-3"
										>
											<div className="flex items-center gap-3 min-w-0">
												{/* Icon wrapper based on Tx Type */}
												<div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs", config.bg)}>
													<IconComponent size={15} className={config.color} />
												</div>

												{/* Tx Metadata Title */}
												<div className="min-w-0">
													<h4 className="text-[13px] font-extrabold text-[var(--dashboard-text)] leading-tight truncate mb-1">
														{tx.title}
													</h4>
													<div className="flex items-center gap-2 text-[10.5px] text-[var(--dashboard-muted)] font-medium shrink-0 flex-wrap">
														<span>{tx.date} at {tx.time}</span>
														<span>·</span>
														<span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold">{tx.id}</span>
														{tx.ticketId && (
															<>
																<span>·</span>
																<span className="font-extrabold text-[var(--dashboard-orange)]">{tx.ticketId}</span>
															</>
														)}
													</div>
												</div>
											</div>

											{/* Tx Status & Amount */}
											<div className="text-right shrink-0 flex items-center gap-4">
												{/* Status badge desktop only */}
												<div className={cn("hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-current text-[10px] font-extrabold leading-none", statusDetail.bg, statusDetail.text)}>
													<span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDetail.dot)} />
													{statusDetail.label}
												</div>

												<div className="flex items-center gap-1 text-right">
													<span className={cn(
														"font-syne font-black text-[14.5px] sm:text-[15.5px] tracking-tight",
														isNegative ? "text-[var(--dashboard-text)]" : "text-green-600 dark:text-green-400"
													)}>
														{isNegative ? "-" : "+"}{formattedCurrency(tx.amount)}
													</span>
													<ChevronRight size={14} className="text-[var(--dashboard-muted)]" />
												</div>
											</div>
										</motion.button>
									);
								})}
							</motion.div>
						)}
					</div>
				</div>

			</div>

			{/* ── dialog modals segment ─────────────────────────────────────── */}

			{/* Modal A: Fund Wallet Modal */}
			<Dialog open={isFundingModalOpen} onOpenChange={setIsFundingModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
						<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
							<Plus size={18} className="text-[var(--dashboard-orange)]" />
							Fund Digital Wallet
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleFundWallet} className="p-6 space-y-5">
						<div className="space-y-2">
							<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Select Funding Method
							</label>
							<div className="grid grid-cols-1 gap-2">
								{savedCards.map((card) => (
									<label
										key={card.id}
										className={cn(
											"flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer hover:bg-[var(--dashboard-bg)]/50 transition-all",
											fundingCardId === card.id
												? "border-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)]/20"
												: "border-[var(--dashboard-border)]"
										)}
									>
										<input
											type="radio"
											name="funding_card"
											checked={fundingCardId === card.id}
											onChange={() => setFundingCardId(card.id)}
											className="accent-[var(--dashboard-orange)] shrink-0"
										/>
										<div className="w-8 h-5.5 rounded bg-indigo-950 flex items-center justify-center p-1 text-[7px] text-white shrink-0 font-bold italic">
											{card.brand.toUpperCase()}
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-[12px] font-bold text-[var(--dashboard-text)] leading-none mb-0.5">
												Card •••• {card.last4}
											</p>
											<span className="text-[9.5px] text-[var(--dashboard-muted)] font-medium">
												Exp {card.expiry}
											</span>
										</div>
									</label>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Specify Deposit Amount (₦)
							</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 font-syne font-extrabold text-[15px] text-[var(--dashboard-muted)]">
									₦
								</span>
								<input
									type="number"
									required
									value={fundingAmount}
									onChange={(e) => setFundingAmount(e.target.value)}
									placeholder="50,000"
									className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-syne font-black text-[16px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>
							<p className="text-[10px] text-[var(--dashboard-muted)] font-medium">
								Deposits are secured by Paystack payment gateway. Transaction is fully encrypted.
							</p>
						</div>

						<div className="flex gap-2.5 pt-3">
							<button
								type="button"
								onClick={() => setIsFundingModalOpen(false)}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!fundingAmount || parseFloat(fundingAmount) <= 0}
								className="flex-1 py-2.5 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Authorize Deposit
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal B: Withdraw Funds Modal */}
			<Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
						<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
							<ArrowUpRight size={18} className="text-red-500" />
							Withdraw Wallet Funds
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleWithdrawWallet} className="p-6 space-y-4">
						<div className="space-y-2">
							<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Select Bank Account
							</label>
							<select
								value={withdrawBank}
								onChange={(e) => setWithdrawBank(e.target.value)}
								className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] font-semibold outline-none focus:border-[var(--dashboard-orange)]"
							>
								<option value="011">First Bank of Nigeria</option>
								<option value="058">Guaranty Trust Bank (GTB)</option>
								<option value="035">Wema Bank</option>
								<option value="044">Access Bank</option>
							</select>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
									Account Number
								</label>
								<input
									type="text"
									required
									maxLength={10}
									value={withdrawAccount}
									onChange={(e) => setWithdrawAccount(e.target.value.replace(/\D/g, ""))}
									placeholder="3091482931"
									className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] font-mono text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
									Amount to Withdraw (₦)
								</label>
								<div className="relative">
									<span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-syne font-extrabold text-[13.5px] text-[var(--dashboard-muted)]">
										₦
									</span>
									<input
										type="number"
										required
										max={balance}
										value={withdrawAmount}
										onChange={(e) => setWithdrawAmount(e.target.value)}
										placeholder="20,000"
										className="w-full pl-8.5 pr-3 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-syne font-black text-[14px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
									/>
								</div>
							</div>
						</div>

						<p className="text-[10px] text-[var(--dashboard-muted)] font-semibold text-right leading-none">
							Withdrawable: <span className="text-[var(--dashboard-text)] font-extrabold">{formattedCurrency(balance)}</span>
						</p>

						<div className="flex gap-2.5 pt-3">
							<button
								type="button"
								onClick={() => setIsWithdrawModalOpen(false)}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance || !withdrawAccount || withdrawAccount.length < 10}
								className="flex-1 py-2.5 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Request Payout
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal C: Add Card Modal */}
			<Dialog open={isAddCardModalOpen} onOpenChange={setIsAddCardModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
						<DialogTitle className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] leading-none flex items-center gap-2">
							<CreditCard size={18} className="text-blue-600" />
							Link New Payment Card
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleAddCard} className="p-6 space-y-4">
						<div className="space-y-2">
							<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Card Number
							</label>
							<div className="relative">
								<CreditCard size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]" />
								<input
									type="text"
									required
									value={newCardNumber}
									onChange={(e) => handleCardNumberChange(e.target.value)}
									placeholder="4321 0984 8293 4821"
									className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-mono text-[13px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
									Expiry Date (MM/YY)
								</label>
								<input
									type="text"
									required
									value={newCardExpiry}
									onChange={(e) => handleExpiryChange(e.target.value)}
									placeholder="09/29"
									className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-mono text-[13px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
									Secure CVV
								</label>
								<input
									type="password"
									required
									maxLength={3}
									value={newCardCVV}
									onChange={(e) => setNewCardCVV(e.target.value.replace(/\D/g, ""))}
									placeholder="•••"
									className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] font-mono text-[13px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block">
								Card Holder Name
							</label>
							<input
								type="text"
								required
								value={newCardHolder}
								onChange={(e) => setNewCardHolder(e.target.value)}
								placeholder="Adeola Kamara"
								className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]"
							/>
						</div>

						<div className="flex gap-2.5 pt-3">
							<button
								type="button"
								onClick={() => setIsAddCardModalOpen(false)}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
							>
								Link Method
							</button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal D: Detailed Receipt Transaction Modal */}
			<Dialog open={selectedTx !== null} onOpenChange={(open) => !open && setSelectedTx(null)}>
				{selectedTx && (
					<DialogContent className="max-w-md">
						<DialogHeader className="p-6 pb-2 border-b border-[var(--dashboard-border)]">
							<DialogTitle className="font-syne font-extrabold text-[17px] text-[var(--dashboard-text)] leading-none">
								Transaction Receipt
							</DialogTitle>
						</DialogHeader>
						<div className="p-6 space-y-6">
							{/* Premium detailed layout */}
							<div className="text-center space-y-2">
								<div className="w-11 h-11 rounded-full bg-[var(--dashboard-orange-light)] flex items-center justify-center mx-auto text-[var(--dashboard-orange)] shadow-xs">
									<ShieldCheck size={22} className="stroke-[2.5]" />
								</div>
								<div>
									<h4 className="text-[12.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
										Statement Amount
									</h4>
									<div className="font-syne font-black text-[26px] sm:text-[30px] text-[var(--dashboard-text)] mt-0.5">
										{selectedTx.amount < 0 ? "-" : "+"}{formattedCurrency(selectedTx.amount)}
									</div>
								</div>
							</div>

							<div className="border border-[var(--dashboard-border)] rounded-2xl p-4.5 space-y-3.5 bg-[var(--dashboard-bg)]/40">
								<div className="flex justify-between items-start gap-2 text-[12px]">
									<span className="text-[var(--dashboard-muted)] font-bold">Transaction Name</span>
									<span className="text-[var(--dashboard-text)] font-extrabold text-right max-w-[200px]">
										{selectedTx.title}
									</span>
								</div>

								<div className="flex justify-between items-center text-[12px]">
									<span className="text-[var(--dashboard-muted)] font-bold">Statement Date</span>
									<span className="text-[var(--dashboard-text)] font-extrabold text-right">
										{selectedTx.date} at {selectedTx.time}
									</span>
								</div>

								<div className="flex justify-between items-center text-[12px]">
									<span className="text-[var(--dashboard-muted)] font-bold">Statement Reference</span>
									<span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold text-right uppercase">
										{selectedTx.id}
									</span>
								</div>

								{selectedTx.ticketId && (
									<div className="flex justify-between items-center text-[12px]">
										<span className="text-[var(--dashboard-muted)] font-bold">Associated Booking</span>
										<span className="font-extrabold text-[var(--dashboard-orange)] text-right">
											{selectedTx.ticketId}
										</span>
									</div>
								)}

								{selectedTx.artisanName && (
									<div className="flex justify-between items-center text-[12px] border-t border-[var(--dashboard-border)]/50 pt-3 mt-1">
										<span className="text-[var(--dashboard-muted)] font-bold">Artisan Partner</span>
										<div className="flex items-center gap-2">
											<div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-black shrink-0", selectedTx.avatarBgClass)}>
												{selectedTx.avatarInitials}
											</div>
											<span className="text-[var(--dashboard-text)] font-extrabold text-right">
												{selectedTx.artisanName}
											</span>
										</div>
									</div>
								)}
							</div>

							<div className="flex flex-col gap-2.5">
								<div className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-900/10 p-3 rounded-xl text-[11px] font-medium text-blue-700 dark:text-blue-400 leading-normal">
									<ShieldCheck size={16} className="shrink-0 text-blue-500" />
									<span>This transaction statement is protected by handhub escrow keys and fully settled.</span>
								</div>

								<button
									type="button"
									onClick={() => setSelectedTx(null)}
									className="w-full py-2.5 bg-[var(--dashboard-text)] hover:bg-neutral-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors shadow-md"
								>
									Dismiss Receipt
								</button>
							</div>
						</div>
					</DialogContent>
				)}
			</Dialog>

		</main>
	);
}
