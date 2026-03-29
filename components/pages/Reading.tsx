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
import { cn } from "@/lib/utils";
import { callGroq, callGroqJSON } from "@/lib/groq";
import ReactMarkdown from "react-markdown";

const READING_SAMPLES: any[] = [];

const READING_PASSAGES: any[] = [];

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

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
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
    
    const correctCount = activePassage.questions.filter((q: any, i: number) => userAnswers[i] === q.answer).length;
    const score = (correctCount / activePassage.questions.length) * 9;

    if (progress) {
      const updated = { 
        ...progress, 
        studyMinutes: (progress.studyMinutes || 0) + activePassage.mins,
        bands: { ...progress.bands, reading: Math.max(progress.bands?.reading || 0, score) }
      };
      saveProgress(updated);
      setProgress(updated);
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
            <div className="space-y-4 flex flex-col h-[40vh] lg:h-full">
              <div className="card bg-bg-2 border-border-2 flex-1 overflow-y-auto custom-scrollbar p-6">
                <h3 className="font-serif font-bold text-xl mb-4 sticky top-0 bg-bg-2 py-2 border-b border-border-2">{activePassage.title}</h3>
                <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {activePassage.text}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col h-[50vh] lg:h-full">
              <div className="font-bold text-sm flex items-center gap-2 px-1 shrink-0">
                <PenTool size={16} className="text-blue-secondary" /> Reading Questions
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activePassage.questions.map((q: any, i: number) => (
                <div key={i} className="card border-border">
                  <div className="text-xs font-bold text-text-primary mb-3">{i + 1}. {q.q}</div>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => !showResults && setUserAnswers({ ...userAnswers, [i]: optIdx })}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-xs transition-all",
                          userAnswers[i] === optIdx 
                            ? "bg-blue-primary border-blue-primary text-white" 
                            : "bg-bg border-border-2 text-text-secondary hover:border-blue-primary",
                          showResults && optIdx === q.answer && "border-green-accent bg-green-accent/10 text-green-accent",
                          showResults && userAnswers[i] === optIdx && optIdx !== q.answer && "border-red-accent bg-red-accent/10 text-red-accent"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!showResults ? (
              <button onClick={handleCheck} className="btn btn-primary w-full py-4">Submit Answers</button>
            ) : (
              <div className="space-y-6">
                <div className="card bg-blue-dim/10 border-blue-primary/20 text-center py-6">
                  <Trophy size={32} className="mx-auto text-yellow-500 mb-2" />
                  <div className="text-xl font-black text-blue-primary">
                    Band {((activePassage.questions.filter((q: any, i: number) => userAnswers[i] === q.answer).length / activePassage.questions.length) * 9).toFixed(1)}
                  </div>
                </div>

                <div className="card bg-bg-2 border-border-2 p-6">
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
    <div className="space-y-8">
      {/* Reading Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 md:p-12 text-white shadow-2xl shadow-emerald-500/20">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <BookOpen size={200} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
            <Sparkles size={14} className="animate-pulse" /> Reading Mastery
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              ACADEMIC READING
            </h3>
            <p className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
              Master skimming, scanning, and detailed reading with our curated collection of IELTS-style passages.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg. Speed</span>
                <span className="text-xl font-black">240 wpm</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Accuracy</span>
                <span className="text-xl font-black">84%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">📖 Reading Academy</h2>
          <p className="text-sm text-text-muted">Master IELTS reading with academic passages and practice</p>
        </div>
        <div className="flex bg-bg-2 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab("practice")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "practice" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
          >
            Practice
          </button>
          <button 
            onClick={() => setActiveTab("samples")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "samples" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
          >
            Sample Q&A
          </button>
          <button 
            onClick={() => setActiveTab("ai-test")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "ai-test" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
          >
            AI Practice Test
          </button>
        </div>
      </div>

      {activeTab === "practice" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {READING_PASSAGES.map((passage) => (
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
      )}

      {activeTab === "samples" && (
        <div className="space-y-6">
          {READING_SAMPLES.map((sample) => (
            <div key={sample.id} className="card bg-bg-2 border-border-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">{sample.title}</h3>
                <span className="tag tag-blue">{sample.type}</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-bg-1 rounded-xl border border-border-2 text-sm text-text-secondary italic">
                  {sample.passage}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "ai-test" && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
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
