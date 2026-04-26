"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Headphones, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowLeft,
  Timer,
  Trophy,
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { DRILLS, Drill, Question } from "@/lib/data/drills";

export default function Drills() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeDrill, setActiveDrill] = useState<Drill | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const startDrill = (drill: Drill) => {
    setActiveDrill(drill);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setAiFeedback(null);
    setTimeLeft(drill.mins * 60);
  };

  const handleAnswer = (optionIndex: number) => {
    if (!activeDrill) return;
    setAnswers({ ...answers, [activeDrill.questions[currentQuestion].id]: optionIndex });
  };

  const handleFinishDrill = useCallback(async () => {
    if (!activeDrill) return;
    setShowResult(true);
    setIsAnalyzing(true);
    
    const correctCount = activeDrill.questions.filter((q: Question) => answers[q.id] === q.correct).length;
    const score = (correctCount / activeDrill.questions.length) * 9;

    // Update progress
    if (progress && progress.bands) {
      const updated = {
        ...progress,
        bands: { ...progress.bands, [activeDrill.type as keyof typeof progress.bands]: Math.max(progress.bands[activeDrill.type as keyof typeof progress.bands] || 0, score) },
        courseXP: progress.courseXP + 50
      };
      setProgress(updated);
      saveProgress(updated);
    }

    // AI Feedback
    const systemPrompt = `You are an IELTS study coach. Analyze the student's performance on a ${activeDrill.type} drill titled "${activeDrill.title}".
    User's Current Level: ${progress?.difficulty || "intermediate"}
    Drill Difficulty: ${activeDrill.difficulty}
    
    Score: ${correctCount}/${activeDrill.questions.length} (${score.toFixed(1)} band).
    Provide a brief, encouraging analysis of their performance and 2-3 specific tips to improve in this area.
    Use markdown for formatting. Keep it concise.`;

    const transcript = activeDrill.questions.map((q: Question) => {
      const isCorrect = answers[q.id] === q.correct;
      return `Q: ${q.text}\nStudent Answer: ${q.options[answers[q.id]] || "No Answer"}\nCorrect Answer: ${q.options[q.correct]}\nResult: ${isCorrect ? "CORRECT" : "INCORRECT"}`;
    }).join("\n\n");

    try {
      const result = await callGroq(transcript, systemPrompt);
      setAiFeedback(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeDrill, answers, progress]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeDrill && timeLeft > 0 && !showResult) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishDrill();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeDrill, showResult, timeLeft, handleFinishDrill]);

  const nextQuestion = () => {
    if (!activeDrill) return;
    if (currentQuestion < activeDrill.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleFinishDrill();
    }
  };

  if (!progress) return null;

  const filteredDrills = DRILLS.filter(d => {
    if (!progress) return true;
    const diff = progress.difficulty;
    if (diff === "beginner") return d.difficulty === "Easy" || d.difficulty === "Medium";
    if (diff === "advanced") return d.difficulty === "Hard" || d.difficulty === "Medium";
    return true; // intermediate sees all
  });

  if (activeDrill) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    const q = activeDrill.questions[currentQuestion];
    const isAnswered = answers[q.id] !== undefined;

    if (showResult) {
      const correctCount = activeDrill.questions.filter((q: any) => answers[q.id] === q.correct).length;
      return (
        <div className="space-y-6">
          <div className="card text-center py-10 space-y-4">
            <Trophy size={48} className="mx-auto text-yellow-500" />
            <h3 className="text-2xl font-serif font-bold">Drill Completed!</h3>
            <p className="text-text-muted">You got {correctCount} out of {activeDrill.questions.length} correct.</p>
            <div className="text-4xl font-black text-blue-primary">
              Band {((correctCount / activeDrill.questions.length) * 9).toFixed(1)}
            </div>
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2 text-blue-secondary text-sm animate-pulse">
                <Loader2 size={16} className="animate-spin" /> AI Coach is analyzing your performance...
              </div>
            ) : aiFeedback && (
              <div className="card bg-blue-dim/10 border-blue-primary/20 text-left mt-4">
                <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
                  <Sparkles size={14} /> AI Coach Analysis
                </div>
                <div className="prose prose-invert prose-sm max-w-none markdown-body">
                  <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                </div>
              </div>
            )}
            <button onClick={() => setActiveDrill(null)} className="btn btn-primary px-8">Back to Drills</button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted">Review Answers</h4>
            {activeDrill.questions.map((q: any, i: number) => (
              <div key={i} className="card border-border-2">
                <div className="flex items-start gap-3 mb-3">
                  {answers[q.id] === q.correct ? <CheckCircle2 size={18} className="text-emerald-accent mt-0.5" /> : <XCircle size={18} className="text-red-accent mt-0.5" />}
                  <div className="text-sm font-bold">{q.text}</div>
                </div>
                <div className="text-xs text-text-secondary bg-bg-2 p-3 rounded-lg border border-border-2">
                  <span className="font-bold text-blue-secondary">Explanation:</span> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveDrill(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Quit
          </button>
          <div className="flex items-center gap-2 font-mono text-sm text-blue-secondary">
            <Timer size={16} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="card card-blue">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-secondary">Question {currentQuestion + 1} of {activeDrill.questions.length}</div>
            <div className="h-1.5 w-24 bg-blue-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-blue-primary transition-all" style={{ width: `${((currentQuestion + 1) / activeDrill.questions.length) * 100}%` }} />
            </div>
          </div>
          <h3 className="text-lg font-bold mb-6">{q.text}</h3>
          <div className="space-y-3">
            {q.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border text-sm transition-all",
                  answers[q.id] === i ? "bg-blue-primary border-blue-primary text-white" : "bg-bg border-border-2 text-text-secondary hover:border-blue-primary"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className="btn btn-primary w-full py-4 disabled:opacity-50"
        >
          {currentQuestion === activeDrill.questions.length - 1 ? "Finish Drill" : "Next Question"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">🎯 Skill Drills</h2>
          <p className="text-sm text-text-muted">Timed exercises to sharpen your exam techniques</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-dim/20 rounded-xl border border-blue-primary/20 self-start">
          <Sparkles size={16} className="text-blue-secondary" />
          <span className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            Level: {progress.difficulty} {progress.adaptiveDifficulty && "(Adaptive)"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredDrills.map((drill) => (
          <button
            key={drill.id}
            onClick={() => startDrill(drill)}
            className="card w-full text-left hover:border-blue-primary group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                drill.type === "reading" ? "bg-emerald-accent/10 text-emerald-accent" : "bg-blue-primary/10 text-blue-primary"
              )}>
                {drill.type === "reading" ? <BookOpen size={24} /> : <Headphones size={24} />}
              </div>
              <div>
                <div className="font-bold text-text-primary mb-0.5">{drill.title}</div>
                <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={10} /> {drill.mins} Mins</span>
                  <span className="flex items-center gap-1"><AlertCircle size={10} /> {drill.difficulty}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
