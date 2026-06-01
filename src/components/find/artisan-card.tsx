import { Briefcase, Check, MapPin, Star } from "lucide-react";
import type { Artisan } from "#/types/artisan";
import { AVATAR_COLORS } from "#/types/artisan";

interface ArtisanCardProps {
	artisan: Artisan;
	onView: (a: Artisan) => void;
}

export function ArtisanCard({ artisan: a, onView }: ArtisanCardProps) {
	const av = AVATAR_COLORS[a.avatarIndex];

	return (
		<article
			className="relative rounded-[16px] border p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2"
			style={{ background: "var(--hh-card)", borderColor: "var(--hh-border)" }}
			onClick={() => onView(a)}
			onKeyDown={(e) => e.key === "Enter" && onView(a)}
			tabIndex={0}
			role="button"
			aria-label={`View profile of ${a.name}`}
			onMouseEnter={(e) => {
				(e.currentTarget as HTMLElement).style.borderColor =
					"rgba(232,80,10,0.35)";
			}}
			onMouseLeave={(e) => {
				(e.currentTarget as HTMLElement).style.borderColor = "var(--hh-border)";
			}}
		>
			{/* Verified badge */}
			<div
				className="absolute top-3.5 right-3.5 w-[22px] h-[22px] rounded-full flex items-center justify-center"
				style={{
					background: "rgba(74,222,128,0.12)",
					border: "1px solid rgba(74,222,128,0.25)",
				}}
				title="Verified artisan"
				aria-label="Verified artisan"
			>
				<Check size={11} style={{ color: "#4ADE80" }} aria-hidden />
			</div>

			{/* Top row */}
			<div className="flex items-start gap-3 mb-3.5">
				<div
					className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-[14px] font-medium shrink-0"
					style={{ background: av.bg, color: av.color }}
					aria-hidden
				>
					{a.initials}
				</div>
				<div className="min-w-0 flex-1">
					<p
						className="text-[14px] font-medium truncate"
						style={{ color: "var(--hh-txt)" }}
					>
						{a.name}
					</p>
					<p
						className="text-[11.5px] mt-0.5"
						style={{ color: "var(--hh-txt3)" }}
					>
						{a.role}
					</p>
					<div
						className="flex items-center gap-1 mt-1 text-[11.5px]"
						style={{ color: "var(--hh-txt3)" }}
					>
						<MapPin size={12} aria-hidden /> {a.loc} · {a.dist}
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="flex gap-3.5 mb-3.5">
				<div
					className="flex items-center gap-1 text-[12px]"
					style={{ color: "var(--hh-txt3)" }}
				>
					<Star
						size={13}
						fill="#F59E0B"
						style={{ color: "#F59E0B" }}
						aria-hidden
					/>
					<strong style={{ color: "var(--hh-txt2)" }}>{a.rating}</strong>
				</div>
				<div
					className="flex items-center gap-1 text-[12px]"
					style={{ color: "var(--hh-txt3)" }}
				>
					<Briefcase size={13} aria-hidden />
					<strong style={{ color: "var(--hh-txt2)" }}>{a.jobs}</strong> jobs
				</div>
			</div>

			{/* Tags */}
			<div className="flex gap-1.5 flex-wrap mb-3.5">
				{a.tags.map((t) => (
					<span
						key={t}
						className="text-[10.5px] rounded-full border px-2.5 py-[3px]"
						style={{
							background: "rgba(255,255,255,0.05)",
							borderColor: "var(--hh-border)",
							color: "var(--hh-txt3)",
						}}
					>
						{t}
					</span>
				))}
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between">
				<div>
					<span
						className="text-[15px] font-bold"
						style={{ fontFamily: "var(--font-syne)", color: "var(--hh-or)" }}
					>
						₦{a.rate.toLocaleString()}
					</span>
					<span
						className="text-[11px] ml-0.5"
						style={{ color: "var(--hh-txt3)" }}
					>
						/hr
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div
						className="flex items-center text-[11.5px]"
						style={{ color: "var(--hh-txt3)" }}
					>
						<span
							className="inline-block w-[7px] h-[7px] rounded-full mr-1"
							style={{ background: a.avail === "now" ? "#4ADE80" : "#FBBF24" }}
							aria-hidden
						/>
						{a.avail === "now" ? "Now" : "Scheduled"}
					</div>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onView(a);
						}}
						className="rounded-[8px] border px-3 py-[5px] text-[12px] cursor-pointer transition-all duration-150 hover:text-white"
						style={{
							background: "rgba(232,80,10,0.08)",
							borderColor: "rgba(232,80,10,0.2)",
							color: "var(--hh-or)",
						}}
						onMouseEnter={(e) => {
							const el = e.currentTarget;
							el.style.background = "var(--hh-or)";
							el.style.color = "#fff";
							el.style.borderColor = "var(--hh-or)";
						}}
						onMouseLeave={(e) => {
							const el = e.currentTarget;
							el.style.background = "rgba(232,80,10,0.08)";
							el.style.color = "var(--hh-or)";
							el.style.borderColor = "rgba(232,80,10,0.2)";
						}}
					>
						View
					</button>
				</div>
			</div>
		</article>
	);
}
