import { Upload } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface ProfileTabProps {
	name: string;
	setName: Dispatch<SetStateAction<string>>;
	email: string;
	setEmail: Dispatch<SetStateAction<string>>;
	phone: string;
	setPhone: Dispatch<SetStateAction<string>>;
	address: string;
	setAddress: Dispatch<SetStateAction<string>>;
	bio: string;
	setBio: Dispatch<SetStateAction<string>>;
}

const inputCls =
	"w-full px-3.5 py-2 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] font-semibold text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)]";
const labelCls =
	"text-[10.5px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block";

export function ProfileTab({
	name,
	setName,
	email,
	setEmail,
	phone,
	setPhone,
	address,
	setAddress,
	bio,
	setBio,
}: ProfileTabProps) {
	return (
		<>
			<div>
				<h3 className="font-syne font-extrabold text-[15px] sm:text-[16px] text-[var(--dashboard-text)] leading-none mb-1 flex items-center gap-2">
					Personal Profile Details
				</h3>
				<p className="text-[11px] text-[var(--dashboard-muted)]">
					Update your personal coordinates and profile bio
				</p>
			</div>

			{/* Premium Avatar Modification Section */}
			<div className="flex items-center gap-4 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-2xl p-4.5 shadow-xs shrink-0">
				<div className="w-14 h-14 rounded-full bg-[var(--dashboard-orange)] flex items-center justify-center text-lg font-black text-white shrink-0 border border-white/10 ring-4 ring-[var(--dashboard-orange-light)]/20 shadow-md">
					AK
				</div>
				<div className="space-y-1.5 min-w-0">
					<div className="flex gap-2">
						<button
							type="button"
							className="py-1.5 px-3 bg-[var(--dashboard-orange-light)] hover:bg-[var(--dashboard-orange)] hover:text-white border border-[var(--dashboard-orange-mid)] text-[var(--dashboard-orange)] rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 cursor-pointer transition-all"
						>
							<Upload size={12} /> Replace Avatar
						</button>
						<button
							type="button"
							className="py-1.5 px-3 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-muted)] rounded-lg text-[10.5px] font-bold cursor-pointer"
						>
							Delete
						</button>
					</div>
					<span className="text-[10px] text-[var(--dashboard-muted)] font-medium leading-none block">
						JPG or PNG, max size 2MB. Fits cleanly inside circular badges.
					</span>
				</div>
			</div>

			{/* Main Profile Grid inputs */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<label className={labelCls}>Full Username Name</label>
					<input
						type="text"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Adeola Kamara"
						className={inputCls}
					/>
				</div>

				<div className="space-y-1.5">
					<label className={labelCls}>Verified Email Address</label>
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="adeola@handhub.co"
						className={inputCls}
					/>
				</div>

				<div className="space-y-1.5">
					<label className={labelCls}>Mobile Telephone Number</label>
					<input
						type="text"
						required
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="+234 812 345 6789"
						className={inputCls}
					/>
				</div>

				<div className="space-y-1.5">
					<label className={labelCls}>Primary Address Coordinate</label>
					<input
						type="text"
						required
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						placeholder="Lekki, Lagos"
						className={inputCls}
					/>
				</div>
			</div>

			<div className="space-y-1.5">
				<label className={labelCls}>
					Biography / Description (Community notes)
				</label>
				<textarea
					rows={3}
					value={bio}
					onChange={(e) => setBio(e.target.value)}
					placeholder="Short description..."
					className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] resize-none"
				/>
			</div>
		</>
	);
}
