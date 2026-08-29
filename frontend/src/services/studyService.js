import apiClient from "./api";

const studyService = {
  /**
   * Summaries API
   */
  async generateSummary(documentId, summaryType = "executive") {
    const response = await apiClient.post("/summary/", {
      document_id: documentId,
      summary_type: summaryType,
    });
    return response.data;
  },

  async getSummaries(documentId) {
    const response = await apiClient.get(`/summary/${documentId}`);
    return response.data;
  },

  /**
   * MCQ Quiz API
   */
  async generateMCQs(documentId, count = 10, difficulty = "medium") {
    const response = await apiClient.post("/mcqs/", {
      document_id: documentId,
      count: parseInt(count),
      difficulty: difficulty,
    });
    return response.data;
  },

  async getMCQs(documentId) {
    const response = await apiClient.get(`/mcqs/${documentId}`);
    return response.data;
  },

  /**
   * Flashcards API
   */
  async generateFlashcards(documentId, deckName = "Default Deck", count = 20) {
    const response = await apiClient.post("/flashcards/", {
      document_id: documentId,
      deck_name: deckName,
      count: parseInt(count),
    });
    return response.data;
  },

  async getFlashcards(documentId) {
    const response = await apiClient.get(`/flashcards/${documentId}`);
    return response.data;
  },

  /**
   * Key Points API
   */
  async generateKeyPoints(documentId) {
    const response = await apiClient.post("/keypoints/", {
      document_id: documentId,
    });
    return response.data;
  },

  async getKeyPoints(documentId) {
    const response = await apiClient.get(`/keypoints/${documentId}`);
    return response.data;
  },

  /**
   * Revision Notes API
   */
  async generateRevisionNotes(documentId, revisionType = "last_minute") {
    const response = await apiClient.post("/revision/", {
      document_id: documentId,
      revision_type: revisionType,
    });
    return response.data;
  },

  async getRevisionNotes(documentId) {
    const response = await apiClient.get(`/revision/${documentId}`);
    return response.data;
  },
};

export default studyService;
