import apiClient from "./api";

const studyService = {
  /**
   * Summaries API
   */
  async generateSummary(documentId, summaryType = "executive", forceRefresh = false) {
    const response = await apiClient.post("/summary/", {
      document_id: documentId,
      summary_type: summaryType,
      force_refresh: forceRefresh,
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
  async generateMCQs(documentId, count = 10, difficulty = "medium", forceRefresh = false) {
    const response = await apiClient.post("/mcqs/", {
      document_id: documentId,
      count: parseInt(count),
      difficulty: difficulty,
      force_refresh: forceRefresh,
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
  async generateFlashcards(documentId, deckName = "Default Deck", count = 20, forceRefresh = false) {
    const response = await apiClient.post("/flashcards/", {
      document_id: documentId,
      deck_name: deckName,
      count: parseInt(count),
      force_refresh: forceRefresh,
    });
    return response.data;
  },

  async getFlashcards(documentId) {
    const response = await apiClient.get(`/flashcards/${documentId}`);
    return response.data;
  },

  async updateFlashcardRating(cardId, difficulty) {
    const response = await apiClient.patch(`/flashcards/${cardId}/rating`, {
      difficulty,
    });
    return response.data;
  },

  /**
   * Key Points API
   */
  async generateKeyPoints(documentId, forceRefresh = false) {
    const response = await apiClient.post("/keypoints/", {
      document_id: documentId,
      force_refresh: forceRefresh,
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
  async generateRevisionNotes(documentId, revisionType = "last_minute", forceRefresh = false) {
    const response = await apiClient.post("/revision/", {
      document_id: documentId,
      revision_type: revisionType,
      force_refresh: forceRefresh,
    });
    return response.data;
  },

  async getRevisionNotes(documentId) {
    const response = await apiClient.get(`/revision/${documentId}`);
    return response.data;
  },
};

export default studyService;
