"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  PenTool, 
  Mic, 
  BookOpen, 
  Headphones, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Trophy
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { callGemini } from "@/lib/gemini";
import { cn, getBandColor } from "@/lib/utils";

const TESTS = [
  { id: "wt1-1", label: "Writing Task 1 (Line Graph)", skill: "writing", mins: 20, icon: FileText, color: "text-blue-secondary", desc: "Summarize the information by selecting and reporting the main features of a line graph." },
  { id: "wt1-2", label: "Writing Task 1 (Process Diagram)", skill: "writing", mins: 20, icon: FileText, color: "text-blue-secondary", desc: "Describe the stages of a biological or industrial process." },
  { id: "wt2-1", label: "Writing Task 2 (Opinion Essay)", skill: "writing", mins: 40, icon: PenTool, color: "text-violet-accent", desc: "To what extent do you agree or disagree with a given statement?" },
  { id: "wt2-2", label: "Writing Task 2 (Problem/Solution)", skill: "writing", mins: 40, icon: PenTool, color: "text-violet-accent", desc: "Discuss the causes of a problem and suggest potential solutions." },
  { id: "speaking", label: "Speaking Full Simulation", skill: "speaking", mins: 15, icon: Mic, color: "text-pink-accent", desc: "Complete Parts 1, 2 & 3 with an AI examiner." },
  { id: "reading", label: "Reading Section 1", skill: "reading", mins: 20, icon: BookOpen, color: "text-green-accent", desc: "Academic reading passage with 13-14 questions." },
  { id: "listening", label: "Listening Section 1", skill: "listening", mins: 10, icon: Headphones, color: "text-amber-accent", desc: "Form completion in a social context." },
  { id: "full", label: "Full Mock Test (Beta)", skill: "all", mins: 165, icon: Trophy, color: "text-blue-primary", desc: "Simulate the entire IELTS exam (L, R, W) in one sitting." },
];

export default function MockTests() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testTask, setTestTask] = useState<string | null>(null);
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [estimatedBand, setEstimatedBand] = useState<number | null>(null);

  const generateTask = async (test: any) => {
    setActiveTest(test);
    setIsGeneratingTask(true);
    setTestTask(null);
    setFeedback(null);
    setAnswer("");
    
    try {
      const prompt = `Generate a realistic IELTS ${test.label} task.
      Skill: ${test.skill}
      Description: ${test.desc}
      If it's Writing Task 1, describe a chart or process.
      If it's Writing Task 2, provide a prompt.
      If it's Reading, provide a short passage and 3 questions.
      Return in clean Markdown.`;
      
      const result = await callGemini(prompt, "You are an IELTS examiner.");
      setTestTask(result);
      setTimeLeft(test.mins * 60);
    } catch (error) {
      console.error(error);
      setTestTask("Failed to generate task. Please try again.");
    } finally {
      setIsGeneratingTask(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || isSubmitting || !progress || !activeTest) return;
    setIsSubmitting(true);

    const systemPrompt = `You are a strict IELTS examiner. Analyze the student's response for ${activeTest.label}. 
    Task was: ${testTask}
    Provide a detailed band score breakdown (0-9) for each criterion and an overall band.
    Be honest and critical. Use markdown for formatting.
    Format your response exactly as:
    📊 BAND SCORES
    Criterion 1: [score]/9
    Criterion 2: [score]/9
    Criterion 3: [score]/9
    Criterion 4: [score]/9
    ━━━━━━━━━━━━━━━
    Overall Band: [score]

    📝 DETAILED FEEDBACK
    [Feedback text]

    ✅ 3 IMPROVEMENTS
    1. [Tip 1]
    2. [Tip 2]
    3. [Tip 3]`;

    try {
      const result = await callGemini(`TASK: ${activeTest.desc}\n\nSTUDENT RESPONSE:\n${answer}`, systemPrompt);
      setFeedback(result);

      const bandMatch = result.match(/Overall Band:\s*([0-9]\.?[0-9]?)/i);
      const band = bandMatch ? parseFloat(bandMatch[1]) : null;
      setEstimatedBand(band);

      if (band) {
        const updated = {
          ...progress,
          bands: activeTest.skill === "all" 
            ? { ...progress.bands, reading: band, writing: band, listening: band } 
            : { ...progress.bands, [activeTest.skill]: band },
          bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: activeTest.skill }],
          mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: activeTest.label, band, skill: activeTest.skill }],
        };
        setProgress(updated);
        saveProgress(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [activeTest, answer, progress, isSubmitting, testTask]);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  useEffect(() => {
    let timer: any;
    if (activeTest && timeLeft > 0 && !feedback) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeTest && !feedback) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [activeTest, timeLeft, feedback, handleSubmit]);

  const startTest = (test: any) => {
    generateTask(test);
  };

  if (!progress) return null;

  if (activeTest) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveTest(null); setTestTask(null); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4">
            <ArrowLeft size={16} /> Abandon Test
          </button>
          {testTask && !feedback && (
            <div className={cn("flex items-center gap-2 font-mono text-xl font-bold", timeLeft < 300 ? "text-red-accent" : "text-green-accent")}>
              <Clock size={20} /> {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {!feedback ? (
          <div className="space-y-6">
            <div className="card border-blue-primary/30 bg-bg-2">
              <div className="text-xs font-bold text-blue-secondary uppercase tracking-widest mb-2">Current Task</div>
              <h3 className="text-xl font-serif font-bold mb-4">{activeTest.label}</h3>
              {isGeneratingTask ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Loader2 size={32} className="animate-spin text-blue-secondary" />
                  <p className="text-xs font-bold text-text-muted animate-pulse uppercase tracking-widest">Aria is preparing your test task...</p>
                </div>
              ) : testTask ? (
                <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: testTask.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-sm text-text-secondary leading-relaxed">{activeTest.desc}. Write your response below. Aim for the required word count and maintain academic tone.</p>
              )}
            </div>

            {testTask && !isGeneratingTask && (
              <>
                <div className="relative">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full bg-bg-1 border border-border-2 rounded-2xl p-5 text-text-primary focus:border-blue-primary outline-none min-h-[300px] resize-none font-serif leading-relaxed text-base"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    Words: {answer.trim() ? answer.trim().split(/\s+/).length : 0}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isSubmitting}
                  className="btn btn-primary w-full py-4 disabled:opacity-50"
                >
                  {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Analyzing Response...</> : "Submit for AI Feedback"}
                </button>
              </>
            )}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="card bg-gradient-to-br from-green-accent/20 to-bg-1 border-green-accent/30 text-center py-8">
              <div className="w-16 h-16 bg-green-accent rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-accent/20">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2">Test Submitted!</h3>
              {estimatedBand && (
                <div className="inline-flex items-center gap-2 bg-bg-2 px-4 py-2 rounded-full border border-border mt-2">
                  <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Estimated Band</span>
                  <span className="text-2xl font-black text-blue-secondary">{estimatedBand}</span>
                </div>
              )}
            </div>

            <div className="card bg-bg-2 border-border-2">
              <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-6">
                <FileText size={14} /> AI Examiner Feedback
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: feedback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
            </div>

            <button onClick={() => setActiveTest(null)} className="btn btn-ghost w-full py-4">Back to Mock Tests</button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1">📝 Mock Test Centre</h2>
        <p className="text-sm text-text-muted">Exam-conditions practice with AI band-score feedback</p>
      </div>

      {progress.mockHistory && progress.mockHistory.length > 0 && (
        <div className="card border-blue-dim/30 bg-blue-dim/5">
          <h4 className="text-xs font-bold text-blue-secondary uppercase tracking-widest mb-4">Recent Results</h4>
          <div className="space-y-3">
            {progress.mockHistory.slice(-3).reverse().map((test, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-bg-1 rounded-xl border border-border">
                <div>
                  <div className="text-sm font-bold">{test.test}</div>
                  <div className="text-[10px] text-text-muted font-medium">{test.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-text-muted font-bold uppercase">{test.skill}</span>
                  <div className="bg-blue-dim text-blue-secondary px-3 py-1 rounded-lg text-sm font-black">Band {test.band}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TESTS.map((test) => (
          <button
            key={test.id}
            onClick={() => startTest(test)}
            className="card text-left hover:border-blue-primary group flex flex-col h-full"
          >
            <div className={cn("p-3 rounded-2xl bg-bg-2 w-fit mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3", test.color)}>
              <test.icon size={28} />
            </div>
            <div className="font-bold text-base text-text-primary mb-1">{test.label}</div>
            <div className="text-xs text-text-muted mb-6 flex-1">{test.desc}</div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="tag tag-gray">⏱ {test.mins} min</span>
                <span className="tag tag-blue">AI Scored</span>
              </div>
              <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>

      <div className="card bg-bg-2 border-dashed border-border-2 flex items-center gap-4 p-6">
        <div className="w-12 h-12 rounded-full bg-bg-3 flex items-center justify-center text-blue-secondary flex-shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary mb-1">More tests coming soon</h4>
          <p className="text-xs text-text-muted">We&apos;re adding full-length Reading and Listening sections based on Cambridge 19.</p>
        </div>
      </div>
    </div>
  );
}
