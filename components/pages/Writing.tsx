"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PenTool, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Trophy,
  MessageSquare,
  BookOpenCheck,
  Target
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq, callGroqJSON } from "@/lib/groq";
import ReactMarkdown from "react-markdown";

const WRITING_SAMPLES = [
  {
    id: "ws1",
    title: "Task 2: Education",
    type: "Task 2",
    question: "Some people think that it is better to educate boys and girls in separate schools. Others, however, believe that mixed schools are more beneficial. Discuss both views and give your opinion.",
    sampleAnswer: "The question of whether single-sex or co-educational schools are more effective for children's development is a subject of ongoing debate. While some argue that separate education allows for better focus and tailored teaching, I believe that mixed schools provide a more realistic and beneficial environment for future success...",
    analysis: "This essay follows a clear structure: Introduction, Body Paragraph 1 (Separate schools), Body Paragraph 2 (Mixed schools), and Conclusion with Opinion. It uses a wide range of vocabulary (e.g., 'co-educational', 'ongoing debate', 'tailored teaching') and complex sentence structures."
  }
];
import { ChartDisplay } from "@/components/ChartDisplay";
import { STRUCTURE_TASKS, WRITING_TASKS } from "@/lib/content";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export default function Writing() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState<"practice" | "samples" | "ai-test" | "structure">("practice");
  const [activeTask, setActiveTask] = useState<any>(null);
  const [userText, setUserText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;
  const targetWords = activeTask?.type === "Task 1" ? 150 : 250;
  const wordCountPct = Math.min(100, (wordCount / targetWords) * 100);

  const [feedback, setFeedback] = useState<any>(null);
  const [smartReview, setSmartReview] = useState<any[] | null>(null);
  const [feedbackTab, setFeedbackTab] = useState<"report" | "review" | "band9">("report");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [band9Version, setBand9Version] = useState<string | null>(null);
  const [liveBandEstimate, setLiveBandEstimate] = useState<number>(1.0);
  
  // Structure Analysis State
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [userAnalysis, setUserAnalysis] = useState<Record<string, string>>({});
  const [structureFeedback, setStructureFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Simple real-time band estimator logic
    const words = userText.trim() ? userText.trim().split(/\s+/).length : 0;
    const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    let estimate = 1.0;
    
    // Word count factor
    if (words > 50) estimate += 1.0;
    if (words > 150) estimate += 1.5;
    if (words > 250) estimate += 1.0;
    
    // Sentence complexity factor (very simple proxy)
    const avgSentenceLength = sentences > 0 ? words / sentences : 0;
    if (avgSentenceLength > 10) estimate += 1.0;
    if (avgSentenceLength > 20) estimate += 1.0;
    
    // Cap it at 8.5 for the live estimate (to be safe)
    setLiveBandEstimate(Math.min(8.5, estimate));
  }, [userText]);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTask && timeLeft > 0 && !feedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTask, timeLeft, feedback]);

  const startTask = (task: any) => {
    setActiveTask(task);
    setUserText("");
    setFeedback(null);
    setStructureFeedback(null);
    setUserAnalysis({});
    setSelectedElement(null);
    setTimeLeft(task.mins * 60);
  };

  const generateAIPractice = async () => {
    setIsGenerating(true);
    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        type: { type: "string" },
        prompt: { type: "string" },
        wordCount: { type: "number" },
        mins: { type: "number" },
        difficulty: { type: "string" }
      },
      required: ["title", "type", "prompt", "wordCount", "mins", "difficulty"]
    };

    const prompt = "Generate a unique IELTS Writing Task 2 prompt. The topic should be modern and relevant (e.g., technology, environment, society).";

    try {
      const result = await callGroqJSON(prompt, schema, "You are an IELTS Writing expert.");
      startTask({
        id: "ai-task-" + Date.now(),
        ...result
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderHighlightedText = (text: string, errors: any[]) => {
    if (!errors || errors.length === 0) return text;
    
    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Sort errors by their appearance in text to handle them sequentially
    const sortedErrors = [...errors].sort((a, b) => {
      const indexA = text.indexOf(a.original);
      const indexB = text.indexOf(b.original);
      return indexA - indexB;
    });

    sortedErrors.forEach((err, i) => {
      const index = text.indexOf(err.original, lastIndex);
      if (index !== -1) {
        // Add text before error
        parts.push(text.substring(lastIndex, index));
        // Add highlighted error
        parts.push(
          <span 
            key={i} 
            className={cn(
              "px-1 rounded cursor-help transition-colors",
              err.type === "grammar" ? "bg-red-accent/20 border-b-2 border-red-accent" : 
              err.type === "spelling" ? "bg-amber-accent/20 border-b-2 border-amber-accent" : 
              "bg-blue-primary/20 border-b-2 border-blue-primary"
            )}
            title={err.explanation}
          >
            {err.original}
          </span>
        );
        lastIndex = index + err.original.length;
      }
    });
    
    // Add remaining text
    parts.push(text.substring(lastIndex));
    return parts;
  };

  const handleAnalyzeStructure = async () => {
    if (Object.keys(userAnalysis).length === 0) return;
    setIsAnalyzing(true);
    
    const systemPrompt = `You are an IELTS Writing expert. A student has analyzed the structure of an essay.
    Essay: ${activeTask.essay}
    Student's Analysis: ${JSON.stringify(userAnalysis)}
    Provide feedback on their analysis. For each identified element, tell them if they correctly identified it and why.
    If they missed something or identified it incorrectly, explain the correct structure.
    Use markdown for formatting.`;

    try {
      const result = await callGroq("Analyze my essay structure identification.", systemPrompt);
      setStructureFeedback(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (userText.trim().length < 50) return;
    setIsAnalyzing(true);
    
    const systemPrompt = `You are an expert IELTS Writing Examiner. Analyze the following essay for ${activeTask.type}.
    Provide a detailed report in JSON format with the following structure:
    {
      "overallBand": number,
      "criteria": {
        "taskResponse": { "score": number, "feedback": "string" },
        "coherenceCohesion": { "score": number, "feedback": "string" },
        "lexicalResource": { "score": number, "feedback": "string" },
        "grammaticalRange": { "score": number, "feedback": "string" }
      },
      "detailedFeedback": "string (markdown)",
      "keyImprovement": "string"
    }
    Essay: ${userText}`;

    const smartReviewPrompt = `Analyze the following IELTS essay for grammar, spelling, and vocabulary errors. 
    Return ONLY a JSON array of objects:
    [
      { "original": "text with error", "correction": "corrected text", "type": "grammar" | "spelling" | "vocabulary", "explanation": "brief explanation" }
    ]
    Essay: ${userText}`;

    const band9Prompt = `You are an IELTS Band 9 candidate. Rewrite the following student essay to achieve a perfect Band 9 score. 
    Maintain the student's original ideas but use sophisticated vocabulary, complex grammatical structures, and perfect cohesion.
    Essay: ${userText}`;

    try {
      const [result, smartResult, band9Result] = await Promise.all([
        callGroq(systemPrompt, "Return ONLY JSON."),
        callGroq(smartReviewPrompt, "Return ONLY JSON."),
        callGroq(userText, band9Prompt)
      ]);

      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setFeedback(JSON.parse(jsonMatch[0]));
        }
      } catch (e) {
        console.error("Failed to parse main feedback JSON", e);
        setFeedback({ detailedFeedback: result }); // Fallback
      }

      setBand9Version(band9Result);
      try {
        const jsonMatch = smartResult.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          setSmartReview(JSON.parse(jsonMatch[0]));
        }
      } catch (e) {
        console.error("Failed to parse smart review JSON", e);
      }
      
      if (progress) {
        const updated = { 
          ...progress, 
          studyMinutes: (progress.studyMinutes || 0) + activeTask.mins,
          courseXP: progress.courseXP + 100
        };
        saveProgress(updated);
        setProgress(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!progress) return null;

  if (activeTask) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

    if (activeTask.type === "Structure Analysis") {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="flex items-center justify-between bg-bg-1/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setActiveTask(null)} 
                className="w-14 h-14 rounded-2xl bg-bg-2 text-text-muted hover:text-text-primary hover:bg-white/5 transition-all flex items-center justify-center border border-white/5 group shadow-xl"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <div className="text-blue-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-2">
                  Structural Mastery
                </div>
                <h3 className="recipe-editorial-h1 text-4xl">Essay Architecture</h3>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 bg-blue-primary/5 px-6 py-3 rounded-2xl border border-blue-primary/10">
              <Sparkles size={18} className="text-blue-secondary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-secondary">AI-Guided Analysis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6 flex flex-col h-[45vh] lg:h-[70vh]">
              <div className="card bg-bg-1/80 backdrop-blur-xl border-white/5 flex-1 overflow-y-auto custom-scrollbar p-10 rounded-[3rem] shadow-2xl relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <FileText size={150} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="tag tag-violet px-5 py-2 rounded-xl">{activeTask.type}</span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-2/50 px-4 py-1.5 rounded-lg border border-white/5">{activeTask.difficulty}</span>
                  </div>
                  <h3 className="recipe-editorial-h1 text-2xl mb-8">{activeTask.title}</h3>
                  <div className="prose prose-invert prose-lg max-w-none text-text-primary leading-[1.8] whitespace-pre-wrap font-serif select-text opacity-90 italic">
                    {activeTask.essay}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col h-[55vh] lg:h-[70vh]">
              <div className="card border-white/5 p-10 flex flex-col flex-1 rounded-[3rem] shadow-3xl bg-bg-1/80 backdrop-blur-xl">
                <div className="flex items-center gap-4 text-blue-secondary font-black text-[11px] uppercase tracking-[0.3em] mb-6">
                  <Target size={18} /> Component Identification
                </div>
                <p className="text-sm text-text-muted mb-10 leading-relaxed font-medium">
                  Select an architectural element below, then isolate and paste the corresponding segment from the essay.
                </p>

                <div className="space-y-4 mb-10 overflow-y-auto custom-scrollbar pr-2">
                  {activeTask.elements.map((el: any) => (
                    <div key={el.id} className="space-y-3">
                      <button
                        onClick={() => setSelectedElement(el.id)}
                        className={cn(
                          "w-full p-6 rounded-[1.5rem] border text-left transition-all duration-500 flex items-center justify-between group shadow-lg",
                          selectedElement === el.id 
                            ? "bg-blue-primary/10 border-blue-primary shadow-blue-primary/10" 
                            : "bg-bg-2/50 border-white/5 hover:border-blue-primary/30 hover:bg-bg-2"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            selectedElement === el.id ? "bg-blue-primary text-white" : "bg-bg-1 text-text-muted group-hover:text-blue-secondary"
                          )}>
                            <PenTool size={18} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">{el.label}</div>
                            <div className="text-[10px] text-text-muted font-medium">{el.description}</div>
                          </div>
                        </div>
                        {userAnalysis[el.id] && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 size={20} className="text-green-accent" />
                          </motion.div>
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {selectedElement === el.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="overflow-hidden"
                          >
                            <textarea
                              value={userAnalysis[el.id] || ""}
                              onChange={(e) => setUserAnalysis(prev => ({ ...prev, [el.id]: e.target.value }))}
                              placeholder={`Paste the identified ${el.label} segment here...`}
                              className="w-full bg-bg-1/50 border border-white/10 rounded-[1.5rem] p-6 text-base text-text-primary outline-none focus:border-blue-primary min-h-[120px] resize-none leading-relaxed font-serif shadow-inner placeholder:text-text-muted/20"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  {!structureFeedback ? (
                    <motion.button 
                      whileHover={{ scale: 1.01, y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAnalyzeStructure} 
                      disabled={isAnalyzing || Object.keys(userAnalysis).length === 0}
                      className="group relative overflow-hidden btn btn-primary w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-3xl shadow-blue-primary/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="flex items-center justify-center gap-3">
                        {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isAnalyzing ? "Aria is verifying..." : "Verify Structural Analysis"}
                      </div>
                    </motion.button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="card bg-blue-dim/20 border-blue-primary/20 rounded-[2.5rem] p-8 shadow-3xl">
                        <div className="flex items-center gap-3 text-blue-secondary font-black text-[11px] uppercase tracking-[0.3em] mb-6">
                          <MessageSquare size={18} /> AI Structural Feedback
                        </div>
                        <div className="prose prose-invert prose-lg max-w-none markdown-body h-[250px] overflow-y-auto pr-4 custom-scrollbar leading-relaxed">
                          <ReactMarkdown>{structureFeedback}</ReactMarkdown>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTask(null)} 
                        className="btn btn-ghost w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-white/5"
                      >
                        Explore Other Structures
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        id="writing-practice-container" 
        className={cn(
          "space-y-8 transition-all duration-700",
          isFocusMode ? "fixed inset-0 z-[100] bg-bg p-8 md:p-16 overflow-y-auto" : ""
        )}
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        {/* Practice Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-bg-1/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTask(null)}
              className="w-16 h-16 rounded-[2rem] bg-bg-2 text-text-muted hover:text-text-primary hover:bg-white/5 transition-all flex items-center justify-center border border-white/5 shadow-xl group"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[10px] text-blue-secondary font-black uppercase tracking-[0.3em]">{activeTask.type}</span>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">{activeTask.difficulty}</span>
              </div>
              <h3 className="recipe-editorial-h1 text-4xl md:text-5xl">{activeTask.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={cn(
                "px-8 py-4 rounded-[1.5rem] border transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-2xl",
                isFocusMode 
                  ? "bg-blue-primary text-white border-blue-primary shadow-blue-primary/30" 
                  : "bg-bg-2 text-text-muted border-white/5 hover:bg-white/5 hover:text-text-primary"
              )}
            >
              <Sparkles size={18} /> {isFocusMode ? "Exit Focus" : "Focus Mode"}
            </button>

            {/* Hardware Timer Widget */}
            <div className="recipe-hardware-widget flex items-center gap-6 px-8 py-4 bg-bg-2/80 backdrop-blur-xl border-white/10 rounded-[1.5rem] shadow-2xl">
              <div className="flex flex-col">
                <span className="recipe-hardware-label mb-1">Time Remaining</span>
                <div className="flex items-center gap-3">
                  <Clock size={20} className={cn(timeLeft < 300 ? "text-red-accent animate-pulse" : "text-blue-secondary")} />
                  <span className={cn("recipe-hardware-value text-3xl", timeLeft < 300 ? "text-red-accent" : "text-text-primary")}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
          {/* Prompt Section */}
          <div className="space-y-8 flex flex-col h-[40vh] lg:h-full">
            <div className="relative overflow-hidden card bg-bg-1/80 backdrop-blur-xl border-white/5 flex-1 overflow-y-auto custom-scrollbar p-10 rounded-[3.5rem] shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <PenTool size={200} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <span className="tag tag-blue px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl bg-blue-primary/10 border-blue-primary/20">
                    {activeTask.type}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-2/50 px-5 py-2 rounded-xl border border-white/5">
                    <Target size={16} className="text-blue-secondary" /> Min. {activeTask.wordCount} Words
                  </div>
                </div>

                <div className="prose prose-invert prose-xl max-w-none text-text-primary leading-relaxed mb-12 font-serif italic font-medium opacity-90">
                  <ReactMarkdown>{activeTask.prompt}</ReactMarkdown>
                </div>

                {activeTask.chartData && (
                  <div className="mb-10 p-8 bg-bg-2/50 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-inner group">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                      <FileText size={14} /> Data Visualization
                    </div>
                    <ChartDisplay type={activeTask.chartType} data={activeTask.chartData} />
                  </div>
                )}

                {activeTask.image && !activeTask.chartData && (
                  <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 mb-10 shadow-3xl group">
                    <img 
                      src={activeTask.image} 
                      alt="Writing Task Visual" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Writing Section */}
          <div className="space-y-8 flex flex-col h-[60vh] lg:h-full">
            <div className="card border-white/5 p-0 overflow-hidden flex flex-col flex-1 rounded-[3.5rem] shadow-3xl bg-bg-1/80 backdrop-blur-xl">
              <div className="bg-bg-2/50 backdrop-blur-xl px-10 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Drafting Area</div>
                  <div className="flex items-center gap-6">
                    <div className="h-2.5 w-40 bg-bg-1 rounded-full overflow-hidden border border-white/5 shadow-inner p-0.5">
                      <motion.div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500 shadow-lg",
                          wordCount >= activeTask.wordCount ? "bg-green-accent shadow-green-accent/20" : "bg-blue-primary shadow-blue-primary/20"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${wordCountPct}%` }}
                      />
                    </div>
                    <span className={cn("text-[11px] font-black uppercase tracking-widest", wordCount >= activeTask.wordCount ? "text-green-accent" : "text-text-muted")}>
                      {wordCount} <span className="opacity-20 mx-1">/</span> {activeTask.wordCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-blue-primary/5 px-6 py-2 rounded-2xl border border-blue-primary/10">
                  <Sparkles size={16} className="text-blue-secondary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-secondary">
                    Live Estimate: <span className="text-sm ml-1">Band {liveBandEstimate.toFixed(1)}</span>
                  </span>
                </div>
              </div>
              
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Begin your response here. Focus on structure, vocabulary, and coherence..."
                disabled={isAnalyzing || !!feedback}
                className="w-full flex-1 bg-transparent p-12 text-xl outline-none resize-none leading-[1.8] custom-scrollbar font-serif text-text-primary placeholder:text-text-muted/20 selection:bg-blue-primary/20"
              />
            </div>

            {!feedback ? (
              <motion.button 
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleAnalyze} 
                disabled={isAnalyzing || userText.trim().length < 50}
                className="group relative overflow-hidden btn btn-primary w-full py-8 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-3xl shadow-blue-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="flex items-center justify-center gap-4">
                  {isAnalyzing ? <Loader2 size={28} className="animate-spin" /> : <Sparkles size={28} />}
                  {isAnalyzing ? "Aria is evaluating your work..." : "Submit for Expert Evaluation"}
                </div>
              </motion.button>
            ) : (
              <div className="space-y-8 flex-1 flex flex-col min-h-0">
                {/* Feedback Tabs */}
                <div className="flex bg-bg-2/50 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/5 shrink-0 shadow-2xl">
                  {[
                    { id: "report", label: "Examiner Report", color: "blue" },
                    { id: "review", label: "Smart Review", color: "amber" },
                    { id: "band9", label: "Band 9 Version", color: "violet" },
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setFeedbackTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                        feedbackTab === tab.id 
                          ? tab.color === "blue" ? "bg-blue-primary text-white shadow-xl shadow-blue-primary/30" :
                            tab.color === "amber" ? "bg-amber-accent text-white shadow-xl shadow-amber-accent/30" :
                            "bg-violet-accent text-white shadow-xl shadow-violet-accent/30"
                          : "text-text-muted hover:text-text-primary hover:bg-white/5"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 min-h-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={feedbackTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full"
                    >
                      {feedbackTab === "report" ? (
                        <div className="card bg-bg-1/80 backdrop-blur-xl border-white/5 h-full flex flex-col overflow-hidden rounded-[3.5rem] p-0 shadow-3xl">
                          <div className="p-10 border-b border-white/5 flex items-center justify-between shrink-0 bg-blue-primary/5">
                            <div className="flex items-center gap-4 text-blue-secondary font-black text-[12px] uppercase tracking-[0.3em]">
                              <div className="w-10 h-10 rounded-2xl bg-blue-primary/10 flex items-center justify-center">
                                <MessageSquare size={20} />
                              </div>
                              AI Examiner Report
                            </div>
                            {feedback?.overallBand && (
                              <div className="flex items-center gap-6 bg-blue-primary text-white px-8 py-3 rounded-[1.5rem] shadow-3xl shadow-blue-primary/30">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Overall Band</span>
                                <span className="text-3xl font-black">{feedback.overallBand}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                            {/* Criteria Scores */}
                            {feedback?.criteria && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(feedback.criteria).map(([key, data]: [string, any]) => (
                                  <div key={key} className="p-8 bg-bg-2/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] space-y-6 shadow-inner group hover:border-blue-primary/20 transition-all">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-blue-secondary transition-colors">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </span>
                                      <span className="text-xl font-black text-blue-secondary">Band {data.score}</span>
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed font-medium">{data.feedback}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Key Improvement */}
                            {feedback?.keyImprovement && (
                              <div className="p-10 bg-violet-accent/5 border border-violet-accent/10 rounded-[3rem] relative overflow-hidden shadow-inner group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                                  <Sparkles size={120} className="text-violet-accent" />
                                </div>
                                <div className="relative z-10">
                                  <div className="text-[10px] font-black text-violet-accent uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-violet-accent/10 flex items-center justify-center">
                                      <Target size={16} />
                                    </div>
                                    Critical Focus Area
                                  </div>
                                  <p className="text-2xl text-text-primary font-bold leading-relaxed tracking-tight">
                                    {feedback.keyImprovement}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="prose prose-invert prose-xl max-w-none markdown-body">
                              <ReactMarkdown>{feedback?.detailedFeedback || ""}</ReactMarkdown>
                            </div>
                            
                            {/* Coherence & Cohesion Visualizer */}
                            <div className="mt-12 pt-12 border-t border-white/5">
                              <div className="text-[12px] font-black text-blue-secondary uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-blue-primary/10 flex items-center justify-center">
                                  <BookOpenCheck size={20} />
                                </div>
                                Structural Mapping
                              </div>
                              <div className="space-y-6">
                                {userText.split('\n\n').map((para, idx) => (
                                  <div key={idx} className="flex gap-8 group">
                                    <div className="w-2 bg-blue-primary/10 rounded-full shrink-0 group-hover:bg-blue-primary transition-all duration-500" />
                                    <div className="flex-1 p-8 bg-bg-2/30 rounded-[2.5rem] border border-white/5 text-base text-text-muted group-hover:border-blue-primary/20 group-hover:bg-bg-2/50 transition-all duration-500 shadow-inner">
                                      <div className="font-black text-blue-secondary mb-4 uppercase tracking-[0.2em] text-[10px]">
                                        {idx === 0 ? "Introduction" : idx === userText.split('\n\n').length - 1 ? "Conclusion" : `Body Paragraph ${idx}`}
                                      </div>
                                      <div className="italic leading-relaxed font-medium text-lg">&quot;{para.substring(0, 200)}...&quot;</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : feedbackTab === "review" ? (
                        <div className="card bg-bg-1/80 backdrop-blur-xl border-white/5 h-full flex flex-col rounded-[3.5rem] p-0 overflow-hidden shadow-3xl">
                          <div className="p-10 border-b border-amber-accent/10 flex items-center gap-4 text-amber-accent font-black text-[12px] uppercase tracking-[0.3em] bg-amber-accent/5">
                            <div className="w-10 h-10 rounded-2xl bg-amber-accent/10 flex items-center justify-center">
                              <Sparkles size={20} />
                            </div>
                            Smart Error Review
                          </div>
                          <div className="overflow-y-auto p-10 custom-scrollbar flex-1 space-y-12">
                            <div className="p-10 bg-bg-2/30 rounded-[3rem] border border-white/5 shadow-inner text-2xl leading-[1.8] font-serif whitespace-pre-wrap text-text-primary italic opacity-90">
                              {smartReview ? (
                                renderHighlightedText(userText, smartReview)
                              ) : (
                                userText
                              )}
                            </div>
                            
                            <div className="space-y-8">
                              <div className="recipe-editorial-label text-text-muted px-2">Identified Corrections</div>
                              <div className="grid grid-cols-1 gap-6">
                                {smartReview?.map((err, i) => (
                                  <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-8 bg-bg-2/50 border border-white/5 rounded-[2.5rem] flex items-start gap-8 group hover:border-amber-accent/30 transition-all duration-500 shadow-inner"
                                  >
                                    <div className={cn(
                                      "w-4 h-4 rounded-full mt-2.5 shrink-0 shadow-2xl",
                                      err.type === "grammar" ? "bg-red-accent shadow-red-accent/40" : err.type === "spelling" ? "bg-amber-accent shadow-amber-accent/40" : "bg-blue-primary shadow-blue-primary/40"
                                    )} />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-6 mb-4">
                                        <span className="text-lg font-black text-red-accent/40 line-through">{err.original}</span>
                                        <ChevronRight size={20} className="text-text-muted" />
                                        <span className="text-lg font-black text-green-accent">{err.correction}</span>
                                      </div>
                                      <p className="text-base text-text-muted font-medium leading-relaxed">{err.explanation}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="card bg-bg-1/80 backdrop-blur-xl border-white/5 h-full flex flex-col rounded-[3.5rem] p-0 overflow-hidden shadow-3xl">
                          <div className="p-10 border-b border-violet-accent/10 flex items-center gap-4 text-violet-accent font-black text-[12px] uppercase tracking-[0.3em] bg-violet-accent/5">
                            <div className="w-10 h-10 rounded-2xl bg-violet-accent/10 flex items-center justify-center">
                              <Trophy size={20} />
                            </div>
                            Band 9 Model Version
                          </div>
                          <div className="prose prose-invert prose-xl max-w-none markdown-body overflow-y-auto p-12 custom-scrollbar flex-1 font-serif leading-[1.8]">
                            <ReactMarkdown>{band9Version || "Generating Band 9 version..."}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <button 
                  onClick={() => { setActiveTask(null); setFeedback(null); setSmartReview(null); }} 
                  className="btn btn-ghost w-full py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all duration-500 border-white/5"
                >
                  Try Another Task
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-bg-1 border border-white/5 p-12 md:p-20">
        <div className="absolute inset-0 recipe-atmospheric-bg opacity-30" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-primary/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-blue-secondary font-black text-[11px] uppercase tracking-[0.4em] mb-8"
            >
              <div className="w-8 h-px bg-blue-secondary/30" />
              <PenTool size={16} /> Production Skills
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="recipe-editorial-h1 text-6xl md:text-8xl lg:text-9xl mb-8"
            >
              Writing <span className="text-blue-primary">Lab</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-muted leading-relaxed font-medium max-w-2xl"
            >
              Master IELTS Writing Task 1 & 2 with real-time AI evaluation, 
              structural analysis, and Band 9 model answers.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex bg-bg-2/50 backdrop-blur-xl p-2 rounded-[2rem] border border-white/5 shadow-2xl"
          >
            {[
              { id: "practice", label: "Practice", icon: PenTool },
              { id: "samples", label: "Samples", icon: FileText },
              { id: "ai-test", label: "AI Test", icon: Sparkles },
              { id: "structure", label: "Structure", icon: Target },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                  activeTab === tab.id 
                    ? "bg-blue-primary text-white shadow-xl shadow-blue-primary/30 scale-105" 
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {WRITING_TASKS.map((task, idx) => (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => startTask(task)}
              className="group relative overflow-hidden card w-full text-left p-10 rounded-[3rem] transition-all hover:shadow-3xl hover:shadow-blue-primary/10 border-white/5 hover:border-blue-primary/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className={cn(
                    "tag px-5 py-2 text-[10px] font-black rounded-2xl",
                    task.type === "Task 1" ? "tag-blue" : "tag-violet"
                  )}>{task.type}</span>
                  <div className="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <div className="flex items-center gap-2 bg-bg-2 px-4 py-2 rounded-xl border border-white/5">
                      <Clock size={12} className="text-blue-secondary" /> {task.mins} Mins
                    </div>
                  </div>
                </div>

                <h3 className="recipe-editorial-h1 text-3xl mb-6 group-hover:text-blue-secondary transition-colors duration-500">{task.title}</h3>
                
                <p className="text-lg text-text-muted line-clamp-2 mb-10 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  {task.prompt}
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-primary/10 flex items-center justify-center text-blue-primary">
                      <FileText size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{task.wordCount}+ Words</span>
                  </div>
                  <div className="w-14 h-14 rounded-[1.5rem] bg-bg-2 flex items-center justify-center group-hover:bg-blue-primary group-hover:text-white transition-all duration-500 group-hover:translate-x-2 shadow-lg">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {activeTab === "samples" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {WRITING_SAMPLES.map((sample, idx) => (
            <motion.div
              key={sample.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] blur-3xl" />
              <div className="card h-full flex flex-col p-10 bg-bg-1/80 backdrop-blur-xl border-white/5 rounded-[3rem] shadow-2xl hover:shadow-blue-primary/10 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                  <FileText size={150} />
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-primary/10 flex items-center justify-center text-blue-primary">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-blue-secondary uppercase tracking-[0.3em] mb-1">Band 9 Model</div>
                      <h3 className="recipe-editorial-h1 text-2xl group-hover:text-blue-secondary transition-colors">{sample.title}</h3>
                    </div>
                  </div>
                  <span className="tag tag-blue px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{sample.type}</span>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-bg-2/50 rounded-[2rem] border border-white/5 shadow-inner">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Target size={14} className="text-blue-secondary" /> The Question
                    </div>
                    <div className="text-lg text-text-primary font-medium leading-relaxed italic opacity-90">
                      &quot;{sample.question}&quot;
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-blue-secondary uppercase tracking-widest flex items-center gap-2 px-2">
                      <PenTool size={14} /> Model Answer
                    </div>
                    <div className="p-8 bg-bg-1/50 rounded-[2.5rem] text-base text-text-muted leading-[1.8] border border-white/5 font-serif shadow-inner h-[300px] overflow-y-auto custom-scrollbar pr-6">
                      {sample.sampleAnswer}
                    </div>
                  </div>

                  <div className="p-8 bg-blue-primary/5 border border-blue-primary/10 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center gap-3 text-[10px] font-black text-blue-secondary uppercase tracking-[0.3em] mb-4">
                      <Sparkles size={16} className="animate-pulse" /> Expert Analysis
                    </div>
                    <div className="text-sm text-text-muted leading-relaxed font-medium">
                      {sample.analysis}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "ai-test" && (
        <div className="relative overflow-hidden rounded-[3rem] bg-bg-1 border border-white/5 p-20 text-center">
          <div className="absolute inset-0 recipe-atmospheric-bg opacity-20" />
          <div className="relative z-10 flex flex-col items-center space-y-10">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 rounded-[2.5rem] bg-blue-primary/10 text-blue-primary flex items-center justify-center shadow-3xl shadow-blue-primary/10 border border-blue-primary/20"
            >
              <Sparkles size={60} />
            </motion.div>
            
            <div className="max-w-2xl mx-auto">
              <h3 className="recipe-editorial-h1 text-4xl mb-6">AI-Generated Writing Test</h3>
              <p className="text-xl text-text-muted leading-relaxed font-medium">
                Aria will synthesize a unique IELTS Writing prompt tailored to your level and provide expert feedback on your response.
              </p>
            </div>

            <button 
              onClick={generateAIPractice}
              disabled={isGenerating}
              className="group relative overflow-hidden btn btn-primary px-12 py-6 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-3xl shadow-blue-primary/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="flex items-center gap-4">
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                {isGenerating ? "Synthesizing Prompt..." : "Generate New Prompt"}
              </div>
            </button>
          </div>
        </div>
      )}

      {activeTab === "structure" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STRUCTURE_TASKS.map((task, idx) => (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => startTask(task)}
              className="group relative overflow-hidden card w-full text-left p-10 rounded-[3rem] transition-all hover:shadow-3xl hover:shadow-violet-accent/10 border-white/5 hover:border-violet-accent/30 bg-gradient-to-br from-violet-accent/5 to-bg-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className="tag tag-violet px-5 py-2 text-[10px] font-black rounded-2xl uppercase tracking-widest">{task.type}</span>
                  <div className="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                    <div className="flex items-center gap-2 bg-bg-2 px-4 py-2 rounded-xl border border-white/5">
                      <Clock size={12} className="text-violet-accent" /> {task.mins} Mins
                    </div>
                  </div>
                </div>

                <h3 className="recipe-editorial-h1 text-3xl mb-6 group-hover:text-violet-accent transition-colors duration-500">{task.title}</h3>
                
                <p className="text-lg text-text-muted line-clamp-2 mb-10 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  Analyze the structure of this high-band essay. Identify the introduction, thesis, topic sentences, and conclusion.
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-violet-accent/10 flex items-center justify-center text-violet-accent">
                      <Target size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{task.difficulty}</span>
                  </div>
                  <div className="w-14 h-14 rounded-[1.5rem] bg-bg-2 flex items-center justify-center group-hover:bg-violet-accent group-hover:text-white transition-all duration-500 group-hover:translate-x-2 shadow-lg">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
