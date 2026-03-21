"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Book, 
  ChevronDown, 
  CheckCircle2, 
  Lightbulb, 
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { callGemini } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2 } from "lucide-react";

import { GRAMMAR_DATA, GrammarTopic } from "@/lib/data/grammar";

export default function Grammar() {
  const [openSection, setOpenSection] = useState<string | null>("0-0");
  const [aiExplanation, setAiExplanation] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});

  const getAiExplanation = async (id: string, heading: string, content: string) => {
    setIsAnalyzing(prev => ({ ...prev, [id]: true }));
    const systemPrompt = `You are an IELTS grammar expert. Explain the grammar rule: "${heading}".
    Provide:
    1. A clear, high-band explanation of why this rule is important for IELTS.
    2. 2-3 advanced examples specifically for Writing Task 2.
    3. A common mistake students make with this rule and how to avoid it.
    Use markdown for formatting. Keep it concise.`;

    try {
      const result = await callGemini(`Rule: ${heading}\nContext: ${content}`, systemPrompt);
      setAiExplanation(prev => ({ ...prev, [id]: result }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [id]: false }));
    }
  };

  const [userSentence, setUserSentence] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const checkGrammar = async () => {
    if (!userSentence.trim()) return;
    setIsChecking(true);
    setCheckResult(null);
    const systemPrompt = `You are an IELTS grammar examiner. Analyze the student's sentence for grammatical accuracy and IELTS suitability.
    Provide:
    1. Corrected version (if needed).
    2. Explanation of errors.
    3. How to make it more "Band 7.5+" (e.g., using more complex structures or academic vocabulary).
    Use markdown for formatting.`;

    try {
      const result = await callGemini(`Sentence: ${userSentence}`, systemPrompt);
      setCheckResult(result);
    } catch (error) {
      console.error(error);
      setCheckResult("Failed to check grammar. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">📖 Grammar for IELTS</h2>
          <p className="text-sm text-text-muted">Essential grammar rules to boost your band score</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-dim/20 border border-blue-primary/20 rounded-full">
          <Sparkles size={14} className="text-blue-secondary" />
          <span className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">AI Powered</span>
        </div>
      </div>

      {/* Grammar Lab - New Section */}
      <div className="card bg-gradient-to-br from-blue-primary/10 to-bg-1 border-blue-primary/20 p-5 md:p-6">
        <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-3 md:mb-4">
          <Sparkles size={14} /> Grammar Lab (AI Checker)
        </div>
        <p className="text-[11px] md:text-xs text-text-secondary mb-4 leading-relaxed">
          Paste a sentence from your essay or speaking practice. Aria will analyze it and suggest high-band improvements.
        </p>
        <div className="space-y-3 md:space-y-4">
          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder="e.g., Technology have many benefits for the people."
            className="w-full bg-bg-1 border border-border-2 rounded-2xl p-3 md:p-4 text-sm text-text-primary focus:border-blue-primary outline-none min-h-[100px] resize-none font-serif"
          />
          <button
            onClick={checkGrammar}
            disabled={!userSentence.trim() || isChecking}
            className="btn btn-primary w-full py-3 md:py-3.5 disabled:opacity-50 text-xs md:text-sm"
          >
            {isChecking ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : "Check Grammar & Upgrade"}
          </button>

          <AnimatePresence>
            {checkResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-bg-2 border-blue-primary/20 mt-4"
              >
                <div className="prose prose-invert prose-sm max-w-none markdown-body">
                  <ReactMarkdown>{checkResult}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-6">
        {GRAMMAR_DATA.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-3">
            <h3 className="text-xs font-bold text-blue-secondary uppercase tracking-widest px-1">{group.title}</h3>
            <div className="space-y-2">
              {group.sections.map((sec, secIdx) => {
                const id = `${groupIdx}-${secIdx}`;
                const isOpen = openSection === id;

                return (
                  <div key={id} className="card border-border overflow-hidden p-0">
                    <button 
                      onClick={() => setOpenSection(isOpen ? null : id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-bg-2 transition-colors"
                    >
                      <span className="font-bold text-sm text-text-primary">{sec.heading}</span>
                      <ChevronDown size={18} className={cn("text-text-muted transition-transform duration-300", isOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-5 bg-bg-2/30 space-y-4">
                            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-serif">
                              {sec.content}
                            </div>

                            {isAnalyzing[id] ? (
                              <div className="flex items-center justify-center gap-2 text-blue-secondary text-xs animate-pulse py-4">
                                <Loader2 size={16} className="animate-spin" /> AI Tutor is explaining...
                              </div>
                            ) : aiExplanation[id] ? (
                              <div className="card bg-blue-dim/10 border-blue-primary/20 text-left">
                                <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
                                  <Sparkles size={14} /> AI Tutor Explanation
                                </div>
                                <div className="prose prose-invert prose-sm max-w-none markdown-body">
                                  <ReactMarkdown>{aiExplanation[id]}</ReactMarkdown>
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => getAiExplanation(id, sec.heading, sec.content)}
                                className="btn btn-ghost border-blue-primary/20 text-blue-secondary text-xs w-full py-2 hover:bg-blue-dim/10"
                              >
                                <Sparkles size={14} /> Get AI Explanation & Examples
                              </button>
                            )}
                            
                            <div className="p-4 bg-bg-3 rounded-xl border border-border-2 space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                <CheckCircle2 size={14} className="text-green-accent" /> Practice Task
                              </div>
                              <p className="text-xs text-text-primary">Write your own example sentence using this structure:</p>
                              <textarea 
                                placeholder="Type here..."
                                className="w-full bg-bg-1 border border-border-2 rounded-lg p-2.5 text-xs text-text-primary focus:border-blue-primary outline-none min-h-[60px] resize-none"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-br from-amber-accent/10 to-bg-1 border-amber-accent/20">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-amber-accent/10 text-amber-accent">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary mb-1">Common Grammar Trap</h4>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Avoid overusing &quot;I think&quot; or &quot;In my opinion&quot; in Task 2. Instead, use academic structures like &quot;It is widely argued that...&quot; or &quot;Evidence suggests that...&quot;
            </p>
            <button className="text-[10px] font-bold text-amber-accent uppercase tracking-wider flex items-center gap-1 hover:underline">
              Learn More <ChevronRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
