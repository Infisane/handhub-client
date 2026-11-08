import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		tailwindcss(),
		// SPA build for static hosting (Cloudflare Pages): prerenders only the root
		// shell to index.html, which Pages serves for every unmatched route.
		tanstackStart({ spa: { enabled: true, prerender: { outputPath: "/index" } } }),
		viteReact(),
	],
	server: {
    hmr: {
      protocol: 'ws', // Use 'wss' if you are running over HTTPS
      host: 'localhost',
    }
  }
});

export default config;
