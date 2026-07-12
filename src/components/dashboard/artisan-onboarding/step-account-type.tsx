import { Building2, Check, User, Users } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { AccountTypeSchema } from "#/core/schemas/artisan-onboarding.schema";
import { set_account_type } from "#/core/redux-store/slices/onboarding.slice";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { cn } from "#/lib/utils";
import type { AccountType } from "./types";

const ACCOUNT_TYPES: {
	value: AccountType;
	label: string;
	desc: string;
	icon: typeof User;
}[] = [
	{
		value: "individual",
		label: "Individual / Freelancer",
		desc: "You work solo and offer your own services directly.",
		icon: User,
	},
	{
		value: "business",
		label: "Registered Business",
		desc: "You operate a registered company with CAC details.",
		icon: Building2,
	},
	{
		value: "agency",
		label: "Agency",
		desc: "You manage a team of artisans under one brand.",
		icon: Users,
	},
];

export interface StepAccountTypeHandle {
	validate: () => boolean;
}

export const StepAccountType = forwardRef<StepAccountTypeHandle, object>(
	(_, ref) => {
		const dispatch = useAppDispatch();
		const data = useAppSelector((s) => s.onboardingStore.accountType);
		const { validate, errors } = useValidator({
			schema: AccountTypeSchema,
			store: data as unknown as Record<string, unknown>,
		});

		useImperativeHandle(ref, () => ({ validate }));

		return (
			<div className="flex flex-col gap-2.5">
				{ACCOUNT_TYPES.map((opt) => {
					const Icon = opt.icon;
					const active = data.accountType === opt.value;
					return (
						<button
							key={opt.value}
							type="button"
							onClick={() => dispatch(set_account_type(opt.value))}
							className={cn(
								"flex items-center gap-3.5 text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer",
								active
									? "border-[var(--dashboard-orange)] bg-[var(--dashboard-orange-light)] ring-2 ring-[var(--dashboard-orange)]/15"
									: "border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] hover:border-[var(--dashboard-orange-mid)]",
							)}
						>
							<div
								className={cn(
									"w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150",
									active
										? "bg-[var(--dashboard-orange)] text-white"
										: "bg-[var(--dashboard-card)] text-[var(--dashboard-muted)] border border-[var(--dashboard-border)]",
								)}
							>
								<Icon size={18} />
							</div>
							<div className="min-w-0 flex-1">
								<div className="text-[13.5px] font-bold text-[var(--dashboard-text)]">
									{opt.label}
								</div>
								<div className="text-[11.5px] text-[var(--dashboard-muted)] font-medium leading-snug mt-0.5">
									{opt.desc}
								</div>
							</div>
							<div
								className={cn(
									"w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors duration-150",
									active
										? "border-[var(--dashboard-orange)] bg-[var(--dashboard-orange)]"
										: "border-[var(--dashboard-border)]",
								)}
							>
								{active && (
									<Check size={11} className="text-white stroke-[3]" />
								)}
							</div>
						</button>
					);
				})}
				{errors.accountType && (
					<p className="field-error">{errors.accountType}</p>
				)}
			</div>
		);
	},
);

StepAccountType.displayName = "StepAccountType";
