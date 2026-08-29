import apiClient from "./api";

const chatService = {
  /**
   * Submit a study query to the RAG Chat with optional tutor mode and document context.
   * @param {Object} params
   * @param {string} params.sessionId - Unique session identifier
   * @param {string|null} params.documentId - Optional active document ID for RAG grounding
   * @param {string} params.question - The student's question
   * @param {number} params.topK - Number of context chunks to retrieve (default: 5)
   * @param {string} params.tutorMode - Pedagogical style: "socratic" | "direct" | "exam_cram" | "eli5" | "worked_example"
   */
  async query({ sessionId, documentId, question, topK = 5, tutorMode = "direct" }) {
    const payload = {
      session_id: sessionId,
      question: question,
      top_k: topK,
      tutor_mode: tutorMode,
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
