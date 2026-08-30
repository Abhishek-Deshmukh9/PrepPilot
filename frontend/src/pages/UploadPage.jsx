import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Plus
} from "lucide-react";
import { useDocuments } from "../contexts/DocumentContext";
import documentService from "../services/documentService";

const UploadPage = () => {
  const { documents, activeDocument, selectDocument, deleteDocument, fetchDocuments } = useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg("File exceeds the maximum size limit of 50MB.");
      return;
    }

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
      await fetchDocuments();
      setUploading(false);
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
    if (window.confirm("Are you sure you want to delete this document? Vector embeddings and study cache will be removed.")) {
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
    <div className="space-y-8 animate-slide-up pb-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-100">Upload Knowledge Bases</h1>
        <p className="text-xs text-slate-400 mt-1">Import academic PDFs, lecture slides, and notes to initialize local vector embeddings.</p>
      </div>

      {/* Upload Drop Zone Panel */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`glass-panel border-2 border-dashed rounded-3xl p-10 sm:p-12 text-center flex flex-col items-center justify-center transition-all ${
          dragActive 
            ? "border-sky-400 bg-sky-500/10 shadow-xl shadow-sky-500/10" 
            : "border-white/[0.1] hover:border-white/[0.25] hover:bg-white/[0.02]"
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="bg-sky-500/10 p-5 rounded-2xl text-sky-400 mb-4 shadow-inner border border-sky-500/20">
          <UploadCloud className="h-9 w-9 animate-pulse-subtle" />
        </div>

        <h3 className="font-display text-lg font-bold text-slate-100 mb-1">Drag and drop study files here</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-sm">PDF, DOCX, or TXT formats supported (Maximum file size: 50MB)</p>

        {uploading ? (
          <div className="w-full max-w-xs space-y-2.5">
            <div className="flex justify-between text-xs font-mono font-semibold">
              <span className="flex items-center text-sky-300">
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Ingesting & Chunking...
              </span>
              <span className="text-slate-300">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <button
            onClick={handleButtonClick}
            className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Browse Local Files</span>
          </button>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center space-x-2 text-xs text-rose-400 font-semibold bg-rose-500/10 px-4 py-2.5 rounded-xl border border-rose-500/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Document Inventory Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-100">Uploaded Study Guides</h2>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No study guides uploaded yet. Drag and drop a file onto the zone above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 uppercase tracking-widest font-mono text-[9px]">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chunks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {documents.map((doc) => {
                  const isActive = activeDocument?.id === doc.id;
                  return (
                    <tr 
                      key={doc.id} 
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isActive ? "bg-sky-500/[0.08]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-200 max-w-sm truncate flex items-center space-x-2.5">
                        <FileText className="h-4 w-4 text-sky-400/80 shrink-0" />
                        <span className="truncate" title={doc.filename}>{doc.filename}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{formatBytes(doc.file_size)}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{doc.chunk_count || 0}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                          doc.status === "ready" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : doc.status === "processing"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2.5 min-w-[140px]">
                        {doc.status === "ready" && (
                          <button
                            onClick={() => selectDocument(isActive ? null : doc)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                              isActive
                                ? "bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10"
                                : "bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/20"
                            }`}
                          >
                            {isActive ? "Deselect" : "Study Now"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors inline-flex items-center align-middle"
                          title="Delete document"
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
