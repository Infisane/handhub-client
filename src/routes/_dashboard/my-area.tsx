import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
	MapPin,
	Plus,
	Trash2,
	Search,
	X,
	Navigation,
	Users,
	Briefcase,
	Activity,
	ChevronRight,
	ToggleLeft,
	ToggleRight,
	CircleDot,
	Layers,
	Shield,
	AlertCircle,
	Check,
	Minus,
	Map as MapIcon,
} from "lucide-react";
import { useState, useContext, useMemo, useRef, useEffect } from "react";
import { DashboardContext } from "../_dashboard";
import { cn } from "#/lib/utils.ts";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";

export const Route = createFileRoute("/_dashboard/my-area")({
	component: MyAreaPage,
});

/* ── Types ─────────────────────────────────────────────────── */
interface Zone {
	id: string;
	name: string;
	lga: string; // Local Government Area
	state: string;
	artisanCount: number;
	activeJobs: number;
	avgResponseTime: string; // e.g. "~18 min"
	coordinates: { x: number; y: number; lat: number; lng: number }; // Both SVG coordinate (%) and actual geographic coordinates
	coverageKm: number;
	isPrimary: boolean;
	isActive: boolean;
	color: string; // hsl color
}

interface MapNode {
	id: string;
	x: number;
	y: number;
	label: string;
	zone?: string;
}

/* ── Mock Data ──────────────────────────────────────────────── */
const MOCK_ZONES: Zone[] = [
	{
		id: "z1",
		name: "Lekki Phase 1",
		lga: "Eti-Osa",
		state: "Lagos",
		artisanCount: 84,
		activeJobs: 12,
		avgResponseTime: "~14 min",
		coordinates: { x: 72, y: 44, lat: 6.4281, lng: 3.4219 },
		coverageKm: 3,
		isPrimary: true,
		isActive: true,
		color: "hsl(28, 95%, 55%)",
	},
	{
		id: "z2",
		name: "Victoria Island",
		lga: "Eti-Osa",
		state: "Lagos",
		artisanCount: 56,
		activeJobs: 8,
		avgResponseTime: "~22 min",
		coordinates: { x: 60, y: 58, lat: 6.4280, lng: 3.4050 },
		coverageKm: 2.5,
		isPrimary: false,
		isActive: true,
		color: "hsl(210, 80%, 60%)",
	},
	{
		id: "z3",
		name: "Ajah",
		lga: "Eti-Osa",
		state: "Lagos",
		artisanCount: 31,
		activeJobs: 4,
		avgResponseTime: "~35 min",
		coordinates: { x: 85, y: 32, lat: 6.4673, lng: 3.5679 },
		coverageKm: 4,
		isPrimary: false,
		isActive: false,
		color: "hsl(155, 65%, 45%)",
	},
];

const SUGGESTED_ZONES = [
	{ name: "Ikoyi", lat: 6.4549, lng: 3.4246 },
	{ name: "Surulere", lat: 6.5000, lng: 3.3500 },
	{ name: "Yaba", lat: 6.5095, lng: 3.3711 },
	{ name: "Ikeja", lat: 6.6018, lng: 3.3515 },
	{ name: "Maryland", lat: 6.5694, lng: 3.3686 },
	{ name: "Gbagada", lat: 6.5500, lng: 3.3850 },
	{ name: "Ogudu", lat: 6.5784, lng: 3.3942 },
	{ name: "Magodo", lat: 6.6214, lng: 3.3768 },
	{ name: "Ojodu", lat: 6.6417, lng: 3.3601 },
	{ name: "Agege", lat: 6.6180, lng: 3.3200 },
];

/* ── Map Nodes (decorative reference points) ────────────────── */
const MAP_NODES: MapNode[] = [
	{ id: "n1", x: 25, y: 20, label: "Ikeja" },
	{ id: "n2", x: 40, y: 35, label: "Yaba" },
	{ id: "n3", x: 55, y: 42, label: "Lagos Island" },
	{ id: "n4", x: 60, y: 58, label: "V/I" },
	{ id: "n5", x: 72, y: 44, label: "Lekki" },
	{ id: "n6", x: 85, y: 32, label: "Ajah" },
	{ id: "n7", x: 30, y: 55, label: "Surulere" },
	{ id: "n8", x: 20, y: 70, label: "Festac" },
	{ id: "n9", x: 48, y: 68, label: "Apapa" },
	{ id: "n10", x: 15, y: 40, label: "Agege" },
];

/* ── Premium Warm-Sand Theme Google Maps Custom Styles ─────── */
const GOOGLE_MAPS_THEME = [
	{ "elementType": "geometry", "stylers": [{ "color": "#f8f6f2" }] },
	{ "elementType": "labels.text.fill", "stylers": [{ "color": "#6B655C" }] },
	{ "elementType": "labels.text.stroke", "stylers": [{ "color": "#f8f6f2" }] },
	{ "featureType": "administrative.land_parcel", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
	{ "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eae6e0" }] },
	{ "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#756d64" }] },
	{ "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
	{ "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8c8275" }] },
	{ "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
	{ "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#fdecdb" }] },
	{ "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#f7d0b8" }] },
	{ "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#dae5ed" }] },
	{ "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#8099ab" }] }
];

/* ── Interactive SVG Map Fallback Component ─────────────────────────────────── */
function ServiceMap({ zones, selectedZone, onSelectZone }: {
	zones: Zone[];
	selectedZone: string | null;
	onSelectZone: (id: string) => void;
}) {
	return (
		<div className="relative w-full rounded-xl overflow-hidden border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/20" style={{ aspectRatio: "16/9" }}>
			<svg
				viewBox="0 0 100 65"
				className="w-full h-full select-none"
			>
				<defs>
					<pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
						<path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(0, 0, 0, 0.035)" strokeWidth="0.25" />
					</pattern>
					{/* Glow Filter */}
					<filter id="glow">
						<feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* Grid overlay */}
				<rect width="100" height="65" fill="url(#grid)" />

				{/* Coastline silhouette (Premium warm-light outline) */}
				<path
					d="M 45 62 Q 50 58 55 60 Q 65 62 72 55 Q 82 48 88 42 Q 92 36 90 28 Q 88 20 82 18 Q 75 15 68 20 Q 60 25 55 32 Q 48 40 45 48 Q 42 55 45 62Z"
					fill="rgba(232, 80, 10, 0.02)"
					stroke="rgba(232, 80, 10, 0.05)"
					strokeWidth="0.4"
				/>

				{/* Decorative Road networks */}
				{[
					"M 10 30 Q 40 28 55 42 Q 65 52 80 48",
					"M 10 50 Q 30 45 45 50 Q 55 55 65 60",
					"M 40 10 Q 42 30 45 48",
					"M 65 10 Q 68 25 72 44",
				].map((d, i) => (
					<path
						key={i}
						d={d}
						fill="none"
						stroke="rgba(0,0,0,0.03)"
						strokeWidth="0.4"
						strokeDasharray="1.5 2"
					/>
				))}

				{/* Interactive Zone Circles */}
				{zones.map((zone) => {
					const isSelected = selectedZone === zone.id;
					const radius = zone.coverageKm * 2.3;
					return (
						<g key={zone.id} className="cursor-pointer">
							{/* Pulse ring */}
							{zone.isActive && (
								<circle
									cx={zone.coordinates.x}
									cy={zone.coordinates.y}
									r={radius + 1.2}
									fill="none"
									stroke={zone.color}
									strokeWidth={isSelected ? "0.6" : "0.3"}
									strokeDasharray="1.5 1.5"
									opacity={isSelected ? 0.6 : 0.25}
								/>
							)}

							{/* Main coverage circle area */}
							<circle
								cx={zone.coordinates.x}
								cy={zone.coordinates.y}
								r={radius}
								fill={zone.color}
								fillOpacity={zone.isActive ? (isSelected ? 0.18 : 0.08) : 0.03}
								stroke={zone.color}
								strokeWidth={isSelected ? "0.8" : "0.4"}
								strokeOpacity={zone.isActive ? (isSelected ? 0.8 : 0.4) : 0.15}
								className="transition-all duration-200"
								onClick={() => onSelectZone(zone.id)}
							/>

							{/* Main center marker */}
							<circle
								cx={zone.coordinates.x}
								cy={zone.coordinates.y}
								r={zone.isPrimary ? 1.5 : 1}
								fill={zone.isActive ? zone.color : "rgba(0,0,0,0.2)"}
								filter={zone.isActive ? "url(#glow)" : undefined}
								onClick={() => onSelectZone(zone.id)}
							/>

							{/* High visibility text labels */}
							<text
								x={zone.coordinates.x}
								y={zone.coordinates.y - radius - 1.2}
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

				{/* Lagos Reference Landmark nodes */}
				{MAP_NODES.map((node) => (
					<g key={node.id}>
						<circle cx={node.x} cy={node.y} r="0.4" fill="rgba(0, 0, 0, 0.15)" />
						<text
							x={node.x + 1}
							y={node.y + 0.6}
							fontSize="1.8"
							fill="var(--dashboard-muted)"
							className="opacity-45 select-none font-medium"
						>
							{node.label}
						</text>
					</g>
				))}
			</svg>
		</div>
	);
}

/* ── Dynamic Google Maps Loader & Renderer ─────────────────────────────────── */
function GoogleMapWrapper({ zones, selectedZoneId, radiusKm, onSelectZone }: {
	zones: Zone[];
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

	// Load Google Maps script
	useEffect(() => {
		if (window.google && window.google.maps) {
			setApiLoaded(true);
			return;
		}

		const callbackName = "initHandhubMap";
		(window as any)[callbackName] = () => {
			setApiLoaded(true);
		};

		const script = document.createElement("script");
		// Unofficial fallback loading, if key missing, API is functional but visually watermarked
		script.src = `https://maps.googleapis.com/maps/api/js?callback=${callbackName}&libraries=geometry`;
		script.async = true;
		script.defer = true;
		script.onerror = () => {
			setLoadError(true);
		};

		document.head.appendChild(script);

		return () => {
			delete (window as any)[callbackName];
		};
	}, []);

	// Initialize and update Map instance
	useEffect(() => {
		if (!apiLoaded || !mapRef.current || !window.google) return;

		// Default Lagos coordinates center
		const defaultCenter = { lat: 6.4480, lng: 3.4219 };

		if (!googleMapRef.current) {
			googleMapRef.current = new window.google.maps.Map(mapRef.current, {
				center: defaultCenter,
				zoom: 12,
				styles: GOOGLE_MAPS_THEME,
				disableDefaultUI: true,
				zoomControl: true,
				gestureHandling: "cooperative",
			});
		}

		// Clear past markers & circles
		markersRef.current.forEach(m => m.setMap(null));
		circlesRef.current.forEach(c => c.setMap(null));
		markersRef.current = [];
		circlesRef.current = [];

		const bounds = new window.google.maps.LatLngBounds();
		let activeZonesCount = 0;

		zones.forEach((zone) => {
			const position = { lat: zone.coordinates.lat, lng: zone.coordinates.lng };
			bounds.extend(position);

			if (zone.isActive) {
				activeZonesCount++;
			}

			const isSelected = selectedZoneId === zone.id;

			// Custom color representation
			const hexColor = zone.color.includes("hsl(28") ? "#E8500A" : zone.color.includes("hsl(210") ? "#3B82F6" : "#10B981";

			// Draw Map Markers
			const marker = new window.google.maps.Marker({
				position,
				map: googleMapRef.current!,
				title: zone.name,
				icon: {
					path: window.google.maps.SymbolPath.CIRCLE,
					scale: zone.isPrimary ? 8 : 6,
					fillColor: zone.isActive ? hexColor : "#6B655C",
					fillOpacity: 1,
					strokeColor: "#ffffff",
					strokeWeight: 2,
				},
			});

			marker.addListener("click", () => {
				onSelectZone(zone.id);
			});

			markersRef.current.push(marker);

			// Draw Coverage radius circles
			if (zone.isActive) {
				const circle = new window.google.maps.Circle({
					map: googleMapRef.current!,
					center: position,
					radius: zone.isPrimary ? radiusKm * 1000 : zone.coverageKm * 1000,
					fillColor: hexColor,
					fillOpacity: isSelected ? 0.16 : 0.07,
					strokeColor: hexColor,
					strokeOpacity: isSelected ? 0.8 : 0.35,
					strokeWeight: isSelected ? 2 : 1,
				});

				circle.addListener("click", () => {
					onSelectZone(zone.id);
				});

				circlesRef.current.push(circle);
			}
		});

		// Auto fit boundaries if multiple locations exist
		if (zones.length > 0 && googleMapRef.current) {
			if (zones.length === 1) {
				googleMapRef.current.setCenter({ lat: zones[0].coordinates.lat, lng: zones[0].coordinates.lng });
				googleMapRef.current.setZoom(13);
			} else {
				googleMapRef.current.fitBounds(bounds);
			}
		}
	}, [apiLoaded, zones, selectedZoneId, radiusKm]);

	if (loadError) {
		return (
			<div className="w-full flex items-center justify-center border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/20 p-12 text-center rounded-xl" style={{ aspectRatio: "16/9" }}>
				<div className="space-y-2">
					<AlertCircle className="mx-auto text-[var(--dashboard-orange)]" size={24} />
					<p className="text-[13px] font-bold text-[var(--dashboard-text)]">Google Maps failed to load</p>
					<p className="text-[11px] text-[var(--dashboard-muted)]">Check your network connection or try switching to Vector mode.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative w-full rounded-xl overflow-hidden border border-[var(--dashboard-border)]" style={{ aspectRatio: "16/9" }}>
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
function ZoneCard({ zone, isSelected, onSelect, onToggle, onDelete }: {
	zone: Zone;
	isSelected: boolean;
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
					: "border-[var(--dashboard-border)] hover:border-[var(--dashboard-orange-mid)] hover:bg-[var(--dashboard-bg)]/20"
			)}
		>
			{/* Primary Badge */}
			{zone.isPrimary && (
				<span className="absolute top-4 right-4 text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[var(--dashboard-orange-light)] text-[var(--dashboard-orange)] border border-[var(--dashboard-orange-mid)]">
					Primary
				</span>
			)}

			<div className="flex items-start gap-3.5">
				{/* Color icon container */}
				<div
					className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
					style={{ background: `${zone.color}15`, border: `1px solid ${zone.color}35` }}
				>
					<MapPin size={16} style={{ color: zone.color }} />
				</div>

				<div className="flex-1 min-w-0">
					<p className="text-[13.5px] font-extrabold text-[var(--dashboard-text)] truncate">{zone.name}</p>
					<p className="text-[11px] text-[var(--dashboard-muted)] font-medium mt-0.5">{zone.lga} LGA · {zone.state}</p>

					<div className="flex items-center gap-4 mt-3">
						<div className="flex items-center gap-1.5 shrink-0">
							<Users size={12} className="text-[var(--dashboard-muted)]/70" />
							<span className="text-[var(--dashboard-text)] text-[11px] font-semibold">{zone.artisanCount} artisans</span>
						</div>
						<div className="flex items-center gap-1.5 shrink-0">
							<Briefcase size={12} className="text-[var(--dashboard-muted)]/70" />
							<span className="text-[var(--dashboard-text)] text-[11px] font-semibold">{zone.activeJobs} jobs</span>
						</div>
						<div className="flex items-center gap-1.5 shrink-0">
							<Activity size={12} className="text-[var(--dashboard-muted)]/70" />
							<span className="text-[var(--dashboard-text)] text-[11px] font-semibold">{zone.avgResponseTime}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Actions row */}
			<div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[var(--dashboard-border)]/55">
				<div className="flex items-center gap-2">
					<span className={cn(
						"text-[11px] font-extrabold uppercase tracking-wide",
						zone.isActive ? "text-emerald-600" : "text-[var(--dashboard-muted)]"
					)}>
						{zone.isActive ? "Active" : "Paused"}
					</span>
					<button
						type="button"
						onClick={(e) => { e.stopPropagation(); onToggle(); }}
						className="transition-transform duration-150 active:scale-95 cursor-pointer flex"
					>
						{zone.isActive
							? <ToggleRight size={23} className="text-emerald-500" />
							: <ToggleLeft size={23} className="text-[var(--dashboard-muted)]/50" />
						}
					</button>
				</div>
				<div className="flex items-center gap-1.5">
					{!zone.isPrimary && (
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); onDelete(); }}
							className="w-7.5 h-7.5 rounded-lg flex items-center justify-center text-[var(--dashboard-muted)]/40 hover:text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer"
						>
							<Trash2 size={13} />
						</button>
					)}
					<button
						type="button"
						onClick={(e) => { e.stopPropagation(); onSelect(); }}
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
function AddZoneModal({ open, onClose, onAdd, existingZones }: {
	open: boolean;
	onClose: () => void;
	onAdd: (name: string, lat: number, lng: number) => void;
	existingZones: Zone[];
}) {
	const [search, setSearch] = useState("");
	const [selectedSuggestion, setSelectedSuggestion] = useState<{ name: string; lat: number; lng: number } | null>(null);

	const filtered = useMemo(() => {
		const existing = existingZones.map((z) => z.name.toLowerCase());
		return SUGGESTED_ZONES.filter(
			(s) =>
				s.name.toLowerCase().includes(search.toLowerCase()) &&
				!existing.includes(s.name.toLowerCase())
		);
	}, [search, existingZones]);

	const handleAdd = () => {
		if (selectedSuggestion) {
			onAdd(selectedSuggestion.name, selectedSuggestion.lat, selectedSuggestion.lng);
		} else {
			const name = search.trim();
			if (!name) return;
			// Default generic coords inside Lagos state boundary
			onAdd(name, 6.5244 + (Math.random() * 0.1 - 0.05), 3.3792 + (Math.random() * 0.1 - 0.05));
		}
		setSearch("");
		setSelectedSuggestion(null);
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-sm bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] p-5 rounded-2xl">
				<DialogHeader>
					<DialogTitle className="text-base font-extrabold text-[var(--dashboard-text)] font-syne">Add Service Zone</DialogTitle>
				</DialogHeader>
				<div className="mt-2 space-y-3.5">
					<p className="text-[var(--dashboard-muted)] text-[12px]">
						Add a neighborhood or region you wish to serve. You will become visible to clients within this specific neighborhood.
					</p>

					{/* Search field */}
					<div className="relative">
						<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-muted)]/70" />
						<input
							value={search}
							onChange={(e) => { setSearch(e.target.value); setSelectedSuggestion(null); }}
							placeholder="Search neighborhood area..."
							className="w-full bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] transition-colors"
						/>
					</div>

					{/* Selected pill */}
					{selectedSuggestion && (
						<div className="flex items-center gap-2 px-3 py-2 bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)] rounded-xl">
							<Check size={13} className="text-[var(--dashboard-orange)]" />
							<span className="text-xs font-bold text-[var(--dashboard-text)] flex-1">{selectedSuggestion.name}</span>
							<button onClick={() => setSelectedSuggestion(null)} className="text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]">
								<X size={13} />
							</button>
						</div>
					)}

					{/* Suggestions list */}
					{!selectedSuggestion && (
						<div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
							{filtered.length === 0 && (
								<p className="text-[var(--dashboard-muted)] text-[11px] text-center py-4">No matching areas found</p>
							)}
							{filtered.map((s) => (
								<button
									key={s.name}
									type="button"
									onClick={() => setSelectedSuggestion(s)}
									className="w-full text-left px-3 py-2 text-[12px] text-[var(--dashboard-text)] font-semibold hover:bg-[var(--dashboard-bg)] rounded-xl transition-colors flex items-center gap-2"
								>
									<MapPin size={11} className="text-[var(--dashboard-muted)]/60 flex-shrink-0" />
									{s.name}
								</button>
							))}
						</div>
					)}

					<div className="flex gap-2 pt-1.5">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[var(--dashboard-text)] text-xs font-extrabold hover:bg-[var(--dashboard-bg)] transition-all cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleAdd}
							disabled={!selectedSuggestion && !search.trim()}
							className="flex-1 py-2.5 rounded-xl bg-[var(--dashboard-orange)] text-white font-extrabold text-xs hover:bg-orange-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
						>
							Add Zone
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

/* ── Zone Detail Panel ──────────────────────────────────────── */
function ZoneDetailPanel({ zone, onClose }: { zone: Zone; onClose: () => void }) {
	const bars = [
		{ label: "Electricians", count: Math.floor(zone.artisanCount * 0.28) },
		{ label: "Plumbers", count: Math.floor(zone.artisanCount * 0.22) },
		{ label: "Carpenters", count: Math.floor(zone.artisanCount * 0.18) },
		{ label: "AC Technicians", count: Math.floor(zone.artisanCount * 0.15) },
		{ label: "Others", count: Math.floor(zone.artisanCount * 0.17) },
	];
	const maxBar = Math.max(...bars.map((b) => b.count));

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			className="h-full flex flex-col"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-4.5">
				<div>
					<h3 className="text-[var(--dashboard-text)] font-extrabold text-[15px]">{zone.name}</h3>
					<p className="text-[var(--dashboard-muted)] text-[11px] font-medium mt-0.5">{zone.lga} LGA · {zone.state}</p>
				</div>
				<button
					onClick={onClose}
					className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-bg)] transition-all cursor-pointer"
				>
					<X size={14} />
				</button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 gap-3 mb-4.5">
				{[
					{ label: "Coverage Radius", value: `${zone.coverageKm} km`, icon: CircleDot, color: zone.color },
					{ label: "Active Artisans", value: zone.artisanCount, icon: Users, color: "hsl(210,80%,55%)" },
					{ label: "Open Jobs", value: zone.activeJobs, icon: Briefcase, color: "hsl(155,65%,45%)" },
					{ label: "Avg Response", value: zone.avgResponseTime, icon: Activity, color: "hsl(280,70%,60%)" },
				].map((stat) => (
					<div
						key={stat.label}
						className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/20 p-3"
					>
						<div
							className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
							style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}35` }}
						>
							<stat.icon size={13} style={{ color: stat.color }} />
						</div>
						<p className="text-[var(--dashboard-text)] font-extrabold text-[16px] leading-none">{stat.value}</p>
						<p className="text-[var(--dashboard-muted)] text-[10px] font-semibold mt-1.5">{stat.label}</p>
					</div>
				))}
			</div>

			{/* Artisan breakdown */}
			<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/10 p-4 mb-4">
				<p className="text-[var(--dashboard-muted)] text-[10px] font-extrabold uppercase tracking-wider mb-3.5">Artisan Breakdown</p>
				<div className="space-y-3">
					{bars.map((bar) => (
						<div key={bar.label} className="flex items-center gap-3">
							<span className="text-[var(--dashboard-text)] text-[11px] font-semibold w-24 flex-shrink-0">{bar.label}</span>
							<div className="flex-1 bg-[var(--dashboard-border)]/50 rounded-full h-1.5 overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${(bar.count / maxBar) * 100}%` }}
									transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
									className="h-full rounded-full"
									style={{ background: zone.color }}
								/>
							</div>
							<span className="text-[var(--dashboard-text)] text-[11px] font-extrabold w-6 text-right">{bar.count}</span>
						</div>
					))}
				</div>
			</div>

			{/* Status card */}
			<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/10 p-4 mt-auto">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className={cn(
							"w-2.5 h-2.5 rounded-full",
							zone.isActive ? "bg-emerald-500 shadow-[0_0_6px_0_rgba(16,185,129,0.4)]" : "bg-[var(--dashboard-muted)]/40"
						)} />
						<span className="text-[var(--dashboard-text)] text-[12px] font-bold">Zone Dispatching</span>
					</div>
					<span className={cn(
						"text-[12px] font-extrabold uppercase tracking-wide",
						zone.isActive ? "text-emerald-600" : "text-[var(--dashboard-muted)]"
					)}>
						{zone.isActive ? "Online" : "Paused"}
					</span>
				</div>
				{!zone.isActive && (
					<p className="text-[var(--dashboard-muted)] text-[11px] font-medium mt-2">
						Job matching is paused for this sector. Toggle active on the left sidebar to restore listing alerts.
					</p>
				)}
			</div>
		</motion.div>
	);
}

/* ── Main Page ──────────────────────────────────────────────── */
function MyAreaPage() {
	const { hasActiveChat } = useContext(DashboardContext);
	const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
	const [selectedZoneId, setSelectedZoneId] = useState<string | null>("z1");
	const [isAvailable, setIsAvailable] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [radiusKm, setRadiusKm] = useState(5);
	const [savedToast, setSavedToast] = useState(false);
	const [mapMode, setMapMode] = useState<"vector" | "google">("google");

	const selectedZone = useMemo(
		() => zones.find((z) => z.id === selectedZoneId) ?? null,
		[zones, selectedZoneId]
	);

	const stats = useMemo(() => ({
		totalArtisans: zones.filter((z) => z.isActive).reduce((s, z) => s + z.artisanCount, 0),
		activeZones: zones.filter((z) => z.isActive).length,
		totalJobs: zones.filter((z) => z.isActive).reduce((s, z) => s + z.activeJobs, 0),
	}), [zones]);

	const handleToggleZone = (id: string) => {
		setZones((prev) =>
			prev.map((z) => (z.id === id ? { ...z, isActive: !z.isActive } : z))
		);
	};

	const handleDeleteZone = (id: string) => {
		setZones((prev) => prev.filter((z) => z.id !== id));
		if (selectedZoneId === id) setSelectedZoneId(null);
	};

	const handleAddZone = (name: string, lat: number, lng: number) => {
		const colors = ["hsl(280,70%,60%)", "hsl(340,80%,55%)", "hsl(45,90%,50%)", "hsl(180,60%,45%)"];
		const newZone: Zone = {
			id: `z${Date.now()}`,
			name,
			lga: "Eti-Osa",
			state: "Lagos",
			artisanCount: Math.floor(Math.random() * 50) + 15,
			activeJobs: Math.floor(Math.random() * 8) + 1,
			avgResponseTime: `~${Math.floor(Math.random() * 20) + 15} min`,
			coordinates: {
				x: Math.random() * 50 + 25,
				y: Math.random() * 30 + 20,
				lat,
				lng
			},
			coverageKm: 3,
			isPrimary: false,
			isActive: true,
			color: colors[Math.floor(Math.random() * colors.length)],
		};
		setZones((prev) => [...prev, newZone]);
		setSelectedZoneId(newZone.id);
	};

	const handleSave = () => {
		setSavedToast(true);
		setTimeout(() => setSavedToast(false), 2500);
	};

	const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

	return (
		<>
			<motion.div
				initial="hidden"
				animate="show"
				variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
				className="p-5 sm:p-6 md:p-8 space-y-6 min-h-full bg-[var(--dashboard-bg)]"
			>
				{/* Header Section */}
				<motion.div variants={fadeUp} className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[var(--dashboard-border)]/60">
					<div>
						<h2 className="font-syne font-extrabold text-[22px] sm:text-[26px] tracking-[-0.6px] text-[var(--dashboard-text)] leading-none mb-1.5">
							My Area
						</h2>
						<p className="text-[var(--dashboard-muted)] text-[12.5px] mt-1 font-medium">
							Define your dispatch service zones, track local demands, and adjust coverage limits.
						</p>
					</div>

					<div className="flex items-center gap-2.5">
						{/* Availability Toggle */}
						<div
							onClick={() => setIsAvailable((v) => !v)}
							className={cn(
								"flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 select-none",
								isAvailable
									? "border-emerald-500/25 bg-emerald-50 text-emerald-600 font-extrabold"
									: "border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-muted)]"
							)}
						>
							{isAvailable
								? <ToggleRight size={20} className="flex-shrink-0" />
								: <ToggleLeft size={20} className="flex-shrink-0 text-[var(--dashboard-muted)]/50" />
							}
							<span className="text-[12px] whitespace-nowrap">
								{isAvailable ? "Accepting Alerts" : "Offline"}
							</span>
						</div>

						<button
							onClick={handleSave}
							className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--dashboard-orange)] hover:bg-orange-600 text-white font-extrabold text-xs tracking-wide transition-colors cursor-pointer"
						>
							<Check size={14} />
							Save Changes
						</button>
					</div>
				</motion.div>

				{/* Stats Row */}
				<motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{[
						{ label: "Artisans Nearby", value: stats.totalArtisans, icon: Users, color: "hsl(210,80%,55%)" },
						{ label: "Active Dispatch Zones", value: stats.activeZones, icon: Layers, color: "hsl(28,95%,50%)" },
						{ label: "Local Job Orders", value: stats.totalJobs, icon: Briefcase, color: "hsl(155,65%,45%)" },
					].map((s) => (
						<div
							key={s.label}
							className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 flex items-center gap-4 shadow-xs"
						>
							<div
								className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
								style={{ background: `${s.color}12`, border: `1px solid ${s.color}35` }}
							>
								<s.icon size={18} style={{ color: s.color }} />
							</div>
							<div>
								<p className="text-[var(--dashboard-text)] font-extrabold text-2xl leading-none">{s.value}</p>
								<p className="text-[var(--dashboard-muted)] text-[11.5px] font-semibold mt-1">{s.label}</p>
							</div>
						</div>
					))}
				</motion.div>

				{/* Main Content Layout Grid */}
				<motion.div variants={fadeUp} className="grid gap-5 grid-cols-1" style={{
					gridTemplateColumns: hasActiveChat
						? "1fr"
						: "1fr 310px 290px",
				}}>
					{/* Left Panel: Maps & Global Controls */}
					<div className="space-y-4">
						{/* Coverage Map Card */}
						<div className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] overflow-hidden shadow-xs">
							<div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dashboard-border)]/55 bg-[var(--dashboard-card)]">
								<div className="flex items-center gap-2">
									<Navigation size={14.5} className="text-[var(--dashboard-orange)]" />
									<span className="text-[var(--dashboard-text)] text-[13px] font-extrabold">Coverage Area Map</span>
									<span className="text-[var(--dashboard-muted)] text-[11px] font-medium">· Lagos State</span>
								</div>

								{/* Dynamic Map Mode Selector */}
								<div className="flex items-center bg-[var(--dashboard-bg)] p-0.5 rounded-lg border border-[var(--dashboard-border)]">
									<button
										onClick={() => setMapMode("google")}
										className={cn(
											"px-2.5 py-1 text-[10.5px] font-bold rounded-md transition-colors cursor-pointer",
											mapMode === "google"
												? "bg-[var(--dashboard-card)] text-[var(--dashboard-text)] shadow-xs border border-[var(--dashboard-border)]"
												: "text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]"
										)}
									>
										Google Maps
									</button>
									<button
										onClick={() => setMapMode("vector")}
										className={cn(
											"px-2.5 py-1 text-[10.5px] font-bold rounded-md transition-colors cursor-pointer",
											mapMode === "vector"
												? "bg-[var(--dashboard-card)] text-[var(--dashboard-text)] shadow-xs border border-[var(--dashboard-border)]"
												: "text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)]"
										)}
									>
										Vector View
									</button>
								</div>
							</div>

							<div className="p-4 bg-[var(--dashboard-card)]">
								{mapMode === "google" ? (
									<GoogleMapWrapper
										zones={zones}
										selectedZoneId={selectedZoneId}
										radiusKm={radiusKm}
										onSelectZone={(id) => setSelectedZoneId((prev) => prev === id ? null : id)}
									/>
								) : (
									<ServiceMap
										zones={zones}
										selectedZone={selectedZoneId}
										onSelectZone={(id) => setSelectedZoneId((prev) => prev === id ? null : id)}
									/>
								)}
							</div>

							{/* Map Legends */}
							<div className="px-5 pb-5 flex items-center gap-5 flex-wrap border-t border-[var(--dashboard-border)]/40 pt-4.5 bg-[var(--dashboard-card)]">
								{zones.map((z) => (
									<div
										key={z.id}
										className={cn(
											"flex items-center gap-2 cursor-pointer transition-all",
											selectedZoneId === z.id ? "opacity-100 scale-105" : "opacity-60 hover:opacity-85"
										)}
										onClick={() => setSelectedZoneId(z.id)}
									>
										<div className="w-2.5 h-2.5 rounded-full" style={{ background: z.color, opacity: z.isActive ? 1 : 0.35 }} />
										<span className="text-[var(--dashboard-text)] text-[11.5px] font-bold">{z.name}</span>
									</div>
								))}
							</div>
						</div>

						{/* Global Search Radius Controls */}
						<div className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-5 shadow-xs">
							<div className="flex items-center justify-between mb-4.5">
								<div>
									<p className="text-[var(--dashboard-text)] font-extrabold text-[13.5px]">Primary Dispatch Radius</p>
									<p className="text-[var(--dashboard-muted)] text-[11.5px] font-medium mt-0.5">Determine how far your services show in job boards</p>
								</div>
								<div className="text-right">
									<p className="text-[var(--dashboard-orange)] font-extrabold text-xl leading-none">{radiusKm} km</p>
									<p className="text-[var(--dashboard-muted)] text-[10px] font-bold uppercase mt-1">From Hub</p>
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
										key={km}
										onClick={() => setRadiusKm(km)}
										className={cn(
											"px-3.5 py-1.5 rounded-xl text-[11.5px] font-bold border transition-all duration-150 cursor-pointer",
											radiusKm === km
												? "bg-[var(--dashboard-orange-light)] border-[var(--dashboard-orange)] text-[var(--dashboard-orange)]"
												: "border-[var(--dashboard-border)] bg-[var(--dashboard-card)] text-[var(--dashboard-muted)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-text)]"
										)}
									>
										{km} km
									</button>
								))}
							</div>
						</div>

						{/* Inactive Mode Alert Notification Banner */}
						{!isAvailable && (
							<motion.div
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4"
							>
								<AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-amber-800 text-[12.5px] font-extrabold">Dispatch Mode Offline</p>
									<p className="text-amber-700 text-[11.5px] font-semibold mt-0.5 leading-relaxed">
										Your artisan profile is hidden from active local searches. Change status to Accepting Alerts in the top panel to go back online.
									</p>
								</div>
							</motion.div>
						)}
					</div>

					{/* Middle Panel: Interactive Zones list */}
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<p className="text-[var(--dashboard-muted)] text-[11px] font-extrabold uppercase tracking-wider">Service Sectors</p>
							<button
								onClick={() => setShowAddModal(true)}
								className="flex items-center gap-1 text-[11px] text-[var(--dashboard-orange)] hover:opacity-85 transition-opacity font-extrabold cursor-pointer"
							>
								<Plus size={13} />
								Add Sector
							</button>
						</div>

						<div className="space-y-3.5">
							<AnimatePresence mode="popLayout">
								{zones.map((zone) => (
									<ZoneCard
										key={zone.id}
										zone={zone}
										isSelected={selectedZoneId === zone.id}
										onSelect={() => setSelectedZoneId((prev) => prev === zone.id ? null : zone.id)}
										onToggle={() => handleToggleZone(zone.id)}
										onDelete={() => handleDeleteZone(zone.id)}
									/>
								))}
							</AnimatePresence>
						</div>

						{/* Legal & Privacy details */}
						<div className="rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/40 p-3.5 flex items-start gap-2.5 mt-auto">
							<Shield size={14} className="text-[var(--dashboard-muted)] flex-shrink-0 mt-0.5" />
							<p className="text-[var(--dashboard-muted)] text-[11px] font-semibold leading-relaxed">
								Your exact home dispatch center coordinate is anonymized. Clients see high-level zone boundaries to ensure personal privacy boundaries.
							</p>
						</div>
					</div>

					{/* Right Panel: Zone detail panel (Only visible when chat is closed) */}
					{!hasActiveChat && (
						<div className="rounded-2xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-5 overflow-y-auto shadow-xs">
							<AnimatePresence mode="wait">
								{selectedZone ? (
									<ZoneDetailPanel
										key={selectedZone.id}
										zone={selectedZone}
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
											<MapPin size={20} className="text-[var(--dashboard-muted)]/60" />
										</div>
										<p className="text-[var(--dashboard-muted)] text-[12px] font-bold">Select a sector to view analytical info</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					)}
				</motion.div>
			</motion.div>

			{/* Add Zone Modal Component wrapper */}
			<AddZoneModal
				open={showAddModal}
				onClose={() => setShowAddModal(false)}
				onAdd={handleAddZone}
				existingZones={zones}
			/>

			{/* Success Alert saved toast */}
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
