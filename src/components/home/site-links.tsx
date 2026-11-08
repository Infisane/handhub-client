import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

/** A top-nav / footer entry. No `to` = the page isn't built yet. */
export interface SiteLinkDef {
	label: string;
	to?: "/" | "/find" | "/signup";
	/** Section id on the target page, e.g. "how-it-works". */
	hash?: string;
}

const HOW_IT_WORKS: SiteLinkDef = {
	label: "How it works",
	to: "/",
	hash: "how-it-works",
};

export const NAV_LINKS: SiteLinkDef[] = [
	HOW_IT_WORKS,
	{ label: "For artisans", to: "/", hash: "for-artisans" },
	{ label: "Pricing" },
	{ label: "Cities" },
];

export const FOOTER_COLS: { heading: string; links: SiteLinkDef[] }[] = [
	{
		heading: "Product",
		links: [
			HOW_IT_WORKS,
			{ label: "AI search", to: "/find" },
			{ label: "Pricing" },
			{ label: "Cities" },
		],
	},
	{
		heading: "Artisans",
		links: [
			{ label: "Join as artisan", to: "/signup" },
			{ label: "Verification" },
			{ label: "Artisan app" },
			{ label: "Payouts" },
		],
	},
	{
		heading: "Company",
		links: [
			{ label: "About" },
			{ label: "Blog" },
			{ label: "Careers" },
			{ label: "Contact" },
		],
	},
];

/** Real link when the destination exists; otherwise a plain label, so users
 *  never click something that silently does nothing (BUG-002). */
export function SiteLink({
	link,
	className,
	style,
}: {
	link: SiteLinkDef;
	className?: string;
	style?: CSSProperties;
}) {
	if (!link.to) {
		return (
			<span className={className} style={style} title="Coming soon">
				{link.label}
			</span>
		);
	}
	return (
		<Link
			to={link.to}
			hash={link.hash}
			className={`${className ?? ""} transition-colors duration-150 hover:text-(--hh-txt)`}
			style={style}
		>
			{link.label}
		</Link>
	);
}
