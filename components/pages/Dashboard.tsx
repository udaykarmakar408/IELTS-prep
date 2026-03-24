"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Clock, 
  PenTool, 
  FileText, 
  BookOpen, 
  Bot,
  ChevronRight,
  Lightbulb,
  Trophy,
  Calendar,
  Headphones,
  Type,
  Book,
  Sparkles,
  Mic,
  Star,
  History,
  CheckCircle2
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserProgress, getProgress, saveProgress } from "@/lib/store";
import { cn, getBandColor } from "@/lib/utils";
import { GRAMMAR_TIPS, WORDS_OF_THE_DAY } from "@/lib/content";
import { callGroq } from "@/lib/groq";
import Markdown from "react-markdown";

interface DashboardProps {
  setActivePage: (page: string) => void;
}

export default function Dashboard({ setActivePage }: DashboardProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      
      // Generate daily briefing if needed
      const today = new Date().toISOString().split("T")[0];
      if (!p.dailyBriefing || p.dailyBriefing.date !== today) {
        generateBriefing(p);
      }
    };
    load();
  }, []);

  const generateBriefing = async (p: UserProgress) => {
    setIsGeneratingBriefing(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const avgBand = Object.values(p.bands).filter(v => v > 0).reduce((a, b, _, arr) => a + b / arr.length, 0).toFixed(1);
      
      const prompt = `You are Aria, an expert IELTS tutor. Provide a high-impact, personalized daily briefing for ${p.name}. 
      Target: Band ${p.target}. Current Avg: ${avgBand}. 
      Progress: ${p.completedLessons.length} lessons done, ${p.essaysWritten} essays written.
      
      Structure:
      1. One sentence of encouragement based on their streak (${p.streak} days).
      2. One specific, actionable task for today (e.g., "Focus on Writing Task 2 cohesion" or "Practice Speaking Part 2 cue cards").
      3. A quick tip for their target band.
      
      Keep it under 60 words total. Use bold for emphasis.`;
      
      const content = await callGroq(prompt);
      const updated = { ...p, dailyBriefing: { date: today, content } };
      setProgress(updated);
      await saveProgress(updated);
    } catch (e) {
      console.error("Briefing generation failed:", e);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  if (!progress) return null;

  // Use date-based index for daily rotation
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const grammarTip = GRAMMAR_TIPS[dayOfYear % GRAMMAR_TIPS.length];
  const wordOfDay = WORDS_OF_THE_DAY[dayOfYear % WORDS_OF_THE_DAY.length];
  const totalLessons = 32;
  const lessonsDone = progress.completedLessons.length;
  const progressPct = Math.round((lessonsDone / totalLessons) * 100);

  const skillBands = [
    { key: "reading", label: "Reading", color: "text-blue-secondary", bg: "bg-blue-secondary" },
    { key: "writing", label: "Writing", color: "text-violet-accent", bg: "bg-violet-accent" },
    { key: "speaking", label: "Speaking", color: "text-pink-accent", bg: "bg-pink-accent" },
    { key: "listening", label: "Listening", color: "text-green-accent", bg: "bg-green-accent" },
  ];

  const quickActions = [
    { id: "quiz", label: "Daily Quiz", icon: PenTool, desc: "Test your knowledge", color: "text-blue-secondary" },
    { id: "tutor", label: "AI Tutor", icon: Bot, desc: "Ask anything", color: "text-violet-accent" },
    { id: "tests", label: "Mock Test", icon: FileText, desc: "AI scored feedback", color: "text-pink-accent" },
    { id: "flashcards", label: "Flashcards", icon: BookOpen, desc: "SRS Vocabulary", color: "text-amber-accent" },
  ];

  const avgBand = ((progress.bands.listening + progress.bands.reading + progress.bands.writing + progress.bands.speaking) / 4).toFixed(1);

  const startRandomPractice = () => {
    const pages = ["quiz", "tests", "speaking", "speaking-lab", "vocab", "grammar", "listening", "reading", "writing"];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    setActivePage(randomPage);
  };

  return (
    <div id="dashboard-root" className="space-y-6">
      {/* Hero Card */}
      <div id="dashboard-hero" className="card-blue overflow-hidden relative p-6 md:p-10">
        <div id="hero-logo-bg" className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Logo className="w-32 h-32 md:w-48 md:h-48" />
        </div>
        <div id="hero-content-flex" className="flex flex-col md:flex-row justify-between gap-6 md:gap-8 relative z-10">
          <div id="hero-text-section" className="space-y-4 md:space-y-6">
            <div>
              <div className="text-[10px] text-blue-secondary font-black uppercase tracking-[0.2em] mb-2">Personalized Learning</div>
              <h3 id="hero-greeting" className="font-serif text-3xl md:text-5xl font-black text-text-primary leading-tight tracking-tight">
                Hello, <span className="text-blue-secondary">{progress.name}</span>
              </h3>
            </div>
            <p id="hero-motivation" className="text-sm md:text-base text-text-secondary max-w-md leading-relaxed">
              {progress.streak >= 3 
                ? `You're on a ${progress.streak}-day winning streak! Your consistency is the key to mastering the IELTS.` 
                : "Your journey to Band 8.0 starts with a single step. Let's practice today."}
            </p>
            <div id="hero-actions" className="flex flex-wrap gap-3 md:gap-4">
              <button id="hero-btn-continue" onClick={() => setActivePage("course")} className="btn btn-primary px-4 py-2 text-sm md:text-base">Continue Learning</button>
              <button id="hero-btn-random" onClick={startRandomPractice} className="btn btn-ghost border-blue-secondary/30 text-blue-secondary hover:bg-blue-secondary hover:text-white px-4 py-2 text-sm md:text-base">Quick Practice</button>
            </div>
          </div>
          
          <div id="hero-band-display" className="flex flex-col items-center md:items-end justify-center bg-white/5 backdrop-blur-md rounded-3xl p-4 md:p-6 border border-white/10">
            <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1 md:mb-2">Predicted Band</div>
            <div id="hero-band-score" className="font-serif text-6xl md:text-8xl font-black text-blue-secondary leading-none tracking-tighter">
              {avgBand === "0.0" ? "—" : avgBand}
            </div>
            <div id="hero-target-display" className="text-[10px] md:text-xs text-text-muted mt-2 md:mt-4 font-bold uppercase tracking-widest">Target: <span className="text-text-primary">{progress.target}</span></div>
          </div>
        </div>

        <div id="hero-progress-section" className="mt-6 md:mt-8 space-y-2">
          <div className="flex justify-between items-end text-xs">
            <span className="text-text-muted font-medium">Overall course progress</span>
            <span id="hero-progress-pct" className="text-blue-secondary font-bold">{progressPct}%</span>
          </div>
          <div id="hero-progress-bar-bg" className="h-2 bg-bg-3 rounded-full overflow-hidden">
            <motion.div 
              id="hero-progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-primary rounded-full relative bar-fill"
            />
          </div>
        </div>
      </div>

      {/* Daily Goal & Stats */}
      <div id="dashboard-stats-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="daily-progress-card" className="lg:col-span-2 card bg-gradient-to-br from-blue-primary/10 to-bg-1 border-blue-primary/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-serif font-black text-text-primary tracking-tight">Daily Progress</h3>
              <p className="text-xs text-text-muted">You&apos;re doing great! Keep it up.</p>
            </div>
            <div className="text-right">
              <span id="daily-goal-pct" className="text-2xl font-black text-blue-secondary">65%</span>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Goal Reached</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-text-secondary">Study Time</span>
                <span id="daily-study-time" className="text-blue-secondary">45 / 60 mins</span>
              </div>
              <div id="study-time-bar-bg" className="h-2 bg-bg-2 rounded-full overflow-hidden">
                <motion.div 
                  id="study-time-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  className="h-full bg-blue-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
            
            <div id="daily-stats-mini-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[
                { id: "stat-words", label: "Words", value: `${progress.vocabLearned || 0}/20`, color: "text-violet-accent" },
                { id: "stat-essays", label: "Essays", value: `${progress.essaysWritten || 0}/2`, color: "text-blue-secondary" },
                { id: "stat-quizzes", label: "Quizzes", value: `${progress.quizHistory?.length || 0}/5`, color: "text-green-accent" },
                { id: "stat-listening", label: "Listening", value: `${progress.studyMinutes || 0}m`, color: "text-amber-accent" },
              ].map((stat, i) => (
                <div key={i} id={stat.id} className="p-3 bg-bg-2/50 border border-border-2 rounded-2xl text-center">
                  <div className={cn("text-sm font-black mb-0.5", stat.color)}>{stat.value}</div>
                  <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="recent-activity-card" className="card bg-bg-2 border-border-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Recent Activity</h3>
            <History size={14} className="text-text-muted" />
          </div>
          <div id="recent-activity-list" className="space-y-4">
            {[
              { type: "Writing", detail: "Task 2 Essay Analyzed", time: "2h ago", icon: PenTool, color: "text-blue-secondary" },
              { type: "Vocabulary", detail: "Learned 5 new words", time: "5h ago", icon: BookOpen, color: "text-violet-accent" },
              { type: "Grammar", detail: "Completed 3 exercises", time: "Yesterday", icon: CheckCircle2, color: "text-green-accent" },
            ].map((act, i) => (
              <div key={i} id={`activity-item-${i}`} className="flex items-start gap-3 group cursor-pointer">
                <div className={cn("p-2 rounded-xl bg-bg-1 border border-border-2 group-hover:border-blue-primary/30 transition-all", act.color)}>
                  <act.icon size={14} />
                </div>
                <div className="flex-1 min-width-0">
                  <div className="text-xs font-bold text-text-primary truncate">{act.detail}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">{act.type}</span>
                    <span className="text-[9px] text-text-muted italic">{act.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button id="btn-view-history" className="w-full mt-6 py-2 text-[10px] font-bold text-blue-secondary uppercase tracking-widest border border-blue-primary/20 rounded-xl hover:bg-blue-dim/10 transition-all">
            View Full History
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div id="quick-actions-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
        {[
          { id: "tutor", label: "Ask Aria", icon: Bot, color: "text-violet-accent", bg: "bg-violet-accent/10", desc: "24/7 AI Support" },
          { id: "tests", label: "Mock Test", icon: FileText, color: "text-blue-secondary", bg: "bg-blue-secondary/10", desc: "Full Simulation" },
          { id: "quiz", label: "Daily Quiz", icon: PenTool, color: "text-pink-accent", bg: "bg-pink-accent/10", desc: "Quick Practice" },
          { id: "flashcards", label: "Flashcards", icon: BookOpen, color: "text-amber-accent", bg: "bg-amber-accent/10", desc: "SRS Vocabulary" },
          { id: "vocab", label: "Vocab", icon: Type, color: "text-green-accent", bg: "bg-green-accent/10", desc: "Master Words" },
          { id: "lizhub", label: "Liz Hub", icon: Star, color: "text-amber-accent", bg: "bg-amber-accent/10", desc: "Expert Tips" },
        ].map((action) => (
          <button
            key={action.id}
            id={`quick-action-${action.id}`}
            onClick={() => setActivePage(action.id)}
            className="card flex flex-col items-start gap-4 p-6 group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", action.bg)}>
              <action.icon size={28} className={action.color} />
            </div>
            <div>
              <div className="text-xs font-black text-text-primary uppercase tracking-widest mb-1">{action.label}</div>
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{action.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Day Streak", value: progress.streak, icon: Flame, color: "text-amber-accent" },
          { label: "Quizzes", value: progress.quizHistory.length, icon: PenTool, color: "text-blue-secondary" },
          { label: "Mock Tests", value: progress.mockHistory.length, icon: FileText, color: "text-violet-accent" },
          { label: "Lessons", value: lessonsDone, icon: BookOpen, color: "text-green-accent" },
        ].map((stat, i) => (
          <div key={i} className="card flex flex-col items-center justify-center text-center hover:scale-105 cursor-default group">
            <div className={cn("p-2 rounded-xl bg-bg-2 mb-2 transition-colors group-hover:bg-bg-3", stat.color)}>
              <stat.icon size={20} />
            </div>
            <div className="font-serif text-2xl font-black text-text-primary">{stat.value}</div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Aria's Daily Briefing & Roadmap Shortcut */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card bg-gradient-to-br from-blue-primary/10 via-bg-1 to-bg-1 border-blue-primary/20 relative overflow-hidden p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-blue-primary font-black text-xs uppercase tracking-[0.2em]">
              <div className="w-8 h-8 bg-blue-primary/10 rounded-full flex items-center justify-center">
                <Bot size={16} />
              </div>
              Aria&apos;s Daily Briefing
            </div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              Updated Today
            </div>
          </div>
          
          {isGeneratingBriefing ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-2 h-2 bg-blue-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-blue-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-text-muted font-medium ml-2">Aria is analyzing your progress...</span>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed font-medium">
              <Markdown>{progress.dailyBriefing?.content || "Getting your briefing ready..."}</Markdown>
            </div>
          )}
          
          <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none transform rotate-12">
            <Bot size={160} />
          </div>
        </div>

        <div className="card bg-bg-2 border-border-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-accent font-bold text-[10px] uppercase tracking-widest mb-4">
              <CheckCircle2 size={14} /> Your Daily Tasks
            </div>
            <div className="space-y-3">
              {[
                { label: "Daily Quiz", id: "quiz", done: !!progress.dailyQuizDone },
                { label: "Learn 5 Words", id: "vocab", done: progress.vocabLearned >= 5 },
                { label: "Study for 60m", id: "timer", done: progress.studyMinutes >= 60 },
                { label: "Review Flashcards", id: "flashcards", done: false },
              ].map((task, i) => (
                <button 
                  key={i} 
                  onClick={() => setActivePage(task.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-1 border border-border-2 hover:border-blue-primary/30 transition-all group"
                >
                  <span className={cn("text-xs font-medium transition-colors", task.done ? "text-text-muted line-through" : "text-text-primary group-hover:text-blue-primary")}>
                    {task.label}
                  </span>
                  {task.done ? (
                    <CheckCircle2 size={16} className="text-green-accent" />
                  ) : (
                    <ChevronRight size={14} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text-muted">
              <span>Overall Completion</span>
              <span>25%</span>
            </div>
            <div className="h-1 bg-bg-3 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-amber-accent w-1/4" />
            </div>
          </div>
        </div>
      </div>

      {/* Grammar Tip & Word of the Day */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Grammar Tip of the Day */}
        <div className="card bg-gradient-to-br from-amber-accent/10 to-bg-1 border-amber-accent/20">
          <div className="flex items-center gap-2 text-amber-accent font-bold text-xs uppercase tracking-widest mb-4">
            <Book size={14} /> Grammar Tip
          </div>
          <p className="text-sm text-text-primary font-bold mb-2">{grammarTip.title}</p>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            {grammarTip.tip}
          </p>
          <div className="space-y-1.5 p-3 bg-bg-2/50 rounded-xl border border-white/5">
            <div className="text-[10px] text-red-accent/70 flex items-start gap-1.5">
              <span className="font-black">❌</span> {grammarTip.bad}
            </div>
            <div className="text-[10px] text-green-accent/70 flex items-start gap-1.5">
              <span className="font-black">✅</span> {grammarTip.good}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Word of the Day Preview */}
        <div className="card bg-gradient-to-br from-violet-accent/10 to-bg-1 border-violet-accent/20">
          <div className="flex items-center gap-2 text-violet-accent font-bold text-xs uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Word of the Day
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-serif text-2xl font-black text-text-primary uppercase tracking-tighter mb-1">{wordOfDay.word}</h4>
              <p className="text-[10px] text-text-muted italic mb-2">{wordOfDay.type} · Band {wordOfDay.band}</p>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">{wordOfDay.def}</p>
              <div className="p-2.5 bg-violet-accent/5 border border-violet-accent/10 rounded-xl italic text-[11px] text-text-primary/80">
                &quot;{wordOfDay.example}&quot;
              </div>
            </div>
            <button onClick={() => setActivePage("vocab")} className="btn btn-ghost p-2 rounded-full border-violet-accent/20 text-violet-accent">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Study Timer Today */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-sm flex items-center gap-2">
              <Clock size={16} className="text-violet-accent" /> Today&apos;s Study Time
            </div>
            <button onClick={() => setActivePage("timer")} className="text-[10px] font-bold text-text-muted hover:text-blue-secondary uppercase tracking-wider flex items-center gap-1">
              Open Timer <ChevronRight size={10} />
            </button>
          </div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-text-muted font-medium">Focused minutes</span>
            <span className="text-sm font-bold text-violet-accent">{progress.studyMinutes || 0} min</span>
          </div>
          <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((progress.studyMinutes || 0) / progress.dailyGoalMin) * 100)}%` }}
              className="h-full bg-violet-accent rounded-full"
            />
          </div>
          <div className="text-[10px] text-text-muted mt-2 font-medium">Goal: {progress.dailyGoalMin} min</div>
        </div>
      </div>

      {/* Skill Bands */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-text-muted">
            <Target size={18} className="text-blue-secondary" /> Skill Bands
          </div>
          <button onClick={() => setActivePage("analytics")} className="text-[10px] font-bold text-text-muted hover:text-blue-secondary uppercase tracking-wider flex items-center gap-1">
            Full Analytics <ChevronRight size={10} />
          </button>
        </div>
        <div className="space-y-5">
          {skillBands.map((skill) => {
            const val = (progress && progress.bands) ? (progress.bands[skill.key as keyof typeof progress.bands] || 0) : 0;
            const pct = (val / 9) * 100;
            return (
              <div key={skill.key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-text-primary">{skill.label}</span>
                  <span className={cn("text-sm font-black", skill.color)}>{val || "Not tested"}</span>
                </div>
                <div className="h-2 bg-bg-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={cn("h-full rounded-full", skill.bg)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="font-bold text-sm uppercase tracking-widest text-text-muted">Achievements</h4>
            <span className="text-[10px] font-bold text-text-muted">{progress.badges.length} earned</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.badges.slice(0, 8).map((badge, i) => (
              <div key={i} className="bg-bg-2 border border-border rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                <Trophy size={14} className="text-amber-accent" />
                <span className="text-[10px] font-bold text-text-primary uppercase tracking-tight">{badge.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HeadphonesIcon({ size, className }: { size: number, className?: string }) {
  return <Headphones size={size} className={className} />;
}
