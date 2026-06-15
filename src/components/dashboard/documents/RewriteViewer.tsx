"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";

export function RewriteViewer({ 
  originalText, 
  improvedText 
}: {
  originalText?: string | null;
  improvedText?: string | null;
}) {
  const [viewMode, setViewMode] = useState<"improved" | "side-by-side" | "original">("improved");

  if (!improvedText) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 text-center text-slate-500">
        <Icon name="FileText" className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No improved version available for this document yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Header controls */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <Icon name="Pencil" className="w-5 h-5 text-primary-400" />
          AI Rewrite Suggestion
        </h3>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("original")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === "original" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
              viewMode === "side-by-side" ? "bg-slate-700 text-slate-100" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon name="Columns2" className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </button>
          <button
            onClick={() => setViewMode("improved")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
              viewMode === "improved" ? "bg-primary-500/20 text-primary-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon name="Sparkles" className="w-4 h-4" />
            Improved
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#0B1120]">
        <AnimatePresence mode="wait">
          {viewMode === "original" && (
            <motion.div
              key="original"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto p-6 font-mono text-sm leading-relaxed text-slate-400 whitespace-pre-wrap"
            >
              {originalText || "Original text not available."}
            </motion.div>
          )}

          {viewMode === "improved" && (
            <motion.div
              key="improved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto p-6 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-primary-500/30"
            >
              {improvedText}
            </motion.div>
          )}

          {viewMode === "side-by-side" && (
            <motion.div
              key="side-by-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex divide-x divide-slate-800"
            >
              <div className="w-1/2 overflow-y-auto p-6 font-mono text-sm leading-relaxed text-slate-500 whitespace-pre-wrap bg-slate-900/30">
                {originalText || "Original text not available."}
              </div>
              <div className="w-1/2 overflow-y-auto p-6 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-primary-500/30">
                {improvedText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
        <button 
          onClick={() => {
            if (improvedText) {
              navigator.clipboard.writeText(improvedText);
              // In a real app we'd trigger a toast here
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-sm font-medium"
        >
          <Icon name="Copy" className="w-4 h-4" />
          Copy Improved Text
        </button>
      </div>
    </div>
  );
}
