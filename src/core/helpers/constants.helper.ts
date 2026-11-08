export const USER_TYPES = {
    customer: "customer",
    provider: "provider",
} as const;

export type UserType = keyof typeof USER_TYPES;

/** One "nearby" radius for every dashboard widget (Artisans nearby tile, Find
 *  Artisans badge, Recommended artisans) so their numbers can't contradict each
 *  other. 50 km matches the API's default search radius. */
export const NEARBY_RADIUS_KM = 50;

/** Resend-OTP cooldown. Mirrors the API's AUTH_OTP_RESEND_SECONDS default (60) — the
 *  server rejects an earlier resend with 429, so keep these in step. */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
