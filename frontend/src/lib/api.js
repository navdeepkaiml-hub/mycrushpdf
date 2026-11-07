import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// On any other host (e.g. the static Firebase site) only same-origin /api is used, never the preview backend.
const sameHost = typeof window === "undefined" || window.location.origin === new URL(BACKEND_URL).origin;
export const API = sameHost ? `${BACKEND_URL}/api` : "/api";

export const api = axios.create({ baseURL: API, withCredentials: true });

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function downloadUrl(jobId) {
  return `${API}/download/${jobId}`;
}
