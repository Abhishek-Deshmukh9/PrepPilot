import axios from "axios";

// Default API base URL from environment
const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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
      config.baseURL = savedUrl.trim();
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
