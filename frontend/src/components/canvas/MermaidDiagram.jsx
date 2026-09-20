import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Sparkles } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

// Configure mermaid
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  fontFamily: "Plus Jakarta Sans, sans-serif",
  theme: "neutral"
});

export const MermaidDiagram = ({ 
  chartDefinition, 
  title = "Visual Architecture & Concept Diagram",
  className = "" 
}) => {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      if (!chartDefinition || !chartDefinition.trim()) {
        setSvgContent("");
        return;
      }

      setError(null);
      const isDark = theme === "dark" || document.documentElement.classList.contains("dark");
      
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        themeVariables: isDark ? {
          darkMode: true,
          background: "#0b0f19",
          primaryColor: "#8b5cf6",
          primaryTextColor: "#f1f5f9",
          primaryBorderColor: "#7c3aed",
          lineColor: "#94a3b8",
          secondaryColor: "#3b82f6",
          tertiaryColor: "#10b981",
          fontFamily: "Plus Jakarta Sans, sans-serif"
        } : {
          darkMode: false,
          primaryColor: "#8b5cf6",
          primaryTextColor: "#0f172a",
          primaryBorderColor: "#7c3aed",
          lineColor: "#64748b",
          secondaryColor: "#3b82f6",
          tertiaryColor: "#10b981",
          fontFamily: "Plus Jakarta Sans, sans-serif"
        }
      });

      try {
        const uniqueId = `mermaid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // ── Step 1: Strip markdown fences and backticks ──
        let raw = chartDefinition
          .replace(/^```(?:mermaid)?\s*/im, "")
          .replace(/```\s*$/im, "")
          .replace(/`/g, "")
          .trim();

        // ── Step 2: Sanitize line-by-line ──
        const lines = raw.split("\n");
        const sanitized = [];
        let hasDeclaration = false;

        // Regex patterns
        const declarationRe = /^\s*(graph|flowchart)\s+(TD|TB|BT|RL|LR)\s*$/i;
        const otherDiagramRe = /^\s*(sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitgraph|mindmap|timeline)/i;
        const styleRe = /^\s*(style|classDef|class|linkStyle)\s+/i;
        const subgraphRe = /^\s*(subgraph|end)\b/i;
        const commentRe = /^\s*%%/;

        /**
         * Ensure a label is safely quoted for Mermaid.
         * Escapes &, replaces inner " with ', wraps in double quotes.
         */
        const safeLabel = (label) => {
          let s = label.trim();
          if (!s) return '""';
          // Strip existing surrounding quotes
          if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
            s = s.slice(1, -1);
          }
          s = s.replace(/&/g, "&amp;");
          s = s.replace(/"/g, "'");
          return `"${s}"`;
        };

        /**
         * Character-scanning sanitizer for a single line.
         * Finds node labels in all Mermaid shapes: [], (), {}, (()), ([]), [()]
         * and wraps them in double quotes so special chars don't break parsing.
         */
        const sanitizeLineLabels = (line) => {
          // Map of open→close delimiters (multi-char first for priority)
          const openers = ["(([", "([", "[(", "((", "[", "(", "{"];
          const closerMap = {
            "(([": "]))",
            "([": "])",
            "[(": ")]",
            "((": "))",
            "[": "]",
            "(": ")",
            "{": "}"
          };

          let result = "";
          let i = 0;

          while (i < line.length) {
            // Check if we're at a node ID followed by an opener
            // Node IDs are word chars: A, B1, node_1, etc.
            // First, try to read a word boundary before an opener
            let idStart = i;
            while (i < line.length && /\w/.test(line[i])) i++;
            let id = line.slice(idStart, i);

            if (id && i < line.length) {
              // Check for any opener at current position
              let foundOpener = null;
              for (const op of openers) {
                if (line.substring(i, i + op.length) === op) {
                  foundOpener = op;
                  break;
                }
              }

              if (foundOpener) {
                const closer = closerMap[foundOpener];
                const labelStart = i + foundOpener.length;

                // Scan for the matching closer
                let labelEnd = line.indexOf(closer, labelStart);
                if (labelEnd === -1) {
                  // No matching closer found — output as-is and continue
                  result += id + foundOpener;
                  i = labelStart;
                  continue;
                }

                const rawLabel = line.slice(labelStart, labelEnd);
                result += id + foundOpener + safeLabel(rawLabel) + closer;
                i = labelEnd + closer.length;
                continue;
              }
            }

            // If no opener found after ID, output what we have
            if (id) {
              result += id;
              continue;
            }

            // Not a word char — just copy it through
            result += line[i];
            i++;
          }

          return result;
        };

        /**
         * Sanitize edge labels: -->|label| or ==>|label|
         */
        const sanitizeEdgeLabels = (line) => {
          return line.replace(
            /(-->|==>|-.->|---->)\|([^|]*)\|/g,
            (match, arrow, label) => `${arrow}|${safeLabel(label)}|`
          );
        };

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];

          // Skip empty lines (but keep one for readability)
          if (!line.trim()) {
            if (sanitized.length > 0 && sanitized[sanitized.length - 1].trim() !== "") {
              sanitized.push("");
            }
            continue;
          }

          // Skip comments
          if (commentRe.test(line)) {
            sanitized.push(line);
            continue;
          }

          // Handle declaration lines (graph TD, flowchart LR, etc.)
          if (declarationRe.test(line) || otherDiagramRe.test(line)) {
            line = line.replace(/^(\s*(?:graph|flowchart)\s+(?:TD|TB|BT|RL|LR))\s*[\[\(].*$/i, "$1");
            hasDeclaration = true;
            sanitized.push(line.trim());
            continue;
          }

          // Handle style/class/linkStyle lines — pass through as-is
          if (styleRe.test(line)) {
            sanitized.push(line);
            continue;
          }

          // Handle subgraph/end — pass through
          if (subgraphRe.test(line)) {
            sanitized.push(line);
            continue;
          }

          // ── Main line: node definitions and edges ──
          line = sanitizeEdgeLabels(line);
          line = sanitizeLineLabels(line);

          sanitized.push(line);
        }

        // Ensure we have a declaration
        if (!hasDeclaration) {
          sanitized.unshift("graph TD");
        }

        let cleanDefinition = sanitized.join("\n").trim();

        // ── Step 3: Final safety passes ──
        // Remove triple+ blank lines
        cleanDefinition = cleanDefinition.replace(/\n{3,}/g, "\n\n");

        // Log for debugging (remove in production)
        console.log("[MermaidDiagram] Sanitized code:\n", cleanDefinition);

        const { svg } = await mermaid.render(uniqueId, cleanDefinition);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err) {
        console.warn("[MermaidDiagram] Render failed:", err);
        console.warn("[MermaidDiagram] Raw input was:", chartDefinition);
        if (isMounted) {
          // Show the raw code so the user can still read the diagram structure
          setError("The AI-generated diagram had syntax issues. The raw structure is shown below.");
          setSvgContent("");
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chartDefinition, theme]);

  const handleCopy = () => {
    if (chartDefinition) {
      navigator.clipboard.writeText(chartDefinition);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden ${className}`}>
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            {title}
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 min-w-9 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleResetZoom}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-[11px] font-medium transition-colors"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Source"}</span>
          </button>
        </div>
      </div>

      {/* Render Area */}
      <div 
        ref={containerRef}
        className="flex-1 p-6 flex items-center justify-center overflow-auto canvas-grid relative select-none"
      >
        {error ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-xl text-center max-w-md">
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">{error}</p>
            <pre className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono text-left overflow-x-auto p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              {chartDefinition}
            </pre>
          </div>
        ) : svgContent ? (
          <div 
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out" 
            }}
            className="flex items-center justify-center max-w-full"
            dangerouslySetInnerHTML={{ __html: svgContent }} 
          />
        ) : (
          <div className="text-slate-400 text-xs flex items-center space-x-2">
            <span>Generating diagram structure...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;
