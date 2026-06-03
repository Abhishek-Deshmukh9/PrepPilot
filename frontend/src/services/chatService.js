import apiClient from "./api";

const chatService = {
  /**
   * Submit query to RAG Chat.
   */
  async query({ sessionId, documentId, question, topK = 5 }) {
    const payload = {
      session_id: sessionId,
      question: question,
      top_k: topK,
    };
    if (documentId) {
      payload.document_id = documentId;
    }
    const response = await apiClient.post("/chat/", payload);
    return response.data;
  },

  /**
   * Fetch chat history for a session.
   */
  async getHistory(sessionId) {
    const response = await apiClient.get(`/history/${sessionId}`);
    return response.data;
  },

  /**
   * Clear session history.
   */
  async clearHistory(sessionId) {
    const response = await apiClient.delete(`/history/${sessionId}`);
    return response.data;
  },
};

export default chatService;
