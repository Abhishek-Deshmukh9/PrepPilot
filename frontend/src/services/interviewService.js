import apiClient from "./api";

const interviewService = {
  /**
   * Compare resume document to job description and generate interview questions
   */
  async generateInterviewPrep(resumeDocId, jobDescription, questionTypes = ["hr", "technical", "behavioral", "project"]) {
    const response = await apiClient.post("/interview/", {
      resume_document_id: resumeDocId,
      job_description: jobDescription,
      question_types: questionTypes,
    });
    return response.data;
  },
};

export default interviewService;
