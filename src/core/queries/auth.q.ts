import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AuthSession, LoginPayload, RegisterPayload } from "#/core/types/auth.types";
import { getMeService, loginService, registerService } from "#/core/services/auth.service";
import { abortController } from "../helpers/axios.helper";
import { useAppDispatch, useAppSelector } from "#/core/hooks/useStore.hook";
import { set_auth_session } from "#/core/redux-store/slices/auth.slice";

export const useRegisterQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: () => void;
} = {}) => {
	return useMutation({
		mutationFn: (payload: RegisterPayload) =>
			registerService({ payload, signal: abortController.signal }),
		onSuccess: () => onSuccessCallback?.(),
	});
};

export const useLoginQuery = ({
	onSuccessCallback,
}: {
	onSuccessCallback?: (session: AuthSession) => void;
} = {}) => {
	return useMutation({
		mutationFn: (payload: LoginPayload) =>
			loginService({ payload, signal: abortController.signal }),
		onSuccess: (session) => onSuccessCallback?.(session),
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
