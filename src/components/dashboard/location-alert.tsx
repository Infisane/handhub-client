import { Loader2, MapPin } from "lucide-react";
import { useAppSelector } from "#/core/hooks/useStore.hook";

export function LocationAlert() {
	const status = useAppSelector((s) => s.geolocationStore.status);

	if (status === "granted" || status === "idle" || status === "loading") {
		return null;
	}

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
						Enable location in your browser settings to find artisans near you.
					</p>
				</div>
				<Loader2
					size={14}
					className="text-amber-500 animate-spin shrink-0 ml-1"
				/>
			</div>
		</div>
	);
}
