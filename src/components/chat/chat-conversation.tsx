import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useChatThread } from "#/core/hooks/useChatThread.hook";
import { useGetProviderByIdQuery } from "#/core/queries/artisan.q";
import { cn } from "#/lib/utils.ts";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import { TicketFooterActions } from "./ticket-footer-actions";

function providerName(
	businessName?: string | null,
	title?: string | null,
): string {
	return businessName || title || "Provider";
}

/**
 * The full chat experience for one conversation — header + message stream +
 * state-driven actions + composer. Embedded by BOTH the full-page messages
 * view and the dashboard drawer, driven entirely by the shared query cache.
 */
export function ChatConversation({
	threadId,
	providerId,
	onThreadResolved,
	onBack,
	compact = false,
}: {
	threadId?: string | null;
	providerId?: string | null;
	onThreadResolved?: (threadId: string) => void;
	onBack?: () => void;
	compact?: boolean;
}) {
	const chat = useChatThread({ threadId, providerId, onThreadResolved });

	// For a fresh conversation (no thread yet) fetch the provider for the header —
	// the viewer is always a customer hiring a provider in that case.
	const { data: providerDetail } = useGetProviderByIdQuery(
		chat.thread ? null : (providerId ?? null),
	);

	// Show the OTHER participant: providers see the customer, customers see the provider.
	const name = chat.thread
		? (chat.counterpart?.name ?? "Conversation")
		: providerName(providerDetail?.businessName, providerDetail?.title);
	const avatar = chat.thread ? chat.counterpart?.avatar : null;
	// The verified badge only applies when the counterpart is a provider.
	const showVerified = chat.thread ? !!chat.counterpart?.isProvider : true;

	const initials = name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");

	return (
		<div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[var(--dashboard-bg)]">
			{/* Header */}
			<div className="shrink-0 bg-[var(--dashboard-card)] border-b border-[var(--dashboard-border)] px-4 py-3 flex items-center gap-3">
				{onBack && (
					<button
						type="button"
						onClick={onBack}
						className="p-1.5 rounded-full hover:bg-[var(--dashboard-bg)] -ml-1 shrink-0"
						aria-label="Back"
					>
						<ArrowLeft size={18} className="text-[var(--dashboard-text)]" />
					</button>
				)}
				{avatar ? (
					<img
						src={avatar}
						alt={name}
						className="w-9 h-9 rounded-lg object-cover shrink-0"
					/>
				) : (
					<div className="w-9 h-9 rounded-lg bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] flex items-center justify-center font-black text-[12px] shrink-0">
						{initials || "?"}
					</div>
				)}
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1">
						<span className="font-syne font-extrabold text-[14px] text-[var(--dashboard-text)] truncate">
							{name}
						</span>
						{showVerified && (
							<ShieldCheck
								size={12}
								className="text-[var(--dashboard-orange)] shrink-0"
							/>
						)}
					</div>
					{chat.activeTicket && (
						<div className="text-[10px] text-[var(--dashboard-muted)] font-bold truncate">
							Ticket {chat.activeTicket.ref} · {chat.activeTicket.status}
						</div>
					)}
				</div>
			</div>

			{/* Body */}
			{chat.isLoading ? (
				<div className="flex-1 p-5 space-y-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							key={i}
							className={cn(
								"h-12 rounded-2xl bg-[var(--dashboard-card)] animate-pulse",
								i % 2 ? "w-2/3 ml-auto" : "w-1/2",
							)}
						/>
					))}
				</div>
			) : (
				<MessageList
					messages={chat.messages}
					currentUserId={chat.user?.id ?? null}
					counterpartName={name}
					threadId={chat.thread?.id ?? ""}
					ticketId={chat.activeTicket?.id ?? ""}
					side={chat.side}
				/>
			)}

			{/* Actions + composer */}
			<div className="shrink-0">
				{chat.thread && (
					<TicketFooterActions
						threadId={chat.thread.id}
						ticket={chat.activeTicket}
						actions={chat.actions}
						activeInvoice={chat.activeInvoice}
					/>
				)}
				<MessageComposer
					onSend={chat.sendMessage}
					disabled={chat.isSending}
					showQuickReplies={!compact}
					placeholder={`Message ${name}…`}
				/>
			</div>
		</div>
	);
}
