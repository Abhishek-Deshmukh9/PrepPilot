import axios from "axios";

// Standard production-ready API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, # 120 seconds timeout for long-running AI generation tasks
});

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
