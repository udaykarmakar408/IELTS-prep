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
  Star
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserProgress, getProgress } from "@/lib/store";
import { cn, getBandColor } from "@/lib/utils";

interface DashboardProps {
  setActivePage: (page: string) => void;
}

export default function Dashboard({ setActivePage }: DashboardProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  if (!progress) return null;

  const avgBand = (progress && progress.bands) ? Object.values(progress.bands).filter(v => v > 0).reduce((a, b, _, arr) => a + b / arr.length, 0).toFixed(1) : "0.0";
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
    { id: "speaking-lab", label: "Speaking Lab", icon: Mic, desc: "Cue card practice", color: "text-amber-accent" },
  ];

  const startRandomPractice = () => {
    const pages = ["quiz", "tests", "speaking-lab", "vocab", "grammar"];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    setActivePage(randomPage);
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="card-blue overflow-hidden relative p-8 md:p-10">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Logo className="w-48 h-48" />
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] text-blue-secondary font-black uppercase tracking-[0.2em] mb-2">Personalized Learning</div>
              <h3 className="font-serif text-4xl md:text-5xl font-black text-text-primary leading-tight tracking-tight">
                Hello, <span className="text-blue-secondary">{progress.name}</span>
              </h3>
            </div>
            <p className="text-sm md:text-base text-text-secondary max-w-md leading-relaxed">
              {progress.streak >= 3 
                ? `You're on a ${progress.streak}-day winning streak! Your consistency is the key to mastering the IELTS.` 
                : "Your journey to Band 8.0 starts with a single step. Let's practice today."}
            </p>
            <div className="flex gap-4">
              <button onClick={() => setActivePage("course")} className="btn btn-primary">Continue Learning</button>
              <button onClick={startRandomPractice} className="btn btn-ghost border-blue-secondary/30 text-blue-secondary hover:bg-blue-secondary hover:text-white">Quick Practice</button>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end justify-center bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
            <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Predicted Band</div>
            <div className="font-serif text-7xl md:text-8xl font-black text-blue-secondary leading-none tracking-tighter">
              {avgBand === "0.0" ? "—" : avgBand}
            </div>
            <div className="text-xs text-text-muted mt-4 font-bold uppercase tracking-widest">Target: <span className="text-text-primary">{progress.target}</span></div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <div className="flex justify-between items-end text-xs">
            <span className="text-text-muted font-medium">Overall course progress</span>
            <span className="text-blue-secondary font-bold">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-bg-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-primary rounded-full relative bar-fill"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {[
          { id: "tutor", label: "Ask Aria", icon: Bot, color: "text-violet-accent", bg: "bg-violet-accent/10", desc: "24/7 AI Support" },
          { id: "tests", label: "Mock Test", icon: FileText, color: "text-blue-secondary", bg: "bg-blue-secondary/10", desc: "Full Simulation" },
          { id: "quiz", label: "Daily Quiz", icon: PenTool, color: "text-pink-accent", bg: "bg-pink-accent/10", desc: "Quick Practice" },
          { id: "vocab", label: "Vocab", icon: Type, color: "text-green-accent", bg: "bg-green-accent/10", desc: "Master Words" },
          { id: "lizhub", label: "Liz Hub", icon: Star, color: "text-amber-accent", bg: "bg-amber-accent/10", desc: "Expert Tips" },
        ].map((action) => (
          <button
            key={action.id}
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <div className="card bg-gradient-to-br from-blue-dim/40 to-bg-1 border-blue-dim/50">
          <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-4">
            <Lightbulb size={14} /> Today&apos;s Focus
          </div>
          <p className="text-sm text-text-secondary leading-relaxed italic">
            {parseFloat(avgBand) < 6 
              ? "🎯 Focus on building foundations — start the Course from Level 1 and complete at least 1 lesson today."
              : parseFloat(avgBand) < 7
              ? "📖 You are making progress! Focus on Reading strategy and take a Writing Task 2 practice today."
              : "✍️ Band 7 range — push to 8 by mastering complex sentences and practicing Writing Task 2 daily."}
          </p>
        </div>

        {/* Grammar Tip of the Day */}
        <div className="card bg-gradient-to-br from-amber-accent/10 to-bg-1 border-amber-accent/20">
          <div className="flex items-center gap-2 text-amber-accent font-bold text-xs uppercase tracking-widest mb-4">
            <Book size={14} /> Grammar Tip
          </div>
          <p className="text-sm text-text-primary font-bold mb-2">The &quot;Although&quot; Structure</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            Avoid using &quot;but&quot; after &quot;although&quot;. 
            <br/>❌ Although it was raining, but we went out.
            <br/>✅ Although it was raining, we went out.
          </p>
          <button onClick={() => setActivePage("grammar")} className="mt-3 text-[10px] font-bold text-amber-accent uppercase tracking-wider flex items-center gap-1 hover:underline">
            Go to Grammar Lab <ChevronRight size={10} />
          </button>
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
              <h4 className="font-serif text-2xl font-black text-text-primary uppercase tracking-tighter mb-1">MITIGATE</h4>
              <p className="text-[10px] text-text-muted italic mb-2">verb · Band 7+</p>
              <p className="text-xs text-text-secondary leading-relaxed">To make something less severe, serious, or painful.</p>
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
