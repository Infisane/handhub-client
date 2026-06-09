import type { Variants } from "framer-motion";

/** Stagger container for the auth left-panel content. */
export const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.1,
		},
	},
};

/** Individual rise-in item used inside {@link containerVariants}. */
export const itemVariants: Variants = {
	hidden: { opacity: 0, y: 15 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 100,
			damping: 15,
		},
	},
};

/** Shared entrance for the right-hand form card. Spread onto a `motion.div`. */
export const formBoxMotion = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	transition: {
		type: "spring" as const,
		stiffness: 90,
		damping: 15,
		delay: 0.15,
	},
};
