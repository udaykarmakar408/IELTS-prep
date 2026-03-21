"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  X,
  Search,
  Filter
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ErrorLog() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const toggleResolved = (idx: number) => {
    if (!progress) return;
    const newLog = [...progress.errorLog];
    newLog[idx].resolved = !newLog[idx].resolved;
    const updated = { ...progress, errorLog: newLog };
    setProgress(updated);
    saveProgress(updated);
  };

  const deleteError = (idx: number) => {
    if (!progress) return;
    const newLog = progress.errorLog.filter((_, i) => i !== idx);
    const updated = { ...progress, errorLog: newLog };
    setProgress(updated);
    saveProgress(updated);
  };

  if (!progress) return null;

  const filteredLog = progress.errorLog.filter(e => 
    e.error.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">📋 My Error Log</h2>
          <p className="text-sm text-text-muted">Track and review your mistakes to improve faster</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search errors..."
            className="w-full bg-bg-2 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:border-blue-primary outline-none"
          />
        </div>
      </div>

      {progress.errorLog.length === 0 ? (
        <div className="card text-center py-16 opacity-50 border-dashed border-border-2">
          <ClipboardList size={48} className="mx-auto mb-4 text-text-muted" />
          <h4 className="font-bold text-lg mb-2">No errors logged yet</h4>
          <p className="text-sm text-text-muted max-w-xs mx-auto">When you get a quiz question wrong or make a writing mistake, it will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLog.slice().reverse().map((item, i) => {
            const originalIdx = progress.errorLog.length - 1 - i;
            return (
              <div key={originalIdx} className={cn(
                "card border-l-4 transition-all",
                item.resolved ? "border-green-accent bg-green-accent/5 opacity-70" : "border-red-accent"
              )}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "tag",
                      item.resolved ? "tag-green" : "tag-amber"
                    )}>{item.resolved ? "Resolved" : "Review Needed"}</span>
                    <span className="tag tag-gray text-[9px]">{item.cat}</span>
                    <span className="text-[10px] text-text-muted font-medium">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => toggleResolved(originalIdx)}
                      className="p-1.5 text-text-muted hover:text-green-accent transition-colors"
                      title={item.resolved ? "Reopen" : "Resolve"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteError(originalIdx)}
                      className="p-1.5 text-text-muted hover:text-red-accent transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-bold text-text-primary leading-relaxed">{item.error}</div>
                  {item.correction && (
                    <div className="text-xs text-green-accent font-medium flex items-start gap-2">
                      <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                      <span>Correction: {item.correction}</span>
                    </div>
                  )}
                  {item.note && (
                    <div className="text-[11px] text-text-muted italic leading-relaxed pl-5">
                      Note: {item.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
