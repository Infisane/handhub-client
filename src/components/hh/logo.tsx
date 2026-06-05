interface HHLogoProps {
	/** Visual theme — matches the background the logo sits on */
	theme?: "dark" | "light" | "on-blue";
	/** Show icon + wordmark ("wordmark") or icon alone ("mark") */
	variant?: "wordmark" | "mark";
	/** Rendered height in px; width scales proportionally */
	height?: number;
	className?: string;
}

/**
 * HandHub brand logo (Midnight Blue theme).
 *
 * Icon anatomy: left element = stylised capital H (hand/worker);
 * right element = lowercase h downstroke curve (artisan), dot above = person.
 */
export function HHLogo({
	theme = "dark",
	variant = "wordmark",
	height = 32,
	className,
}: HHLogoProps) {
	// Colour tokens per theme — Signal Blue brand
	const markBg = theme === "on-blue" ? "#fff" : "#3B82F6";
	const strokeCol = theme === "on-blue" ? "#3B82F6" : "#fff";
	const dotCol = theme === "on-blue" ? "#3B82F6" : "#BFDBFE";
	const wordmarkMain =
		theme === "dark" ? "#F8FAFC" : theme === "light" ? "#0F172A" : "#fff";
	const wordmarkAccent = theme === "on-blue" ? "#fff" : "#3B82F6";

	if (variant === "mark") {
		// 44×44 standalone icon mark
		const w = height;
		return (
			<svg
				width={w}
				height={height}
				viewBox="0 0 44 44"
				fill="none"
				role="img"
				aria-label="HandHub"
				className={className}
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>HandHub</title>
				<rect width="44" height="44" rx="11" fill={markBg} />
				<path
					d="M10 11 L10 33 M10 22 L19 22 M19 11 L19 33"
					stroke={strokeCol}
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M25 33 L25 21 C25 18 27.2 16.5 29.5 16.5 C31.8 16.5 34 18 34 21 L34 33"
					stroke={strokeCol}
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle cx="29.5" cy="12" r="2" fill={dotCol} />
			</svg>
		);
	}

	// Wordmark — icon (0–44) + text (48–220) in a 240×44 canvas
	// viewBox is 240 wide (not 220) to prevent the final glyph from clipping
	const w = Math.round(height * (240 / 44));
	return (
		<svg
			width={w}
			height={height}
			viewBox="0 0 240 44"
			fill="none"
			role="img"
			aria-label="HandHub"
			className={className}
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>HandHub</title>
			{/* Icon mark */}
			<rect x="0" y="4" width="36" height="36" rx="9" fill={markBg} />
			<path
				d="M10 13 L10 31 M10 22 L18 22 M18 13 L18 31"
				stroke={strokeCol}
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M23 31 L23 20 C23 17.2 25 16 27 16 C29 16 31 17.2 31 20 L31 31"
				stroke={strokeCol}
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle cx="27" cy="13" r="1.5" fill={dotCol} />
			{/* Wordmark text */}
			<text
				x="48"
				y="30"
				fontFamily="Plus Jakarta Sans, sans-serif"
				fontWeight="800"
				fontSize="26"
				letterSpacing="-0.8"
				fill={wordmarkMain}
			>
				hand
				<tspan fill={wordmarkAccent}>hub</tspan>
			</text>
		</svg>
	);
}
