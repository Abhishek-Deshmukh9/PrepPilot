import React, { createContext, useContext, useState, useEffect } from "react";
import documentService from "../services/documentService";

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(() => {
    const saved = localStorage.getItem("active_document");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentService.list();
      setDocuments(data);
      // Sync active document if it was deleted or changed status
      if (activeDocument) {
        const found = data.find((doc) => doc.id === activeDocument.id);
        if (found) {
          setActiveDocument(found);
          localStorage.setItem("active_document", JSON.stringify(found));
        } else {
          setActiveDocument(null);
          localStorage.removeItem("active_document");
        }
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message || "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectDocument = (doc) => {
    setActiveDocument(doc);
    if (doc) {
      localStorage.setItem("active_document", JSON.stringify(doc));
    } else {
      localStorage.removeItem("active_document");
    }
  };

  const removeDocument = async (docId) => {
    setError(null);
    try {
      await documentService.delete(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (activeDocument?.id === docId) {
        selectDocument(null);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError(err.message || "Failed to delete document.");
      throw err;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <DocumentContext.Provider
      value={{
        documents,
        activeDocument,
        isLoading,
        error,
        fetchDocuments,
        selectDocument,
        deleteDocument: removeDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};
