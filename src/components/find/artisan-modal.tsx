import { Briefcase, Check, Lock, Star, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Artisan } from "#/types/artisan";
import { AVATAR_COLORS } from "#/types/artisan";

interface ArtisanModalProps {
	artisan: Artisan | null;
	onClose: () => void;
}

export function ArtisanModal({ artisan, onClose }: ArtisanModalProps) {
	const overlayRef = useRef<HTMLDivElement>(null);

	// Lock body scroll while open
	useEffect(() => {
		if (artisan) {
			document.body.style.overflow = "hidden";
			overlayRef.current?.scrollTo(0, 0);
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [artisan]);

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	if (!artisan) return null;

	const av = AVATAR_COLORS[artisan.avatarIndex];

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto py-16 px-5"
			style={{ background: "rgba(0,0,0,0.72)" }}
			onClick={(e) => e.target === overlayRef.current && onClose()}
			role="dialog"
			aria-modal="true"
			aria-label={`${artisan.name} profile`}
		>
			<div
				className="w-full max-w-[540px] rounded-[20px] border overflow-hidden"
				style={{
					background: "var(--hh-bg2)",
					borderColor: "var(--hh-border2)",
				}}
			>
				{/* Header */}
				<div className="flex justify-end px-6 pt-5">
					<button
						type="button"
						onClick={onClose}
						aria-label="Close profile"
						className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[8px] border transition-colors duration-150"
						style={{
							background: "rgba(255,255,255,0.06)",
							borderColor: "var(--hh-border)",
							color: "var(--hh-txt3)",
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLButtonElement).style.color =
								"var(--hh-txt)";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLButtonElement).style.color =
								"var(--hh-txt3)";
						}}
					>
						<X size={16} aria-hidden />
					</button>
				</div>

				{/* Profile */}
				<div
					className="flex items-start gap-4 px-6 py-5 border-b"
					style={{ borderColor: "var(--hh-border)" }}
				>
					<div
						className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-medium shrink-0"
						style={{ background: av.bg, color: av.color }}
						aria-hidden
					>
						{artisan.initials}
					</div>
					<div className="flex-1">
						<p
							className="text-[20px] font-bold mb-0.5"
							style={{ fontFamily: "var(--font-syne)", color: "var(--hh-txt)" }}
						>
							{artisan.name}
						</p>
						<p className="text-[13px] mb-2" style={{ color: "var(--hh-txt3)" }}>
							{artisan.role} · {artisan.loc}
						</p>
						<div className="flex gap-1.5 flex-wrap">
							<span
								className="inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px]"
								style={{
									background: "rgba(74,222,128,0.1)",
									borderColor: "rgba(74,222,128,0.2)",
									color: "#4ADE80",
								}}
							>
								<Check size={11} aria-hidden /> Verified
							</span>
							<span
								className="inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px]"
								style={{
									background: "rgba(59,130,246,0.1)",
									borderColor: "rgba(59,130,246,0.2)",
									color: "var(--hh-or)",
								}}
							>
								<Star size={11} aria-hidden /> {artisan.rating} rating
							</span>
							<span
								className="inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px]"
								style={{
									background: "rgba(255,255,255,0.05)",
									borderColor: "var(--hh-border)",
									color: "var(--hh-txt3)",
								}}
							>
								<Briefcase size={11} aria-hidden /> {artisan.jobs} jobs done
							</span>
						</div>
					</div>
				</div>

				{/* Body */}
				<div className="px-6 py-5 flex flex-col gap-5">
					{/* About */}
					<div>
						<p
							className="text-[11px] uppercase tracking-[0.8px] mb-2.5"
							style={{ color: "var(--hh-txt3)" }}
						>
							About
						</p>
						<p
							className="text-[13.5px] leading-[1.65]"
							style={{ color: "var(--hh-txt2)" }}
						>
							{artisan.bio}
						</p>
					</div>

					{/* Stats */}
					<div>
						<p
							className="text-[11px] uppercase tracking-[0.8px] mb-2.5"
							style={{ color: "var(--hh-txt3)" }}
						>
							Stats
						</p>
						<div className="grid grid-cols-3 gap-2.5">
							{[
								{ v: String(artisan.rating), l: "Rating" },
								{ v: String(artisan.jobs), l: "Jobs done" },
								{ v: `₦${(artisan.rate / 1000).toFixed(0)}k`, l: "Per hour" },
							].map((s) => (
								<div
									key={s.l}
									className="rounded-[8px] p-3 text-center"
									style={{ background: "var(--hh-bg3)" }}
								>
									<div
										className="text-[18px] font-bold"
										style={{
											fontFamily: "var(--font-syne)",
											color: "var(--hh-txt)",
										}}
									>
										{s.v}
									</div>
									<div
										className="text-[11px] mt-0.5"
										style={{ color: "var(--hh-txt3)" }}
									>
										{s.l}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Reviews */}
					<div>
						<p
							className="text-[11px] uppercase tracking-[0.8px] mb-2.5"
							style={{ color: "var(--hh-txt3)" }}
						>
							Recent reviews
						</p>
						<div className="flex flex-col gap-2">
							{artisan.reviews.map((r, i) => (
								<div
									key={i}
									className="rounded-[8px] p-3"
									style={{ background: "var(--hh-bg3)" }}
								>
									<div
										className="flex gap-0.5 mb-1.5"
										aria-label={`${r.stars} stars`}
									>
										{Array.from({ length: r.stars }).map((_, j) => (
											<Star
												key={j}
												size={12}
												fill="#F59E0B"
												style={{ color: "#F59E0B" }}
												aria-hidden
											/>
										))}
									</div>
									<p
										className="text-[12.5px] leading-[1.5]"
										style={{ color: "var(--hh-txt2)" }}
									>
										{r.text}
									</p>
									<p
										className="text-[11px] mt-1.5"
										style={{ color: "var(--hh-txt3)" }}
									>
										— {r.by}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Gate CTA */}
					<div
						className="flex items-center gap-3.5 rounded-[12px] border p-4"
						style={{
							background: "rgba(59,130,246,0.06)",
							borderColor: "rgba(59,130,246,0.15)",
						}}
					>
						<div
							className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
							style={{ background: "rgba(59,130,246,0.1)" }}
						>
							<Lock size={18} style={{ color: "var(--hh-or)" }} aria-hidden />
						</div>
						<div className="flex-1">
							<p
								className="text-[13.5px] font-medium"
								style={{ color: "var(--hh-txt)" }}
							>
								Sign up to contact {artisan.name.split(" ")[0]}
							</p>
							<p className="text-[12px]" style={{ color: "var(--hh-txt3)" }}>
								Book, chat, and pay securely in one place
							</p>
						</div>
						<div className="flex flex-col gap-1.5 shrink-0">
							<button
								type="button"
								className="cursor-pointer rounded-[8px] px-4 py-1.5 text-[12.5px] font-medium text-white whitespace-nowrap"
								style={{ background: "var(--hh-or)", border: "none" }}
							>
								Sign up free
							</button>
							<button
								type="button"
								className="cursor-pointer rounded-[8px] border px-4 py-1.5 text-[12px] whitespace-nowrap transition-colors duration-150"
								style={{
									background: "transparent",
									borderColor: "var(--hh-border2)",
									color: "var(--hh-txt2)",
								}}
							>
								Sign in
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
