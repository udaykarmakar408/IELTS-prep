"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Book, ChevronDown, CheckCircle2, Lightbulb, AlertTriangle, ChevronRight, History, Trash2, Copy, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { callGroq } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2 } from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";

import { GRAMMAR_DATA, GrammarTopic } from "@/lib/data/grammar";

const GRAMMAR_EXAMPLES = [
  "Technology have many benefits for the people.",
  "In my opinion, I think that education is very important.",
  "The government should to spend more money on health.",
  "If I will go to the university, I will study engineering.",
  "There is many reasons why people like to travel.",
  "The number of people who smokes is increasing.",
  "I am agree with this statement because of several reasons.",
  "The environment is being polluted by many different ways.",
  "Most of people believe that money can buy happiness.",
  "Despite of the weather was bad, we went for a walk."
];

export default function Grammar() {
  const [progress, setProgress] = React.useState<UserProgress | null>(null);
  const [openSection, setOpenSection] = useState<string | null>("0-0");
  const [aiExplanation, setAiExplanation] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceEvaluations, setPracticeEvaluations] = useState<Record<string, string>>({});
  const [isEvaluatingTask, setIsEvaluatingTask] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const getAiExplanation = async (id: string, heading: string, content: string) => {
    setIsAnalyzing(prev => ({ ...prev, [id]: true }));
    const systemPrompt = `You are an IELTS grammar expert. Explain the grammar rule: "${heading}".
    Provide:
    1. A clear, high-band explanation of why this rule is important for IELTS.
    2. 2-3 advanced examples specifically for Writing Task 2.
    3. A common mistake students make with this rule and how to avoid it.
    Use markdown for formatting. Keep it concise.`;

    try {
      const result = await callGroq(`Rule: ${heading}\nContext: ${content}`, systemPrompt);
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
    const systemPrompt = `You are an expert IELTS Grammar Examiner (Aria). Your goal is to help the student achieve a Band 7.5+ in their writing and speaking by correcting their grammar and elevating their language.

Analyze the following sentence:
"${userSentence}"

Provide your analysis in the following structured format:

### 1. Corrected Version
> [Corrected Sentence Here]

### 2. Error Analysis
* **Grammar Points**: Identify specific errors (e.g., Subject-Verb Agreement, Article usage, Tense consistency).
* **Explanation**: Briefly explain why it was wrong and the rule behind it.

### 3. Elevate to Band 7.5+
* **Advanced Structure**: Suggest a more complex grammatical structure (e.g., inversion, conditional, passive voice, nominalization) that conveys the same meaning but more formally.
* **Lexical Upgrade**: Suggest 1-2 academic synonyms for common words used in the sentence.

### 4. IELTS Context
* Explain how this specific correction or upgrade helps in a Writing Task 1 or Task 2 context.

Use **Markdown** for formatting. Be encouraging but precise.`;

    try {
      const result = await callGroq(`Sentence: ${userSentence}`, systemPrompt);
      setCheckResult(result);
      
      if (progress) {
        const newHistory = [
          { sentence: userSentence, analysis: result, date: new Date().toISOString() },
          ...(progress.grammarHistory || [])
        ].slice(0, 10);
        
        const updated = { ...progress, grammarHistory: newHistory };
        setProgress(updated);
        saveProgress(updated);
      }
    } catch (error) {
      console.error(error);
      setCheckResult("Failed to check grammar. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const evaluateTask = async (id: string, heading: string, content: string) => {
    const answer = practiceAnswers[id];
    if (!answer || !answer.trim()) return;

    setIsEvaluatingTask(prev => ({ ...prev, [id]: true }));
    setPracticeEvaluations(prev => ({ ...prev, [id]: "" }));

    const systemPrompt = `You are an expert IELTS Grammar Tutor. The student has written a practice sentence for the grammar rule: "${heading}".
    
    Rule Context:
    ${content}
    
    Student's Sentence:
    "${answer}"
    
    Evaluate the sentence:
    1. **Accuracy**: Is the grammar rule applied correctly? Are there any other errors?
    2. **IELTS Suitability**: Is the sentence appropriate for an academic context (Writing Task 1 or 2)?
    3. **Band 7.5+ Upgrade**: Suggest a way to make the sentence even more sophisticated.
    
    Keep your feedback concise, encouraging, and highly professional. Use Markdown.`;

    try {
      const result = await callGroq(`Evaluate this sentence for the rule "${heading}": ${answer}`, systemPrompt);
      setPracticeEvaluations(prev => ({ ...prev, [id]: result }));
    } catch (error) {
      console.error(error);
      setPracticeEvaluations(prev => ({ ...prev, [id]: "Failed to evaluate. Please try again." }));
    } finally {
      setIsEvaluatingTask(prev => ({ ...prev, [id]: false }));
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

      {/* Grammar Lab - Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-primary via-blue-primary/90 to-blue-secondary p-8 md:p-12 text-white shadow-2xl shadow-blue-primary/20">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Book size={200} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
            <Sparkles size={14} className="animate-pulse" /> Grammar Lab (AI Checker)
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              UPGRADE TO 7.5+
            </h3>
            <p className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
              Paste your sentences below. Aria will analyze them for accuracy, IELTS suitability, and suggest high-band improvements.
            </p>
          </div>
          
          <div className="space-y-4 pt-4">
            <div className="relative group">
              <textarea
                value={userSentence}
                onChange={(e) => setUserSentence(e.target.value)}
                placeholder="e.g., Technology have many benefits for the people."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-lg text-white placeholder:text-white/40 focus:border-white/40 outline-none min-h-[160px] resize-none font-serif leading-relaxed transition-all group-hover:bg-white/15"
              />
              {!userSentence && (
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2 pointer-events-none">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest w-full mb-1">Try an example:</span>
                  {GRAMMAR_EXAMPLES.slice(0, 3).map((ex, i) => (
                    <button 
                      key={i}
                      onClick={(e) => { e.preventDefault(); setUserSentence(ex); }}
                      className="pointer-events-auto px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {ex.length > 30 ? ex.substring(0, 30) + "..." : ex}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={checkGrammar}
              disabled={!userSentence.trim() || isChecking}
              className="w-full py-5 bg-white text-blue-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {isChecking ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analyzing Sentence...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={18} />
                  <span>Check Grammar & Upgrade to 7.5+</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

          <AnimatePresence>
            {checkResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-bg-2 border-blue-primary/20 mt-4 p-0 overflow-hidden"
              >
                <div className="bg-blue-dim/10 px-4 py-2 border-b border-blue-primary/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">AI Analysis</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(checkResult)}
                    className="text-text-muted hover:text-blue-secondary transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <div className="p-5 prose prose-invert prose-sm max-w-none markdown-body">
                  <ReactMarkdown>{checkResult}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {progress?.grammarHistory && progress.grammarHistory.length > 0 && !checkResult && (
            <div className="pt-4 border-t border-border-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">
                <History size={12} /> Recent Checks
              </div>
              <div className="space-y-2">
                {progress.grammarHistory.slice(0, 3).map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => { setUserSentence(item.sentence); setCheckResult(item.analysis); }}
                    className="w-full text-left p-3 bg-bg-2/50 border border-border-2 rounded-xl hover:border-blue-primary/30 transition-all group"
                  >
                    <div className="text-xs text-text-primary line-clamp-1 mb-1 group-hover:text-blue-secondary transition-colors">{item.sentence}</div>
                    <div className="text-[9px] text-text-muted">{new Date(item.date).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                                value={practiceAnswers[id] || ""}
                                onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [id]: e.target.value }))}
                                className="w-full bg-bg-1 border border-border-2 rounded-lg p-2.5 text-xs text-text-primary focus:border-blue-primary outline-none min-h-[60px] resize-none"
                              />
                              <button 
                                onClick={() => evaluateTask(id, sec.heading, sec.content)}
                                disabled={!practiceAnswers[id]?.trim() || isEvaluatingTask[id]}
                                className="w-full py-2.5 bg-blue-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-blue-primary/10 transition-all active:scale-95"
                              >
                                {isEvaluatingTask[id] ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 size={12} className="animate-spin" />
                                    <span>Evaluating...</span>
                                  </div>
                                ) : (
                                  "Submit for Evaluation"
                                )}
                              </button>

                              <AnimatePresence>
                                {practiceEvaluations[id] && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-2"
                                  >
                                    <div className="p-4 bg-blue-dim/5 border border-blue-primary/10 rounded-xl text-[11px] leading-relaxed markdown-body overflow-hidden">
                                      <div className="flex items-center gap-2 text-blue-secondary font-bold text-[9px] uppercase tracking-widest mb-2">
                                        <Sparkles size={12} /> Feedback
                                      </div>
                                      <ReactMarkdown>{practiceEvaluations[id]}</ReactMarkdown>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
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
