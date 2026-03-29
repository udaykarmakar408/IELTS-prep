"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  PenTool,
  Trophy,
  AlertCircle,
  Sparkles,
  Loader2,
  MessageSquare,
  BookOpenCheck
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { calculateReadingBand } from "@/lib/ielts";
import { cn } from "@/lib/utils";
import { callGroq, callGroqJSON } from "@/lib/groq";
import ReactMarkdown from "react-markdown";

import { READING_PASSAGES, READING_SAMPLES, Sample } from "@/lib/data/ielts_content";

export default function Reading() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState<"practice" | "samples" | "ai-test">("practice");
  const [activePassage, setActivePassage] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dynamicPassages, setDynamicPassages] = useState<any[]>(READING_PASSAGES);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  const generateMorePassages = async () => {
    setIsGeneratingMore(true);
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          difficulty: { type: "string", enum: ["Medium", "Hard"] },
          mins: { type: "number" },
          text: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["multiple-choice", "tfng", "matching-headings", "matching-info", "completion"] },
                q: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                answer: { type: "string" },
                explanation: { type: "string" }
              },
              required: ["id", "type", "q", "answer"]
            }
          }
        },
        required: ["id", "title", "difficulty", "mins", "text", "questions"]
      }
    };

    const prompt = `Generate 3 new unique IELTS Academic Reading passages. 
    Ensure high academic quality and varied topics (e.g., science, history, sociology). 
    Each passage should have 13-14 questions.`;

    try {
      const result = await callGroqJSON(prompt, schema);
      if (result && Array.isArray(result)) {
        const newPassages = result.map((p: any) => ({
          ...p,
          id: `dynamic-${Date.now()}-${p.id}`
        }));
        setDynamicPassages(prev => [...prev, ...newPassages]);
      }
    } catch (error) {
      console.error("Failed to generate more passages:", error);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
    // Automatically generate more content on mount to provide a dynamic experience
    if (dynamicPassages.length <= READING_PASSAGES.length) {
      generateMorePassages();
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activePassage && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activePassage, timeLeft, showResults]);

  const generateAIPractice = async () => {
    setIsGenerating(true);
    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        difficulty: { type: "string" },
        mins: { type: "number" },
        passages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              text: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    type: { type: "string", enum: ["multiple-choice", "tfng", "matching-headings", "matching-info", "completion"] },
                    q: { type: "string" },
                    options: { type: "array", items: { type: "string" }, description: "Only for multiple-choice or matching-headings" },
                    answer: { type: "string" },
                    explanation: { type: "string" }
                  },
                  required: ["id", "type", "q", "answer"]
                }
              }
            },
            required: ["title", "text", "questions"]
          }
        }
      },
      required: ["title", "difficulty", "mins", "passages"]
    };

    const prompt = `Generate a full-length, Band 9.0 standard IELTS Academic Reading test with 3 passages (40 questions total).
    The content must be highly academic and professional, mimicking the complexity of Cambridge IELTS 15-19.
    
    Structure:
    - Passage 1: Descriptive/factual (13 questions). Mix multiple-choice and tfng.
    - Passage 2: Discursive/analytical (13 questions). Mix matching-headings and matching-info.
    - Passage 3: Complex argument (14 questions). Mix completion and multiple-choice.
    
    Each passage should be approx 1000-1200 words on a complex academic subject (science, history, environment, sociology).
    
    The passage should use sophisticated vocabulary, complex sentence structures, and subtle arguments to challenge even advanced learners.`;

    try {
      const result = await callGroqJSON(prompt, schema, "You are an IELTS Reading content creator.");
      setActivePassage(result);
      setUserAnswers({});
      setShowResults(false);
      setAiFeedback(null);
      setTimeLeft(result.mins * 60 || 20 * 60);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startPassage = (passage: any) => {
    setActivePassage(passage);
    setUserAnswers({});
    setShowResults(false);
    setAiFeedback(null);
    setTimeLeft(passage.mins * 60);
  };

  const handleCheck = async () => {
    setShowResults(true);
    setIsAnalyzing(true);
    
    let correctCount = 0;
    activePassage.questions.forEach((q: any, i: number) => {
      const userAns = (userAnswers[i] || "").toString().toLowerCase().trim();
      const correctAns = (q.answer || "").toString().toLowerCase().trim();
      if (userAns === correctAns) {
        correctCount++;
      }
    });

    const band = calculateReadingBand(correctCount);

    if (progress) {
      const updated = { 
        ...progress, 
        studyMinutes: (progress.studyMinutes || 0) + activePassage.mins,
        bands: { ...progress.bands, reading: band },
        bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: "reading" }],
        mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: `Practice: ${activePassage.title}`, band, skill: "reading" }],
      };
      setProgress(updated);
      saveProgress(updated);
    }

    // AI Assessment
    const prompt = `You are an IELTS Reading tutor. A student has completed a reading task.
    Passage Title: ${activePassage.title}
    Passage Text: ${activePassage.text}
    Questions and Correct Answers: ${JSON.stringify(activePassage.questions)}
    Student's Answers: ${JSON.stringify(userAnswers)}
    
    Provide a detailed assessment. Explain why the correct answers are correct and where the student might have gone wrong. Give tips for improving their reading score.
    Use markdown for formatting.`;

    try {
      const feedback = await callGroq(prompt, "You are an IELTS Reading tutor.");
      setAiFeedback(feedback);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!progress) return null;

  if (activePassage) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActivePassage(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className={cn(
            "flex items-center gap-2 font-mono text-sm",
            timeLeft < 300 ? "text-red-accent animate-pulse" : "text-blue-secondary"
          )}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)] min-h-[600px]">
          {/* Left Side: Passage */}
          <div className="lg:w-1/2 flex flex-col h-full">
            <div className="card bg-bg-2 border-border-2 flex-1 overflow-y-auto custom-scrollbar p-8 shadow-inner rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6 sticky top-0 bg-bg-2 py-2 z-10">
                <BookOpen size={14} /> Reading Passage
              </div>
              <h3 className="font-serif font-black text-3xl mb-8 text-text-primary leading-tight">{activePassage.title}</h3>
              <div className="prose prose-invert prose-sm md:prose-base max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap font-medium">
                {activePassage.text}
              </div>
            </div>
          </div>

          {/* Right Side: Questions */}
          <div className="lg:w-1/2 flex flex-col h-full gap-4">
            <div className="flex items-center justify-between px-1 shrink-0">
              <div className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 text-blue-secondary">
                <PenTool size={14} /> Questions 1-{activePassage.questions.length}
              </div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                {Object.keys(userAnswers).length}/{activePassage.questions.length} Answered
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {activePassage.questions.map((q: any, i: number) => (
                <div key={i} className="card border-border bg-white/5 hover:border-blue-primary/30 transition-all group rounded-xl">
                  <div className="flex gap-4">
                    <div className="text-lg font-serif font-black text-blue-secondary opacity-30 group-hover:opacity-100 transition-opacity shrink-0">{i + 1}.</div>
                    <div className="flex-1 space-y-4">
                      <p className="text-sm text-text-primary font-bold leading-relaxed">{q.q}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <button
                            key={optIdx}
                            onClick={() => !showResults && setUserAnswers({ ...userAnswers, [i]: optIdx })}
                            className={cn(
                              "w-full text-left p-4 rounded-xl border text-xs transition-all flex items-center gap-3",
                              userAnswers[i] === optIdx 
                                ? "bg-blue-primary border-blue-primary text-white shadow-lg shadow-blue-primary/20" 
                                : "bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:border-blue-primary/50",
                              showResults && optIdx === q.answer && "border-green-accent bg-green-accent/10 text-green-accent ring-1 ring-green-accent",
                              showResults && userAnswers[i] === optIdx && optIdx !== q.answer && "border-red-accent bg-red-accent/10 text-red-accent ring-1 ring-red-accent"
                            )}
                          >
                            <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center font-black text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        ))}
                      </div>
                      {showResults && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pt-2 border-t border-white/5">
                          {userAnswers[i] === q.answer 
                            ? <span className="text-green-accent flex items-center gap-1">✓ Correct</span> 
                            : <span className="text-red-accent flex items-center gap-1">✗ Correct Answer: {String.fromCharCode(65 + q.answer)}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!showResults ? (
              <button onClick={handleCheck} className="btn btn-primary w-full py-5 shadow-xl shadow-blue-primary/20 shrink-0">
                Submit Answers
              </button>
            ) : (
              <div className="space-y-6 shrink-0">
                <div className="card bg-blue-dim/10 border-blue-primary/20 text-center py-8 rounded-2xl">
                  <Trophy size={32} className="mx-auto text-yellow-500 mb-2" />
                  <div className="text-xl font-black text-blue-primary">
                    Band {calculateReadingBand(activePassage.questions.filter((q: any, i: number) => userAnswers[i] === q.answer).length)}
                  </div>
                </div>

                <div className="card bg-bg-2 border-border-2 p-8 rounded-2xl">
                  <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-4">
                    <Sparkles size={16} /> AI Assessment & Explanations
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 size={24} className="animate-spin text-blue-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aria is analyzing your performance...</span>
                      </div>
                    ) : (
                      <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                    )}
                  </div>
                </div>

                <button onClick={() => setActivePassage(null)} className="btn btn-ghost w-full">Try Another Passage</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="space-y-16 pb-20">
      {/* Reading Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-bg-1 border border-white/5 p-8 md:p-12 lg:p-16">
        <div className="absolute inset-0 recipe-atmospheric-bg opacity-30" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-end justify-between gap-12">
          <div className="max-w-3xl min-w-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="recipe-editorial-label mb-8 flex items-center gap-3"
            >
              <div className="w-8 h-px bg-emerald-500/30" />
              <BookOpen size={16} className="text-emerald-500" /> Receptive Skills
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="recipe-editorial-h1 mb-8"
            >
              Reading <span className="text-emerald-500">Academy</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary leading-relaxed font-medium max-w-2xl"
            >
              Master skimming, scanning, and detailed reading with our curated 
              collection of IELTS-style passages and AI-powered feedback.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap md:flex-nowrap bg-bg-2/50 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl"
          >
            {[
              { id: "practice", label: "Practice", icon: BookOpen },
              { id: "samples", label: "Samples", icon: FileText },
              { id: "ai-test", label: "AI Test", icon: Sparkles },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                  activeTab === tab.id 
                    ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 scale-105" 
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                )}
              >
                <tab.icon size={14} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {activeTab === "practice" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Practice Passages</h3>
            <button
              onClick={generateMorePassages}
              disabled={isGeneratingMore}
              className="flex items-center gap-2 text-[10px] font-bold text-violet-accent uppercase tracking-widest hover:underline disabled:opacity-50"
            >
              {isGeneratingMore ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {isGeneratingMore ? "Generating..." : "Generate More Practice Passages"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dynamicPassages.map((passage) => (
              <button
                key={passage.id}
                onClick={() => startPassage(passage)}
                className="group relative flex flex-col text-left bg-bg-2 border border-border rounded-[2rem] overflow-hidden transition-all hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 active:scale-[0.98]"
              >
                <div className="p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      passage.difficulty === "Medium" ? "bg-amber-dim text-amber-600" : "bg-red-dim text-red-accent"
                    )}>{passage.difficulty}</span>
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                      <Clock size={12} /> {passage.mins} Mins
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-black text-text-primary group-hover:text-emerald-600 transition-colors">{passage.title}</h3>
                  <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed">
                    {passage.text.substring(0, 150)}...
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{passage.questions.length} Questions</span>
                    <div className="w-10 h-10 rounded-full bg-bg-1 border border-border flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={generateMorePassages}
              disabled={isGeneratingMore}
              className="group flex items-center gap-3 px-8 py-4 bg-bg-2 border border-border rounded-xl hover:border-emerald-500/50 transition-all active:scale-95 disabled:opacity-50"
            >
              {isGeneratingMore ? (
                <Loader2 size={20} className="animate-spin text-emerald-600" />
              ) : (
                <Sparkles size={20} className="text-emerald-600 group-hover:animate-pulse" />
              )}
              <span className="text-sm font-bold text-text-primary">
                {isGeneratingMore ? "Generating New Passages..." : "Generate More Practice Passages"}
              </span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "samples" && (
        <div className="space-y-6">
          {READING_SAMPLES.map((sample) => (
            <div key={sample.id} className="card bg-bg-2 border-border-2 p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="tag tag-blue">{sample.type}</span>
                  <h3 className="font-bold text-text-primary">{sample.title}</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-bg-1 rounded-xl border border-border-2 text-sm text-text-secondary italic leading-relaxed">
                  <div className="text-[10px] font-bold text-blue-primary uppercase tracking-widest mb-2">Passage Snippet</div>
                  "{sample.passage}"
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-text-primary">Question: {sample.question}</div>
                  {sample.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sample.options.map((opt: string, i: number) => (
                        <div key={i} className="p-2 bg-bg-3 rounded-lg text-[10px] text-text-muted border border-border">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-green-accent/5 border border-green-accent/20 rounded-xl">
                  <div className="text-[10px] font-bold text-green-accent uppercase tracking-widest mb-1">Correct Answer</div>
                  <div className="text-sm font-bold text-text-primary mb-2">{sample.answer}</div>
                  <div className="text-[10px] text-text-muted leading-relaxed">
                    <span className="font-bold">Explanation:</span> {sample.explanation}
                  </div>
                </div>
                <div className="p-4 bg-violet-accent/5 border border-violet-accent/20 rounded-xl">
                  <div className="text-[10px] font-bold text-violet-accent uppercase tracking-widest mb-1">Examiner Analysis (Band {sample.band})</div>
                  <div className="text-xs text-text-secondary leading-relaxed">
                    {sample.analysis}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "ai-test" && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
            <Sparkles size={40} />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">AI-Generated Practice Test</h3>
            <p className="text-sm text-text-muted">
              Aria will generate a unique IELTS Academic Reading passage and set of questions tailored to your level.
            </p>
          </div>
          <button 
            onClick={generateAIPractice}
            disabled={isGenerating}
            className="btn btn-primary px-8 py-4 flex items-center gap-2"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isGenerating ? "Generating Test..." : "Generate New Test"}
          </button>
        </div>
      )}
    </div>
  );
}
