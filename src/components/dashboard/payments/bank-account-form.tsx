import { Check, Landmark } from "lucide-react";
import { useState } from "react";
import { AppButton } from "#/components/ui/app-button";
import { getApiErrorMessage } from "#/core/helpers/error-handler.helper";
import {
	useGetBanksQuery,
	useSaveBankAccountQuery,
} from "#/core/queries/wallet.q";

const inputCls =
	"w-full px-3 py-2.5 rounded-xl bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] text-[12.5px] text-[var(--dashboard-text)] placeholder-[var(--dashboard-muted)] outline-none focus:border-[var(--dashboard-orange)] transition-colors disabled:opacity-50";
const errorCls = "text-[10.5px] text-red-500 font-semibold";

/** Bank account setup for withdrawals — one call both resolves the account
 * name via the gateway and saves it; the resolved name is shown back as
 * confirmation, not gated behind a second submit. */
export function BankAccountForm({ onSaved }: { onSaved: () => void }) {
	const [bankCode, setBankCode] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [serverError, setServerError] = useState<string | null>(null);
	const [savedName, setSavedName] = useState<string | null>(null);

	const { data: banks = [], isLoading: banksLoading } = useGetBanksQuery();

	const saveAccount = useSaveBankAccountQuery({
		onSuccessCallback: (account) => setSavedName(account.bankAccountName),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!bankCode || !accountNumber) return;
		setServerError(null);
		saveAccount.mutate(
			{ bankCode, accountNumber },
			{ onError: (err) => setServerError(getApiErrorMessage(err) ?? null) },
		);
	};

	if (savedName) {
		return (
			<div className="p-6 space-y-5 text-center">
				<div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
					<Check size={22} className="stroke-[2.5]" />
				</div>
				<div>
					<p className="text-[12px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider">
						Account verified
					</p>
					<p className="font-syne font-extrabold text-[18px] text-[var(--dashboard-text)] mt-1">
						{savedName}
					</p>
				</div>
				<button
					type="button"
					onClick={onSaved}
					className="w-full py-2.5 bg-[var(--dashboard-orange)] hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
				>
					Continue
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="p-6 space-y-5">
			<div className="space-y-2">
				<label
					htmlFor="bank-select"
					className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
				>
					Bank
				</label>
				<select
					id="bank-select"
					value={bankCode}
					onChange={(e) => setBankCode(e.target.value)}
					disabled={banksLoading}
					className={inputCls}
				>
					<option value="">
						{banksLoading ? "Loading banks…" : "Select your bank…"}
					</option>
					{banks.map((bank) => (
						<option key={bank.code} value={bank.code}>
							{bank.name}
						</option>
					))}
				</select>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="account-number"
					className="text-[11px] text-[var(--dashboard-muted)] font-bold uppercase tracking-wider block"
				>
					Account Number
				</label>
				<input
					id="account-number"
					type="text"
					inputMode="numeric"
					value={accountNumber}
					onChange={(e) => {
						setAccountNumber(e.target.value.replace(/\D/g, ""));
						setServerError(null);
					}}
					placeholder="0123456789"
					className={inputCls}
				/>
				{serverError && <p className={errorCls}>{serverError}</p>}
			</div>

			<AppButton
				type="submit"
				disabled={!bankCode || !accountNumber}
				isLoading={saveAccount.isPending}
				loadingText="Verifying…"
			>
				<Landmark size={14} />
				Verify &amp; Save
			</AppButton>
		</form>
	);
}
