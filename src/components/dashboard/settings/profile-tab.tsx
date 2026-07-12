import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useValidator } from "#/core/helpers/useValidator.helper";
import { useFileUpload } from "#/core/hooks/useFileUpload.hook";
import {
	useGetUserProfileQuery,
	useUpdateUserProfileQuery,
} from "#/core/queries/settings.q";
import { ProfileSchema } from "#/core/schemas/settings.schema";
import { SettingsSaveBar, useSavedFlash } from "./settings-save-bar.tsx";

const inputCls =
	"w-full px-3.5 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]";
const labelCls =
	"text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block";

function initialsOf(name: string) {
	return (
		name
			.split(" ")
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase())
			.join("") || "?"
	);
}

const EMPTY_FORM = { fullName: "", phone: "", address: "", bio: "" };

export function ProfileTab() {
	const { data: profile } = useGetUserProfileQuery();
	const [form, setForm] = useState(EMPTY_FORM);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [seededId, setSeededId] = useState<string | null>(null);
	const [saved, flashSaved] = useSavedFlash();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Seed the editable copy from the loaded profile (adjust state during render —
	// no effect). Re-seeds only when a different profile arrives.
	if (profile && profile.id !== seededId) {
		setSeededId(profile.id);
		setForm({
			fullName: profile.fullName ?? "",
			phone: profile.phone ?? "",
			address: profile.address ?? "",
			bio: profile.bio ?? "",
		});
		setAvatar(profile.avatar ?? null);
	}

	const { validate, revalidate, errors } = useValidator({
		schema: ProfileSchema,
		store: form,
	});

	const update = useUpdateUserProfileQuery({
		onSuccessCallback: (updated) => {
			setAvatar(updated.avatar ?? null);
			flashSaved();
		},
	});

	const { handleFileChange, isUploading, uploadError } = useFileUpload({
		folder: "profile-photo",
		onSuccess: (publicUrl) => update.mutate({ avatar: publicUrl }),
	});

	const setField = (field: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		revalidate(field, value);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		validate(() => update.mutate(form));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div>
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1">
					Personal Profile Details
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					Update your personal details and profile bio
				</p>
			</div>

			{/* Avatar */}
			<div className="flex items-center gap-4 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-4.5 shadow-xs shrink-0">
				{avatar ? (
					<img
						src={avatar}
						alt={form.fullName}
						className="w-14 h-14 rounded-full object-cover shrink-0 ring-4 ring-[var(--dashboard-orange-light)]/20 shadow-md"
					/>
				) : (
					<div className="w-14 h-14 rounded-full bg-[var(--dashboard-orange)] flex items-center justify-center text-lg font-black text-white shrink-0 ring-4 ring-[var(--dashboard-orange-light)]/20 shadow-md">
						{initialsOf(form.fullName)}
					</div>
				)}
				<div className="space-y-1.5 min-w-0">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onChange={handleFileChange}
						className="hidden"
					/>
					<div className="flex gap-2">
						<button
							type="button"
							disabled={isUploading}
							onClick={() => fileInputRef.current?.click()}
							className="py-1.5 px-3 bg-[var(--dashboard-orange-light)] hover:bg-[var(--dashboard-orange)] hover:text-white border border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)] rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-60"
						>
							<Upload size={12} />{" "}
							{isUploading ? "Uploading…" : "Replace Avatar"}
						</button>
						{avatar && (
							<button
								type="button"
								disabled={isUploading}
								onClick={() => update.mutate({ avatar: "" })}
								className="py-1.5 px-3 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)] rounded-lg text-[10.5px] font-bold cursor-pointer flex items-center gap-1 disabled:opacity-60"
							>
								<Trash2 size={12} /> Delete
							</button>
						)}
					</div>
					{uploadError ? (
						<span className="text-[10px] text-red-500 font-semibold block">
							{uploadError}
						</span>
					) : (
						<span className="text-[10px] text-[var(--dashboard-muted)] font-medium leading-none block">
							JPG, PNG or WebP, max size 2MB.
						</span>
					)}
				</div>
			</div>

			{/* Fields */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<label htmlFor="pf-fullName" className={labelCls}>
						Full Name
					</label>
					<input
						id="pf-fullName"
						type="text"
						value={form.fullName}
						onChange={(e) => setField("fullName", e.target.value)}
						placeholder="Your full name"
						className={inputCls}
					/>
					{errors.fullName && (
						<p className="text-[10.5px] text-red-500 font-semibold">
							{errors.fullName}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label htmlFor="pf-email" className={labelCls}>
						Email Address
					</label>
					<input
						id="pf-email"
						type="email"
						value={profile?.email ?? ""}
						readOnly
						disabled
						className={`${inputCls} opacity-70 cursor-not-allowed`}
						title="Email can't be changed here"
					/>
					<p className="text-[10px] text-[var(--dashboard-muted)]">
						Email can't be changed from settings.
					</p>
				</div>

				<div className="space-y-1.5">
					<label htmlFor="pf-phone" className={labelCls}>
						Mobile Phone Number
					</label>
					<input
						id="pf-phone"
						type="text"
						value={form.phone}
						onChange={(e) => setField("phone", e.target.value)}
						placeholder="+234 812 345 6789"
						className={inputCls}
					/>
				</div>

				<div className="space-y-1.5">
					<label htmlFor="pf-address" className={labelCls}>
						Address
					</label>
					<input
						id="pf-address"
						type="text"
						value={form.address}
						onChange={(e) => setField("address", e.target.value)}
						placeholder="Lekki, Lagos"
						className={inputCls}
					/>
				</div>
			</div>

			<div className="space-y-1.5">
				<label htmlFor="pf-bio" className={labelCls}>
					Biography / Description
				</label>
				<textarea
					id="pf-bio"
					rows={3}
					value={form.bio}
					onChange={(e) => setField("bio", e.target.value)}
					placeholder="Short description…"
					className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] resize-none"
				/>
			</div>

			<SettingsSaveBar isSaving={update.isPending} saved={saved} />
		</form>
	);
}
