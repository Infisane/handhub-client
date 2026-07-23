import { MapPin } from "lucide-react";
import { useAppSelector } from "#/core/hooks/useStore.hook";

interface LocationAlertProps {
	onRetry: () => void;
}

export function LocationAlert({ onRetry }: LocationAlertProps) {
	const status = useAppSelector((s) => s.geolocationStore.status);

	if (status === "granted" || status === "idle" || status === "loading") {
		return null;
	}

	// Once a browser permission is explicitly blocked, no page can re-open the
	// native prompt — that's a deliberate browser security restriction. Retrying
	// only helps the "unavailable" (transient GPS/timeout) case.
	const isBlocked = status === "denied";

	return (
		<div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-3 duration-300 w-max max-w-[calc(100vw-2rem)]">
			<div className="flex items-center gap-3 bg-amber-50 border border-amber-200/70 text-amber-800 rounded-2xl px-4 py-3 shadow-lg shadow-amber-500/10">
				<div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200/60 flex items-center justify-center shrink-0">
					<MapPin size={15} className="text-amber-600" />
				</div>
				<div className="min-w-0">
					<p className="text-[12.5px] font-extrabold leading-none mb-0.5">
						Location access needed
					</p>
					<p className="text-[11px] font-medium text-amber-700/80 leading-snug">
						{isBlocked
							? "Location is blocked. Click the location icon in your address bar and allow it, then retry."
							: "Enable location in your browser settings to find artisans near you."}
					</p>
				</div>
				<button
					type="button"
					onClick={onRetry}
					className="shrink-0 ml-1 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-200/60 text-amber-800 text-[11px] font-bold transition-colors cursor-pointer"
				>
					{isBlocked ? "Retry" : "Try again"}
				</button>
			</div>
		</div>
	);
}
