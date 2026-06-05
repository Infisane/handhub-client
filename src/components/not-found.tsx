import { Link, useNavigate } from "@tanstack/react-router";
import { Compass, Home, Search, Wrench, RefreshCw, CheckCircle2, Droplets, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { HHButton } from "#/components/hh/button";
import { HHLogo } from "#/components/hh/logo";

/**
 * Branded 404 page — wired as the router's defaultNotFoundComponent.
 * Matches the light Midnight Blue + gold theme, now with a highly interactive, 
 * acoustic-visual Lagos Pipeline game.
 */
export function NotFound() {
	const navigate = useNavigate();

	// Sound states (persisted in local storage)
	const [soundMuted, setSoundMuted] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("hh_404_mute") === "true";
		}
		return false;
	});

	// Interactive Pipe Game States
	const [angles, setAngles] = useState<number[]>([90, 270, 90]);
	const [isFixed, setIsFixed] = useState(false);
	const [movesCount, setMovesCount] = useState(0);
	const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; duration: number; color: string; size: number }[]>([]);

	// Web Audio API Sound Synthesizer
	const playSynthSound = (type: "click" | "align" | "success") => {
		if (soundMuted) return;
		try {
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioContextClass) return;
			const ctx = new AudioContextClass();
			const now = ctx.currentTime;

			if (type === "click") {
				// Mechanical metallic tap sound
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = "triangle";
				osc.frequency.setValueAtTime(160, now);
				osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

				gain.gain.setValueAtTime(0.12, now);
				gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

				osc.connect(gain);
				gain.connect(ctx.destination);
				osc.start();
				osc.stop(now + 0.09);

				// High-frequency bolt click transient
				const metalOsc = ctx.createOscillator();
				const metalGain = ctx.createGain();
				metalOsc.type = "sine";
				metalOsc.frequency.setValueAtTime(950, now);
				metalOsc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

				metalGain.gain.setValueAtTime(0.07, now);
				metalGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);

				metalOsc.connect(metalGain);
				metalGain.connect(ctx.destination);
				metalOsc.start();
				metalOsc.stop(now + 0.03);
			} else if (type === "align") {
				// Harmonic lock chime (two resonant tones)
				const osc1 = ctx.createOscillator();
				const osc2 = ctx.createOscillator();
				const gain = ctx.createGain();

				osc1.type = "sine";
				osc1.frequency.setValueAtTime(392, now); // G4
				osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.06); // C5

				osc2.type = "triangle";
				osc2.frequency.setValueAtTime(784, now); // G5
				osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.06); // C6

				gain.gain.setValueAtTime(0.08, now);
				gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);

				osc1.connect(gain);
				osc2.connect(gain);
				gain.connect(ctx.destination);
				osc1.start();
				osc2.start();
				osc1.stop(now + 0.2);
				osc2.stop(now + 0.2);
			} else if (type === "success") {
				// Water filling sound sweep
				for (let i = 0; i < 4; i++) {
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();
					osc.type = "sine";
					const baseF = 180 + i * 120;
					osc.frequency.setValueAtTime(baseF, now);
					osc.frequency.linearRampToValueAtTime(baseF + 90, now + 0.4);
					osc.frequency.linearRampToValueAtTime(baseF - 30, now + 0.7);

					gain.gain.setValueAtTime(0, now);
					gain.gain.linearRampToValueAtTime(0.04, now + 0.15);
					gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

					osc.connect(gain);
					gain.connect(ctx.destination);
					osc.start(now);
					osc.stop(now + 0.75);
				}

				// Celebratory pentatonic arpeggio chord (C4, E4, G4, C5, E5)
				const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
				notes.forEach((freq, idx) => {
					const osc = ctx.createOscillator();
					const gain = ctx.createGain();
					osc.type = "sine";
					osc.frequency.setValueAtTime(freq, now + 0.15);

					const noteStart = now + 0.15 + idx * 0.07;
					const duration = 0.55;

					gain.gain.setValueAtTime(0, now);
					gain.gain.setValueAtTime(0, noteStart);
					gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.03);
					gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

					osc.connect(gain);
					gain.connect(ctx.destination);
					osc.start(noteStart);
					osc.stop(noteStart + duration + 0.05);
				});
			}
		} catch (e) {
			console.warn("Audio Context init blocked or failed:", e);
		}
	};

	// Toggle volume mute and write to local storage
	const toggleMute = () => {
		setSoundMuted((prev) => {
			const next = !prev;
			localStorage.setItem("hh_404_mute", String(next));
			// Play a diagnostic click to give feedback if unmuting
			if (!next) {
				try {
					const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
					if (AudioContextClass) {
						const ctx = new AudioContextClass();
						const osc = ctx.createOscillator();
						const gain = ctx.createGain();
						osc.frequency.value = 440;
						gain.gain.setValueAtTime(0.05, ctx.currentTime);
						gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
						osc.connect(gain);
						gain.connect(ctx.destination);
						osc.start();
						osc.stop(ctx.currentTime + 0.12);
					}
				} catch {}
			}
			return next;
		});
	};

	// Initialize with randomized, unaligned starting angles
	const initializeGame = (shouldPlaySound = false) => {
		const possibleUnaligned = [90, 270];
		const initial = [
			possibleUnaligned[Math.floor(Math.random() * possibleUnaligned.length)],
			possibleUnaligned[Math.floor(Math.random() * possibleUnaligned.length)],
			possibleUnaligned[Math.floor(Math.random() * possibleUnaligned.length)],
		];
		setAngles(initial);
		setIsFixed(false);
		setMovesCount(0);
		if (shouldPlaySound) {
			playSynthSound("click");
		}
	};

	useEffect(() => {
		initializeGame(false);
	}, []);

	// Rain confetti when page is fixed
	useEffect(() => {
		if (isFixed) {
			const colors = ["#E8500A", "#1E3A8A", "#10B981", "#F59E0B", "#EC4899", "#3B82F6"];
			const items = Array.from({ length: 35 }).map((_, i) => ({
				id: i,
				left: Math.random() * 100,
				delay: Math.random() * 1.2,
				duration: 1.8 + Math.random() * 1.5,
				color: colors[Math.floor(Math.random() * colors.length)],
				size: 6 + Math.random() * 8,
			}));
			setConfetti(items);
		} else {
			setConfetti([]);
		}
	}, [isFixed]);

	// Click to rotate pipe segment by 90 degrees
	const rotatePipe = (index: number) => {
		if (isFixed) return;

		const newAngles = [...angles];
		const newAngle = (newAngles[index] + 90) % 360;
		newAngles[index] = newAngle;
		setAngles(newAngles);
		setMovesCount((prev) => prev + 1);

		const isSegmentAligned = newAngle === 0 || newAngle === 180;
		const allAligned = newAngles.every((angle) => angle === 0 || angle === 180);

		if (allAligned) {
			setIsFixed(true);
			playSynthSound("success");
		} else if (isSegmentAligned) {
			playSynthSound("align");
		} else {
			playSynthSound("click");
		}
	};

	// Determine gauge pressure variables
	const unalignedCount = angles.filter((a) => a !== 0 && a !== 180).length;
	const pressure = isFixed ? 0 : Math.round((unalignedCount / 3) * 100);
	const needleRotation = -90 + (pressure / 100) * 180;

	return (
		<main
			className="hh-page relative min-h-dvh flex flex-col items-center justify-center text-center px-6 py-12 overflow-hidden"
			style={{
				background:
					"radial-gradient(680px 320px at 50% -6%,rgba(30,58,138,0.04),transparent 60%)," +
					"radial-gradient(720px 360px at 100% 100%,rgba(30,58,138,0.06),transparent 60%)," +
					"var(--hh-bg)",
				color: "var(--hh-txt)",
			}}
		>
			{/* CSS Animations */}
			<style>{`
				@keyframes hhDrip {
					0% { transform: translateY(0) scale(0.8); opacity: 0.3; }
					50% { opacity: 0.8; }
					100% { transform: translateY(18px) scale(0.4); opacity: 0; }
				}
				@keyframes hhSpray1 {
					0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
					100% { transform: translate(-15px, -35px) scale(0.2); opacity: 0; }
				}
				@keyframes hhSpray2 {
					0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
					100% { transform: translate(15px, -40px) scale(0.2); opacity: 0; }
				}
				@keyframes hhFlowWater {
					0% { background-position: 0% 50%; }
					100% { background-position: 100% 50%; }
				}
				@keyframes hhJitter {
					0%, 100% { transform: rotate(var(--needle-rot)) translate(0, 0); }
					25% { transform: rotate(calc(var(--needle-rot) + 1.8deg)) translate(-0.4px, -0.4px); }
					75% { transform: rotate(calc(var(--needle-rot) - 1.8deg)) translate(0.4px, 0.4px); }
				}
				@keyframes hhConfettiFall {
					0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
					90% { opacity: 1; }
					100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
				}
				@keyframes hhSlideDown {
					0% { transform: translateY(-8px); opacity: 0; max-height: 0; }
					100% { transform: translateY(0); opacity: 1; max-height: 350px; }
				}
				.hh-drip-drop {
					animation: hhDrip 1s infinite linear;
				}
				.hh-spray-drop-1 {
					animation: hhSpray1 0.6s infinite linear;
				}
				.hh-spray-drop-2 {
					animation: hhSpray2 0.5s infinite linear;
				}
				.hh-water-flow {
					background: linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #2563eb 100%);
					background-size: 200% 100%;
					animation: hhFlowWater 1.2s infinite linear;
				}
				.hh-needle-jitter {
					animation: hhJitter 0.1s infinite linear;
				}
				.hh-confetti {
					position: fixed;
					top: -50px;
					animation: hhConfettiFall var(--dur) ease-in-out var(--delay) forwards;
					pointer-events: none;
					z-index: 50;
				}
				.hh-certificate {
					animation: hhSlideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				}
			`}</style>

			{/* Confetti celebration rendering */}
			{confetti.map((c) => (
				<div
					key={c.id}
					className="hh-confetti select-none"
					style={{
						left: `${c.left}%`,
						backgroundColor: c.color,
						width: `${c.size}px`,
						height: `${c.size}px`,
						borderRadius: c.id % 2 === 0 ? "50%" : "2px",
						"--dur": `${c.duration}s`,
						"--delay": `${c.delay}s`,
					} as React.CSSProperties}
				/>
			))}

			{/* Brand Logo */}
			<Link
				to="/"
				className="mb-8 transition-opacity duration-150 hover:opacity-80 shrink-0"
				aria-label="HandHub home"
			>
				<HHLogo theme="light" height={30} />
			</Link>

			{/* Header title & info */}
			<div className="relative z-10 max-w-[500px]">
				<div
					className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-extrabold mb-4"
					style={{
						background: "var(--hh-or-l)",
						borderColor: "var(--hh-or-m)",
						color: "var(--hh-or)",
						animation: "fadeUp .5s ease both",
					}}
				>
					<Compass size={13} className="animate-spin" style={{ animationDuration: "6s" }} /> 
					404 Error: Leak Detected
				</div>

				<h1
					className="font-extrabold tracking-[-1px] mb-3 leading-[1.15]"
					style={{
						fontFamily: "var(--font-syne)",
						fontSize: "clamp(26px,3.5vw,36px)",
						color: "var(--hh-txt)",
						animation: "fadeUp .6s .05s ease both",
					}}
				>
					This page wandered off the job site
				</h1>

				<p
					className="text-[14px] sm:text-[14.5px] leading-[1.65] mb-7 font-medium"
					style={{
						color: "var(--hh-txt2)",
						animation: "fadeUp .6s .1s ease both",
					}}
				>
					We couldn’t find the page you’re looking for. While our search crew tracks it down, practice your trade skills and seal the leaking Lagos pipe below!
				</p>
			</div>

			{/* Interactive Game Board */}
			<div
				className="w-full max-w-[420px] bg-[var(--hh-card)] border border-[var(--hh-border)] rounded-2xl p-5 mb-8 shadow-sm relative z-10 transition-all duration-300"
				style={{
					animation: "fadeUp .7s .15s ease both",
					borderColor: isFixed ? "rgba(34,197,94,0.3)" : "var(--hh-border)",
				}}
			>
				{/* Top bar with moves indicator */}
				<div className="flex items-center justify-between mb-4 border-b border-[var(--hh-border)] pb-3">
					<div className="flex items-center gap-2">
						<Wrench size={14} className={isFixed ? "text-green-500 animate-pulse" : "text-[var(--hh-txt3)]"} />
						<span className="text-[12px] font-extrabold uppercase tracking-wide text-[var(--hh-txt2)]">
							Lagos Pipeline Game
						</span>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-[11px] font-semibold text-[var(--hh-txt3)]">
							Moves: <strong className="text-[var(--hh-txt)]">{movesCount}</strong>
						</span>
					</div>
				</div>

				{/* Pressure Gauge & Details */}
				<div className="mb-4 flex flex-col items-center justify-center">
					<svg width="100" height="60" viewBox="0 0 100 60" className="select-none">
						<defs>
							<linearGradient id="hhGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" stopColor="#22C55E" />
								<stop offset="50%" stopColor="#F59E0B" />
								<stop offset="100%" stopColor="#EF4444" />
							</linearGradient>
						</defs>
						<path
							d="M 15 50 A 35 35 0 0 1 85 50"
							fill="none"
							stroke="var(--hh-border)"
							strokeWidth="8"
							strokeLinecap="round"
						/>
						<path
							d="M 15 50 A 35 35 0 0 1 85 50"
							fill="none"
							stroke="url(#hhGaugeGrad)"
							strokeWidth="8"
							strokeLinecap="round"
						/>
						<circle cx="50" cy="50" r="5" fill="var(--hh-txt)" />
						<g
							className={pressure > 0 ? "hh-needle-jitter" : ""}
							style={{
								"--needle-rot": `${needleRotation}deg`,
								transform: `rotate(${needleRotation}deg)`,
								transformOrigin: "50px 50px",
								transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
							} as React.CSSProperties}
						>
							<path d="M 48 50 L 50 15 L 52 50 Z" fill="#EF4444" />
						</g>
					</svg>
					<span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--hh-txt3)] mt-1">
						Pressure: <strong className={pressure > 60 ? "text-red-500" : pressure > 30 ? "text-yellow-600" : "text-green-600"}>{pressure} PSI</strong>
					</span>
				</div>

				{/* Visual Grid Layout of the pipeline */}
				<div className="flex items-center justify-between bg-[var(--hh-bg)] rounded-xl p-4 gap-1 relative overflow-hidden min-h-[92px] border border-[var(--hh-border)]">
					{/* Left Static Inlet Valve */}
					<div className="flex flex-col items-center shrink-0 relative">
						<svg width="32" height="40" viewBox="0 0 32 40" fill="none">
							<defs>
								<linearGradient id="hhStaticMetal" x1="0%" y1="0%" x2="0%" y2="100%">
									<stop offset="0%" stopColor="#334155" />
									<stop offset="50%" stopColor="#64748B" />
									<stop offset="100%" stopColor="#1E293B" />
								</linearGradient>
							</defs>
							<rect x="0" y="13" width="22" height="14" fill="url(#hhStaticMetal)" />
							<rect x="22" y="8" width="10" height="24" rx="3" fill="#475569" />
							<rect x="0" y="17" width="32" height="6" fill="#3B82F6" />
						</svg>
						{/* Dripping particle */}
						{!isFixed && (
							<div className="absolute left-[10px] bottom-[-2px] w-2 h-2 rounded-full bg-blue-500 hh-drip-drop pointer-events-none" />
						)}
					</div>

					{/* 3 Rotatable Pipe Segments */}
					<div className="flex-1 flex justify-around items-center">
						{angles.map((angle, idx) => {
							const isPipeAligned = angle === 0 || angle === 180;
							const showLeakLeft = idx === 0 && !isPipeAligned;
							const showLeakRight = (idx === 1 || idx === 2) && !isPipeAligned;

							return (
								<div key={idx} className="relative select-none">
									{/* Leaking water spray indicators */}
									{showLeakLeft && (
										<div className="absolute left-0 top-0 pointer-events-none z-10">
											<div className="absolute -left-2 -top-4 w-1.5 h-1.5 rounded-full bg-blue-400 hh-spray-drop-1" />
											<div className="absolute -left-1 -top-6 w-1 h-1 rounded-full bg-blue-300 hh-spray-drop-2" />
										</div>
									)}
									{showLeakRight && (
										<div className="absolute right-0 top-0 pointer-events-none z-10">
											<div className="absolute -right-2 -top-4 w-1.5 h-1.5 rounded-full bg-blue-400 hh-spray-drop-1" />
											<div className="absolute -right-1 -top-6 w-1 h-1 rounded-full bg-blue-300 hh-spray-drop-2" />
										</div>
									)}

									{/* Rotatable segment button */}
									<button
										type="button"
										onClick={() => rotatePipe(idx)}
										disabled={isFixed}
										aria-label={`Rotate pipe segment ${idx + 1}`}
										className={`w-14 h-14 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
											isFixed
												? "border-green-200/50 bg-green-500/5 cursor-default shadow-sm"
												: isPipeAligned
													? "border-[var(--hh-border2)] bg-[var(--hh-card)] hover:bg-[var(--hh-bg3)] hover:scale-105 shadow-sm"
													: "border-[var(--hh-or-m)]/60 bg-[var(--hh-or-l)]/20 hover:bg-[var(--hh-or-l)]/40 hover:scale-105"
										}`}
										style={{ transform: `rotate(${angle}deg)` }}
									>
										<svg width="56" height="56" viewBox="0 0 56 56" fill="none">
											<defs>
												<linearGradient id="hhPipeMetal" x1="0%" y1="0%" x2="0%" y2="100%">
													<stop offset="0%" stopColor="#475569" />
													<stop offset="25%" stopColor="#94A3B8" />
													<stop offset="50%" stopColor="#cbd5e1" />
													<stop offset="75%" stopColor="#475569" />
													<stop offset="100%" stopColor="#1e293b" />
												</linearGradient>
											</defs>

											{/* Pipe body cylinder */}
											<rect x="0" y="18" width="56" height="20" rx="3" fill="url(#hhPipeMetal)" />

											{/* Inner water stream */}
											{isFixed ? (
												<rect x="0" y="22" width="56" height="12" className="hh-water-flow" opacity={0.9} />
											) : (
												<rect
													x="0"
													y="22"
													width="56"
													height="12"
													fill="#3B82F6"
													opacity={isPipeAligned ? 0.75 : 0.15}
													className={isPipeAligned ? "animate-pulse" : ""}
												/>
											)}

											{/* Bolts/Joint details on the left and right edges */}
											<rect x="0" y="14" width="6" height="28" rx="2" fill="#64748B" stroke="#475569" strokeWidth="1" />
											<rect x="50" y="14" width="6" height="28" rx="2" fill="#64748B" stroke="#475569" strokeWidth="1" />

											{/* Flange bolt heads */}
											<circle cx="3" cy="18" r="1.2" fill="#e2e8f0" />
											<circle cx="3" cy="38" r="1.2" fill="#e2e8f0" />
											<circle cx="53" cy="18" r="1.2" fill="#e2e8f0" />
											<circle cx="53" cy="38" r="1.2" fill="#e2e8f0" />
										</svg>
									</button>
								</div>
							);
						})}
					</div>

					{/* Right Static Drain Outlet */}
					<div className="flex flex-col items-center shrink-0">
						<svg width="32" height="40" viewBox="0 0 32 40" fill="none">
							<rect x="0" y="8" width="10" height="24" rx="3" fill="#475569" />
							<rect x="10" y="13" width="22" height="14" fill="url(#hhStaticMetal)" />
							{isFixed ? (
								<rect x="0" y="17" width="32" height="6" className="hh-water-flow" />
							) : (
								<rect x="0" y="17" width="32" height="6" fill="#3B82F6" opacity={0.15} />
							)}
						</svg>
					</div>
				</div>

				{/* Game Status Footer & Controls */}
				<div className="mt-4 flex items-center justify-between text-left">
					{isFixed ? (
						<div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-bottom-1 duration-300">
							<CheckCircle2 size={16} className="shrink-0" />
							<div>
								<p className="text-[12px] font-extrabold leading-none">Pipeline sealed!</p>
								<span className="text-[10px] font-semibold text-green-700/80 leading-none">Emergency diagnostic: ₦0</span>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-2 text-[var(--hh-or)]">
							<Droplets size={16} className="animate-bounce shrink-0 text-blue-500" />
							<div>
								<p className="text-[12px] font-extrabold leading-none">Leak active!</p>
								<span className="text-[10px] font-semibold text-[var(--hh-txt3)] leading-none">Tap segments to rotate them.</span>
							</div>
						</div>
					)}

					<div className="flex items-center gap-2">
						{/* Sound Toggle Button */}
						<button
							type="button"
							onClick={toggleMute}
							aria-label={soundMuted ? "Unmute sounds" : "Mute sounds"}
							className="w-7 h-7 rounded-lg border border-[var(--hh-border)] flex items-center justify-center text-[var(--hh-txt3)] hover:text-[var(--hh-txt)] hover:bg-[var(--hh-bg3)] hover:border-[var(--hh-border2)] transition-colors cursor-pointer"
						>
							{soundMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
						</button>

						{/* Restart Button */}
						<button
							type="button"
							onClick={() => initializeGame(true)}
							aria-label="Restart game"
							className="w-7 h-7 rounded-lg border border-[var(--hh-border)] flex items-center justify-center text-[var(--hh-txt3)] hover:text-[var(--hh-txt)] hover:bg-[var(--hh-bg3)] hover:border-[var(--hh-border2)] transition-colors cursor-pointer"
						>
							<RefreshCw size={12} className={isFixed ? "" : "animate-spin"} style={{ animationDuration: isFixed ? "0s" : "6s" }} />
						</button>
					</div>
				</div>

				{/* Lagos Water Board dispatch receipt */}
				{isFixed && (
					<div className="hh-certificate mt-5 bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-left relative overflow-hidden">
						<div className="absolute right-3 top-3 border border-dashed border-green-600/30 text-green-600/30 font-extrabold text-[9px] px-2 py-0.5 rounded rotate-[-12deg] uppercase tracking-wider select-none pointer-events-none">
							₦0 Lagos Seal
						</div>
						
						<h4 className="text-[11px] font-extrabold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
							<CheckCircle2 size={12} /> Lagos Water Board Dispatch
						</h4>
						
						<div className="space-y-1.5 text-[11px] text-[var(--hh-txt2)]">
							<div className="flex justify-between">
								<span>Job Site:</span>
								<span className="font-semibold text-[var(--hh-txt)]">Lost 404 Route</span>
							</div>
							<div className="flex justify-between">
								<span>Emergency Plumber:</span>
								<span className="font-semibold text-[var(--hh-txt)]">You (Artisan #1)</span>
							</div>
							<div className="flex justify-between">
								<span>Status:</span>
								<span className="font-bold text-green-700">100% Sealed & Safe</span>
							</div>
							<div className="flex justify-between border-t border-dashed border-[var(--hh-border)] pt-1.5 mt-1.5">
								<span>Diagnostic Charge:</span>
								<span className="font-mono text-green-700 font-extrabold">₦0.00</span>
							</div>
							<div className="flex justify-between">
								<span>Moves Taken:</span>
								<span className="font-mono text-[var(--hh-txt)]">{movesCount} turns</span>
							</div>
						</div>
						
						<p className="text-[10px] text-green-800/70 italic mt-3 text-center border-t border-green-500/10 pt-2">
							"Prompt response. Good work done, leak fixed in a few taps!" — Customer Review
						</p>
					</div>
				)}
			</div>

			{/* CTAs */}
			<div
				className="flex items-center justify-center gap-3.5 flex-wrap relative z-10"
				style={{ animation: "fadeUp .7s .2s ease both" }}
			>
				<HHButton size="lg" onClick={() => navigate({ to: "/" })}>
					<Home size={17} aria-hidden /> Back home
				</HHButton>
				<HHButton
					variant="ghost"
					size="lg"
					onClick={() => navigate({ to: "/find" })}
				>
					<Search size={17} aria-hidden /> {isFixed ? "Book a real plumber anyway" : "Find a plumber now"}
				</HHButton>
			</div>
		</main>
	);
}
