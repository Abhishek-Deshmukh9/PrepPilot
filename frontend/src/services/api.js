import axios from "axios";

// Default API base URL from environment
export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

/**
 * Normalizes an API URL:
 * - Trims whitespace
 * - Ensures http:// or https:// protocol
 * - Strips trailing slashes
 * - Ensures a single /api/v1 suffix without duplicating
 */
export function normalizeApiUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return DEFAULT_API_BASE_URL;
  }

  let cleaned = rawUrl.trim();
  if (!cleaned) return DEFAULT_API_BASE_URL;

  // Add protocol if missing
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `http://${cleaned}`;
  }

  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, "");

  // Check if it already has /api/v1 (or repeated /api/v1)
  if (/\/api\/v1/i.test(cleaned)) {
    // Replace any repeated /api/v1 with a single /api/v1 at the end
    cleaned = cleaned.replace(/(\/api\/v1)+$/i, "/api/v1");
  } else {
    // Append /api/v1
    cleaned = `${cleaned}/api/v1`;
  }

  return cleaned;
}

const apiClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 120 seconds timeout for long-running AI generation tasks
});

// Request interceptor: dynamically resolve base URL from localStorage at runtime
// This ensures changes made in the Settings page take effect immediately without a reload.
apiClient.interceptors.request.use(
  (config) => {
    const savedUrl = localStorage.getItem("preppilot_api_url");
    if (savedUrl && savedUrl.trim()) {
      config.baseURL = normalizeApiUrl(savedUrl);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error messages consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: "An unexpected error occurred. Please try again.",
      status: error.response?.status,
      data: error.response?.data,
    };

    if (error.response?.data?.detail) {
      customError.message = error.response.data.detail;
    } else if (error.message) {
      customError.message = error.message;
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
