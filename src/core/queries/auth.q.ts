import { useMutation } from "@tanstack/react-query";
import type { AuthSession } from "#/core/services/auth.service";
import {
	type LoginPayload,
	loginService,
	type RegisterPayload,
	registerService,
} from "#/core/services/auth.service";
import { abortController } from "../helpers/axios.helper";

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
