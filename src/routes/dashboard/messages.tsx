import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Search, X } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { ChatConversation } from "#/components/chat/chat-conversation";
import { useGetThreadsQuery } from "#/core/queries/thread.q";
import type { ThreadSummary, TicketStatus } from "#/core/types/chat.types";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/messages")({
	component: MessagesPage,
});

const STATUS_BADGE: Partial<
	Record<TicketStatus, { label: string; cls: string }>
> = {
	open: { label: "Open", cls: "bg-blue-50 text-blue-700" },
	invoiced: { label: "Invoice", cls: "bg-amber-50 text-amber-700" },
	booked: { label: "Booked", cls: "bg-green-50 text-green-700" },
	closed: { label: "Closed", cls: "bg-neutral-100 text-neutral-500" },
	cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600" },
};

function threadName(thread: ThreadSummary) {
	return thread.provider.businessName || thread.provider.title || "Provider";
}

function initialsOf(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");
}

function formatWhen(iso?: string) {
	if (!iso) return "";
	const d = new Date(iso);
	const now = new Date();
	if (d.toDateString() === now.toDateString()) {
		return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}
	return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessagesPage() {
	const [params, setParams] = useQueryStates({
		thread: parseAsString,
		provider: parseAsString,
	});
	const [searchQuery, setSearchQuery] = useState("");

	const { data: threads = [], isLoading } = useGetThreadsQuery();

	const filteredThreads = useMemo(() => {
		if (!searchQuery.trim()) return threads;
		const q = searchQuery.toLowerCase();
		return threads.filter((t) => threadName(t).toLowerCase().includes(q));
	}, [threads, searchQuery]);

	const hasConversation = !!params.thread || !!params.provider;

	const selectThread = (id: string) =>
		setParams({ thread: id, provider: null });

	return (
		<main className="flex-1 flex h-full overflow-hidden bg-[var(--dashboard-bg)]">
			{/* Inbox */}
			<div
				className={cn(
					"w-full md:w-85 shrink-0 bg-[var(--dashboard-card)] border-r border-[var(--dashboard-border)] flex flex-col h-full",
					hasConversation && "hidden md:flex",
				)}
			>
				<div className="p-5 border-b border-[var(--dashboard-border)] space-y-4">
					<div>
						<h2 className="font-syne font-extrabold text-[20px] tracking-[-0.5px] text-[var(--dashboard-text)]">
							Conversations
						</h2>
						<p className="text-[11.5px] text-[var(--dashboard-muted)] font-medium">
							Chat threads with verified service experts
						</p>
					</div>
					<div className="relative">
						<Search
							size={14}
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)] pointer-events-none"
						/>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search conversations…"
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

				<div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-none">
					{isLoading ? (
						Array.from({ length: 5 }).map((_, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								key={i}
								className="h-16 rounded-xl bg-[var(--dashboard-bg)] animate-pulse"
							/>
						))
					) : filteredThreads.length === 0 ? (
						<div className="text-center py-12 text-[var(--dashboard-muted)] space-y-2">
							<MessageSquare className="mx-auto size-7 opacity-40" />
							<p className="text-[12px] font-bold">No conversations yet</p>
							<p className="text-[11px]">Hire an artisan to start chatting.</p>
						</div>
					) : (
						filteredThreads.map((thread) => {
							const name = threadName(thread);
							const isActive = thread.id === params.thread;
							const badge = thread.activeTicket
								? STATUS_BADGE[thread.activeTicket.status]
								: undefined;
							return (
								<button
									key={thread.id}
									type="button"
									onClick={() => selectThread(thread.id)}
									className={cn(
										"w-full flex gap-3 p-3.5 rounded-xl text-left cursor-pointer transition-all border",
										isActive
											? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange-mid)]"
											: "bg-transparent border-transparent hover:bg-[var(--dashboard-bg)]/80",
									)}
								>
									<div className="w-10 h-10 rounded-lg bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center font-black text-[12.5px] shrink-0">
										{initialsOf(name)}
									</div>
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex items-center justify-between gap-1.5">
											<span className="font-syne font-extrabold text-[13px] leading-none truncate text-[var(--dashboard-text)]">
												{name}
											</span>
											<span className="text-[10px] text-[var(--dashboard-muted)] font-bold shrink-0">
												{formatWhen(
													thread.lastMessage?.createdAt ?? thread.updatedAt,
												)}
											</span>
										</div>
										<div className="flex items-center gap-1.5">
											{badge && (
												<span
													className={cn(
														"text-[9px] font-extrabold px-1.5 py-0.5 rounded-full",
														badge.cls,
													)}
												>
													{badge.label}
												</span>
											)}
											<p className="text-[11.5px] truncate text-[var(--dashboard-muted)] font-medium">
												{thread.lastMessage?.content ?? "No messages yet"}
											</p>
										</div>
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>

			{/* Workspace */}
			<div
				className={cn(
					"flex-1 flex flex-col h-full",
					!hasConversation && "hidden md:flex",
				)}
			>
				{hasConversation ? (
					<ChatConversation
						threadId={params.thread}
						providerId={params.provider}
						onThreadResolved={(id) => setParams({ thread: id, provider: null })}
						onBack={() => setParams({ thread: null, provider: null })}
					/>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--dashboard-card)]">
						<div className="w-14 h-14 rounded-2xl bg-[var(--dashboard-bg)]/80 border border-[var(--dashboard-border)] flex items-center justify-center shadow-xs mb-3">
							<MessageSquare
								size={22}
								className="text-[var(--dashboard-muted)]"
							/>
						</div>
						<h3 className="font-syne font-extrabold text-[15px] text-[var(--dashboard-text)] mb-0.5">
							Select a conversation
						</h3>
						<p className="text-[12px] text-[var(--dashboard-muted)] max-w-[240px]">
							Choose a thread on the left, or hire an artisan to start a new
							one.
						</p>
					</div>
				)}
			</div>
		</main>
	);
}
