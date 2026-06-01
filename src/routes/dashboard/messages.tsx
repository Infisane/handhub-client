import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowLeft,
	Check,
	MessageSquare,
	Phone,
	Search,
	Send,
	ShieldCheck,
	X,
	Zap,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/messages")({ 
	component: MessagesPage,
});

/* ── Types ─────────────────────────────────────────────────── */
interface Quote {
	title: string;
	amount: string;
	desc: string;
	paid: boolean;
}

interface ChatMessage {
	id: string;
	sender: "artisan" | "user" | "system";
	text: string;
	time: string;
	quote?: Quote;
}

interface ChatThread {
	id: string;
	artisanName: string;
	artisanInitials: string;
	artisanTrade: string;
	avatarColor: string;
	verified: boolean;
	online: boolean;
	lastMessageSnippet: string;
	lastMessageTime: string;
	unread: boolean;
	messages: ChatMessage[];
}

/* ── Data ───────────────────────────────────────────────────── */
const INITIAL_THREADS: ChatThread[] = [
	{
		id: "t1",
		artisanName: "Taiwo Johnson",
		artisanInitials: "TJ",
		artisanTrade: "Licensed Electrician",
		avatarColor: "bg-[#FEE9E1] text-[#C2410C]",
		verified: true,
		online: true,
		lastMessageSnippet: "Quote Proposal - Inverter Inspection Fee",
		lastMessageTime: "14:35",
		unread: false,
		messages: [
			{
				id: "m1_1",
				sender: "artisan",
				text: "Hello! I've reviewed your booking request. The smoking solar panel inverter sounds like an urgent issue. I can head over by 4:00 PM today to inspect. Is that fine?",
				time: "14:32",
			},
			{
				id: "m1_2",
				sender: "user",
				text: "Sure, that works perfectly! Please bring your full diagnostic kit — the inverter has been acting up for a week now.",
				time: "14:35",
			},
			{
				id: "m1_3",
				sender: "artisan",
				text: "Understood, I will bring everything. Here is my official quote proposal for the diagnostics and balancing of the load phases:",
				time: "14:35",
			},
			{
				id: "m1_4",
				sender: "artisan",
				text: "Quote Proposal",
				time: "14:35",
				quote: {
					title: "Inverter Inspection",
					amount: "₦45,000",
					desc: "Inverter diagnostics, load phase balancing, and wire inspections.",
					paid: false,
				},
			},
		],
	},
	{
		id: "t2",
		artisanName: "Biodun Kareem",
		artisanInitials: "BK",
		artisanTrade: "AC Technician",
		avatarColor: "bg-[#E2FBF0] text-[#0F766E]",
		verified: true,
		online: true,
		lastMessageSnippet: "See you tomorrow at 10 AM, thanks!",
		lastMessageTime: "Yesterday",
		unread: false,
		messages: [
			{
				id: "m2_1",
				sender: "user",
				text: "Hi Biodun, can you service 3 split AC units in the main lounge tomorrow morning?",
				time: "Yesterday",
			},
			{
				id: "m2_2",
				sender: "artisan",
				text: "Hello, yes I am available! I can arrive at 10:00 AM. Let me know if that schedule works for you.",
				time: "Yesterday",
			},
			{
				id: "m2_3",
				sender: "user",
				text: "Perfect. See you tomorrow at 10 AM, thanks!",
				time: "Yesterday",
			},
		],
	},
	{
		id: "t3",
		artisanName: "Emeka Nwosu",
		artisanInitials: "EM",
		artisanTrade: "Master Plumber",
		avatarColor: "bg-[#E0F2FE] text-[#0369A1]",
		verified: true,
		online: false,
		lastMessageSnippet: "Invoice marked as paid. Thank you!",
		lastMessageTime: "May 28",
		unread: false,
		messages: [
			{
				id: "m3_1",
				sender: "artisan",
				text: "The leak under the kitchen cabinet is fully repaired. I replaced the damaged drain line joints and sealed the piping.",
				time: "May 28",
			},
			{
				id: "m3_2",
				sender: "user",
				text: "Excellent work, Emeka! The kitchen floor is dry now and water pressure is back to normal.",
				time: "May 28",
			},
			{
				id: "m3_3",
				sender: "artisan",
				text: "Invoice marked as paid. Thank you!",
				time: "May 28",
			},
		],
	},
];

const QUICK_REPLIES = [
	"On my way now!",
	"Can we reschedule?",
	"Perfect, thank you!",
	"Please send details.",
];

/* ── Component ──────────────────────────────────────────────── */
function MessagesPage() {
	const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
	const [selectedThreadId, setSelectedThreadId] = useState<string | null>("t1");
	const [searchQuery, setSearchQuery] = useState("");
	const [inputText, setInputText] = useState("");

	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Selected Thread memo
	const activeThread = useMemo(() => {
		return threads.find((t) => t.id === selectedThreadId) || null;
	}, [threads, selectedThreadId]);

	// Filtered Threads
	const filteredThreads = useMemo(() => {
		if (!searchQuery.trim()) return threads;
		const q = searchQuery.toLowerCase();
		return threads.filter(
			(t) =>
				t.artisanName.toLowerCase().includes(q) ||
				t.artisanTrade.toLowerCase().includes(q) ||
				t.lastMessageSnippet.toLowerCase().includes(q)
		);
	}, [threads, searchQuery]);

	// Auto scroll to bottom
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		if (activeThread) {
			scrollToBottom();
		}
	}, [activeThread?.messages.length, selectedThreadId]);

	// Handle Message Send
	const handleSendMessage = (text: string) => {
		if (!text.trim() || !selectedThreadId) return;

		setThreads((prev) =>
			prev.map((t) => {
				if (t.id !== selectedThreadId) return t;

				const newMessage: ChatMessage = {
					id: `m_${Date.now()}`,
					sender: "user",
					text: text.trim(),
					time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				};

				return {
					...t,
					lastMessageSnippet: text.trim(),
					lastMessageTime: "Just now",
					messages: [...t.messages, newMessage],
				};
			})
		);

		setInputText("");
	};

	// Mark Proposal as Paid
	const handlePayProposal = (msgId: string) => {
		if (!selectedThreadId) return;

		setThreads((prev) =>
			prev.map((t) => {
				if (t.id !== selectedThreadId) return t;

				const updatedMessages = t.messages.map((m) => {
					if (m.id === msgId && m.quote) {
						return {
							...m,
							quote: { ...m.quote, paid: true },
						};
					}
					return m;
				});

				const systemNotif: ChatMessage = {
					id: `sys_${Date.now()}`,
					sender: "system",
					text: "Proposal paid successfully. Invoice locked. Job scheduled.",
					time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				};

				return {
					...t,
					lastMessageSnippet: "Payment Successful ✓",
					messages: [...updatedMessages, systemNotif],
				};
			})
		);
	};

	return (
		<main className="flex-1 flex h-full overflow-hidden bg-[var(--dashboard-bg)]">
			
			{/* ── Left Sidebar: Conversations Inbox ────────────────────────────────────── */}
			<div className={cn(
				"w-full md:w-85 shrink-0 bg-[var(--dashboard-card)] border-r border-[var(--dashboard-border)] flex flex-col h-full",
				selectedThreadId && "hidden md:flex" // Collapse threads panel on mobile if chat is active
			)}>
				{/* Inbox Header */}
				<div className="p-5 border-b border-[var(--dashboard-border)] space-y-4">
					<div>
						<h2 className="font-syne font-extrabold text-[20px] tracking-[-0.5px] text-[var(--dashboard-text)]">
							Conversations
						</h2>
						<p className="text-[11.5px] text-[var(--dashboard-muted)] font-medium">
							Chat threads with verified service experts
						</p>
					</div>

					{/* Inbox search input */}
					<div className="relative">
						<Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)] pointer-events-none" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search chats or artisans..."
							className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-1 focus:ring-[var(--dashboard-orange)]/15 transition-all shadow-xs"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)] hover:text-[var(--dashboard-orange)]"
							>
								<X size={12} className="stroke-[3.5]" />
							</button>
						)}
					</div>
				</div>

				{/* Threads Scroll Feed */}
				<div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-none">
					{filteredThreads.length === 0 ? (
						<div className="text-center py-12 text-[var(--dashboard-muted)] space-y-2">
							<MessageSquare className="mx-auto size-7 opacity-40" />
							<p className="text-[12px] font-bold">No conversations found</p>
						</div>
					) : (
						filteredThreads.map((thread) => {
							const isActive = thread.id === selectedThreadId;

							return (
								<button
									key={thread.id}
									type="button"
									onClick={() => setSelectedThreadId(thread.id)}
									className={cn(
										"w-full flex gap-3 p-3.5 rounded-xl text-left cursor-pointer transition-all border",
										isActive
											? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)]"
											: "bg-transparent border-transparent hover:bg-[var(--dashboard-bg)]/80"
									)}
								>
									{/* Initials Avatar */}
									<div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-black text-[12.5px] shrink-0 relative shadow-xs", thread.avatarColor)}>
										{thread.artisanInitials}
										{thread.verified && (
											<div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--dashboard-orange)] border border-white flex items-center justify-center shadow-xs">
												<Check size={8} className="text-white stroke-[4]" />
											</div>
										)}
										{thread.online && (
											<span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
										)}
									</div>

									{/* Info body */}
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex items-center justify-between gap-1.5">
											<span className={cn(
												"font-syne text-[13px] leading-none truncate",
												thread.unread || isActive ? "font-extrabold text-[var(--dashboard-text)]" : "font-bold text-[var(--dashboard-muted)]"
											)}>
												{thread.artisanName}
											</span>
											<span className="text-[10px] text-[var(--dashboard-muted)] font-bold shrink-0">
												{thread.lastMessageTime}
											</span>
										</div>
										<div className="text-[10.5px] font-bold text-[var(--dashboard-muted)] truncate">
											{thread.artisanTrade}
										</div>
										<p className={cn(
											"text-[11.5px] truncate mt-1 leading-none font-medium",
											thread.unread ? "text-[var(--dashboard-text)] font-extrabold" : "text-[var(--dashboard-muted)]"
										)}>
											{thread.lastMessageSnippet}
										</p>
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>

			{/* ── Right Content: Messaging Workspace ─────────────────────────────────── */}
			<div className={cn(
				"flex-1 flex flex-col h-full bg-[var(--dashboard-bg)]",
				!selectedThreadId && "hidden md:flex" // Hide on mobile if no thread chosen
			)}>
				<AnimatePresence mode="wait">
					{activeThread ? (
						<motion.div
							key={activeThread.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex-1 flex flex-col h-full overflow-hidden relative"
						>
							
							{/* ── Active Conversation Header ─────────────────────────────────── */}
							<div className="shrink-0 bg-[var(--dashboard-card)] border-b border-[var(--dashboard-border)] px-5 py-4 flex items-center justify-between shadow-xs">
								<div className="flex items-center gap-3 min-w-0">
									
									{/* Mobile Back trigger */}
									<button
										type="button"
										onClick={() => setSelectedThreadId(null)}
										className="md:hidden p-1.5 rounded-full hover:bg-[var(--dashboard-bg)] -ml-1 shrink-0"
										aria-label="Back to conversations"
									>
										<ArrowLeft size={18} className="text-[var(--dashboard-text)]" />
									</button>

									{/* Avatar */}
									<div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-black text-[12px] shrink-0 relative", activeThread.avatarColor)}>
										{activeThread.artisanInitials}
										{activeThread.online && (
											<span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-white" />
										)}
									</div>

									{/* Meta Titles */}
									<div className="min-w-0">
										<div className="flex items-center gap-1">
											<span className="font-syne font-extrabold text-[14.5px] text-[var(--dashboard-text)] leading-none truncate">
												{activeThread.artisanName}
											</span>
											{activeThread.verified && (
												<ShieldCheck size={13} className="text-[var(--dashboard-orange)] shrink-0" />
											)}
										</div>
										<div className="text-[10px] text-[var(--dashboard-muted)] font-bold truncate mt-0.5">
											{activeThread.online ? "Online · " : "Offline · "} {activeThread.artisanTrade}
										</div>
									</div>
								</div>

								{/* Direct calling options */}
								<div className="flex gap-1.5">
									<button
										type="button"
										className="w-9 h-9 rounded-xl border border-[var(--dashboard-border)] flex items-center justify-center text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-colors cursor-pointer shrink-0"
										title="Call Artisan"
									>
										<Phone size={14} />
									</button>
								</div>
							</div>

							{/* ── Active Chat Bubble scroll feed ──────────────────────────────── */}
							<div className="flex-1 overflow-y-auto p-5 space-y-4 pb-28 scrollbar-none">
								
								{/* Safety / Verification warning */}
								<div className="mx-auto max-w-sm bg-blue-50/70 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl p-3 text-center text-[11px] text-blue-700 dark:text-blue-400 font-medium">
									To protect your payment, always book and pay directly through Handhub. Keep communication on the app.
								</div>

								{activeThread.messages.map((msg) => {
									const isUser = msg.sender === "user";
									const isSystem = msg.sender === "system";

									if (isSystem) {
										return (
											<div key={msg.id} className="flex justify-center my-2 animate-in fade-in duration-200">
												<span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200/50 text-[10.5px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
													<Check size={11} className="stroke-[3.5]" />
													{msg.text}
												</span>
											</div>
										);
									}

									return (
										<div
											key={msg.id}
											className={cn(
												"flex w-full mb-1 items-end gap-2.5",
												isUser ? "justify-end" : "justify-start"
											)}
										>
											{/* Avatar bubble for artisan only */}
											{!isUser && (
												<div className={cn("w-7 h-7 rounded-md flex items-center justify-center font-black text-[9.5px] shrink-0", activeThread.avatarColor)}>
													{activeThread.artisanInitials}
												</div>
											)}

											{/* Message content block */}
											<div className={cn(
												"max-w-[75%] rounded-2xl p-3.5 shadow-xs relative",
												isUser
													? "bg-[var(--dashboard-orange)] text-white rounded-br-none"
													: "bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[var(--dashboard-text)] rounded-bl-none"
											)}>
												{/* Quote proposal payload layout */}
												{msg.quote ? (
													<div className="space-y-3">
														<div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 rounded-lg w-fit">
															<Zap size={11} className="stroke-[2.5]" /> Quote Proposal
														</div>
														<div className="space-y-1">
															<h4 className="font-syne font-extrabold text-[14.5px] text-[var(--dashboard-text)] leading-tight">
																{msg.quote.title}
															</h4>
															<p className="text-[12.5px] text-[var(--dashboard-muted)] leading-relaxed">
																{msg.quote.desc}
															</p>
														</div>

														<div className="flex items-center justify-between border-t border-[var(--dashboard-border)] pt-3 mt-1 gap-2.5">
															<div>
																<div className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">Total Fee</div>
																<div className="font-syne font-extrabold text-[14.5px] text-[var(--dashboard-text)] mt-0.5">
																	{msg.quote.amount}
																</div>
															</div>

															{msg.quote.paid ? (
																<span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-extrabold text-[11.5px] px-3.5 py-1.5 rounded-xl border border-green-200/50 flex items-center gap-1">
																	<Check size={12} className="stroke-[3.5]" /> Paid ✓
																</span>
															) : (
																<button
																	type="button"
																	onClick={() => handlePayProposal(msg.id)}
																	className="px-4 py-2 rounded-xl bg-[var(--dashboard-orange)] hover:bg-orange-600 text-white font-extrabold text-[11.5px] shadow-md shadow-orange-500/10 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
																>
																	<Check size={12} className="stroke-[3.5]" /> Pay Proposal
																</button>
															)}
														</div>
													</div>
												) : (
													/* Standard Text Message */
													<p className="text-[12.5px] leading-relaxed font-medium">
														{msg.text}
													</p>
												)}

												{/* Message timestamp */}
												<span className={cn(
													"text-[9px] block text-right mt-1.5 font-bold opacity-60",
													isUser ? "text-orange-100" : "text-[var(--dashboard-muted)]"
												)}>
													{msg.time}
												</span>
											</div>
										</div>
									);
								})}
								<div ref={messagesEndRef} />
							</div>

							{/* ── Fixed Bottom Actions & Input Drawer ───────────────────────────── */}
							<div className="absolute bottom-0 left-0 right-0 bg-[var(--dashboard-card)] border-t border-[var(--dashboard-border)] p-4 space-y-3 shadow-2xl z-10">
								
								{/* Quick suggestions segment */}
								<div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
									{QUICK_REPLIES.map((reply) => (
										<button
											key={reply}
											type="button"
											onClick={() => handleSendMessage(reply)}
											className="px-3.5 py-1.5 rounded-full bg-[var(--dashboard-bg)] hover:bg-[var(--dashboard-orange-light)] hover:text-[var(--dashboard-orange)] border border-[var(--dashboard-border)]/50 text-[11px] font-bold text-[var(--dashboard-muted)] whitespace-nowrap cursor-pointer transition-colors"
										>
											{reply}
										</button>
									))}
								</div>

								{/* Message form submit */}
								<form
									onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
									className="flex gap-2"
								>
									<input
										type="text"
										value={inputText}
										onChange={(e) => setInputText(e.target.value)}
										placeholder={`Message ${activeThread.artisanName}...`}
										className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] focus:ring-1 focus:ring-[var(--dashboard-orange)]/15 transition-all shadow-xs"
									/>
									<button
										type="submit"
										disabled={!inputText.trim()}
										className={cn(
											"w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 cursor-pointer transition-all shadow-xs",
											inputText.trim()
												? "bg-[var(--dashboard-orange)] hover:bg-orange-600 active:scale-95"
												: "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed border border-neutral-200 dark:border-neutral-700/50"
										)}
										aria-label="Send message"
									>
										<Send size={15} className="stroke-[2.5]" />
									</button>
								</form>
							</div>

						</motion.div>
					) : (
						/* Empty workspace placeholder */
						<div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--dashboard-card)]">
							<div className="w-14 h-14 rounded-2xl bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)] flex items-center justify-center shadow-xs mb-3">
								<MessageSquare size={22} className="text-[var(--dashboard-muted)]" />
							</div>
							<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] mb-0.5">Select a conversation</h3>
							<p className="text-[12px] text-[var(--dashboard-muted)] max-w-[240px]">
								Choose an expert thread on the left to start sending messages or reviewing quotes.
							</p>
						</div>
					)}
				</AnimatePresence>
			</div>

		</main>
	);
}
