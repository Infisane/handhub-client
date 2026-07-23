import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { set_auth_session } from "#/core/redux-store/slices/auth.slice";
import {
	getMeService,
	loginService,
	registerService,
	resendEmailVerificationService,
	verifyEmailService,
} from "#/core/services/auth.service";
import type {
	AuthGateResponse,
	LoginPayload,
	RegisterPayload,
	RequestOtpPayload,
	VerifyOtpPayload,
} from "#/core/types/auth.types";
import { abortController } from "../helpers/axios.helper";

export const useRegisterQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (response: AuthGateResponse) => void;
} = {}) => {
	return useMutation({
		mutationFn: (payload: RegisterPayload) =>
			registerService({ payload, signal: abortController.signal }),
		onSuccess: (response) => onSuccessCallback?.(response),
	});
};

export const useLoginQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (response: AuthGateResponse) => void;
} = {}) => {
	return useMutation({
		mutationFn: (payload: LoginPayload) =>
			loginService({ payload, signal: abortController.signal }),
		onSuccess: (response) => onSuccessCallback?.(response),
	});
};

export const useResendEmailVerificationQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: () => void;
} = {}) => {
	return useMutation({
		mutationFn: (payload: RequestOtpPayload) =>
			resendEmailVerificationService({
				payload,
				signal: abortController.signal,
			}),
		onSuccess: () => onSuccessCallback?.(),
	});
};

export const useVerifyEmailQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: () => void;
} = {}) => {
	return useMutation({
		mutationFn: (payload: VerifyOtpPayload) =>
			verifyEmailService({ payload, signal: abortController.signal }),
		onSuccess: () => onSuccessCallback?.(),
	});
};

export const useMeQuery = () => {
	const dispatch = useAppDispatch();
	const token = useAppSelector((s) => s.authStore.token);

	const query = useQuery({
		queryKey: ["auth", "me"],
		queryFn: ({ signal }) => getMeService({ signal }),
		enabled: !!token,
		staleTime: 1000 * 60 * 5,
	});

	useEffect(() => {
		if (query.data) {
			dispatch(set_auth_session({ user: query.data }));
		}
	}, [query.data, dispatch]);

	return query;
};
