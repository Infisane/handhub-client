import { useCallback, useEffect, useState } from "react";

/** Countdown for rate-limited actions (e.g. "Resend code"). `start()` begins it;
 *  `remaining` is whole seconds left (0 = ready). Derived from a deadline, not a
 *  tick count, so throttled background tabs still show the right time. */
export const useCooldown = (seconds: number) => {
	const [until, setUntil] = useState(0);
	const [remaining, setRemaining] = useState(0);

	useEffect(() => {
		if (!until) return;
		const tick = () => {
			const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
			setRemaining(left);
			return left;
		};
		if (tick() === 0) return;
		const id = setInterval(() => {
			if (tick() === 0) clearInterval(id);
		}, 250);
		return () => clearInterval(id);
	}, [until]);

	const start = useCallback(
		() => setUntil(Date.now() + seconds * 1000),
		[seconds],
	);

	return { remaining, start };
};
