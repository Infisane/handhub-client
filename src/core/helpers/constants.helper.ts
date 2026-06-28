export const USER_TYPES = {
    customer: "customer",
    artisan: "artisan",
} as const;

export type UserType = keyof typeof USER_TYPES;