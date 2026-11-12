export const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export function resolveFunctionUrl(env = import.meta.env) {
  if (env?.VITE_USE_LOCAL_EMULATOR === "true") {
    return "http://127.0.0.1:5001/wandergen---ai-travel-planner/us-central1/api";
  }

  const explicit = env?.VITE_FUNCTION_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const priceUrl = env?.VITE_PRICE_FUNCTION_URL?.trim();
  if (priceUrl && !priceUrl.includes("127.0.0.1") && !priceUrl.includes("localhost")) {
    return priceUrl.replace(/\/+$/, "");
  }

  return "https://vac-ai-tion.onrender.com";
}

export const FUNCTION_URL = resolveFunctionUrl();
