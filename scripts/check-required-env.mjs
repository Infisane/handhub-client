import { loadEnv } from "vite";

// VITE_* vars are inlined into the bundle at build time. A missing one
// doesn't fail the build — it silently ships as `undefined`, which only
// surfaces later as a broken feature in production (e.g. Google sign-in's
// "Missing required parameter: client_id"). This runs before every build
// (local, `pnpm deploy`, and CI alike) so that failure mode becomes a loud,
// immediate error instead.
const REQUIRED_VARS = ["VITE_API_URL", "VITE_GOOGLE_CLIENT_ID"];

const env = loadEnv("production", process.cwd());
const missing = REQUIRED_VARS.filter((key) => !env[key]);

if (missing.length > 0) {
	console.error(
		`\nMissing required env var(s): ${missing.join(", ")}\n` +
			"Set them in .env.local for local builds, or as GitHub Actions repo " +
			"Variables for CI (see .github/workflows/deploy.yml's Build step).\n",
	);
	process.exit(1);
}
