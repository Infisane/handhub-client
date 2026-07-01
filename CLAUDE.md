# Handhub Client — Project Reference

## Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (`@tanstack/react-start`) — SSR React on Cloudflare Workers |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Server-side data | `@tanstack/react-router-ssr-query` — auto-wires `QueryClientProvider` |
| Client-side data | TanStack Query v5 (`@tanstack/react-query`) |
| Styling | Custom CSS classes + Tailwind v4 (both coexist) |
| Animations | Framer Motion |
| Icons | Lucide React |
| HTTP client | Axios (`src/core/helpers/axios.helper.ts`) |
| Validation | Zod v4 + `useValidator` hook |
| Linting/Formatting | Biome (`pnpm check`, `pnpm lint`, `pnpm format`) |
| Testing | Vitest + Testing Library (`pnpm test`) |
| Package manager | pnpm |
| Deploy | `pnpm deploy` → Wrangler → Cloudflare Workers |
| Notifications | Sonner (toasts) |

## Import Alias

`#/` maps to `src/`. Always use it for cross-module imports (e.g. `#/core/helpers/axios.helper`).

## Environment Variables

- `VITE_API_URL` — base URL for the backend API. Set in `.env.local` (not committed).

## File Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Service | `src/core/services/*.service.ts` | `auth.service.ts` |
| Query hook | `src/core/queries/*.q.ts` | `auth.q.ts` |
| Schema | `src/core/schemas/*.schema.ts` | `auth.schema.ts` |
| Helper | `src/core/helpers/*.helper.ts` | `axios.helper.ts` |
| Hook | `src/core/hooks/*.hook.ts` | `useStore.hook.ts` |
| Context | `src/core/contexts/*.context.tsx` | `auth.context.tsx` |
| Constant | `src/core/helpers/constants.helper.ts` | `USER_TYPES`, `UserType` |
| Types | `src/core/types/*.types.ts` | `auth.types.ts` |

---

## API Integration Pattern (Three Layers)

Every API feature follows this exact three-layer structure:

### 1. Service layer (`src/core/services/*.service.ts`)

Pure async functions. Use the shared `request` axios instance and `getRequestData<T>()` to unwrap `.data`.

```ts
import { getRequestData, request } from "#/core/helpers/axios.helper";

export const loginService = ({ payload, signal }: { payload: LoginPayload; signal?: AbortSignal }) =>
  getRequestData<AuthSession>(request.post("/api/auth/login", payload, { signal }));
```

- Always type the generic on `getRequestData<T>()`.
- Pass `signal?: AbortSignal` for cancellability.
- Keep services as plain functions, not classes.

### 2. Query layer (`src/core/queries/*.q.ts`)

TanStack Query mutations (or queries). Named `useXxxQuery` by convention even for mutations.

```ts
import { useMutation } from "@tanstack/react-query";
import { abortController } from "../helpers/axios.helper";

export const useLoginQuery = ({ onSuccessCallback }: { onSuccessCallback?: (session: AuthSession) => void } = {}) =>
  useMutation({
    mutationFn: (payload: LoginPayload) => loginService({ payload, signal: abortController.signal }),
    onSuccess: (session) => onSuccessCallback?.(session),
  });
```

- Always pass `abortController.signal`.
- `onSuccessCallback` is optional and typed with the response shape.
- Do not put UI logic or navigation here — that belongs in the route/component.

### 3. Presentation layer (route/component)

Smart routes consume query hooks; dumb components receive only props.

```ts
const { mutate, isPending } = useLoginQuery({
  onSuccessCallback: (session) => { login(session); navigate({ to: "/dashboard" }); },
});
```

### Central Error Handling

`QueryClient` in `src/router.tsx` wires `ErrorHandler.parser` for all query/mutation errors:

```ts
queryCache: new QueryCache({ onError: (error) => ErrorHandler.parser(error) }),
mutationCache: new MutationCache({ onError: (error) => ErrorHandler.parser(error) }),
```

`ErrorHandler.parser` (`src/core/helpers/error-handler.helper.ts`) reads `error.response.data.message` from Axios errors and falls back to a generic toast. Individual query hooks do **not** need their own error handling.

---

## Form Validation Pattern

Three-part pattern: **Schema → `useValidator` → controlled component with `error` prop**.

### 1. Zod schema (`src/core/schemas/*.schema.ts`)

One schema file per domain. Error messages live in the schema, never in UI code.

```ts
export const SignInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type SignIn = z.infer<typeof SignInSchema>;
```

- Always export the inferred type alongside the schema.
- Use `.refine()` for cross-field rules (e.g. password confirmation).

### 2. `useValidator` hook

```ts
const { validate, revalidate, errors } = useValidator({ schema: SignInSchema, store: formData });
```

- `validate(callback?)` — runs full parse on submit; calls `callback` only if valid.
- `revalidate(field, value)` — clears/updates a single field error on change.
- `errors` — `Partial<Record<keyof Schema, string>>`.

### 3. `AppInput` component (`src/components/ui/app-input.tsx`)

Reusable controlled input with built-in icon, password toggle, and error display.

```tsx
<AppInput
  type="email"
  icon={<Mail size={16} aria-hidden="true" />}
  value={formData.email}
  onChange={(e) => { setFormData(...); revalidate("email", e.target.value); }}
  error={errors.email}
/>
```

- `type="password"` enables internal show/hide toggle — callers need no extra state.
- `error` string adds `has-error` class (red border) and renders `<p className="field-error">` below the input.
- Error `<p>` is outside `.inp-wrap` so the icon stays vertically centered on the input, not the whole block.

### CSS classes (auth forms, scoped under `.hh-auth`)

| Class | Purpose |
|---|---|
| `.inp` | Base input style |
| `.inp-wrap` | Position-relative wrapper for icon + input + trail button |
| `.inp-icon` | Absolute-positioned leading icon |
| `.inp-trail` | Absolute-positioned trailing button (password toggle) |
| `.has-icon` | Adds left padding to input when icon is present |
| `.has-error` | Red border on input/select |
| `.field-error` | Red error message text below field |
| `.field` | Field wrapper (label + input + error) |

---

## Auth System

### Session shape (from `POST /api/auth/login`)

```ts
interface AuthSession { token: string; user: AuthUser; }
interface AuthUser {
  id: string; fullName: string; email: string; phone: string;
  userType: "customer" | "artisan"; isVerified: boolean; isActive: boolean;
  city: string | null; avatar: string | null; createdAt: string;
}
```

### Storage

`src/core/helpers/auth-storage.helper.ts` — all methods SSR-guarded with `typeof window !== "undefined"`. Storage key: `"handhub_auth"`.

### Auth context (`src/core/contexts/auth.context.tsx`)

`<AuthProvider>` wraps the whole app in `__root.tsx`. Provides:

```ts
const { token, user, isAuthenticated, login, logout } = useAuth();
```

- `login(session)` — writes to localStorage + sets React state.
- `logout()` — clears localStorage + clears state.

### Axios interceptors (`src/core/helpers/axios.helper.ts`)

- Request: attaches `Authorization: Bearer <token>` if a session exists.
- Response: calls `clearStoredSession()` on `401`.

### Route protection

Dashboard uses `beforeLoad` in `src/routes/dashboard/route.tsx`:

```ts
beforeLoad: () => {
  if (typeof window !== "undefined" && !readStoredSession()) {
    throw redirect({ to: "/signin" });
  }
},
```

Note: this is client-side only (SSR can't read localStorage). Proper SSR auth would require cookies — deferred until backend contract is confirmed.

### User types

```ts
// src/core/helpers/constants.helper.ts
export const USER_TYPES = { customer: "customer", artisan: "artisan" } as const;
export type UserType = keyof typeof USER_TYPES;
```

---

## Router Setup (`src/router.tsx`)

`getRouter()` creates the `QueryClient` and calls `setupRouterSsrQueryIntegration` — no manual `<QueryClientProvider>` needed anywhere.

Root route uses `createRootRouteWithContext<{ queryClient: QueryClient }>()` to make the client available to loaders.

---

## Design System Notes

- Primary color: Midnight Blue theme. CSS variable names include `--or` (orange alias → blue), `--bg`, `--bg2`, `--txt`, `--txt2`, `--txt3`, `--bdr`, `--bdr2`.
- Auth pages use custom CSS classes (`.hh-auth`, `.split`, `.panel-right`, `.form-box`, etc.), not Tailwind, for layout consistency.
- Tailwind utility classes are used in non-auth UI (dashboard, home).
- Font: Jost (loaded globally).
- Do not revert CSS variable aliases — `--or` and `--pu` (purple) map to blue shades intentionally.
