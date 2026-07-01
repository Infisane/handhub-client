import { LogOut } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog.tsx";

interface LogoutDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

export function LogoutDialog({ open, onClose, onConfirm }: LogoutDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-sm p-5 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] shadow-2xl rounded-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-3 text-[16px] font-extrabold text-[var(--dashboard-text)] font-syne">
						<div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
							<LogOut size={15} className="text-red-500" />
						</div>
						Log out of Handhub?
					</DialogTitle>
				</DialogHeader>
				<div className="mt-2 space-y-4">
					<p className="text-[12.5px] leading-relaxed text-[var(--dashboard-muted)]">
						You'll be signed out of your session. Any unsaved modifications in
						your workspace will be lost.
					</p>
					<div className="flex gap-2.5 pt-1">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-2.5 border border-[var(--dashboard-border)] hover:bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={onConfirm}
							className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white border border-red-700/10 rounded-xl text-xs font-extrabold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
						>
							<LogOut size={13} />
							Yes, log out
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
