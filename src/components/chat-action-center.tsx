import {
	CheckCircle2,
	Clock,
	FileText,
	MapPin,
	Paperclip,
	Send,
	X,
	XCircle,
	ZoomIn,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "#/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sender = "customer" | "artisan";

interface TextMessage {
	id: string;
	type: "text";
	sender: Sender;
	content: string;
	timestamp: Date;
}

interface ImageMessage {
	id: string;
	type: "image";
	sender: Sender;
	src: string;
	alt: string;
	timestamp: Date;
}

interface QuoteMessage {
	id: string;
	type: "quote";
	sender: "artisan";
	title: string;
	description: string;
	amount: number;
	currency: string;
	status: "pending" | "accepted" | "declined";
	timestamp: Date;
}

interface AIMessage {
	id: string;
	type: "ai";
	content: string;
	timestamp: Date;
}

export type Message = TextMessage | ImageMessage | QuoteMessage | AIMessage;

export interface QuickReply {
	id: string;
	label: string;
}

interface ChatActionCenterProps {
	messages?: Message[];
	quickReplies?: QuickReply[];
	artisanName?: string;
	artisanInitial?: string;
	onSendMessage?: (text: string) => void;
	onQuoteAccept?: (quoteId: string) => void;
	onQuoteDecline?: (quoteId: string) => void;
	onQuickReply?: (reply: QuickReply) => void;
	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date) {
	return date.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initial, size = 32 }: { initial: string; size?: number }) {
	return (
		<div
			className="flex shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
			style={{
				width: size,
				height: size,
				background: "linear-gradient(135deg, var(--lagoon-deep), var(--palm))",
			}}
			aria-hidden="true"
		>
			{initial}
		</div>
	);
}

function QuoteCard({
	message,
	onAccept,
	onDecline,
}: {
	message: QuoteMessage;
	onAccept?: () => void;
	onDecline?: () => void;
}) {
	const isPending = message.status === "pending";
	const isAccepted = message.status === "accepted";

	return (
		<div
			className="rounded-xl border p-4"
			style={{
				background: "var(--surface-strong)",
				borderColor: "var(--line)",
			}}
			role="region"
			aria-label="Quote proposal"
		>
			<div className="mb-3 flex items-start gap-2">
				<FileText
					size={16}
					style={{ color: "var(--lagoon-deep)" }}
					aria-hidden="true"
				/>
				<div className="min-w-0 flex-1">
					<p
						className="text-xs font-semibold uppercase tracking-wide"
						style={{ color: "var(--sea-ink-soft)" }}
					>
						Quote Proposal
					</p>
					<p
						className="mt-0.5 text-sm font-semibold"
						style={{ color: "var(--sea-ink)" }}
					>
						{message.title}
					</p>
					<p
						className="mt-0.5 text-xs"
						style={{ color: "var(--sea-ink-soft)" }}
					>
						{message.description}
					</p>
				</div>
				<span
					className="shrink-0 text-lg font-bold"
					style={{ color: "var(--sea-ink)" }}
				>
					{message.currency}
					{message.amount.toFixed(2)}
				</span>
			</div>

			{isPending ? (
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onAccept}
						className="flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-colors duration-150 hover:brightness-110"
						style={{ background: "var(--lagoon-deep)" }}
					>
						<CheckCircle2 size={16} aria-hidden="true" />
						Review &amp; Pay Now
					</button>
					<button
						type="button"
						onClick={onDecline}
						className="flex min-h-[48px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors duration-150 hover:bg-black/5"
						style={{ borderColor: "var(--line)", color: "var(--sea-ink-soft)" }}
					>
						<XCircle size={16} aria-hidden="true" />
						Decline
					</button>
				</div>
			) : (
				<div
					className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg text-sm font-semibold"
					style={{
						background: isAccepted
							? "rgba(79,184,178,0.12)"
							: "rgba(239,68,68,0.08)",
						color: isAccepted ? "var(--lagoon-deep)" : "#dc2626",
					}}
					aria-live="polite"
				>
					{isAccepted ? (
						<>
							<CheckCircle2 size={16} aria-hidden="true" /> Quote Accepted
						</>
					) : (
						<>
							<XCircle size={16} aria-hidden="true" /> Quote Declined
						</>
					)}
				</div>
			)}
		</div>
	);
}

function ImageBubble({
	message,
	onZoom,
}: {
	message: ImageMessage;
	onZoom: (msg: ImageMessage) => void;
}) {
	return (
		<div
			className="group relative max-w-[200px] cursor-pointer overflow-hidden rounded-xl"
			onClick={() => onZoom(message)}
		>
			<img
				src={message.src}
				alt={message.alt}
				className="block w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
			/>
			<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-150 group-hover:bg-black/20">
				<ZoomIn
					size={24}
					className="text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
					aria-hidden="true"
				/>
			</div>
			<span className="sr-only">Tap to zoom: {message.alt}</span>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEMO_QUICK_REPLIES: QuickReply[] = [
	{ id: "otw", label: "I'm on my way" },
	{ id: "reschedule", label: "Can we reschedule?" },
	{ id: "confirm", label: "Confirmed, see you then!" },
	{ id: "more-info", label: "Can you share more details?" },
];

export function ChatActionCenter({
	messages: externalMessages,
	quickReplies = DEMO_QUICK_REPLIES,
	artisanName = "Artisan",
	artisanInitial = "A",
	onSendMessage,
	onQuoteAccept,
	onQuoteDecline,
	onQuickReply,
	className,
}: ChatActionCenterProps) {
	const [internalMessages, setInternalMessages] = useState<Message[]>(
		() => DEMO_MESSAGES,
	);
	const [inputValue, setInputValue] = useState("");
	const [zoomedImage, setZoomedImage] = useState<ImageMessage | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const inputId = useId();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const messages = externalMessages ?? internalMessages;

	// Scroll to latest message
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Control native dialog
	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (zoomedImage) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [zoomedImage]);

	function handleSend() {
		const text = inputValue.trim();
		if (!text) return;

		if (onSendMessage) {
			onSendMessage(text);
		} else {
			const msg: TextMessage = {
				id: crypto.randomUUID(),
				type: "text",
				sender: "customer",
				content: text,
				timestamp: new Date(),
			};
			setInternalMessages((prev) => [...prev, msg]);
		}
		setInputValue("");
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	function handleQuickReply(reply: QuickReply) {
		onQuickReply?.(reply);
		if (!onSendMessage) {
			const msg: TextMessage = {
				id: crypto.randomUUID(),
				type: "text",
				sender: "customer",
				content: reply.label,
				timestamp: new Date(),
			};
			setInternalMessages((prev) => [...prev, msg]);
		}
	}

	function handleQuoteAccept(quoteId: string) {
		onQuoteAccept?.(quoteId);
		if (!externalMessages) {
			setInternalMessages((prev) =>
				prev.map((m) =>
					m.id === quoteId && m.type === "quote"
						? { ...m, status: "accepted" }
						: m,
				),
			);
		}
	}

	function handleQuoteDecline(quoteId: string) {
		onQuoteDecline?.(quoteId);
		if (!externalMessages) {
			setInternalMessages((prev) =>
				prev.map((m) =>
					m.id === quoteId && m.type === "quote"
						? { ...m, status: "declined" }
						: m,
				),
			);
		}
	}

	return (
		<div
			className={cn(
				"flex flex-col overflow-hidden rounded-2xl border",
				className,
			)}
			style={{
				background: "var(--foam)",
				borderColor: "var(--line)",
				height: "600px",
			}}
		>
			{/* Header */}
			<div
				className="flex items-center gap-3 border-b px-4 py-3"
				style={{
					background: "var(--surface-strong)",
					borderColor: "var(--line)",
				}}
			>
				<Avatar initial={artisanInitial} />
				<div>
					<p
						className="text-sm font-semibold"
						style={{ color: "var(--sea-ink)" }}
					>
						{artisanName}
					</p>
					<div className="flex items-center gap-1">
						<span
							className="inline-block h-2 w-2 rounded-full bg-emerald-500"
							aria-hidden="true"
						/>
						<p className="text-xs" style={{ color: "var(--sea-ink-soft)" }}>
							Online
						</p>
					</div>
				</div>
				<div className="ml-auto flex items-center gap-1">
					<MapPin
						size={14}
						style={{ color: "var(--lagoon-deep)" }}
						aria-hidden="true"
					/>
					<span className="text-xs" style={{ color: "var(--sea-ink-soft)" }}>
						2.4 km away
					</span>
				</div>
			</div>

			{/* Message list */}
			<div
				className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
				role="log"
				aria-live="polite"
				aria-label="Chat messages"
			>
				{messages.map((msg) => {
					if (msg.type === "ai") {
						return (
							<div
								key={msg.id}
								className="rounded-xl px-4 py-3"
								style={{
									background: "var(--ai-gradient)",
									border: "1px solid var(--ai-border)",
								}}
								aria-label="Handhub AI Assistant"
								role="note"
							>
								<p
									className="mb-1 text-xs font-semibold uppercase tracking-wide"
									style={{ color: "var(--ai-primary)" }}
								>
									Handhub AI
								</p>
								<p className="text-sm" style={{ color: "var(--sea-ink)" }}>
									{msg.content}
								</p>
								<p
									className="mt-1.5 text-right text-[10px]"
									style={{ color: "var(--sea-ink-soft)" }}
								>
									{formatTime(msg.timestamp)}
								</p>
							</div>
						);
					}

					const isCustomer = msg.sender === "customer";

					if (msg.type === "quote") {
						return (
							<div key={msg.id} className="flex gap-2">
								<Avatar initial={artisanInitial} size={28} />
								<div className="max-w-[80%] flex-1">
									<QuoteCard
										message={msg}
										onAccept={() => handleQuoteAccept(msg.id)}
										onDecline={() => handleQuoteDecline(msg.id)}
									/>
									<p
										className="mt-1 text-[10px]"
										style={{ color: "var(--sea-ink-soft)" }}
									>
										<Clock
											size={10}
											className="mr-0.5 inline"
											aria-hidden="true"
										/>
										{formatTime(msg.timestamp)}
									</p>
								</div>
							</div>
						);
					}

					return (
						<div
							key={msg.id}
							className={cn(
								"flex items-end gap-2",
								isCustomer ? "flex-row-reverse" : "flex-row",
							)}
						>
							{!isCustomer && <Avatar initial={artisanInitial} size={28} />}

							<div
								className={cn(
									"flex max-w-[72%] flex-col gap-1",
									isCustomer && "items-end",
								)}
							>
								{msg.type === "image" ? (
									<ImageBubble message={msg} onZoom={setZoomedImage} />
								) : (
									<div
										className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
										style={{
											background: isCustomer
												? "var(--lagoon-deep)"
												: "var(--surface-strong)",
											color: isCustomer ? "#fff" : "var(--sea-ink)",
											borderRadius: isCustomer
												? "18px 18px 4px 18px"
												: "18px 18px 18px 4px",
											border: isCustomer ? "none" : "1px solid var(--line)",
										}}
									>
										{msg.content}
									</div>
								)}
								<p
									className="text-[10px]"
									style={{ color: "var(--sea-ink-soft)" }}
								>
									<Clock
										size={10}
										className="mr-0.5 inline"
										aria-hidden="true"
									/>
									<time dateTime={msg.timestamp.toISOString()}>
										{formatTime(msg.timestamp)}
									</time>
								</p>
							</div>
						</div>
					);
				})}
				<div ref={messagesEndRef} aria-hidden="true" />
			</div>

			{/* Quick replies */}
			{quickReplies.length > 0 && (
				<div
					className="border-t px-4 py-2"
					style={{ borderColor: "var(--line)", background: "var(--surface)" }}
					aria-label="Quick reply suggestions"
				>
					<div
						className="flex gap-2 overflow-x-auto pb-1"
						style={{ scrollbarWidth: "none" }}
					>
						{quickReplies.map((reply) => (
							<button
								key={reply.id}
								type="button"
								onClick={() => handleQuickReply(reply)}
								className="flex min-h-[48px] shrink-0 cursor-pointer items-center rounded-full border px-4 text-xs font-medium transition-colors duration-150 hover:bg-black/5"
								style={{
									borderColor: "var(--lagoon)",
									color: "var(--lagoon-deep)",
									background: "transparent",
								}}
							>
								{reply.label}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Input area */}
			<div
				className="border-t px-4 py-3"
				style={{
					background: "var(--surface-strong)",
					borderColor: "var(--line)",
				}}
			>
				<label htmlFor={inputId} className="sr-only">
					Type a message
				</label>
				<div
					className="flex items-end gap-2 rounded-xl border px-3 py-2 transition-colors duration-150 focus-within:border-[var(--lagoon)]"
					style={{ borderColor: "var(--line)", background: "var(--foam)" }}
				>
					{/* Attach image */}
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="mb-1 shrink-0 cursor-pointer rounded-lg p-1 transition-colors duration-150 hover:bg-black/5"
						aria-label="Attach image"
					>
						<Paperclip
							size={18}
							style={{ color: "var(--sea-ink-soft)" }}
							aria-hidden="true"
						/>
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="sr-only"
						aria-label="Upload image attachment"
						tabIndex={-1}
					/>

					<textarea
						id={inputId}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message…"
						rows={1}
						className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[var(--sea-ink-soft)]"
						style={{
							color: "var(--sea-ink)",
							lineHeight: "1.5",
							paddingTop: "6px",
							paddingBottom: "6px",
						}}
					/>

					<button
						type="button"
						onClick={handleSend}
						disabled={!inputValue.trim()}
						className="mb-0.5 flex min-h-[40px] w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40"
						style={{ background: "var(--lagoon-deep)" }}
						aria-label="Send message"
					>
						<Send size={16} aria-hidden="true" />
					</button>
				</div>
				<p
					className="mt-1.5 text-center text-[10px]"
					style={{ color: "var(--sea-ink-soft)" }}
				>
					Press Enter to send · Shift+Enter for new line
				</p>
			</div>

			{/* Image zoom dialog */}
			<dialog
				ref={dialogRef}
				className="m-auto max-h-[90dvh] max-w-[90dvw] rounded-xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-black/70"
				onClick={(e) => e.target === dialogRef.current && setZoomedImage(null)}
				onClose={() => setZoomedImage(null)}
				aria-label={
					zoomedImage ? `Zoomed image: ${zoomedImage.alt}` : "Image viewer"
				}
			>
				{zoomedImage && (
					<div className="relative">
						<img
							src={zoomedImage.src}
							alt={zoomedImage.alt}
							className="block max-h-[85dvh] max-w-[85dvw] rounded-xl object-contain"
						/>
						<button
							type="button"
							onClick={() => setZoomedImage(null)}
							className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-150 hover:bg-black/70"
							aria-label="Close zoomed image"
						>
							<X size={18} aria-hidden="true" />
						</button>
						<p className="mt-2 text-center text-sm text-white/80">
							{zoomedImage.alt}
						</p>
					</div>
				)}
			</dialog>
		</div>
	);
}

// ─── Demo seed data ────────────────────────────────────────────────────────────

const t = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);

const DEMO_MESSAGES: Message[] = [
	{
		id: "1",
		type: "ai",
		content:
			"I found 3 verified electricians near you. Chukwuemeka Obi is available immediately and has a 4.9★ rating from 142 jobs. Connecting you now.",
		timestamp: t(18),
	},
	{
		id: "2",
		type: "text",
		sender: "artisan",
		content:
			"Hello! I just saw your request about the smoking panel. That sounds like it could be a tripped breaker or a loose live wire — both need urgent attention. Can you describe what you hear or smell?",
		timestamp: t(15),
	},
	{
		id: "3",
		type: "text",
		sender: "customer",
		content:
			"There's a burning smell and one socket near the panel is sparking occasionally.",
		timestamp: t(13),
	},
	{
		id: "4",
		type: "text",
		sender: "artisan",
		content:
			"Please switch off the main breaker immediately if you can do so safely. I can head over by 4:00 PM. Is that fine?",
		timestamp: t(12),
	},
	{
		id: "5",
		type: "text",
		sender: "customer",
		content: "Sure, that works perfectly!",
		timestamp: t(10),
	},
	{
		id: "6",
		type: "quote",
		sender: "artisan",
		title: "Inverter Inspection Fee (Fixed Rate)",
		description:
			"Full panel inspection, fault diagnosis, and socket repair. Parts billed separately if needed.",
		amount: 45.0,
		currency: "$",
		status: "pending",
		timestamp: t(8),
	},
];
