import { useEffect, useRef, useState } from "react";

interface SocialAuthButtonsProps {
	/** Action verb for aria-labels, e.g. "Sign in" / "Sign up". */
	verb: string;
	/** Divider caption, e.g. "or continue with" / "or sign up with". */
	dividerLabel: string;
	/** Fires with the raw Google ID token once the user completes the Google flow. */
	onGoogleCredential: (idToken: string) => void;
}

/** Divider + Google/Apple social login buttons shared by the auth pages.
 *
 * The Google button is the app's own custom-styled `.soc-btn`, not Google's
 * native rendered button — Google Identity Services has no supported API to
 * trigger the real credential flow from an arbitrary element, so a real
 * (invisible) `renderButton()` output is stacked exactly on top of it. The
 * visible button is purely decorative; clicks land on Google's element. */
export function SocialAuthButtons({
	verb,
	dividerLabel,
	onGoogleCredential,
}: SocialAuthButtonsProps) {
	const googleBtnRef = useRef<HTMLButtonElement>(null);
	const gsiContainerRef = useRef<HTMLDivElement>(null);
	const initializedRef = useRef(false);
	const [gsiLoaded, setGsiLoaded] = useState(false);

	useEffect(() => {
		if (window.google?.accounts?.id) {
			setGsiLoaded(true);
			return;
		}
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = () => setGsiLoaded(true);
		document.head.appendChild(script);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: onGoogleCredential is a stable per-render closure from the parent route, not a reactive dependency; adding it would re-init Google + re-render the button on every parent render
	useEffect(() => {
		if (!gsiLoaded || !window.google) return;

		if (!initializedRef.current) {
			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: (response) => onGoogleCredential(response.credential),
			});
			initializedRef.current = true;
		}

		const renderGsiButton = () => {
			if (!googleBtnRef.current || !gsiContainerRef.current || !window.google)
				return;
			gsiContainerRef.current.innerHTML = "";
			window.google.accounts.id.renderButton(gsiContainerRef.current, {
				type: "standard",
				width: Math.round(googleBtnRef.current.offsetWidth),
			});
		};

		renderGsiButton();

		let resizeTimeout: ReturnType<typeof setTimeout>;
		const observer = new ResizeObserver(() => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(renderGsiButton, 150);
		});
		if (googleBtnRef.current) observer.observe(googleBtnRef.current);

		return () => {
			clearTimeout(resizeTimeout);
			observer.disconnect();
		};
	}, [gsiLoaded]);

	return (
		<>
			<div className="divider">
				<span>{dividerLabel}</span>
			</div>
			<div className="social-btns">
				<div style={{ position: "relative", flex: 1 }}>
					<button
						ref={googleBtnRef}
						type="button"
						className="soc-btn"
						style={{ width: "100%" }}
						aria-label={`${verb} with Google`}
					>
						<svg className="soc-icon" viewBox="0 0 24 24" fill="none">
							<title>Google</title>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</button>
					<div
						ref={gsiContainerRef}
						aria-hidden="true"
						style={{
							position: "absolute",
							inset: 0,
							opacity: 0,
							overflow: "hidden",
							zIndex: 10,
						}}
					/>
				</div>
			</div>
		</>
	);
}
