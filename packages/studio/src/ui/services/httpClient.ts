import axios, { AxiosError } from "axios";

/** Every network failure in the app is normalized to this shape by the interceptor below. An Error
 *  subclass (not a plain object) so rejections are real Errors — callers still read `.status`/`.body`. */
export class ApiError extends Error {
  status: number;
  /** Parsed response body, so callers can read structured detail (e.g. a 409's `current` topic). */
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * The single axios instance. Deviates from the template's `VITE_API_BASE_URL`: the Studio API is
 * served SAME-ORIGIN under the app's mount (`import.meta.env.BASE_URL`, e.g. "/" or "/kb-studio/"),
 * so a request to `/api/manifest` resolves to `<base>/api/manifest` and the reverse proxy routes it
 * to the studio. Cookies carry identity — no auth header. Nothing outside `hooks/` imports this file.
 */
const httpClient = axios.create({
  baseURL: import.meta.env.BASE_URL.replace(/\/$/, ""),
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) =>
    // This API reports failures as `{ error: string }`, not `{ message }`.
    Promise.reject(
      new ApiError(
        error.response?.status ?? 0,
        error.response?.data?.error ?? error.message ?? "Something went wrong",
        error.response?.data,
      ),
    ),
);

export default httpClient;
