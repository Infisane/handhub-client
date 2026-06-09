import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { containerVariants, itemVariants } from "./auth-motion.ts";

export interface ProofItem {
	icon: LucideIcon;
	title: string;
	subtitle: string;
}

function ProofCard({ icon: Icon, title, subtitle }: ProofItem) {
	return (
		<div className="proof-card p-4.5 md:p-5 gap-4">
			<div className="pc-icon w-10 h-10 md:w-11 md:h-11 rounded-[10px]">
				<Icon size={20} aria-hidden="true" />
			</div>
			<div className="flex flex-col justify-center">
				<div className="pc-t text-[14px] md:text-[15.5px] font-semibold mb-1">
					{title}
				</div>
				<div className="pc-s text-[12px] md:text-[13px] opacity-80">
					{subtitle}
				</div>
			</div>
		</div>
	);
}

interface AuthLeftPanelProps {
	eyebrowIcon: LucideIcon;
	eyebrowText: string;
	/** Heading content — may include an <em> for the "Handhub" accent. */
	heading: ReactNode;
	subheading: string;
	proofs: ProofItem[];
	/** Optional extra content (e.g. a testimonial) rendered below the proofs. */
	children?: ReactNode;
}

/**
 * Marketing left panel shared by the sign-in and sign-up pages: eyebrow,
 * heading, sub-copy and a stack of proof cards, with staggered entrance.
 */
export function AuthLeftPanel({
	eyebrowIcon: EyebrowIcon,
	eyebrowText,
	heading,
	subheading,
	proofs,
	children,
}: AuthLeftPanelProps) {
	return (
		<div className="panel-left">
			<div className="orb orb1" />
			<div className="orb orb2" />
			<motion.div
				className="left-content max-w-[460px] w-full flex flex-col gap-6 md:gap-8"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<motion.div
					className="left-eyebrow py-1.5 px-4 text-[13px] gap-2 mb-0 w-fit flex items-center"
					variants={itemVariants}
				>
					<EyebrowIcon size={15} aria-hidden="true" /> {eyebrowText}
				</motion.div>
				<motion.h2
					className="left-h text-[34px] md:text-[38px] lg:text-[44px] md:mb-0 leading-[1.15]"
					variants={itemVariants}
				>
					{heading}
				</motion.h2>
				<motion.p
					className="left-p text-[14px] md:text-[15.5px] lg:text-[16.5px] md:mb-0 opacity-90"
					variants={itemVariants}
				>
					{subheading}
				</motion.p>
				<motion.div
					className="proof-cards flex flex-col gap-3.5"
					variants={itemVariants}
				>
					{proofs.map((p) => (
						<ProofCard key={p.title} {...p} />
					))}
				</motion.div>
				{children}
			</motion.div>
		</div>
	);
}
