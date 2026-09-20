import axios from "axios";
import apiClient, { normalizeApiUrl } from "./api";

const systemService = {
  /**
   * Ping backend health endpoint and measure latency.
   * @param {string} [targetUrl] - Optional target base URL to test before saving
   * @returns {Promise<{ ok: boolean, latencyMs: number, data?: any, error?: string }>}
   */
  async checkHealth(targetUrl) {
    const start = performance.now();
    try {
      if (targetUrl) {
        const normalized = normalizeApiUrl(targetUrl);
        const response = await axios.get(`${normalized}/health`, {
          timeout: 6000,
          headers: { "Content-Type": "application/json" },
        });
        const latencyMs = Math.round(performance.now() - start);
        return { ok: true, latencyMs, data: response.data };
      } else {
        const response = await apiClient.get("/health", { timeout: 6000 });
        const latencyMs = Math.round(performance.now() - start);
        return { ok: true, latencyMs, data: response.data };
      }
    } catch (err) {
      const latencyMs = Math.round(performance.now() - start);
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Could not connect to backend server.";
      return { ok: false, latencyMs, error: errorMsg };
    }
  },

  /**
   * Fetch dynamic backend runtime architecture parameters.
   * @returns {Promise<any>}
   */
  async getSystemInfo() {
    const response = await apiClient.get("/system/info", { timeout: 8000 });
    return response.data;
  },
};

export default systemService;
