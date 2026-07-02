import type { ReactNode } from "react";
import { useAppSelector } from "#/core/hooks/useStore.hook";
import type { UserType } from "#/core/helpers/constants.helper";

interface RoleGuardProps {
	allow: UserType | UserType[];
	children: ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
	const userType = useAppSelector((s) => s.authStore.user?.userType);
	const allowed = Array.isArray(allow) ? allow : [allow];
	if (!userType || !allowed.includes(userType)) return null;
	return <>{children}</>;
}
