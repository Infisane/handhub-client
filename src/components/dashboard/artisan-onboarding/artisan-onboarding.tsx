import {
	Check,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	MapPin,
	ShieldCheck,
	Sparkles,
	User,
} from "lucide-react";
import { useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogContent,
} from "#/components/ui/alert-dialog.tsx";
import { HelperMethods } from "#/core/helpers/methods.helper";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { useUpdateProviderProfileQuery } from "#/core/queries/artisan.q";
import { set_auth_session } from "#/core/redux-store/slices/auth.slice";
import { reset_onboarding } from "#/core/redux-store/slices/onboarding.slice";
import { cn } from "#/lib/utils.ts";
import {
	StepAccountType,
	type StepAccountTypeHandle,
} from "./step-account-type";
import { StepLocation, type StepLocationHandle } from "./step-location";
import { StepServices, type StepServicesHandle } from "./step-services";
import {
	StepVerification,
	type StepVerificationHandle,
} from "./step-verification";
import { type OnboardingData, STEP } from "./types";

const STEPS = [
	{ title: "Account type", icon: User },
	{ title: "Location", icon: MapPin },
	{ title: "Your services", icon: Sparkles },
	{ title: "Verification", icon: ShieldCheck },
];

export interface ArtisanOnboardingProps {
	open: boolean;
	/** Called when the wizard is completed or skipped. */
	onComplete: (data: OnboardingData | null) => void;
}

export function ArtisanOnboarding({
	open,
	onComplete,
}: ArtisanOnboardingProps) {
	const [step, setStep] = useState(0);
	const [affirmed, setAffirmed] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const dispatch = useAppDispatch();
	const onboardingState = useAppSelector((s) => s.onboardingStore);
	const authUser = useAppSelector((s) => s.authStore.user);

	const { mutate, isPending } = useUpdateProviderProfileQuery({
		onSuccessCallback: (updatedUser) => {
			dispatch(set_auth_session({ user: updatedUser }));
			dispatch(reset_onboarding());
			setIsSuccess(true);
			setTimeout(() => onComplete(null), 2500);
		},
	});

	const stepRefs = [
		useRef<StepAccountTypeHandle>(null),
		useRef<StepLocationHandle>(null),
		useRef<StepServicesHandle>(null),
		useRef<StepVerificationHandle>(null),
	];

	const isLast = step === STEPS.length - 1;

	const handleFinish = () => {
		const s = onboardingState;
		if (!authUser || !s.accountType.accountType) return;
		mutate({
			fullName: authUser.fullName,
			phone: authUser.phone,
			accountType: s.accountType.accountType,
			stateCode: s.location.stateCode,
			lgaCode: s.location.lgaCode,
			wardCode: s.location.wardCode,
			address: s.location.address,
			latitude: s.location.latitude ? Number(s.location.latitude) : undefined,
			longitude: s.location.longitude
				? Number(s.location.longitude)
				: undefined,
			serviceIds: s.services.services,
			bio: s.services.bio,
			experience: Number(s.services.experience),
			minCharge: Number(s.services.minCharge),
			businessName: s.services.businessName || undefined,
			idType: s.verification.idType || undefined,
			idNumber: s.verification.idNumber || undefined,
			idDocumentUrl: s.verification.documentUrl || undefined,
			preferredCommunication: s.verification.communication.length
				? s.verification.communication
				: undefined,
			availability: HelperMethods.buildAvailabilityPayload(
				s.services.availabilityDays,
				s.services.availabilityFrom,
				s.services.availabilityTo,
			),
		});
	};

	const handleNext = () => {
		const valid = stepRefs[step].current?.validate() ?? true;
		if (!valid) return;
		if (isLast) {
			handleFinish();
			return;
		}
		setStep((s) => s + 1);
	};

	const handleBack = () => setStep((s) => Math.max(STEP.ACCOUNT_TYPE, s - 1));

	const handleSkip = () => {
		onComplete(null);
		dispatch(reset_onboarding());
	};

	const StepIcon = STEPS[step].icon;

	return (
		<AlertDialog open={open}>
			<AlertDialogContent className="p-0">
				{isSuccess ? (
					<div className="flex flex-col items-center justify-center gap-5 px-8 py-14 text-center">
						<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
							<CheckCircle2 size={34} className="text-green-500" />
						</div>
						<div>
							<h2 className="font-syne font-extrabold text-[17px] text-(--dashboard-text) mb-2">
								Profile setup complete!
							</h2>
							<p className="text-[13px] text-(--dashboard-muted) leading-relaxed max-w-[260px]">
								Your artisan profile is now live. Clients can discover and book
								you on Handhub.
							</p>
						</div>
						<div className="flex items-center gap-1.5 text-[11.5px] text-(--dashboard-muted)">
							<Loader2 size={12} className="animate-spin" />
							Closing…
						</div>
					</div>
				) : (
					<>
						{/* Header */}
						<div className="px-5 sm:px-6 pt-5 pb-4 border-b border-(--dashboard-border) bg-(--dashboard-card)">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-9 h-9 rounded-xl bg-(--dashboard-orange-light) border border-(--dashboard-orange-mid)/40 flex items-center justify-center text-(--dashboard-orange) shrink-0">
									<StepIcon size={17} />
								</div>
								<div className="min-w-0">
									<h2 className="font-syne font-extrabold text-[16px] leading-none text-(--dashboard-text)">
										Set up your artisan profile
									</h2>
									<p className="text-[11.5px] text-(--dashboard-muted) font-medium mt-1">
										Step {step + 1} of {STEPS.length} · {STEPS[step].title}
									</p>
								</div>
							</div>

							{/* Progress segments */}
							<div className="flex items-center gap-1.5">
								{STEPS.map((s, i) => (
									<div
										key={s.title}
										className={cn(
											"h-1.5 flex-1 rounded-full transition-colors duration-300",
											i <= step
												? "bg-(--dashboard-orange)"
												: "bg-(--dashboard-border)",
										)}
									/>
								))}
							</div>
						</div>

						{/* Body */}
						<div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1">
							{step === STEP.ACCOUNT_TYPE && (
								<StepAccountType ref={stepRefs[STEP.ACCOUNT_TYPE]} />
							)}
							{step === STEP.LOCATION && (
								<StepLocation ref={stepRefs[STEP.LOCATION]} />
							)}
							{step === STEP.SERVICES && (
								<StepServices ref={stepRefs[STEP.SERVICES]} />
							)}
							{step === STEP.VERIFICATION && (
								<StepVerification
									ref={stepRefs[STEP.VERIFICATION]}
									affirmed={affirmed}
									onAffirmChange={setAffirmed}
								/>
							)}
						</div>

						{/* Footer */}
						<div className="px-5 sm:px-6 py-4 border-t border-(--dashboard-border) bg-(--dashboard-bg) flex items-center gap-2.5">
							{step > STEP.ACCOUNT_TYPE ? (
								<button
									type="button"
									onClick={handleBack}
									className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-(--dashboard-border) text-[12.5px] font-bold text-(--dashboard-text) hover:bg-(--dashboard-card) transition-colors duration-150 cursor-pointer"
								>
									<ChevronLeft size={15} /> Back
								</button>
							) : (
								<span />
							)}

							<div className="ml-auto flex items-center gap-2.5">
								{isLast && (
									<button
										type="button"
										onClick={handleSkip}
										className="px-4 py-2.5 rounded-xl text-[12.5px] font-bold text-(--dashboard-muted) hover:text-(--dashboard-text) transition-colors duration-150 cursor-pointer"
									>
										Skip for now
									</button>
								)}
								<button
									type="button"
									onClick={handleNext}
									disabled={isPending || (isLast && !affirmed)}
									className={cn(
										"flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12.5px] font-extrabold text-white shadow-sm shadow-blue-500/20 transition-all duration-150",
										isPending || (isLast && !affirmed)
											? "bg-(--dashboard-orange)/70 cursor-not-allowed"
											: "bg-(--dashboard-orange) hover:bg-(--dashboard-blue-dark) cursor-pointer",
									)}
								>
									{isLast ? (
										isPending ? (
											<>
												<Loader2 size={15} className="animate-spin" /> Saving…
											</>
										) : (
											<>
												<Check size={15} className="stroke-3" /> Finish setup
											</>
										)
									) : (
										<>
											Continue <ChevronRight size={15} />
										</>
									)}
								</button>
							</div>
						</div>
					</>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
