import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { HHLogo } from "#/components/hh/logo";
import { Nav } from "#/components/home/nav";
import { Separator } from "#/components/ui/separator";

export const Route = createFileRoute("/_public")({ component: Layout });

const FOOTER_COLS = [
	{
		heading: "Product",
		links: ["How it works", "AI search", "Pricing", "Cities"],
	},
	{
		heading: "Artisans",
		links: ["Join as artisan", "Verification", "Artisan app", "Payouts"],
	},
	{ heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
];

function Layout() {
	const { pathname } = useLocation();
	const showLinks = pathname !== "/find";

	return (
		<div className="hh-page">
			<Nav showLinks={showLinks} />
			<Outlet />

			{/* ── Footer ──────────────────────────────────────────────────────── */}
			<footer
				className="px-[5%] pt-12 pb-8 border-t"
				style={{ borderColor: "var(--hh-border)" }}
			>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
					<div className="lg:col-span-1">
						<div className="mb-3">
							<HHLogo theme="dark" height={28} />
						</div>
						<p
							className="text-[13px] leading-[1.7] max-w-[260px]"
							style={{ color: "var(--hh-txt3)" }}
						>
							Nigeria's AI-powered artisan marketplace. Connecting skilled hands
							with people who need them — fast, safely, and fairly.
						</p>
					</div>
					{FOOTER_COLS.map((col) => (
						<div key={col.heading}>
							<h4
								className="text-[12px] font-medium uppercase tracking-[0.8px] mb-3.5"
								style={{ color: "var(--hh-txt)" }}
							>
								{col.heading}
							</h4>
							{col.links.map((l) => (
								<a
									key={l}
									href="#"
									className="block text-[13px] mb-2.5 transition-colors duration-150 hover:text-(--hh-txt)"
									style={{ color: "var(--hh-txt3)" }}
								>
									{l}
								</a>
							))}
						</div>
					))}
				</div>
				<Separator style={{ background: "var(--hh-border)" }} />
				<div className="flex items-center justify-between pt-6">
					<p className="text-[12px]" style={{ color: "var(--hh-txt3)" }}>
						© 2026 Handhub Technologies Ltd. All rights reserved.
					</p>
					<div className="flex gap-2.5">
						{["X", "IG", "in"].map((label) => (
							<button
								key={label}
								type="button"
								aria-label={label}
								className="w-8 h-8 rounded-[8px] border flex items-center justify-center cursor-pointer text-[11px] font-semibold transition-all duration-150"
								style={{
									background: "rgba(255,255,255,0.05)",
									borderColor: "var(--hh-border)",
									color: "var(--hh-txt3)",
									fontFamily: "var(--font-syne)",
								}}
								onMouseEnter={(e) => {
									const el = e.currentTarget;
									el.style.background = "rgba(232,80,10,0.1)";
									el.style.borderColor = "rgba(232,80,10,0.3)";
									el.style.color = "var(--hh-or)";
								}}
								onMouseLeave={(e) => {
									const el = e.currentTarget;
									el.style.background = "rgba(255,255,255,0.05)";
									el.style.borderColor = "var(--hh-border)";
									el.style.color = "var(--hh-txt3)";
								}}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
