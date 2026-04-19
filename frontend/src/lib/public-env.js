const FALLBACK_BASE_URL = "https://jbtasoitusmaalaus.fi";

function trimTrailingSlash(value) {
  return value ? value.replace(/\/$/, "") : value;
}

export function getRuntimeOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return "";
}

export function getSiteUrl() {
  return trimTrailingSlash(
    getRuntimeOrigin() ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      FALLBACK_BASE_URL
  );
}

export function getApiBaseUrl() {
  const configuredValue =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.REACT_APP_BACKEND_URL ||
    process.env.BACKEND_URL;

  if (configuredValue) {
    return configuredValue.replace(/\/$/, "");
  }

  // Default to same-origin API routing. The Node static server proxies `/api`
  // to the backend, which avoids baking local-only backend URLs into the SPA.
  return "";
}

export function withSiteUrl(path) {
  if (!path) return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) return path;
  return `${getSiteUrl()}${path}`;
}

export function withApiUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) return path;
  return `${getApiBaseUrl()}${path}`;
}
