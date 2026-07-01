export const USER_TYPES = {
    customer: "customer",
    provider: "provider",
} as const;

export type UserType = keyof typeof USER_TYPES;