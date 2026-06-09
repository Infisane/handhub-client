import {
	Building2,
	Check,
	ChevronLeft,
	ChevronRight,
	FileText,
	MapPin,
	ShieldCheck,
	Sparkles,
	Upload,
	User,
	Users,
} from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogContent,
} from "#/components/ui/alert-dialog.tsx";
import { cn } from "#/lib/utils.ts";

/* ─── Static option data ──────────────────────────────────────────────────── */

type AccountType = "individual" | "business" | "agency";

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

const NIGERIAN_STATES = [
	"Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
	"Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
	"FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
	"Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
	"Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const SERVICE_OPTIONS = [
	"Plumbing", "Electrical", "Carpentry", "Painting", "AC Repair", "Tiling",
	"Welding", "Generator Repair", "Cleaning", "Masonry", "Roofing", "POP Ceiling",
	"Solar Installation", "Appliance Repair", "Landscaping", "Pest Control",
];

const ID_TYPES = [
	"National ID (NIN)",
	"Driver's License",
	"International Passport",
	"Voter's Card",
];

const COMMUNICATION_OPTIONS = [
	{ value: "email", label: "Email" },
	{ value: "sms", label: "SMS" },
	{ value: "app", label: "App notification" },
];

const STEPS = [
	{ title: "Account type", icon: User },
	{ title: "Location", icon: MapPin },
	{ title: "Your services", icon: Sparkles },
	{ title: "Verification", icon: ShieldCheck },
];

/* ─── Form state ──────────────────────────────────────────────────────────── */

interface OnboardingData {
	accountType: AccountType | null;
	state: string;
	city: string;
	address: string;
	services: string[];
	businessName: string;
	bio: string;
	experience: string;
	workHours: string;
	minCharge: string;
	maxCharge: string;
	idType: string;
	idNumber: string;
	communication: string[];
	documentName: string;
}

const INITIAL_DATA: OnboardingData = {
	accountType: null,
	state: "",
	city: "",
	address: "",
	services: [],
	businessName: "",
	bio: "",
	experience: "",
	workHours: "",
	minCharge: "",
	maxCharge: "",
	idType: "",
	idNumber: "",
	communication: [],
	documentName: "",
};

/* ─── Reusable field primitives ───────────────────────────────────────────── */

const inputCls =
	"w-full rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-3.5 py-2.5 text-[13px] text-[var(--dashboard-text)] outline-none transition-colors duration-150 placeholder:text-[var(--dashboard-muted)] focus:border-[var(--dashboard-orange)] focus:ring-2 focus:ring-[var(--dashboard-orange)]/15";

function Field({
	label,
	htmlFor,
	optional,
	children,
}: {
	label: string;
	htmlFor?: string;
	optional?: boolean;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={htmlFor}
				className="text-[11.5px] font-bold text-[var(--dashboard-text)] flex items-center gap-1.5"
			>
				{label}
				{optional && (
					<span className="text-[10px] font-medium text-[var(--dashboard-muted)] normal-case">
						(optional)
					</span>
				)}
			</label>
			{children}
		</div>
	);
}

function Chip({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-150 cursor-pointer flex items-center gap-1.5",
				active
					? "bg-[var(--dashboard-orange)] text-white border-[var(--dashboard-orange)] shadow-sm"
					: "bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)] border-[var(--dashboard-border)] hover:border-[var(--dashboard-orange-mid)] hover:text-[var(--dashboard-text)]",
			)}
		>
			{active && <Check size={12} className="stroke-[3]" />}
			{label}
		</button>
	);
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export interface ArtisanOnboardingProps {
	open: boolean;
	/** Called when the wizard is completed or skipped. */
	onComplete: (data: OnboardingData | null) => void;
}

export function ArtisanOnboarding({ open, onComplete }: ArtisanOnboardingProps) {
	const [step, setStep] = useState(0);
	const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const uid = useId();

	const set = <K extends keyof OnboardingData>(
		key: K,
		value: OnboardingData[K],
	) => setData((prev) => ({ ...prev, [key]: value }));

	const toggleInArray = (key: "services" | "communication", value: string) =>
		setData((prev) => {
			const arr = prev[key];
			return {
				...prev,
				[key]: arr.includes(value)
					? arr.filter((v) => v !== value)
					: [...arr, value],
			};
		});

	// Per-step gating — step 4 (verification) is always skippable/optional.
	const canProceed = (() => {
		if (step === 0) return data.accountType !== null;
		if (step === 1)
			return (
				data.state.trim() !== "" &&
				data.city.trim() !== "" &&
				data.address.trim() !== ""
			);
		if (step === 2)
			return (
				data.services.length > 0 &&
				data.bio.trim() !== "" &&
				data.experience.trim() !== "" &&
				data.minCharge.trim() !== "" &&
				data.maxCharge.trim() !== ""
			);
		return true;
	})();

	const isLast = step === STEPS.length - 1;

	const handleNext = () => {
		if (!canProceed) return;
		if (isLast) {
			onComplete(data);
			return;
		}
		setStep((s) => s + 1);
	};

	const handleBack = () => setStep((s) => Math.max(0, s - 1));

	const StepIcon = STEPS[step].icon;

	return (
		<AlertDialog open={open}>
			<AlertDialogContent className="p-0">
				{/* Header */}
				<div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-card)]">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-9 h-9 rounded-xl bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)]/40 flex items-center justify-center text-[var(--dashboard-orange)] shrink-0">
							<StepIcon size={17} />
						</div>
						<div className="min-w-0">
							<h2 className="font-syne font-extrabold text-[16px] leading-none text-[var(--dashboard-text)]">
								Set up your artisan profile
							</h2>
							<p className="text-[11.5px] text-[var(--dashboard-muted)] font-medium mt-1">
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
										? "bg-[var(--dashboard-orange)]"
										: "bg-[var(--dashboard-border)]",
								)}
							/>
						))}
					</div>
				</div>

				{/* Body */}
				<div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1">
					{/* Step 1 — Account type */}
					{step === 0 && (
						<div className="flex flex-col gap-2.5">
							{ACCOUNT_TYPES.map((opt) => {
								const Icon = opt.icon;
								const active = data.accountType === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => set("accountType", opt.value)}
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
						</div>
					)}

					{/* Step 2 — Location */}
					{step === 1 && (
						<div className="flex flex-col gap-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Field label="State" htmlFor={`${uid}-state`}>
									<select
										id={`${uid}-state`}
										className={inputCls}
										value={data.state}
										onChange={(e) => set("state", e.target.value)}
									>
										<option value="">Select state</option>
										{NIGERIAN_STATES.map((s) => (
											<option key={s} value={s}>
												{s}
											</option>
										))}
									</select>
								</Field>
								<Field label="City" htmlFor={`${uid}-city`}>
									<input
										id={`${uid}-city`}
										className={inputCls}
										placeholder="e.g. Ikeja"
										value={data.city}
										onChange={(e) => set("city", e.target.value)}
									/>
								</Field>
							</div>
							<Field label="Business / Home address" htmlFor={`${uid}-address`}>
								<textarea
									id={`${uid}-address`}
									className={cn(inputCls, "resize-none")}
									rows={3}
									placeholder="Street address where you're based or operate from"
									value={data.address}
									onChange={(e) => set("address", e.target.value)}
								/>
							</Field>
						</div>
					)}

					{/* Step 3 — Services */}
					{step === 2 && (
						<div className="flex flex-col gap-4">
							<Field label="Services you offer">
								<div className="flex flex-wrap gap-2">
									{SERVICE_OPTIONS.map((svc) => (
										<Chip
											key={svc}
											label={svc}
											active={data.services.includes(svc)}
											onClick={() => toggleInArray("services", svc)}
										/>
									))}
								</div>
							</Field>

							<Field label="Business name" htmlFor={`${uid}-bizname`} optional>
								<input
									id={`${uid}-bizname`}
									className={inputCls}
									placeholder="e.g. SparkRight Electricals"
									value={data.businessName}
									onChange={(e) => set("businessName", e.target.value)}
								/>
							</Field>

							<Field label="Professional bio / about me" htmlFor={`${uid}-bio`}>
								<textarea
									id={`${uid}-bio`}
									className={cn(inputCls, "resize-none")}
									rows={3}
									placeholder="Tell clients about your experience, specialties and what sets you apart."
									value={data.bio}
									onChange={(e) => set("bio", e.target.value)}
								/>
							</Field>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Field label="Years of experience" htmlFor={`${uid}-exp`}>
									<input
										id={`${uid}-exp`}
										type="number"
										min="0"
										className={inputCls}
										placeholder="e.g. 5"
										value={data.experience}
										onChange={(e) => set("experience", e.target.value)}
									/>
								</Field>
								<Field label="Work hours / availability" htmlFor={`${uid}-hours`}>
									<input
										id={`${uid}-hours`}
										className={inputCls}
										placeholder="e.g. Mon–Sat, 8am–6pm"
										value={data.workHours}
										onChange={(e) => set("workHours", e.target.value)}
									/>
								</Field>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Field label="Minimum charge (₦)" htmlFor={`${uid}-min`}>
									<input
										id={`${uid}-min`}
										type="number"
										min="0"
										className={inputCls}
										placeholder="e.g. 5000"
										value={data.minCharge}
										onChange={(e) => set("minCharge", e.target.value)}
									/>
								</Field>
								<Field label="Maximum charge (₦)" htmlFor={`${uid}-max`}>
									<input
										id={`${uid}-max`}
										type="number"
										min="0"
										className={inputCls}
										placeholder="e.g. 50000"
										value={data.maxCharge}
										onChange={(e) => set("maxCharge", e.target.value)}
									/>
								</Field>
							</div>
						</div>
					)}

					{/* Step 4 — Verification */}
					{step === 3 && (
						<div className="flex flex-col gap-4">
							<div className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--dashboard-orange-light)] border border-[var(--dashboard-orange-mid)]/40">
								<ShieldCheck
									size={16}
									className="text-[var(--dashboard-orange)] shrink-0 mt-0.5"
								/>
								<p className="text-[11.5px] text-[var(--dashboard-text)] font-medium leading-snug">
									Verified artisans get a trust badge and rank higher in search.
									You can skip this and complete it later from Settings.
								</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Field label="ID document type" htmlFor={`${uid}-idtype`}>
									<select
										id={`${uid}-idtype`}
										className={inputCls}
										value={data.idType}
										onChange={(e) => set("idType", e.target.value)}
									>
										<option value="">Select document</option>
										{ID_TYPES.map((t) => (
											<option key={t} value={t}>
												{t}
											</option>
										))}
									</select>
								</Field>
								<Field label="ID number" htmlFor={`${uid}-idnum`} optional>
									<input
										id={`${uid}-idnum`}
										className={inputCls}
										placeholder="Enter ID number"
										value={data.idNumber}
										onChange={(e) => set("idNumber", e.target.value)}
									/>
								</Field>
							</div>

							<Field label="Preferred communication">
								<div className="flex flex-wrap gap-2">
									{COMMUNICATION_OPTIONS.map((opt) => (
										<Chip
											key={opt.value}
											label={opt.label}
											active={data.communication.includes(opt.value)}
											onClick={() => toggleInArray("communication", opt.value)}
										/>
									))}
								</div>
							</Field>

							<Field label="Document upload" optional>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-xl border-2 border-dashed border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] hover:border-[var(--dashboard-orange-mid)] hover:bg-[var(--dashboard-orange-light)]/40 transition-colors duration-150 cursor-pointer"
								>
									{data.documentName ? (
										<span className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--dashboard-text)]">
											<FileText size={15} className="text-[var(--dashboard-orange)]" />
											{data.documentName}
										</span>
									) : (
										<>
											<Upload size={18} className="text-[var(--dashboard-muted)]" />
											<span className="text-[12px] font-semibold text-[var(--dashboard-text)]">
												Click to upload ID document
											</span>
											<span className="text-[10.5px] text-[var(--dashboard-muted)]">
												PNG, JPG or PDF up to 5MB
											</span>
										</>
									)}
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/png,image/jpeg,application/pdf"
									className="hidden"
									onChange={(e) =>
										set("documentName", e.target.files?.[0]?.name ?? "")
									}
								/>
							</Field>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-5 sm:px-6 py-4 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] flex items-center gap-2.5">
					{step > 0 ? (
						<button
							type="button"
							onClick={handleBack}
							className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--dashboard-border)] text-[12.5px] font-bold text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card)] transition-colors duration-150 cursor-pointer"
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
								onClick={() => onComplete(null)}
								className="px-4 py-2.5 rounded-xl text-[12.5px] font-bold text-[var(--dashboard-muted)] hover:text-[var(--dashboard-text)] transition-colors duration-150 cursor-pointer"
							>
								Skip for now
							</button>
						)}
						<button
							type="button"
							onClick={handleNext}
							disabled={!canProceed}
							className={cn(
								"flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12.5px] font-extrabold transition-all duration-150",
								canProceed
									? "bg-[var(--dashboard-orange)] text-white hover:bg-[var(--dashboard-blue-dark)] cursor-pointer shadow-sm shadow-blue-500/20"
									: "bg-[var(--dashboard-border)] text-[var(--dashboard-muted)] cursor-not-allowed",
							)}
						>
							{isLast ? (
								<>
									<Check size={15} className="stroke-[3]" /> Finish setup
								</>
							) : (
								<>
									Continue <ChevronRight size={15} />
								</>
							)}
						</button>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
