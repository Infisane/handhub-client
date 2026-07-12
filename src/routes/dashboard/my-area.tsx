import { createFileRoute, redirect } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Check,
	ChevronRight,
	CircleDot,
	Layers,
	MapPin,
	Navigation,
	Plus,
	Shield,
	ToggleLeft,
	ToggleRight,
	Trash2,
	Users,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";
import { readStoredSession } from "#/core/helpers/auth-storage.helper";
import { USER_TYPES } from "#/core/helpers/constants.helper";
import { useAppSelector } from "#/core/hooks/useStore.hook";
import {
	useGetLgasQuery,
	useGetStatesQuery,
	useGetWardsQuery,
} from "#/core/queries/location.q";
import {
	useCreateZoneQuery,
	useDeleteZoneQuery,
	useGetAreaSummaryQuery,
	useGetZoneInsightsQuery,
	useGetZonesQuery,
	useUpdateProviderAvailabilityQuery,
	useUpdateZoneQuery,
} from "#/core/queries/my-area.q";
import type {
	CreateZonePayload,
	ServiceZone,
} from "#/core/types/my-area.types";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/my-area")({
	// Provider-only — customers have no service area to manage. Client-side
	// only (SSR can't read localStorage), same constraint as the dashboard
	// shell's auth guard.
	beforeLoad: () => {
		if (typeof window === "undefined") return;
		const session = readStoredSession();
		if (session?.user.userType !== USER_TYPES.provider) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: MyAreaPage,
});

/* ── Zone color assignment ────────────────────────────────────
 * The API doesn't return a color; assign one deterministically so it's
 * consistent across the card list, both map modes, and the detail panel.
 * The primary zone always gets the brand accent for visual consistency. */
const PRIMARY_ZONE_COLOR = "#1E3A8A"; // resolved --dashboard-orange / --hh-or
const ZONE_PALETTE = [
	"#3B82F6",
	"#10B981",
	"#8B5CF6",
	"#F59E0B",
	"#EC4899",
	"#14B8A6",
];

function getZoneColor(zone: ServiceZone, index: number): string {
	return zone.isPrimary
		? PRIMARY_ZONE_COLOR
		: ZONE_PALETTE[index % ZONE_PALETTE.length];
}

/* ── Generic lat/lng → viewBox projection (Vector View) ───────
 * Works for zones in any state — no Lagos-specific assumptions. Projects
 * onto the current zone set's own bounding box, so a single zone centers
 * and a wide spread fits proportionally. */
const VIEWBOX_W = 100;
const VIEWBOX_H = 65;
const PROJECTION_PADDING = 12;
const KM_PER_DEGREE = 111; // rough approximation — fine for a decorative fallback map

interface LatLngBounds {
	minLat: number;
	maxLat: number;
	minLng: number;
	maxLng: number;
}

function computeBounds(zones: ServiceZone[]): LatLngBounds {
	const lats = zones.map((z) => Number(z.latitude));
	const lngs = zones.map((z) => Number(z.longitude));
	return {
		minLat: Math.min(...lats),
		maxLat: Math.max(...lats),
		minLng: Math.min(...lngs),
		maxLng: Math.max(...lngs),
	};
}

function projectLatLng(lat: number, lng: number, bounds: LatLngBounds) {
	const latRange = bounds.maxLat - bounds.minLat;
	const lngRange = bounds.maxLng - bounds.minLng;
	const normX = lngRange > 0 ? (lng - bounds.minLng) / lngRange : 0.5;
	const normY = latRange > 0 ? (lat - bounds.minLat) / latRange : 0.5;
	return {
		x: PROJECTION_PADDING + normX * (VIEWBOX_W - PROJECTION_PADDING * 2),
		// Latitude increases northward; SVG y increases downward.
		y: PROJECTION_PADDING + (1 - normY) * (VIEWBOX_H - PROJECTION_PADDING * 2),
	};
}

function computeSpanKm(bounds: LatLngBounds): number {
	const latSpanKm = (bounds.maxLat - bounds.minLat) * KM_PER_DEGREE;
	const lngSpanKm = (bounds.maxLng - bounds.minLng) * KM_PER_DEGREE;
	// Floor avoids the scale blowing up when zones are tightly clustered.
	return Math.max(latSpanKm, lngSpanKm, 10);
}

/* ── Interactive SVG Map Fallback Component ─────────────────────────────────── */
function ServiceMap({
	zones,
	selectedZone,
	onSelectZone,
}: {
	zones: ServiceZone[];
	selectedZone: string | null;
	onSelectZone: (id: string) => void;
}) {
	const bounds = useMemo(() => computeBounds(zones), [zones]);
	const spanKm = useMemo(() => computeSpanKm(bounds), [bounds]);
	const pxPerKm =
		(Math.min(VIEWBOX_W, VIEWBOX_H) - PROJECTION_PADDING * 2) / spanKm;

	return (
		<div
			className="relative w-full rounded-xl overflow-hidden border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/20"
			style={{ aspectRatio: "16/9" }}
		>
			<svg
				viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
				className="w-full h-full select-none"
				role="img"
				aria-label="Vector map of service zone coverage"
			>
				<title>Service zone coverage map</title>
				<defs>
					<pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
						<path
							d="M 6 0 L 0 0 0 6"
							fill="none"
							stroke="rgba(0, 0, 0, 0.035)"
							strokeWidth="0.25"
						/>
					</pattern>
					<filter id="glow">
						<feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<rect width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#grid)" />

				{zones.map((zone, i) => {
					const isSelected = selectedZone === zone.id;
					const { x, y } = projectLatLng(
						Number(zone.latitude),
						Number(zone.longitude),
						bounds,
					);
					const radius = Math.max(zone.coverageKm * pxPerKm, 1.5);
					const color = getZoneColor(zone, i);

					return (
						<g key={zone.id} className="cursor-pointer">
							{zone.isActive && (
								<circle
									cx={x}
									cy={y}
									r={radius + 1.2}
									fill="none"
									stroke={color}
									strokeWidth={isSelected ? "0.6" : "0.3"}
									strokeDasharray="1.5 1.5"
									opacity={isSelected ? 0.6 : 0.25}
								/>
							)}

							<circle
								cx={x}
								cy={y}
								r={radius}
								fill={color}
								fillOpacity={zone.isActive ? (isSelected ? 0.18 : 0.08) : 0.03}
								stroke={color}
								strokeWidth={isSelected ? "0.8" : "0.4"}
								strokeOpacity={zone.isActive ? (isSelected ? 0.8 : 0.4) : 0.15}
								className="transition-all duration-200"
								onClick={() => onSelectZone(zone.id)}
							/>

							<circle
								cx={x}
								cy={y}
								r={zone.isPrimary ? 1.5 : 1}
								fill={zone.isActive ? color : "rgba(0,0,0,0.2)"}
								filter={zone.isActive ? "url(#glow)" : undefined}
								onClick={() => onSelectZone(zone.id)}
							/>

							<text
								x={x}
								y={y - radius - 1.2}
								textAnchor="middle"
								fontSize="2.1"
								fill="var(--dashboard-text)"
								className="font-bold select-none transition-all"
								opacity={zone.isActive ? (isSelected ? 1 : 0.7) : 0.3}
							>
								{zone.name}
							</text>
						</g>
					);
				})}
			</svg>
		</div>
	);
}

/* ── Dynamic Google Maps Loader & Renderer ─────────────────────────────────── */
function GoogleMapWrapper({
	zones,
	selectedZoneId,
	radiusKm,
	onSelectZone,
}: {
	zones: ServiceZone[];
	selectedZoneId: string | null;
	radiusKm: number;
	onSelectZone: (id: string) => void;
}) {
	const mapRef = useRef<HTMLDivElement>(null);
	const googleMapRef = useRef<google.maps.Map | null>(null);
	const markersRef = useRef<google.maps.Marker[]>([]);
	const circlesRef = useRef<google.maps.Circle[]>([]);
	const [apiLoaded, setApiLoaded] = useState(false);
	const [loadError, setLoadError] = useState(false);

	useEffect(() => {
		if (window.google?.maps) {
			setApiLoaded(true);
			return;
		}

		const callbackName = "initHandhubMap";
		(window as unknown as Record<string, () => void>)[callbackName] = () => {
			setApiLoaded(true);
		};

		const script = document.createElement("script");
		// Unofficial fallback loading — if key missing, API is functional but visually watermarked.
		script.src = `https://maps.googleapis.com/maps/api/js?callback=${callbackName}&libraries=geometry`;
		script.async = true;
		script.defer = true;
		script.onerror = () => setLoadError(true);
		document.head.appendChild(script);

		return () => {
			delete (window as unknown as Record<string, unknown>)[callbackName];
		};
	}, []);

	useEffect(() => {
		if (!apiLoaded || !mapRef.current || !window.google) return;

		const defaultCenter = { lat: 9.082, lng: 8.6753 }; // Nigeria centroid fallback

		if (!googleMapRef.current) {
			googleMapRef.current = new window.google.maps.Map(mapRef.current, {
				center: defaultCenter,
				zoom: 12,
				disableDefaultUI: true,
				zoomControl: true,
				gestureHandling: "cooperative",
			});
		}
		const map = googleMapRef.current;

		for (const m of markersRef.current) m.setMap(null);
		for (const c of circlesRef.current) c.setMap(null);
		markersRef.current = [];
		circlesRef.current = [];

		const bounds = new window.google.maps.LatLngBounds();

		zones.forEach((zone, i) => {
			const position = {
				lat: Number(zone.latitude),
				lng: Number(zone.longitude),
			};
			bounds.extend(position);

			const isSelected = selectedZoneId === zone.id;
			const color = getZoneColor(zone, i);

			const marker = new window.google.maps.Marker({
				position,
				map,
				title: zone.name,
				icon: {
					path: window.google.maps.SymbolPath.CIRCLE,
					scale: zone.isPrimary ? 8 : 6,
					fillColor: zone.isActive ? color : "#64748B",
					fillOpacity: 1,
					strokeColor: "#ffffff",
					strokeWeight: 2,
				},
			});
			marker.addListener("click", () => onSelectZone(zone.id));
			markersRef.current.push(marker);

			if (zone.isActive) {
				const circle = new window.google.maps.Circle({
					map,
					center: position,
					radius: (zone.isPrimary ? radiusKm : zone.coverageKm) * 1000,
					fillColor: color,
					fillOpacity: isSelected ? 0.16 : 0.07,
					strokeColor: color,
					strokeOpacity: isSelected ? 0.8 : 0.35,
					strokeWeight: isSelected ? 2 : 1,
				});
				circle.addListener("click", () => onSelectZone(zone.id));
				circlesRef.current.push(circle);
			}
		});

		if (zones.length > 0 && googleMapRef.current) {
			if (zones.length === 1) {
				googleMapRef.current.setCenter({
					lat: Number(zones[0].latitude),
					lng: Number(zones[0].longitude),
				});
				googleMapRef.current.setZoom(13);
			} else {
				googleMapRef.current.fitBounds(bounds);
			}
		}
	}, [apiLoaded, zones, selectedZoneId, radiusKm, onSelectZone]);

	if (loadError) {
		return (
			<div
				className="w-full flex items-center justify-center border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/20 p-12 text-center rounded-xl"
				style={{ aspectRatio: "16/9" }}
			>
				<div className="space-y-2">
					<AlertCircle
						className="mx-auto text-[var(--dashboard-orange)]"
						size={24}
					/>
					<p className="text-[13px] font-bold text-[var(--dashboard-text)]">
						Google Maps failed to load
					</p>
					<p className="text-[11px] text-[var(--dashboard-muted)]">
						Check your network connection or try switching to Vector mode.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className="relative w-full rounded-xl overflow-hidden border border-[var(--dashboard-border)]"
			style={{ aspectRatio: "16/9" }}
		>
			{!apiLoaded && (
				<div className="absolute inset-0 bg-[var(--dashboard-bg)]/50 flex items-center justify-center z-10">
					<div className="flex items-center gap-2 text-xs font-semibold text-[var(--dashboard-muted)]">
						<div className="w-4 h-4 border-2 border-[var(--dashboard-orange)] border-t-transparent rounded-full animate-spin" />
						Loading Google Maps...
					</div>
				</div>
			)}
			<div ref={mapRef} className="w-full h-full" />
		</div>
	);
}

/* ── Zone Card ──────────────────────────────────────────────── */
function ZoneCard({
	zone,
	color,
	isSelected,
	disabled,
	onSelect,
	onToggle,
	onDelete,
}: {
	zone: ServiceZone;
	color: string;
	isSelected: boolean;
	disabled: boolean;
	onSelect: () => void;
	onToggle: () => void;
	onDelete: () => void;
}) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			onClick={onSelect}
			className={cn(
				"relative rounded-xl border p-4.5 cursor-pointer transition-all duration-200 group bg-[var(--dashboard-card)]",
				isSelected
					? "border-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)]/50 shadow-xs"
					: "border-[var(--dashboard-border)] hover:border-[var(--dashboard-orange-mid)] hover:bg-[var(--dashboard-bg)]/20",
			)}
		>
			{zone.isPrimary && (
				<span className="absolute top-4 right-4 text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] border border-[var(--dashboard-orange-mid)]">
					Primary
				</span>
			)}

			<div className="flex items-start gap-3.5">
				<div
					className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
					style={{ background: `${color}15`, border: `1px solid ${color}35` }}
				>
					<MapPin size={16} style={{ color }} />
				</div>

				<div className="flex-1 min-w-0">
					<p className="text-[13.5px] font-extrabold text-[var(--dashboard-text)] truncate">
						{zone.name}
					</p>
					{zone.geoWard && (
						<p className="text-[11px] text-[var(--dashboard-muted)] font-medium mt-0.5">
							Ward: {zone.geoWard.name}
						</p>
					)}
					<div className="flex items-center gap-1.5 mt-3">
						<CircleDot size={12} className="text-[var(--dashboard-muted)]/70" />
						<span className="text-[var(--dashboard-text)] text-[11px] font-semibold">
							{zone.coverageKm} km coverage
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[var(--dashboard-border)]/55">
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"text-[11px] font-extrabold uppercase tracking-wide",
							zone.isActive
								? "text-emerald-600"
								: "text-[var(--dashboard-muted)]",
						)}
					>
						{zone.isActive ? "Active" : "Paused"}
					</span>
					<button
						type="button"
						disabled={disabled}
						onClick={(e) => {
							e.stopPropagation();
							onToggle();
						}}
						className="transition-transform duration-150 active:scale-95 cursor-pointer flex disabled:opacity-50"
					>
						{zone.isActive ? (
							<ToggleRight size={23} className="text-emerald-500" />
						) : (
							<ToggleLeft
								size={23}
								className="text-[var(--dashboard-muted)]/50"
							/>
						)}
					</button>
				</div>
				<div className="flex items-center gap-1.5">
					{!zone.isPrimary && (
						<button
							type="button"
							disabled={disabled}
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-[var(--dashboard-muted)]/40 hover:text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer disabled:opacity-50"
						>
							<Trash2 size={13} />
						</button>
					)}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onSelect();
						}}
						className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-[var(--dashboard-muted)]/40 hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-all duration-150 cursor-pointer"
					>
						<ChevronRight size={14} />
					</button>
				</div>
			</div>
		</motion.div>
	);
}

/* ── Add Zone Modal ─────────────────────────────────────────── */
function AddZoneModal({
	open,
	onClose,
	onAdd,
	isSubmitting,
}: {
	open: boolean;
	onClose: () => void;
	onAdd: (payload: CreateZonePayload) => void;
	isSubmitting: boolean;
}) {
	const [stateId, setStateId] = useState("");
	const [lgaId, setLgaId] = useState("");
	const [wardId, setWardId] = useState("");
	const [coverageKm, setCoverageKm] = useState(5);

	const { data: states = [], isLoading: statesLoading } = useGetStatesQuery();
	const { data: lgas = [], isLoading: lgasLoading } = useGetLgasQuery(stateId);
	const { data: wards = [], isLoading: wardsLoading } = useGetWardsQuery(lgaId);

	const selectCls =
		"w-full bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--dashboard-text)] outline-none focus:border-[var(--dashboard-orange)] transition-colors disabled:opacity-50";

	const resetAndClose = () => {
		setStateId("");
		setLgaId("");
		setWardId("");
		setCoverageKm(5);
		onClose();
	};

	const handleAdd = () => {
		if (!wardId) return;
		onAdd({ wardId, coverageKm });
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && resetAndClose()}>
			<DialogContent className="max-w-sm bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] p-5 rounded-2xl">
				<DialogHeader>
					<DialogTitle className="text-base font-extrabold text-[var(--dashboard-text)] font-syne">
						Add Service Zone
					</DialogTitle>
				</DialogHeader>
				<div className="mt-2 space-y-3.5">
					<p className="text-[var(--dashboard-muted)] text-[12px]">
						Pick a ward you wish to serve. You will become visible to clients
						within this specific ward.
					</p>

					<div className="space-y-1.5">
						<label
							htmlFor="zone-state"
							className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
						>
							State
						</label>
						<select
							id="zone-state"
							value={stateId}
							onChange={(e) => {
								setStateId(e.target.value);
								setLgaId("");
								setWardId("");
							}}
							disabled={statesLoading}
							className={selectCls}
						>
							<option value="">Select state…</option>
							{states.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="zone-lga"
							className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
						>
							LGA
						</label>
						<select
							id="zone-lga"
							value={lgaId}
							onChange={(e) => {
								setLgaId(e.target.value);
								setWardId("");
							}}
							disabled={!stateId || lgasLoading}
							className={selectCls}
						>
							<option value="">Select LGA…</option>
							{lgas.map((l) => (
								<option key={l.id} value={l.id}>
									{l.name}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor="zone-ward"
							className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
						>
							Ward
						</label>
						<select
							id="zone-ward"
							value={wardId}
							onChange={(e) => setWardId(e.target.value)}
							disabled={!lgaId || wardsLoading}
							className={selectCls}
						>
							<option value="">Select ward…</option>
							{wards.map((w) => (
								<option key={w.id} value={w.id}>
									{w.name}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<label
								htmlFor="zone-coverage"
								className="text-[10px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
							>
								Coverage radius
							</label>
							<span className="text-[var(--dashboard-orange)] font-extrabold text-[12px]">
								{coverageKm} km
							</span>
						</div>
						<input
							id="zone-coverage"
							type="range"
							min={1}
							max={20}
							value={coverageKm}
							onChange={(e) => setCoverageKm(Number(e.target.value))}
							className="w-full accent-[var(--dashboard-orange)] cursor-pointer"
						/>
					</div>

					<div className="flex gap-2 pt-1.5">
						<button
							type="button"
							onClick={resetAndClose}
							className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[var(--dashboard-text)] text-xs font-extrabold hover:bg-[var(--dashboard-bg)] transition-all cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleAdd}
							disabled={!wardId || isSubmitting}
							className="flex-1 py-2.5 rounded-xl bg-[var(--dashboard-orange)] text-white font-extrabold text-xs hover:bg-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
						>
							{isSubmitting ? "Adding…" : "Add Zone"}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

/* ── Zone Detail Panel ──────────────────────────────────────── */
function ZoneDetailPanel({
	zone,
	color,
	onClose,
}: {
	zone: ServiceZone;
	color: string;
	onClose: () => void;
}) {
	// Lazy by construction — this query only runs while this panel is mounted,
	// i.e. only for the currently selected zone.
	const { data: insights, isLoading } = useGetZoneInsightsQuery(zone.id);
	const breakdown = insights?.breakdown ?? [];
	const maxBar = Math.max(1, ...breakdown.map((b) => b.count));

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			className="h-full flex flex-col"
		>
			<div className="flex items-center justify-between mb-4.5">
				<div>
					<h3 className="text-[var(--dashboard-text)] font-extrabold text-[15px]">
						{zone.name}
					</h3>
					{zone.geoWard && (
						<p className="text-[var(--dashboard-muted)] text-[11px] font-medium mt-0.5">
							{zone.geoWard.name}
						</p>
					)}
				</div>
				<button
					type="button"
					onClick={onClose}
					className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-all cursor-pointer"
				>
					<X size={14} />
				</button>
			</div>

			<div className="grid grid-cols-2 gap-3 mb-4.5">
				<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/20 p-3">
					<div
						className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
						style={{ background: `${color}15`, border: `1px solid ${color}35` }}
					>
						<CircleDot size={13} style={{ color }} />
					</div>
					<p className="text-[var(--dashboard-text)] font-extrabold text-[16px] leading-none">
						{zone.coverageKm} km
					</p>
					<p className="text-[var(--dashboard-muted)] text-[10px] font-semibold mt-1.5">
						Coverage Radius
					</p>
				</div>
				<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/20 p-3">
					<div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2 bg-[hsl(210,80%,55%)]/15 border border-[hsl(210,80%,55%)]/35">
						<Users size={13} className="text-[hsl(210,80%,55%)]" />
					</div>
					<p className="text-[var(--dashboard-text)] font-extrabold text-[16px] leading-none">
						{isLoading ? "…" : (insights?.artisanCount ?? 0)}
					</p>
					<p className="text-[var(--dashboard-muted)] text-[10px] font-semibold mt-1.5">
						Active Artisans
					</p>
				</div>
			</div>

			<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/10 p-4 mb-4">
				<p className="text-[var(--dashboard-muted)] text-[10px] font-extrabold uppercase tracking-wider mb-3.5">
					Artisan Breakdown
				</p>
				{isLoading ? (
					<div className="space-y-3">
						{["s1", "s2", "s3"].map((key) => (
							<div
								key={key}
								className="h-3 rounded-full bg-[var(--dashboard-border)]/40 animate-pulse"
							/>
						))}
					</div>
				) : breakdown.length === 0 ? (
					<p className="text-[var(--dashboard-muted)] text-[11px] text-center py-2">
						No artisans found in this zone yet.
					</p>
				) : (
					<div className="space-y-3">
						{breakdown.map((bar) => (
							<div key={bar.categoryId} className="flex items-center gap-3">
								<span className="text-[var(--dashboard-text)] text-[11px] font-semibold w-24 flex-shrink-0 truncate">
									{bar.name}
								</span>
								<div className="flex-1 bg-[var(--dashboard-border)]/50 rounded-full h-1.5 overflow-hidden">
									<motion.div
										initial={{ width: 0 }}
										animate={{ width: `${(bar.count / maxBar) * 100}%` }}
										transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
										className="h-full rounded-full"
										style={{ background: color }}
									/>
								</div>
								<span className="text-[var(--dashboard-text)] text-[11px] font-extrabold w-6 text-right">
									{bar.count}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/10 p-4 mt-auto">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"w-2.5 h-2.5 rounded-full",
								zone.isActive
									? "bg-emerald-500 shadow-[0_0_6px_0_rgba(16,185,129,0.4)]"
									: "bg-[var(--dashboard-muted)]/40",
							)}
						/>
						<span className="text-[var(--dashboard-text)] text-[12px] font-bold">
							Zone Dispatching
						</span>
					</div>
					<span
						className={cn(
							"text-[12px] font-extrabold uppercase tracking-wide",
							zone.isActive
								? "text-emerald-600"
								: "text-[var(--dashboard-muted)]",
						)}
					>
						{zone.isActive ? "Online" : "Paused"}
					</span>
				</div>
				{!zone.isActive && (
					<p className="text-[var(--dashboard-muted)] text-[11px] font-medium mt-2">
						Job matching is paused for this sector. Toggle active on the left
						sidebar to restore listing alerts.
					</p>
				)}
			</div>
		</motion.div>
	);
}

/* ── Main Page ──────────────────────────────────────────────── */
function MyAreaPage() {
	const providerProfile = useAppSelector(
		(s) => s.authStore.user?.providerProfile,
	);

	const { data: zonesData, isLoading: zonesLoading } = useGetZonesQuery();
	const { data: summary } = useGetAreaSummaryQuery();
	const zones = zonesData ?? [];

	const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [mapMode, setMapMode] = useState<"vector" | "google">("google");
	const [savedToast, setSavedToast] = useState(false);

	// Availability + radius: local editable copy, seeded from the provider
	// profile at render time (no effect) once it loads.
	const [isAvailable, setIsAvailable] = useState(true);
	const [radiusKm, setRadiusKm] = useState(5);
	const [seeded, setSeeded] = useState(false);
	if (providerProfile && !seeded) {
		setSeeded(true);
		setIsAvailable(providerProfile.isAvailable);
		setRadiusKm(providerProfile.serviceRadius ?? 5);
	}

	const selectedZone = useMemo(
		() => zones.find((z) => z.id === selectedZoneId) ?? null,
		[zones, selectedZoneId],
	);
	const selectedZoneColor = selectedZone
		? getZoneColor(
				selectedZone,
				zones.findIndex((z) => z.id === selectedZone.id),
			)
		: null;

	const updateAvailability = useUpdateProviderAvailabilityQuery({
		onSuccessCallback: () => {
			setSavedToast(true);
			setTimeout(() => setSavedToast(false), 2500);
		},
	});
	const createZone = useCreateZoneQuery({
		onSuccessCallback: (zone) => {
			setSelectedZoneId(zone.id);
			setShowAddModal(false);
		},
	});
	const updateZone = useUpdateZoneQuery();
	const deleteZone = useDeleteZoneQuery();

	const zoneMutationPending = updateZone.isPending || deleteZone.isPending;

	const handleToggleZone = (zone: ServiceZone) => {
		updateZone.mutate({ id: zone.id, payload: { isActive: !zone.isActive } });
	};

	const handleDeleteZone = (id: string) => {
		deleteZone.mutate(id, {
			onSuccess: () => {
				if (selectedZoneId === id) setSelectedZoneId(null);
			},
		});
	};

	const handleAddZone = (payload: CreateZonePayload) => {
		createZone.mutate(payload);
	};

	const handleSave = () => {
		updateAvailability.mutate({ isAvailable, serviceRadius: radiusKm });
	};

	const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

	return (
		<>
			<motion.div
				initial="hidden"
				animate="show"
				variants={{
					hidden: {},
					show: { transition: { staggerChildren: 0.05 } },
				}}
				className="flex flex-col h-full overflow-hidden bg-[var(--dashboard-bg)]"
			>
				<div className="px-5 sm:px-6 md:px-8 pt-5 sm:pt-6 md:pt-8 pb-5 shrink-0 space-y-6">
					<motion.div
						variants={fadeUp}
						className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[var(--dashboard-border)]/60"
					>
						<div>
							<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5">
								My Area
							</h2>
							<p className="text-[var(--dashboard-muted)] text-[12.5px] mt-1 font-medium">
								Define your dispatch service zones, track local demands, and
								adjust coverage limits.
							</p>
						</div>

						<div className="flex items-center gap-2.5">
							<div
								onClick={() => setIsAvailable((v) => !v)}
								className={cn(
									"flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none",
									isAvailable
										? "border-emerald-500/25 bg-emerald-50 text-emerald-600 font-extrabold"
										: "border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-muted)]",
								)}
							>
								{isAvailable ? (
									<ToggleRight size={20} className="flex-shrink-0" />
								) : (
									<ToggleLeft
										size={20}
										className="flex-shrink-0 text-[var(--dashboard-muted)]/50"
									/>
								)}
								<span className="text-[12px] whitespace-nowrap">
									{isAvailable ? "Accepting Alerts" : "Offline"}
								</span>
							</div>

							<button
								type="button"
								onClick={handleSave}
								disabled={updateAvailability.isPending}
								className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white font-extrabold text-xs tracking-wide transition-colors cursor-pointer disabled:opacity-60"
							>
								<Check size={14} />
								{updateAvailability.isPending ? "Saving…" : "Save Changes"}
							</button>
						</div>
					</motion.div>

					<motion.div
						variants={fadeUp}
						className="grid grid-cols-1 sm:grid-cols-2 gap-4"
					>
						{[
							{
								label: "Artisans Nearby",
								value: summary?.artisansNearby ?? 0,
								icon: Users,
								color: "hsl(210,80%,55%)",
							},
							{
								label: "Active Dispatch Zones",
								value: summary?.activeZones ?? 0,
								icon: Layers,
								color: "hsl(28,95%,50%)",
							},
						].map((s) => (
							<div
								key={s.label}
								className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 flex items-center gap-4 shadow-xs"
							>
								<div
									className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
									style={{
										background: `${s.color}12`,
										border: `1px solid ${s.color}35`,
									}}
								>
									<s.icon size={18} style={{ color: s.color }} />
								</div>
								<div>
									<p className="text-[var(--dashboard-text)] font-extrabold text-2xl leading-none">
										{s.value}
									</p>
									<p className="text-[var(--dashboard-muted)] text-[11.5px] font-semibold mt-1">
										{s.label}
									</p>
								</div>
							</div>
						))}
					</motion.div>
				</div>

				<div className="flex-1 overflow-y-auto px-5 sm:px-6 md:px-8 pb-8 pt-5">
					{zonesLoading ? (
						<div className="flex items-center justify-center py-24">
							<div className="w-6 h-6 border-2 border-[var(--dashboard-orange)] border-t-transparent rounded-full animate-spin" />
						</div>
					) : (
						<motion.div
							variants={fadeUp}
							className="grid gap-5 grid-cols-1 lg:grid-cols-3"
							style={{ gridTemplateColumns: "1fr 310px 290px" }}
						>
							<div className="space-y-4">
								<div className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] overflow-hidden shadow-xs">
									<div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dashboard-border)]/55 bg-[var(--dashboard-card)]">
										<div className="flex items-center gap-2">
											<Navigation
												size={14.5}
												className="text-[var(--dashboard-orange)]"
											/>
											<span className="text-[var(--dashboard-text)] text-[13px] font-extrabold">
												Coverage Area Map
											</span>
										</div>

										<div className="flex items-center bg-[var(--dashboard-bg)] p-0.5 rounded-lg border border-[var(--dashboard-border)]">
											<button
												type="button"
												onClick={() => setMapMode("google")}
												className={cn(
													"px-2.5 py-1 text-[10.5px] font-bold rounded-md transition-colors cursor-pointer",
													mapMode === "google"
														? "bg-[var(--dashboard-card)] text-[var(--dashboard-text)] shadow-xs border border-[var(--dashboard-border)]"
														: "text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]",
												)}
											>
												Google Maps
											</button>
											<button
												type="button"
												onClick={() => setMapMode("vector")}
												className={cn(
													"px-2.5 py-1 text-[10.5px] font-bold rounded-md transition-colors cursor-pointer",
													mapMode === "vector"
														? "bg-[var(--dashboard-card)] text-[var(--dashboard-text)] shadow-xs border border-[var(--dashboard-border)]"
														: "text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]",
												)}
											>
												Vector View
											</button>
										</div>
									</div>

									<div className="p-4 bg-[var(--dashboard-card)]">
										{zones.length === 0 ? (
											<div
												className="w-full flex items-center justify-center border border-dashed border-[var(--dashboard-border)] rounded-xl p-12 text-center"
												style={{ aspectRatio: "16/9" }}
											>
												<p className="text-[12px] text-[var(--dashboard-muted)] font-semibold">
													No service zones yet — add one to see it on the map.
												</p>
											</div>
										) : mapMode === "google" ? (
											<GoogleMapWrapper
												zones={zones}
												selectedZoneId={selectedZoneId}
												radiusKm={radiusKm}
												onSelectZone={(id) =>
													setSelectedZoneId((prev) => (prev === id ? null : id))
												}
											/>
										) : (
											<ServiceMap
												zones={zones}
												selectedZone={selectedZoneId}
												onSelectZone={(id) =>
													setSelectedZoneId((prev) => (prev === id ? null : id))
												}
											/>
										)}
									</div>

									{zones.length > 0 && (
										<div className="px-5 pb-5 flex items-center gap-5 flex-wrap border-t border-[var(--dashboard-border)]/40 pt-4.5 bg-[var(--dashboard-card)]">
											{zones.map((z, i) => (
												<div
													key={z.id}
													className={cn(
														"flex items-center gap-2 cursor-pointer transition-all",
														selectedZoneId === z.id
															? "opacity-100 scale-105"
															: "opacity-60 hover:opacity-85",
													)}
													onClick={() => setSelectedZoneId(z.id)}
												>
													<div
														className="w-2.5 h-2.5 rounded-full"
														style={{
															background: getZoneColor(z, i),
															opacity: z.isActive ? 1 : 0.35,
														}}
													/>
													<span className="text-[var(--dashboard-text)] text-[11.5px] font-bold">
														{z.name}
													</span>
												</div>
											))}
										</div>
									)}
								</div>

								<div className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-5 shadow-xs">
									<div className="flex items-center justify-between mb-4.5">
										<div>
											<p className="text-[var(--dashboard-text)] font-extrabold text-[13.5px]">
												Primary Dispatch Radius
											</p>
											<p className="text-[var(--dashboard-muted)] text-[11.5px] font-medium mt-0.5">
												Determine how far your services show in job boards
											</p>
										</div>
										<div className="text-right">
											<p className="text-[var(--dashboard-orange)] font-extrabold text-xl leading-none">
												{radiusKm} km
											</p>
											<p className="text-[var(--dashboard-muted)] text-[10px] font-bold uppercase mt-1">
												From Hub
											</p>
										</div>
									</div>

									<div className="relative">
										<input
											type="range"
											min={1}
											max={20}
											value={radiusKm}
											onChange={(e) => setRadiusKm(Number(e.target.value))}
											className="w-full accent-[var(--dashboard-orange)] cursor-pointer"
										/>
										<div className="flex justify-between mt-1 text-[11px] font-bold text-[var(--dashboard-muted)]/70">
											<span>1 km</span>
											<span>20 km</span>
										</div>
									</div>

									<div className="flex gap-2 mt-4 flex-wrap">
										{[2, 5, 10, 15, 20].map((km) => (
											<button
												type="button"
												key={km}
												onClick={() => setRadiusKm(km)}
												className={cn(
													"px-3.5 py-1.5 rounded-xl text-[11.5px] font-bold border transition-all duration-150 cursor-pointer",
													radiusKm === km
														? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange)] text-[var(--dashboard-orange)]"
														: "border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-text)]",
												)}
											>
												{km} km
											</button>
										))}
									</div>
								</div>

								{!isAvailable && (
									<motion.div
										initial={{ opacity: 0, y: -8 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4"
									>
										<AlertCircle
											size={16}
											className="text-amber-600 flex-shrink-0 mt-0.5"
										/>
										<div>
											<p className="text-amber-800 text-[12.5px] font-extrabold">
												Dispatch Mode Offline
											</p>
											<p className="text-amber-700 text-[11.5px] font-semibold mt-0.5 leading-relaxed">
												Your artisan profile is hidden from active local
												searches. Change status to Accepting Alerts in the top
												panel to go back online.
											</p>
										</div>
									</motion.div>
								)}
							</div>

							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<p className="text-[var(--dashboard-muted)] text-[11px] font-extrabold uppercase tracking-wider">
										Service Sectors
									</p>
									<button
										type="button"
										onClick={() => setShowAddModal(true)}
										className="flex items-center gap-1 text-[11px] text-[var(--dashboard-orange)] hover:opacity-85 transition-opacity font-extrabold cursor-pointer"
									>
										<Plus size={13} />
										Add Sector
									</button>
								</div>

								<div className="space-y-3.5">
									<AnimatePresence mode="popLayout">
										{zones.map((zone, i) => (
											<ZoneCard
												key={zone.id}
												zone={zone}
												color={getZoneColor(zone, i)}
												isSelected={selectedZoneId === zone.id}
												disabled={zoneMutationPending}
												onSelect={() =>
													setSelectedZoneId((prev) =>
														prev === zone.id ? null : zone.id,
													)
												}
												onToggle={() => handleToggleZone(zone)}
												onDelete={() => handleDeleteZone(zone.id)}
											/>
										))}
									</AnimatePresence>
								</div>

								<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/40 p-3.5 flex items-start gap-2.5 mt-auto">
									<Shield
										size={14}
										className="text-[var(--dashboard-muted)] flex-shrink-0 mt-0.5"
									/>
									<p className="text-[var(--dashboard-muted)] text-[11px] font-semibold leading-relaxed">
										Your exact home dispatch center coordinate is anonymized.
										Clients see high-level zone boundaries to ensure personal
										privacy boundaries.
									</p>
								</div>
							</div>

							<div className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-5 overflow-y-auto shadow-xs">
								<AnimatePresence mode="wait">
									{selectedZone && selectedZoneColor ? (
										<ZoneDetailPanel
											key={selectedZone.id}
											zone={selectedZone}
											color={selectedZoneColor}
											onClose={() => setSelectedZoneId(null)}
										/>
									) : (
										<motion.div
											key="empty"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="h-full flex flex-col items-center justify-center text-center py-12 gap-3"
										>
											<div className="w-12 h-12 rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] flex items-center justify-center">
												<MapPin
													size={20}
													className="text-[var(--dashboard-muted)]/60"
												/>
											</div>
											<p className="text-[var(--dashboard-muted)] text-[12px] font-bold">
												Select a sector to view analytical info
											</p>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>

			<AddZoneModal
				open={showAddModal}
				onClose={() => setShowAddModal(false)}
				onAdd={handleAddZone}
				isSubmitting={createZone.isPending}
			/>

			<AnimatePresence>
				{savedToast && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold shadow-xl"
					>
						<Check size={14} className="text-emerald-600" />
						Sector settings saved successfully
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
