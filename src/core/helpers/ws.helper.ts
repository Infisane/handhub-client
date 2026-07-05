/* ──────────────────────────────────────────────────────────────
 * Chat WebSocket (doc §3 / §3.1 Milestone 2).
 * Transport-only manager: connect, authenticate, reconnect with backoff,
 * and forward server frames to a registered listener. Correctness never
 * depends on this — every frame has a REST equivalent (the DB is the source
 * of truth), so on drop/reconnect the consumer re-fetches to reconcile.
 * ────────────────────────────────────────────────────────────── */
import type {
	AppNotification,
	Invoice,
	Message,
} from "#/core/types/chat.types";

export type WsServerFrame =
	| { type: "auth_ok"; userId: string }
	| { type: "auth_error"; message: string }
	| { type: "message"; payload: Message }
	| { type: "invoice"; payload: Invoice }
	| {
			type: "booking_confirmed";
			payload: { bookingRef: string; bookingId: string; ticketId: string };
	  }
	| { type: "notification"; payload: AppNotification };

interface ConnectArgs {
	token: string;
	/** Any non-auth frame. */
	onFrame: (frame: WsServerFrame) => void;
	/** Fires on auth_ok — reconcile from REST here (REST wins). */
	onReady?: () => void;
}

const MAX_BACKOFF_MS = 30_000;

let socket: WebSocket | null = null;
let live = false;
let intentionalClose = false;
let authFailed = false;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
/** Bumped on every connect/disconnect so stale socket events are ignored. */
let generation = 0;
let args: ConnectArgs | null = null;

/** Whether the socket is authenticated and receiving live — consumers use this
 *  to suspend REST polling while it holds. */
export function isSocketLive(): boolean {
	return live;
}

function wsUrl(): string {
	const explicit = import.meta.env.VITE_WS_URL as string | undefined;
	if (explicit) return explicit;
	const api = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
	return `${api.replace(/^http/, "ws").replace(/\/$/, "")}/ws`;
}

function clearReconnect() {
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
}

function scheduleReconnect() {
	if (intentionalClose || authFailed || !args) return;
	const delay = Math.min(1000 * 2 ** reconnectAttempts, MAX_BACKOFF_MS);
	reconnectAttempts += 1;
	clearReconnect();
	reconnectTimer = setTimeout(() => open(), delay);
}

function open() {
	if (typeof window === "undefined" || !args) return;

	const myGeneration = generation;
	let ws: WebSocket;
	try {
		ws = new WebSocket(wsUrl());
	} catch {
		scheduleReconnect();
		return;
	}
	socket = ws;

	ws.onopen = () => {
		if (myGeneration !== generation) return;
		ws.send(JSON.stringify({ event: "auth", data: { token: args?.token } }));
	};

	ws.onmessage = (event) => {
		if (myGeneration !== generation) return;
		let frame: WsServerFrame;
		try {
			frame = JSON.parse(event.data);
		} catch {
			return;
		}
		if (frame.type === "auth_ok") {
			live = true;
			authFailed = false;
			reconnectAttempts = 0;
			args?.onReady?.();
			return;
		}
		if (frame.type === "auth_error") {
			// Bad/expired token — stop retrying until a fresh connect() with a new one.
			authFailed = true;
			live = false;
			return;
		}
		args?.onFrame(frame);
	};

	ws.onclose = () => {
		if (myGeneration !== generation) return;
		live = false;
		socket = null;
		scheduleReconnect();
	};

	// No onerror close(): a failed connection fires 'error' then 'close' on its
	// own, so onclose drives the reconnect. Calling close() here would just be a
	// redundant close on a CONNECTING socket (the "closed before established" warning).
}

export function connectChatSocket(next: ConnectArgs) {
	// Tear down any prior connection, then start fresh (new generation).
	disconnectChatSocket();
	generation += 1;
	intentionalClose = false;
	authFailed = false;
	reconnectAttempts = 0;
	args = next;
	open();
}

export function disconnectChatSocket() {
	generation += 1; // invalidate in-flight handlers
	intentionalClose = true;
	live = false;
	clearReconnect();
	if (socket) {
		const s = socket;
		s.onmessage = null;
		s.onclose = null;
		s.onerror = null;
		if (s.readyState === WebSocket.CONNECTING) {
			// Closing a still-connecting socket logs "closed before the connection
			// is established" (doc §3.2). Let it finish opening, then close cleanly.
			s.onopen = () => {
				try {
					s.close(1000, "unmount");
				} catch {
					// already closing
				}
			};
		} else {
			s.onopen = null;
			try {
				s.close(1000, "unmount");
			} catch {
				// already closing
			}
		}
		socket = null;
	}
	args = null;
}
