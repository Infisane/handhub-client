import { createStart } from "@tanstack/react-start";

// SPA: the server renders only the root shell; every route renders client-side.
// Auth/geolocation state lives in localStorage (redux-persist), so SSR output
// could never match the client's first render.
export const startInstance = createStart(() => ({ defaultSsr: false }));
