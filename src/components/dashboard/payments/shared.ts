import { AlertCircle, ArrowDownLeft, ArrowUpRight, Lock } from "lucide-react";
import type { TxCategory } from "#/core/types/chat.types";

export const txConfig: Record<
	TxCategory,
	{ label: string; icon: typeof ArrowDownLeft; color: string; bg: string }
> = {
	deposit: {
		label: "Deposit",
		icon: ArrowDownLeft,
		color: "text-green-600 dark:text-green-400",
		bg: "bg-green-50 dark:bg-green-500/10",
	},
	withdrawal: {
		label: "Withdrawal",
		icon: ArrowUpRight,
		color: "text-neutral-700 dark:text-neutral-300",
		bg: "bg-neutral-100 dark:bg-neutral-800",
	},
	payment: {
		label: "Payment",
		icon: ArrowUpRight,
		color: "text-neutral-700 dark:text-neutral-300",
		bg: "bg-neutral-100 dark:bg-neutral-800",
	},
	release: {
		label: "Escrow Released",
		icon: Lock,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-50 dark:bg-blue-500/10",
	},
	refund: {
		label: "Refund",
		icon: ArrowDownLeft,
		color: "text-blue-600 dark:text-blue-400",
		bg: "bg-blue-50 dark:bg-blue-500/10",
	},
	clawback: {
		label: "Clawback",
		icon: AlertCircle,
		color: "text-red-600 dark:text-red-400",
		bg: "bg-red-50 dark:bg-red-500/10",
	},
};

export const TABS = [
	"all",
	"deposit",
	"payment",
	"withdrawal",
	"refund",
] as const;
export type Tab = (typeof TABS)[number];

export function formatDateTime(iso: string) {
	const d = new Date(iso);
	return {
		date: d.toLocaleDateString([], {
			month: "short",
			day: "numeric",
			year: "numeric",
		}),
		time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
	};
}

export function initialsOf(name: string) {
	return name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");
}
