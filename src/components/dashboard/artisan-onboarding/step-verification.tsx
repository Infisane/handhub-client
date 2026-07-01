import { FileText, Loader2, ShieldCheck, Upload } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { useFileUpload } from "#/core/hooks/useFileUpload.hook";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { VerificationSchema } from "#/core/schemas/artisan-onboarding.schema";
import {
	set_verification,
	toggle_communication,
} from "#/core/redux-store/slices/onboarding.slice";
import { Chip, Field, inputCls } from "./shared";

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

export interface StepVerificationHandle {
	validate: () => boolean;
}

interface StepVerificationProps {
	affirmed: boolean;
	onAffirmChange: (v: boolean) => void;
}

export const StepVerification = forwardRef<
	StepVerificationHandle,
	StepVerificationProps
>(({ affirmed, onAffirmChange }, ref) => {
	const dispatch = useAppDispatch();
	const data = useAppSelector((s) => s.onboardingStore.verification);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { validate } = useValidator({
		schema: VerificationSchema,
		store: data,
	});
	const { isUploading, uploadError, handleFileChange } = useFileUpload({
		folder: "identity-doc",
		onSuccess: (publicUrl, file) =>
			dispatch(
				set_verification({ documentName: file.name, documentUrl: publicUrl }),
			),
	});

	useImperativeHandle(ref, () => ({ validate }));

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-start gap-2.5 p-3 rounded-xl bg-(--dashboard-orange-light) border border-(--dashboard-orange-mid)/40">
				<ShieldCheck
					size={16}
					className="text-(--dashboard-orange) shrink-0 mt-0.5"
				/>
				<p className="text-[11.5px] text-(--dashboard-text) font-medium leading-snug">
					Verified artisans get a trust badge and rank higher in search. You can
					skip this and complete it later from Settings.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Field label="ID document type" htmlFor="ob-idtype">
					<select
						id="ob-idtype"
						className={inputCls}
						value={data.idType}
						onChange={(e) =>
							dispatch(set_verification({ idType: e.target.value }))
						}
					>
						<option value="">Select document</option>
						{ID_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</Field>
				<Field label="ID number" htmlFor="ob-idnum" optional>
					<input
						id="ob-idnum"
						className={inputCls}
						placeholder="Enter ID number"
						value={data.idNumber}
						onChange={(e) =>
							dispatch(set_verification({ idNumber: e.target.value }))
						}
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
							onClick={() => dispatch(toggle_communication(opt.value))}
						/>
					))}
				</div>
			</Field>

			<Field label="Document upload" optional>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className="w-full flex flex-col items-center justify-center gap-1.5 py-6 rounded-xl border-2 border-dashed border-(--dashboard-border) bg-(--dashboard-bg) hover:border-(--dashboard-orange-mid) hover:bg-(--dashboard-orange-light)/40 transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{isUploading ? (
						<>
							<Loader2
								size={18}
								className="text-(--dashboard-orange) animate-spin"
							/>
							<span className="text-[12px] font-semibold text-(--dashboard-text)">
								Uploading…
							</span>
						</>
					) : data.documentName ? (
						<span className="flex items-center gap-2 text-[12.5px] font-semibold text-(--dashboard-text)">
							<FileText size={15} className="text-(--dashboard-orange)" />
							{data.documentName}
						</span>
					) : (
						<>
							<Upload size={18} className="text-(--dashboard-muted)" />
							<span className="text-[12px] font-semibold text-(--dashboard-text)">
								Click to upload ID document
							</span>
							<span className="text-[10.5px] text-(--dashboard-muted)">
								PNG, JPG or PDF up to 10MB
							</span>
						</>
					)}
				</button>
				{uploadError && <p className="field-error">{uploadError}</p>}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,application/pdf"
					className="hidden"
					onChange={handleFileChange}
				/>
			</Field>

			<label className="flex items-start gap-3 cursor-pointer">
				<input
					type="checkbox"
					checked={affirmed}
					onChange={(e) => onAffirmChange(e.target.checked)}
					className="mt-0.5 shrink-0 w-4 h-4 rounded border border-(--dashboard-border) accent-(--dashboard-orange) cursor-pointer"
				/>
				<span className="text-[12px] text-(--dashboard-text) leading-snug">
					I confirm that all information provided above is true, accurate, and
					authentic. I understand that submitting false information may result in
					account suspension.
				</span>
			</label>
		</div>
	);
});

StepVerification.displayName = "StepVerification";
