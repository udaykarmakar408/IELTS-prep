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
  MessageSquare
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { ChartDisplay } from "@/components/ChartDisplay";
import { STRUCTURE_TASKS, WRITING_TASKS } from "@/lib/content";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export default function Writing() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTab, setActiveTab] = useState<"practice" | "structure">("practice");
  const [activeTask, setActiveTask] = useState<any>(null);
  const [userText, setUserText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [smartReview, setSmartReview] = useState<any[] | null>(null);
  const [feedbackTab, setFeedbackTab] = useState<"report" | "review">("report");
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Structure Analysis State
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [userAnalysis, setUserAnalysis] = useState<Record<string, string>>({});
  const [structureFeedback, setStructureFeedback] = useState<string | null>(null);

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
    
    const systemPrompt = `You are an expert IELTS Writing examiner with 20+ years of experience. 
    Analyze the student's response for a ${activeTask.type} task.
    
    Task Details:
    - Title: ${activeTask.title}
    - Prompt: ${activeTask.prompt}
    ${activeTask.chartData ? `- Data provided: ${JSON.stringify(activeTask.chartData)}` : ""}
    
    Provide a comprehensive evaluation following the official IELTS marking criteria:
    
    1. **Estimated Band Score**: Provide a realistic band score (0-9) based on the overall performance.
    
    2. **Task Achievement (Task 1) / Task Response (Task 2)**: 
       - Did they cover all parts of the prompt?
       - For Task 1: Did they select and report main features? Did they make relevant comparisons?
       - For Task 2: Did they address all parts of the question? Is their position clear?
    
    3. **Coherence and Cohesion**:
       - Is the essay logically organized?
       - Are cohesive devices used effectively and naturally?
       - Is paragraphing appropriate?
    
    4. **Lexical Resource**:
       - Is there a wide range of vocabulary?
       - Is the vocabulary used accurately and appropriately for the context?
       - Are there any errors in spelling or word formation?
    
    5. **Grammatical Range and Accuracy**:
       - Is there a variety of complex sentence structures?
       - Are the sentences accurate?
       - Are there frequent error-free sentences?
    
    6. **Specific Suggestions for Improvement**:
       - Provide 3-5 actionable tips to help the student reach a higher band (Target: Band 7.5+).
       - Point out specific sentences that could be improved and provide a better version.
    
    Use clear Markdown formatting with bold headers and bullet points. Be encouraging but strictly professional.`;

    const smartReviewPrompt = `You are an IELTS Writing proofreader. Analyze the following essay and identify ALL grammatical, spelling, and vocabulary errors.
    Return ONLY a JSON array of objects with this structure:
    [
      { "original": "text with error", "correction": "corrected text", "type": "grammar" | "spelling" | "vocabulary", "explanation": "brief explanation" }
    ]
    Essay: ${userText}`;

    try {
      const [result, smartResult] = await Promise.all([
        callGroq(userText, systemPrompt),
        callGroq(smartReviewPrompt, "Return ONLY JSON.")
      ]);

      setFeedback(result);
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setActiveTask(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="text-blue-secondary font-bold text-sm uppercase tracking-widest">
              Structure Analysis
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 flex flex-col">
              <div className="card bg-bg-2 border-border-2 flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="tag tag-violet">{activeTask.type}</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{activeTask.difficulty}</span>
                </div>
                <h3 className="font-serif font-bold text-lg mb-4">{activeTask.title}</h3>
                <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap font-serif select-text">
                  {activeTask.essay}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col">
              <div className="card border-border-2 p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-4">
                  <Sparkles size={14} /> Identify Essay Elements
                </div>
                <p className="text-xs text-text-muted mb-6">
                  Select an element from the list below, then copy and paste the corresponding text from the essay into the box.
                </p>

                <div className="space-y-4 mb-6">
                  {activeTask.elements.map((el: any) => (
                    <div key={el.id} className="space-y-2">
                      <button
                        onClick={() => setSelectedElement(el.id)}
                        className={cn(
                          "w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group",
                          selectedElement === el.id ? "bg-blue-primary/10 border-blue-primary" : "bg-bg-2 border-border-2 hover:border-blue-primary/50"
                        )}
                      >
                        <div>
                          <div className="text-xs font-bold text-text-primary">{el.label}</div>
                          <div className="text-[10px] text-text-muted">{el.description}</div>
                        </div>
                        {userAnalysis[el.id] && <CheckCircle2 size={16} className="text-green-accent" />}
                      </button>
                      
                      {selectedElement === el.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-2"
                        >
                          <textarea
                            value={userAnalysis[el.id] || ""}
                            onChange={(e) => setUserAnalysis(prev => ({ ...prev, [el.id]: e.target.value }))}
                            placeholder={`Paste the ${el.label} here...`}
                            className="w-full bg-bg-1 border border-border-2 rounded-xl p-3 text-xs text-text-primary outline-none focus:border-blue-primary min-h-[80px] resize-none"
                          />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {!structureFeedback ? (
                  <button 
                    onClick={handleAnalyzeStructure} 
                    disabled={isAnalyzing || Object.keys(userAnalysis).length === 0}
                    className="btn btn-primary w-full py-4 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {isAnalyzing ? "AI is checking..." : "Check My Analysis"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="card bg-blue-dim/10 border-blue-primary/20">
                      <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-4">
                        <MessageSquare size={14} /> AI Analysis Feedback
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none markdown-body h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <ReactMarkdown>{structureFeedback}</ReactMarkdown>
                      </div>
                    </div>
                    <button onClick={() => setActiveTask(null)} className="btn btn-ghost w-full">Try Another Task</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveTask(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
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
          <div className="space-y-4 flex flex-col h-[30vh] lg:h-full">
            <div className="card bg-bg-2 border-border-2 flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="tag tag-blue">{activeTask.type}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Min. {activeTask.wordCount} Words</span>
              </div>
              <h3 className="font-serif font-bold text-lg mb-4">{activeTask.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">
                {activeTask.prompt}
              </p>
              {activeTask.chartData && (
                <div className="mb-4">
                  <ChartDisplay type={activeTask.chartType} data={activeTask.chartData} />
                </div>
              )}
              {activeTask.image && !activeTask.chartData && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border-2 mb-4">
                  <img 
                    src={activeTask.image} 
                    alt="Writing Task Chart" 
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 flex flex-col h-[50vh] lg:h-full">
            <div className="card border-border-2 p-0 overflow-hidden flex flex-col flex-1">
              <div className="bg-bg-3 px-4 py-2 border-b border-border-2 flex items-center justify-between shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Writing Area</div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  wordCount < activeTask.wordCount ? "text-amber-accent" : "text-green-accent"
                )}>
                  {wordCount} Words
                </div>
              </div>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Start writing your response here..."
                disabled={isAnalyzing || !!feedback}
                className="w-full flex-1 bg-bg-1 p-6 text-sm outline-none resize-none leading-relaxed custom-scrollbar"
              />
            </div>

            {!feedback ? (
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || userText.trim().length < 50}
                className="btn btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isAnalyzing ? "AI Examiner is checking..." : "Get AI Feedback"}
              </button>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex bg-bg-2 p-1 rounded-xl border border-border shrink-0">
                  <button 
                    onClick={() => setFeedbackTab("report")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      feedbackTab === "report" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted"
                    )}
                  >
                    Examiner Report
                  </button>
                  <button 
                    onClick={() => setFeedbackTab("review")}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      feedbackTab === "review" ? "bg-blue-primary text-white shadow-lg" : "text-text-muted"
                    )}
                  >
                    Smart Review
                  </button>
                </div>

                <div className="flex-1 min-h-0">
                  {feedbackTab === "report" ? (
                    <div className="card bg-blue-dim/10 border-blue-primary/20 h-full flex flex-col">
                      <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-4 shrink-0">
                        <MessageSquare size={14} /> AI Examiner Feedback
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none markdown-body overflow-y-auto pr-2 custom-scrollbar flex-1">
                        <ReactMarkdown>{feedback}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="card bg-amber-dim/10 border-amber-accent/20 h-full flex flex-col">
                      <div className="flex items-center gap-2 text-amber-accent font-bold text-[10px] uppercase tracking-widest mb-4 shrink-0">
                        <Sparkles size={14} /> Smart Error Review
                      </div>
                      <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-4">
                        <div className="p-4 bg-bg-1 rounded-xl border border-border-2 text-sm leading-relaxed font-serif whitespace-pre-wrap">
                          {smartReview ? (
                            renderHighlightedText(userText, smartReview)
                          ) : (
                            userText
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Identified Errors</div>
                          {smartReview?.map((err, i) => (
                            <div key={i} className="p-3 bg-bg-2 border border-border rounded-xl flex items-start gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                err.type === "grammar" ? "bg-red-accent" : err.type === "spelling" ? "bg-amber-accent" : "bg-blue-primary"
                              )} />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-red-accent line-through opacity-70">{err.original}</span>
                                  <ChevronRight size={12} className="text-text-muted" />
                                  <span className="text-xs font-bold text-green-accent">{err.correction}</span>
                                </div>
                                <p className="text-[10px] text-text-muted">{err.explanation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button onClick={() => { setActiveTask(null); setFeedback(null); setSmartReview(null); }} className="btn btn-ghost w-full shrink-0">Try Another Task</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">✍️ Writing Lab</h2>
          <p className="text-sm text-text-muted">Practice Task 1 & 2 or analyze essay structures with AI feedback</p>
        </div>
        <div className="flex bg-bg-2 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab("practice")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "practice" ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            Practice Tasks
          </button>
          <button 
            onClick={() => setActiveTab("structure")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeTab === "structure" ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            Structure Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === "practice" ? (
          WRITING_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => startTask(task)}
              className="card w-full text-left hover:border-blue-primary group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={cn(
                  "tag",
                  task.type === "Task 1" ? "tag-blue" : "tag-violet"
                )}>{task.type}</span>
                <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                  <Clock size={10} /> {task.mins} Mins
                </span>
              </div>
              <h3 className="font-bold text-text-primary mb-2 group-hover:text-blue-primary transition-colors">{task.title}</h3>
              <p className="text-xs text-text-muted line-clamp-2 mb-4">
                {task.prompt}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{task.wordCount}+ Words</span>
                <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))
        ) : (
          STRUCTURE_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => startTask(task)}
              className="card w-full text-left hover:border-violet-accent group bg-gradient-to-br from-violet-accent/5 to-bg-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="tag tag-violet">{task.type}</span>
                <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                  <Clock size={10} /> {task.mins} Mins
                </span>
              </div>
              <h3 className="font-bold text-text-primary mb-2 group-hover:text-violet-accent transition-colors">{task.title}</h3>
              <p className="text-xs text-text-muted line-clamp-3 mb-4">
                Analyze the structure of this high-band essay. Identify the introduction, thesis, topic sentences, and conclusion.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{task.difficulty}</span>
                <ChevronRight size={16} className="text-text-muted group-hover:text-violet-accent group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
