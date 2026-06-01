import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import {
	LayoutDashboard,
	Search,
	Calendar,
	MessageSquare,
	CreditCard,
	Star,
	MapPin,
	Settings,
	Phone,
	FileText,
	Lock,
	Send,
	Check,
	X,
	Menu,
	ChevronUp,
	User,
	HelpCircle,
	LogOut,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { useState, useRef, useEffect, createContext } from "react";
import { HHLogo } from "#/components/hh/logo";

export interface DashboardContextType {
	hasActiveChat: boolean;
	setHasActiveChat: (val: boolean) => void;
	isMobileSidebarOpen: boolean;
	setIsMobileSidebarOpen: (val: boolean) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
	hasActiveChat: true,
	setHasActiveChat: () => {},
	isMobileSidebarOpen: false,
	setIsMobileSidebarOpen: () => {},
});

export const Route = createFileRoute("/dashboard")({ component: DashboardLayout });

interface Message {
	id: number;
	sender: "artisan" | "user" | "system";
	text: string;
	time: string;
	quote?: {
		title: string;
		amount: string;
		desc: string;
		paid: boolean;
	};
}

function DashboardLayout() {
	const { pathname } = useLocation();
	const navigate = Route.useNavigate();
	
	const [hasActiveChat, setHasActiveChat] = useState(true);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	
	// Real-time chat states
	const [messages, setMessages] = useState<Message[]>([
		{
			id: 1,
			sender: "artisan",
			text: "Hello! I've reviewed your request. The smoking panel sounds like an urgent issue. I can head over by 4:00 PM. Is that fine?",
			time: "14:32",
		},
		{
			id: 2,
			sender: "user",
			text: "Sure, that works perfectly! Please bring your full kit — the inverter has been acting up for a week now.",
			time: "14:35",
		},
		{
			id: 3,
			sender: "artisan",
			text: "Understood, I'll bring everything. Here's my quote for the inspection:",
			time: "14:36",
			quote: {
				title: "Quote proposal",
				amount: "₦45,000",
				desc: "Inverter inspection fee (fixed rate)",
				paid: false,
			},
		},
	]);

	const [inputText, setInputText] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Scroll to latest message
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Lock body scroll when mobile sidebar is open
	useEffect(() => {
		if (isMobileSidebarOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isMobileSidebarOpen]);

	const handleSendMessage = (textToSend: string) => {
		if (!textToSend.trim()) return;

		const userMsg: Message = {
			id: Date.now(),
			sender: "user",
			text: textToSend,
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		};

		setMessages((prev) => [...prev, userMsg]);
		setInputText("");

		// Simulate artisan typing a reply after 1.2s
		setIsTyping(true);
		setTimeout(() => {
			setIsTyping(false);
			const replyMsg: Message = {
				id: Date.now() + 1,
				sender: "artisan",
				text: "Great! I'm packing my tools now and will head your way shortly. I will call you once I arrive.",
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			};
			setMessages((prev) => [...prev, replyMsg]);
		}, 2000);
	};

	const handlePayQuote = (msgId: number) => {
		setMessages((prev) =>
			prev.map((msg) => {
				if (msg.id === msgId && msg.quote) {
					return {
						...msg,
						quote: { ...msg.quote, paid: true },
					};
				}
				return msg;
			})
		);

		// Append a system confirmation message
		setTimeout(() => {
			const systemMsg: Message = {
				id: Date.now() + 2,
				sender: "system",
				text: "Payment Confirmed: ₦45,000 has been secured in escrow for Inverter Inspection.",
				time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			};
			setMessages((prev) => [...prev, systemMsg]);
		}, 500);
	};

	const navItems = [
		{ section: "Main", items: [
			{ name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", badge: null },
			{ name: "Find Artisans", icon: Search, path: "/dashboard/artisans", badge: 48 },
			{ name: "Bookings", icon: Calendar, path: "/dashboard/bookings", badge: 3 },
			{ name: "Messages", icon: MessageSquare, path: "/dashboard/messages", badge: 5 },
		]},
		{ section: "Manage", items: [
			{ name: "Payments", icon: CreditCard, path: "/dashboard/payments", badge: null },
			{ name: "Reviews", icon: Star, path: "/dashboard/reviews", badge: null },
			{ name: "My Area", icon: MapPin, path: "/dashboard/my-area", badge: null },
		]},
		{ section: "Account", items: [
			{ name: "Settings", icon: Settings, path: "/dashboard/settings", badge: null },
		]}
	];

	// Sidebar nav content - shared between desktop and mobile
	const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
		<>
			{/* Sidebar Logo */}
			<div
				className="p-6 border-b border-white/5 hover:cursor-pointer transition-opacity duration-150 hover:opacity-90 flex items-center justify-between"
				onClick={() => { navigate({ to: "/" }); onNavClick?.(); }}
			>
				<div>
					<HHLogo theme="dark" height={28} />
					<p className="text-[9.5px] text-white/30 tracking-[0.8px] uppercase mt-1.5 font-bold">
						Marketplace OS
					</p>
				</div>
				{/* Close button only visible on mobile */}
				{onNavClick && (
					<button
						type="button"
						onClick={(e) => { e.stopPropagation(); onNavClick(); }}
						className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-150 ml-auto"
						aria-label="Close sidebar"
					>
						<X size={16} />
					</button>
				)}
			</div>

			{/* Sidebar Nav */}
			<nav className="flex-1 overflow-y-auto px-3 py-6 flex flex-col gap-6 scrollbar-none">
				{navItems.map((sec) => (
					<div key={sec.section}>
						<div className="text-[9.5px] text-white/20 tracking-[1.5px] uppercase font-bold px-3.5 mb-2.5 select-none">
							{sec.section}
						</div>
						<div className="flex flex-col gap-1">
							{sec.items.map((item) => {
								const isActive = pathname === item.path;
								const Icon = item.icon;
								return (
									<Link
										key={item.name}
										to={item.path}
										onClick={() => {
											onNavClick?.();
										}}
										className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] cursor-pointer transition-all duration-150 border ${
											isActive
												? "bg-white/[0.04] !text-[var(--dashboard-orange)] font-semibold border-white/5"
												: "!text-white/30 border-transparent hover:bg-white/[0.03] hover:!text-white/80"
										}`}
									>
										{/* Vertical indicator bar for active item */}
										{isActive && (
											<div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r bg-[var(--dashboard-orange)]" />
										)}
										
										{/* Explicit size and no-shrink to prevent collapsing */}
										<Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
											isActive ? "text-[var(--dashboard-orange)]" : "text-white/30"
										}`} />
										
										<span className="truncate">{item.name}</span>
										{item.badge && (
											<span className={`ml-auto text-[9.5px] px-2 py-0.5 rounded-full font-bold leading-none ${
												isActive ? "bg-[var(--dashboard-orange)]/10 text-[var(--dashboard-orange)]" : "bg-white/5 text-white/30"
											}`}>
												{item.badge}
											</span>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			{/* Sidebar Footer User Info */}
			<div className="p-4 border-t border-white/5 bg-white/[0.01]">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 cursor-pointer shadow-inner group"
						>
							<div className="w-8 h-8 rounded-full bg-[var(--dashboard-orange)] flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm border border-white/10 ring-2 ring-[var(--dashboard-orange-light)]/10">
								AK
							</div>
							<div className="flex flex-col min-w-0 flex-1 text-left">
								<p className="text-[13px] font-semibold text-white/90 leading-none mb-1 truncate">
									Adeola Kamara
								</p>
								<span className="text-[10px] text-white/30 font-medium truncate">
									Lekki, Lagos
								</span>
							</div>
							<ChevronUp size={13} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						side="top"
						align="start"
						sideOffset={8}
						className="w-56 mb-1"
					>
						<DropdownMenuLabel className="flex items-center gap-2.5 pb-2">
							<div className="w-7 h-7 rounded-full bg-[var(--dashboard-orange)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
								AK
							</div>
							<div className="flex flex-col min-w-0">
								<span className="text-xs font-semibold text-foreground truncate">Adeola Kamara</span>
								<span className="text-[10px] text-muted-foreground truncate">adeola@example.com</span>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="gap-2.5 cursor-pointer"
							onClick={() => navigate({ to: "/dashboard/settings" })}
						>
							<User size={14} className="text-muted-foreground" />
							View Profile
						</DropdownMenuItem>

						<DropdownMenuItem
							className="gap-2.5 cursor-pointer"
							onClick={() => navigate({ to: "/dashboard/settings" })}
						>
							<Settings size={14} className="text-muted-foreground" />
							Settings
						</DropdownMenuItem>

						<DropdownMenuItem className="gap-2.5 cursor-pointer">
							<HelpCircle size={14} className="text-muted-foreground" />
							Help & Support
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="gap-2.5 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
							onClick={() => setShowLogoutDialog(true)}
						>
							<LogOut size={14} />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* ── Logout Confirmation Dialog ───────────────────────────────────── */}
			<Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<DialogContent className="max-w-sm p-5 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-2xl rounded-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3 text-[16px] font-extrabold text-[var(--dashboard-text)] font-syne">
							<div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
								<LogOut size={15} className="text-red-500" />
							</div>
							Log out of Handhub?
						</DialogTitle>
					</DialogHeader>
					<div className="mt-2 space-y-4">
						<p className="text-[12.5px] leading-relaxed text-[var(--dashboard-muted)]">
							You'll be signed out of your session. Any unsaved modifications in your workspace will be lost.
						</p>
						<div className="flex gap-2.5 pt-1">
							<button
								type="button"
								onClick={() => setShowLogoutDialog(false)}
								className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => { setShowLogoutDialog(false); navigate({ to: "/" }); }}
								className="flex-1 py-2.5 bg-red-600 hover:bg-red-750 text-white border border-red-700/10 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
							>
								<LogOut size={13} />
								Yes, log out
							</button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);

	return (
		<div className="hh-dashboard flex h-screen w-screen overflow-hidden bg-[var(--dashboard-bg)]">

			{/* ── Mobile Sidebar Drawer Overlay ──────────────────────────────── */}
			{/* Backdrop */}
			<div
				className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
					isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				}`}
				onClick={() => setIsMobileSidebarOpen(false)}
				aria-hidden="true"
			/>

			{/* Mobile Drawer Panel */}
			<aside
				className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-[#13110F] flex flex-col border-r border-white/5 md:hidden transition-transform duration-300 ease-in-out ${
					isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				aria-label="Mobile navigation"
			>
				<SidebarContent onNavClick={() => setIsMobileSidebarOpen(false)} />
			</aside>

			{/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
			<aside className="hidden md:flex flex-col bg-[#13110F] w-[260px] h-full shrink-0 border-r border-white/5">
				<SidebarContent />
			</aside>

			{/* ── Main Content Area ──────────────────────────────────────────── */}
			<div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
				<DashboardContext.Provider value={{ hasActiveChat, setHasActiveChat, isMobileSidebarOpen, setIsMobileSidebarOpen }}>
					<Outlet />
				</DashboardContext.Provider>
			</div>

			{/* ── Chat Panel (Right Side) ─────────────────────────────────────── */}
			{hasActiveChat && pathname !== "/dashboard/messages" && pathname !== "/dashboard/payments" && pathname !== "/dashboard/reviews" && pathname !== "/dashboard/settings" && pathname !== "/dashboard/my-area" && (
				<aside className="hidden lg:flex flex-col w-[320px] bg-[var(--dashboard-card)] border-l border-[var(--dashboard-border)] h-full overflow-hidden shrink-0 animate-in slide-in-from-right duration-250">
					{/* Chat Header */}
					<div className="p-4 border-b border-[var(--dashboard-border)] flex items-center gap-3 bg-[var(--dashboard-card)]">
						<div className="w-9 h-9 rounded-full bg-[var(--dashboard-orange-light)] flex items-center justify-center text-sm font-semibold text-[var(--dashboard-orange)] relative shrink-0">
							TJ
							<div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white absolute bottom-0 right-0" />
						</div>
						<div className="flex flex-col min-w-0">
							<h3 className="text-sm font-bold text-[var(--dashboard-text)] truncate">
								Taiwo Johnson
							</h3>
							<p className="text-[11px] text-green-600 font-medium">
								Online · Licensed Electrician
							</p>
						</div>
						<div className="ml-auto flex gap-1 shrink-0">
							<button
								type="button"
								className="w-8 h-8 rounded-lg border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-bg)] hover:text-[var(--dashboard-text)] transition-colors duration-150"
								aria-label="Call artisan"
							>
								<Phone size={14} />
							</button>
							<button
								type="button"
								className="w-8 h-8 rounded-lg border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-muted)] hover:bg-[var(--dashboard-bg)] hover:text-[var(--dashboard-text)] transition-colors duration-150"
								aria-label="View location map"
							>
								<MapPin size={14} />
							</button>
							<button
								type="button"
								onClick={() => setHasActiveChat(false)}
								className="w-8 h-8 rounded-lg border border-[var(--dashboard-border)] flex items-center justify-center text-red-500 bg-red-50/10 hover:bg-red-500 hover:text-white transition-colors duration-150 cursor-pointer"
								aria-label="Close chat"
							>
								<X size={14} className="stroke-[2.5]" />
							</button>
						</div>
					</div>

					{/* Chat active ticket tag */}
					<div className="mx-4 mt-3 bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)] rounded-lg p-3 flex items-center gap-2.5 shrink-0">
						<FileText size={15} className="text-[var(--dashboard-orange)] shrink-0" />
						<div className="min-w-0">
							<p className="text-[12px] font-bold text-[#9A3412] truncate">
								Inverter Inspection · Ticket #1042
							</p>
							<span className="text-[10.5px] text-[#C2410C] font-medium block">
								In progress · Started 09:14 today
							</span>
						</div>
					</div>

					{/* Chat Messages */}
					<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 bg-[var(--dashboard-card)]">
						{messages.map((msg) => {
							if (msg.sender === "system") {
								return (
									<div key={msg.id} className="text-center my-1.5" role="status">
										<span className="text-[11px] bg-green-50 text-green-700 border border-green-200 rounded-full px-3.5 py-1 inline-flex items-center gap-1.5 font-medium">
											<Check size={11} className="stroke-[3]" /> {msg.text}
										</span>
									</div>
								);
							}

							const isUser = msg.sender === "user";
							return (
								<div
									key={msg.id}
									className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
								>
									{!isUser && (
										<div className="w-7 h-7 rounded-full bg-[var(--dashboard-orange-light)] flex items-center justify-center text-[10px] font-bold text-[var(--dashboard-orange)] shrink-0">
											TJ
										</div>
									)}
									<div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
										<div
											className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
												isUser
													? "bg-[var(--dashboard-orange)] text-white rounded-br-none"
													: "bg-[#F1EEE9] text-[var(--dashboard-text)] rounded-bl-none"
											}`}
										>
											{msg.text}
										</div>

										{msg.quote && (
											<div className="w-full mt-2 bg-white border border-[var(--dashboard-border)] rounded-xl p-3.5 shadow-sm max-w-[240px]">
												<div className="text-[10px] uppercase font-bold tracking-wider text-[var(--dashboard-muted)] mb-1.5 flex items-center gap-1.5">
													<FileText size={12} className="text-[var(--dashboard-orange)]" />
													Quote proposal
												</div>
												<div className="font-syne text-[22px] font-bold text-[var(--dashboard-orange)] mb-0.5">
													{msg.quote.amount}
												</div>
												<p className="text-[11.5px] text-[var(--dashboard-muted)] mb-3">
													{msg.quote.desc}
												</p>
												<button
													type="button"
													className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 ${
														msg.quote.paid
															? "bg-green-600 text-white cursor-default"
															: "bg-[var(--dashboard-orange)] hover:bg-[var(--dashboard-orange-mid)] text-white"
													}`}
													onClick={() => !msg.quote?.paid && handlePayQuote(msg.id)}
													disabled={msg.quote.paid}
												>
													{msg.quote.paid ? (
														<>
															<Check size={14} className="stroke-[3]" /> Paid ✓
														</>
													) : (
														<>
															<Lock size={13} /> Review &amp; pay now
														</>
													)}
												</button>
											</div>
										)}
										<span className="text-[9.5px] text-[var(--dashboard-muted)] mt-1 px-1">
											{msg.time}
										</span>
									</div>
								</div>
							);
						})}

						{/* Loading typing indicator */}
						{isTyping && (
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 rounded-full bg-[var(--dashboard-orange-light)] flex items-center justify-center text-[10px] font-bold text-[var(--dashboard-orange)]">
									TJ
								</div>
								<div className="bg-[#F1EEE9] px-3.5 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-1">
									<span className="w-1.5 h-1.5 bg-[var(--dashboard-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
									<span className="w-1.5 h-1.5 bg-[var(--dashboard-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
									<span className="w-1.5 h-1.5 bg-[var(--dashboard-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
								</div>
							</div>
						)}
						<div ref={chatEndRef} />
					</div>

					{/* Chat quick replies */}
					<div className="px-4 py-2 border-t border-[var(--dashboard-border)] flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 bg-[var(--dashboard-card)]">
						{["I'm on my way", "Can we reschedule?", "Got it, thanks!"].map((text) => (
							<button
								key={text}
								type="button"
								className="px-3 py-1.5 rounded-full border border-[var(--dashboard-border)] text-[11px] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange)] hover:text-[var(--dashboard-orange)] bg-white cursor-pointer whitespace-nowrap transition-colors duration-150 shrink-0"
								onClick={() => handleSendMessage(text)}
							>
								{text}
							</button>
						))}
					</div>

					{/* Chat Input area */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSendMessage(inputText);
						}}
						className="p-3 border-t border-[var(--dashboard-border)] flex items-center gap-2 bg-[var(--dashboard-card)] shrink-0"
					>
						<input
							type="text"
							className="flex-1 bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-full px-4 py-2 text-sm text-[var(--dashboard-text)] outline-none focus:border-[var(--dashboard-orange)] transition-colors duration-150"
							placeholder="Type a message…"
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							aria-label="Chat message input"
						/>
						<button
							type="submit"
							className="w-9 h-9 rounded-full bg-[var(--dashboard-orange)] hover:bg-[var(--dashboard-orange-mid)] text-white flex items-center justify-center cursor-pointer transition-colors duration-150 shrink-0"
							aria-label="Send message"
						>
							<Send size={15} />
						</button>
					</form>
				</aside>
			)}

			{/* ── Mobile Bottom Tab Bar ──────────────────────────────────────── */}
			<nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#13110F] border-t border-white/10 flex items-center px-2 py-1 safe-area-bottom">
				{[
					{ name: "Home", icon: LayoutDashboard, path: "/dashboard" },
					{ name: "Find", icon: Search, path: "/artisans" },
					{ name: "Bookings", icon: Calendar, path: "/bookings" },
					{ name: "Messages", icon: MessageSquare, path: "/messages", badge: 5 },
					{ name: "More", icon: Menu, path: null },
				].map((item) => {
					const isActive = item.path ? pathname === item.path : false;
					const Icon = item.icon;
					return (
						<button
							key={item.name}
							type="button"
							onClick={() => {
								if (item.path === null) {
									setIsMobileSidebarOpen(true);
								} else {
									navigate({ to: item.path });
								}
							}}
							className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
								isActive
									? "text-[var(--dashboard-orange)]"
									: "text-white/30 hover:text-white/60"
							}`}
						>
							<Icon size={20} className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`} />
							<span className="text-[9px] font-semibold tracking-wide">{item.name}</span>
							{"badge" in item && item.badge && (
								<span className="absolute top-1.5 w-4 h-4 bg-[var(--dashboard-orange)] rounded-full text-[8px] text-white font-bold flex items-center justify-center">
									{item.badge}
								</span>
							)}
						</button>
					);
				})}
			</nav>
		</div>
	);
}
