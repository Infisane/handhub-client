import { useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";

interface RevealProps {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

export function Reveal({ children, className, style }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const obs = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					setVisible(true);
					obs.unobserve(el);
				}
			},
			{ threshold: 0.1 },
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn(
				"transition-[opacity,transform] duration-[600ms] ease-out",
				visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
				className,
			)}
			style={style}
		>
			{children}
		</div>
	);
}
