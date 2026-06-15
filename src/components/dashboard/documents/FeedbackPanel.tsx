"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";

export function FeedbackPanel({ 
  feedback, 
  grammarIssues, 
  contentSuggestions 
}: {
  feedback: string;
  grammarIssues: string[];
  contentSuggestions: string[];
}) {
  return (
    <div className="space-y-6">
      {/* Overall Feedback */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-500/10 rounded-lg text-primary-500">
            <Icon name="MessageSquare" className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">Overall Feedback</h3>
        </div>
        <p className="text-slate-300 leading-relaxed">
          {feedback}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grammar & Structure Issues */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <Icon name="Info" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-red-400">Grammar & Structure</h3>
          </div>
          {grammarIssues.length > 0 ? (
            <ul className="space-y-3">
              {grammarIssues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500/50 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic">No major grammar issues detected. Great job!</p>
          )}
        </motion.div>

        {/* Content Improvements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Icon name="TrendingUp" className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-blue-400">Content Suggestions</h3>
          </div>
          {contentSuggestions.length > 0 ? (
            <ul className="space-y-3">
              {contentSuggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic">No further content suggestions at this time.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
