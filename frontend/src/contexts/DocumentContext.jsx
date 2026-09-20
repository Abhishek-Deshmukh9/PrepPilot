import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import documentService from "../services/documentService";
import { ToastContainer } from "../components/common/Toast";

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(() => {
    const saved = localStorage.getItem("active_document");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);
  const prevProcessingIdsRef = useRef(new Set());
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = "info", duration = 4500) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentService.list();
      setDocuments(data);
      // Sync active document if it was deleted or changed status
      setActiveDocument((prev) => {
        if (!prev) return null;
        const found = data.find((doc) => doc.id === prev.id);
        if (found) {
          localStorage.setItem("active_document", JSON.stringify(found));
          return found;
        }
        localStorage.removeItem("active_document");
        return null;
      });
      return data;
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message || "Failed to load documents.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-poll while any document is still processing
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing");

    // Detect transitions: processing → ready or processing → error
    const prevIds = prevProcessingIdsRef.current;
    if (prevIds.size > 0) {
      for (const doc of documents) {
        if (prevIds.has(doc.id)) {
          if (doc.status === "ready") {
            addToast(`📄 "${doc.filename}" is ready to study!`, "success");
          } else if (doc.status === "error") {
            addToast(`❌ "${doc.filename}" failed to process.`, "error");
          }
        }
      }
    }

    // Update tracking set
    prevProcessingIdsRef.current = new Set(
      documents.filter((d) => d.status === "processing").map((d) => d.id)
    );

    if (hasProcessing && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(async () => {
        const updated = await fetchDocuments();
        const stillProcessing = updated.some((d) => d.status === "processing");
        if (!stillProcessing) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }, 3000);
    } else if (!hasProcessing && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [documents, fetchDocuments, addToast]);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        addToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
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
