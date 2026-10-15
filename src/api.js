const API_ORIGIN = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "")
  : "";
const API_ROOT = `${API_ORIGIN}/api`;
const TOKEN_KEY = "master-tracker-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.conflicts = payload?.conflicts ?? [];
  }
}

export async function api(path, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  const token = getToken();

  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (token && options.auth !== false) headers.set("Authorization", `Bearer ${token}`);

  try {
    const requestUrl = path.startsWith("/backend-health")
      ? (API_ORIGIN ? `${API_ORIGIN}/` : path)
      : `${API_ROOT}${path}`;
    const response = await fetch(requestUrl, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      const message = response.ok
        ? "The API returned an invalid JSON response."
        : `Request failed with status ${response.status}`;
      console.error(`[api] ${method} ${path} -> ${response.status}: ${message}`);
      throw new ApiError(message, response.status);
    }

    if (!response.ok || payload.success === false) {
      const message = payload.message || `Request failed with status ${response.status}`;
      console.error(`[api] ${method} ${path} -> ${response.status}: ${message}`);
      throw new ApiError(message, response.status, payload);
    }

    console.info(`[api] ${method} ${path} -> ${response.status}`);
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`[api] ${method} ${path} -> NETWORK ERROR`, error);
    throw new ApiError(
      "Cannot reach the API. Check that the backend is running and reachable.",
      0,
    );
  }
}

export const dataOf = (response) => response?.data;
