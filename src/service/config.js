export const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
export const FUNCTION_URL = isLocal 
  ? "http://127.0.0.1:5001/wandergen---ai-travel-planner/us-central1/api" 
  : "https://vac-ai-tion.onrender.com";
