import { useState } from "react";
import { cn } from "#/lib/utils.ts";

/** User avatar: shows the profile image when available, otherwise the initials.
 *  Falls back to initials if the image fails to load. */
export function UserAvatarBadge({
	avatar,
	initials,
	className,
}: {
	avatar: string | null | undefined;
	initials: string;
	className: string;
}) {
	const [failed, setFailed] = useState(false);

	if (avatar && !failed) {
		return (
			<img
				src={avatar}
				alt=""
				onError={() => setFailed(true)}
				className={cn(className, "object-cover")}
			/>
		);
	}

	return <div className={className}>{initials}</div>;
}
