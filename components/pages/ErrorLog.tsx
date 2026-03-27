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
  Filter,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Loader2
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq } from "@/lib/groq";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Markdown from "react-markdown";

export default function ErrorLog() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ insight: string; recommendations: string[] } | null>(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      if (p.mistakeAnalysis) {
        setAnalysis({ insight: p.mistakeAnalysis.insight, recommendations: p.mistakeAnalysis.recommendations });
      }
    };
    load();
  }, []);

  const analyzeErrors = async () => {
    if (!progress || progress.errorLog.length < 3) return;
    setIsAnalyzing(true);
    try {
      const errorText = progress.errorLog.map(e => `[${e.cat}] ${e.error} -> ${e.correction}`).join("\n");
      const prompt = `Analyze these IELTS practice errors and provide:
      1. A concise summary of the main patterns (e.g., "You consistently struggle with Subject-Verb Agreement in Writing").
      2. Three specific, actionable recommendations to fix these patterns.
      
      Errors:
      ${errorText}
      
      Return in JSON format: { "insight": "...", "recommendations": ["...", "...", "..."] }`;
      
      const result = await callGroq(prompt, "You are an expert IELTS analyst. Provide structured feedback.");
      const parsed = JSON.parse(result.replace(/```json|```/g, "").trim());
      
      const updated = { 
        ...progress, 
        mistakeAnalysis: { 
          date: new Date().toISOString(), 
          insight: parsed.insight, 
          recommendations: parsed.recommendations 
        } 
      };
      setProgress(updated);
      saveProgress(updated);
      setAnalysis(parsed);
    } catch (e) {
      console.error("Analysis failed:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const catData = progress.errorLog.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.cat);
    if (existing) existing.value++;
    else acc.push({ name: curr.cat, value: 1 });
    return acc;
  }, []);

  const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-3xl font-black mb-1">📋 My Error Log</h2>
          <p className="text-sm text-text-muted">Track and review your mistakes to improve faster</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search errors..."
              className="w-full bg-bg-2 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:border-blue-primary outline-none"
            />
          </div>
          <button 
            onClick={analyzeErrors}
            disabled={isAnalyzing || progress.errorLog.length < 3}
            className="btn btn-primary bg-violet-accent hover:bg-violet-accent/80 px-4 py-2 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
            <span className="hidden md:inline ml-2 text-xs font-bold uppercase tracking-widest">Analyze Patterns</span>
          </button>
        </div>
      </div>

      {progress.errorLog.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card bg-gradient-to-br from-violet-accent/10 to-bg-1 border-violet-accent/20 p-6">
            <div className="flex items-center gap-2 text-violet-accent font-black text-xs uppercase tracking-widest mb-6">
              <Sparkles size={16} /> AI Mistake Analysis
            </div>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 size={32} className="animate-spin text-violet-accent" />
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Aria is identifying your weak spots...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">Key Insight</h4>
                  <p className="text-xs text-text-secondary leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                    &quot;{analysis.insight}&quot;
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-bg-2 rounded-xl border border-border-2">
                        <div className="w-5 h-5 rounded-full bg-violet-accent/20 flex items-center justify-center text-[10px] font-black text-violet-accent shrink-0">{i+1}</div>
                        <p className="text-[11px] text-text-secondary leading-tight">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BrainCircuit size={32} className="text-text-muted opacity-20 mb-4" />
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest max-w-xs">
                  {progress.errorLog.length < 3 
                    ? "Log at least 3 errors to unlock AI analysis" 
                    : "Click 'Analyze Patterns' to get expert feedback"}
                </p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 text-blue-secondary font-black text-xs uppercase tracking-widest mb-6">
              <TrendingUp size={16} /> Category Breakdown
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {catData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {catData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{cat.name}</span>
                  </div>
                  <span className="text-xs font-black text-text-primary">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
