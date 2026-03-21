"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
import { callGemini } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

const WRITING_TASKS = [
  {
    id: "t1",
    type: "Task 1",
    title: "Academic Writing: Describing a Chart",
    difficulty: "Medium",
    mins: 20,
    prompt: "The chart below shows the percentage of households in a particular country that owned various consumer durables between 1972 and 1983. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "https://picsum.photos/seed/chart/800/400",
    wordCount: 150
  },
  {
    id: "t2",
    type: "Task 2",
    title: "Academic Writing: Essay on Technology",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people believe that the rapid development of technology has made our lives more complicated and stressful. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
    wordCount: 250
  }
];

export default function Writing() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [userText, setUserText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

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
    setTimeLeft(task.mins * 60);
  };

  const handleAnalyze = async () => {
    if (userText.trim().length < 50) return;
    setIsAnalyzing(true);
    
    const systemPrompt = `You are an IELTS Writing examiner. Analyze the student's response for a ${activeTask.type} task.
    Prompt: ${activeTask.prompt}
    Provide a detailed feedback including:
    1. Estimated Band Score (0-9)
    2. Task Achievement/Response
    3. Coherence and Cohesion
    4. Lexical Resource
    5. Grammatical Range and Accuracy
    6. Specific suggestions for improvement.
    Use markdown for formatting. Keep it professional and constructive.`;

    try {
      const result = await callGemini(userText, systemPrompt);
      setFeedback(result);
      
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card bg-bg-2 border-border-2">
              <div className="flex items-center justify-between mb-4">
                <span className="tag tag-blue">{activeTask.type}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Min. {activeTask.wordCount} Words</span>
              </div>
              <h3 className="font-serif font-bold text-lg mb-4">{activeTask.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">
                {activeTask.prompt}
              </p>
              {activeTask.image && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border-2 mb-4">
                  <Image 
                    src={activeTask.image} 
                    alt="Writing Task Chart" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card border-border-2 p-0 overflow-hidden">
              <div className="bg-bg-3 px-4 py-2 border-b border-border-2 flex items-center justify-between">
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
                className="w-full h-[400px] bg-bg-1 p-6 text-sm outline-none resize-none leading-relaxed custom-scrollbar"
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
              <div className="space-y-4">
                <div className="card bg-blue-dim/10 border-blue-primary/20">
                  <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-4">
                    <MessageSquare size={14} /> AI Examiner Feedback
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none markdown-body h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </div>
                </div>
                <button onClick={() => setActiveTask(null)} className="btn btn-ghost w-full">Try Another Task</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">✍️ Writing Lab</h2>
          <p className="text-sm text-text-muted">Practice Task 1 & 2 with instant AI band score and analysis</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
          <PenTool size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WRITING_TASKS.map((task) => (
          <button
            key={task.id}
            onClick={() => startTask(task)}
            className="card w-full text-left hover:border-blue-primary group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                "tag",
                task.type === "Task 1" ? "tag-blue" : "tag-purple"
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
        ))}
      </div>
    </div>
  );
}
