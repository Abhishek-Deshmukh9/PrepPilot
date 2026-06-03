import apiClient from "./api";

const documentService = {
  /**
   * Upload a PDF/DOCX/TXT document with progress tracking.
   */
  async upload(file, onUploadProgress = () => {}) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      },
    });
    return response.data;
  },

  /**
   * List all uploaded documents.
   */
  async list() {
    const response = await apiClient.get("/documents/");
    return response.data;
  },

  /**
   * Fetch single document details.
   */
  async get(documentId) {
    const response = await apiClient.get(`/documents/${documentId}`);
    return response.data;
  },

  /**
   * Delete a document and its collections.
   */
  async delete(documentId) {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },
};

export default documentService;
