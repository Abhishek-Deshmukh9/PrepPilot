import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Plus,
  RotateCcw
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import documentService from "../services/documentService";

const UploadPage = () => {
  const { documents, activeDocument, selectDocument, deleteDocument, fetchDocuments } = useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [processingDocName, setProcessingDocName] = useState(null);
  const fileInputRef = useRef(null);
  const uploadZoneRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process selected file
  const processFile = async (file) => {
    if (!file) return;

    // Validate size (50MB maximum)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg("File exceeds the maximum size limit of 50MB.");
      return;
    }

    // Validate type
    const validExtensions = [".pdf", ".docx", ".txt"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMsg("Invalid file format. Only PDF, DOCX, and TXT files are supported.");
      return;
    }

    setErrorMsg("");
    setUploading(true);
    setUploadProgress(0);

    try {
      await documentService.upload(file, (progress) => {
        setUploadProgress(progress);
      });
      // Refresh list — new doc will have status "processing"
      await fetchDocuments();
      setUploading(false);
      // Show post-upload processing feedback
      setProcessingDocName(file.name);
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload document. Please try again.");
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document? All vector indices and generation history will be permanently lost.")) {
      try {
        await deleteDocument(id);
      } catch (err) {
        alert("Failed to delete document: " + err.message);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Upload Documents</h1>
        <p className="text-slate-500 dark:text-slate-400">Build your local AI knowledge bases by uploading notes, study papers, and resumes.</p>
      </div>

      {/* Upload Drop Zone Panel */}
      <div 
        ref={uploadZoneRef}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`glass-panel border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center transition-all ${
          dragActive 
            ? "border-brand-500 bg-brand-50/10 dark:bg-brand-950/10" 
            : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="bg-brand-50 dark:bg-brand-950/40 p-4 rounded-full text-brand-600 dark:text-brand-400 mb-4 shadow-inner">
          <UploadCloud className="h-8 w-8 animate-pulse-subtle" />
        </div>

        <h3 className="font-display text-md font-bold mb-1">Drag and drop file here</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">PDF, DOCX, or TXT formats supported (Max size: 50MB)</p>

        {uploading ? (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center"><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : processingDocName && documents.some((d) => d.status === "processing") ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing "{processingDocName}" — extracting text, chunking, and embedding...</span>
            </div>
            <p className="text-[10px] text-slate-400">This may take a moment. You can navigate away — we'll notify you when it's ready.</p>
          </div>
        ) : (
          <button
            onClick={() => { setProcessingDocName(null); handleButtonClick(); }}
            className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Select File From Local</span>
          </button>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center space-x-1.5 text-xs text-rose-500 font-semibold bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Document Inventory Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
        <h2 className="font-display text-lg font-bold">Uploaded Guides</h2>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No documents uploaded yet. Drag a file onto the panel above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => {
                  const isActive = activeDocument?.id === doc.id;
                  return (
                    <tr 
                      key={doc.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors ${
                        isActive ? "bg-brand-50/20 dark:bg-brand-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 max-w-sm truncate flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="truncate" title={doc.filename}>{doc.filename}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{formatBytes(doc.file_size)}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{doc.chunk_count || 0}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          doc.status === "ready" 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : doc.status === "processing"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                        }`}>
                          {doc.status === "ready" && <CheckCircle className="w-3 h-3" />}
                          {doc.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
                          {doc.status === "error" && <AlertTriangle className="w-3 h-3" />}
                          <span>{doc.status === "ready" ? "Ready" : doc.status === "processing" ? "Processing" : "Failed"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2.5 min-w-[160px]">
                        {doc.status === "ready" && (
                          <button
                            onClick={() => selectDocument(isActive ? null : doc)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isActive
                                ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                : "bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/10"
                            }`}
                          >
                            {isActive ? "Deselect" : "Study Now"}
                          </button>
                        )}
                        {doc.status === "error" && (
                          <button
                            onClick={async () => {
                              try {
                                await deleteDocument(doc.id);
                                uploadZoneRef.current?.scrollIntoView({ behavior: "smooth" });
                              } catch (err) {
                                alert("Failed to remove: " + err.message);
                              }
                            }}
                            className="px-3 py-1 rounded-lg text-[10px] font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-500/10 transition-all inline-flex items-center space-x-1"
                            title={doc.metadata_json?.error_message || "Processing failed"}
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Re-upload</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors inline-flex items-center align-middle"
                          title="Delete knowledge base"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
