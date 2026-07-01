import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { clearStoredSession, readStoredSession } from "./auth-storage.helper";
import { store } from "#/core/redux-store";
import { clear_auth_session } from "#/core/redux-store/slices/auth.slice";

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

request.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = readStoredSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredSession();
      store.dispatch(clear_auth_session());
      if (typeof window !== "undefined") {
        window.location.replace("/signin");
      }
    }
    return Promise.reject(error);
  },
);

const abortController = new AbortController();

const getRequestData = async <T>(
  promise: Promise<{ data: T }>,
): Promise<any> => {
  const { data } = await promise;
  return data;
};

export {
  abortController,
  getRequestData,
  request,
};
