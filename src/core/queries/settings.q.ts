import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { abortController } from "#/core/helpers/axios.helper";
import {
	changePasswordService,
	getNotificationPreferencesService,
	getSecurityStatusService,
	getUserProfileService,
	updateNotificationPreferencesService,
	updateUserProfileService,
} from "#/core/services/settings.service";
import type {
	ChangePasswordPayload,
	NotificationPreferences,
	UpdateNotificationPreferencesPayload,
	UpdateProfilePayload,
	UserProfile,
} from "#/core/types/settings.types";

export const useGetUserProfileQuery = () =>
	useQuery({
		queryKey: ["user", "profile"],
		queryFn: ({ signal }) => getUserProfileService({ signal }),
		staleTime: 1000 * 60 * 5,
	});

export const useUpdateUserProfileQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (profile: UserProfile) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateProfilePayload) =>
			updateUserProfileService({ payload, signal: abortController.signal }),
		onSuccess: (profile) => {
			queryClient.setQueryData(["user", "profile"], profile);
			// Keep the sidebar/header identity (from useMeQuery) in sync.
			queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
			onSuccessCallback?.(profile);
		},
	});
};

export const useChangePasswordQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (result: { message: string }) => void;
} = {}) =>
	useMutation({
		mutationFn: (payload: ChangePasswordPayload) =>
			changePasswordService({ payload, signal: abortController.signal }),
		onSuccess: (result) => onSuccessCallback?.(result),
	});

export const useGetSecurityStatusQuery = () =>
	useQuery({
		queryKey: ["auth", "security-status"],
		queryFn: ({ signal }) => getSecurityStatusService({ signal }),
		staleTime: 1000 * 60 * 5,
	});

export const useGetNotificationPreferencesQuery = () =>
	useQuery({
		queryKey: ["notification-preferences"],
		queryFn: ({ signal }) => getNotificationPreferencesService({ signal }),
		staleTime: 1000 * 60 * 5,
	});

export const useUpdateNotificationPreferencesQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (prefs: NotificationPreferences) => void;
} = {}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateNotificationPreferencesPayload) =>
			updateNotificationPreferencesService({
				payload,
				signal: abortController.signal,
			}),
		onSuccess: (prefs) => {
			queryClient.setQueryData(["notification-preferences"], prefs);
			onSuccessCallback?.(prefs);
		},
	});
};
