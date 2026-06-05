import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Simple custom markdown parser that outputs safe HTML elements
  const lines = content.split("\n");

  return (
    <div className="space-y-3 text-right text-slate-700 leading-relaxed text-sm md:text-base">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("### ")) {
          const text = trimmed.slice(4).replace(/\*\*/g, "");
          return (
            <h4 key={idx} className="text-base font-bold text-slate-800 mt-4 mb-2 flex items-center gap-2 border-r-4 border-emerald-500 pr-2">
              {text}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          const text = trimmed.slice(3).replace(/\*\*/g, "");
          return (
            <h3 key={idx} className="text-lg font-bold text-slate-900 mt-5 mb-3 flex items-center gap-2 border-r-4 border-indigo-600 pr-2">
              {text}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          const text = trimmed.slice(2).replace(/\*\*/g, "");
          return (
            <h2 key={idx} className="text-xl font-extrabold text-indigo-950 mt-6 mb-4 pb-2 border-b border-slate-200">
              {text}
            </h2>
          );
        }

        // List items
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const rawText = trimmed.slice(2);
          // Highlight bold text inside bullet
          const parts = parseBold(rawText);
          return (
            <div key={idx} className="flex items-start gap-2 mr-3 my-1">
              <span className="text-emerald-500 font-bold text-base mt-1">•</span>
              <span className="flex-1">{parts}</span>
            </div>
          );
        }

        // Horizontal Rule
        if (trimmed === "---") {
          return <hr key={idx} className="my-6 border-slate-200" />;
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Normal paragraph (with optional bold parts)
        return (
          <p key={idx} className="my-2">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Heuristic helper to parse **bold** markers
function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-extrabold text-slate-800 bg-amber-50 px-1 rounded-sm">
          {part}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}
