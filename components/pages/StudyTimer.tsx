"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Target, 
  ChevronRight,
  SkipForward
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function StudyTimer() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      const today = new Date().toISOString().split("T")[0];
      if (p && p.studyLog) {
        setTodayMinutes(p.studyLog[today] || 0);
      }
    };
    load();
  }, []);

  const handleMinutePassed = useCallback(() => {
    if (!progress || !progress.studyLog) return;
    const today = new Date().toISOString().split("T")[0];
    const newMinutes = (progress.studyLog[today] || 0) + 1;
    const updated = {
      ...progress,
      studyMinutes: (progress.studyMinutes || 0) + 1,
      studyLog: { ...progress.studyLog, [today]: newMinutes }
    };
    setProgress(updated);
    saveProgress(updated);
    setTodayMinutes(newMinutes);
  }, [progress]);

  const handleSessionEnd = useCallback(() => {
    setIsActive(false);
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(5 * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(25 * 60);
      setSessionCount(prev => prev + 1);
    }
  }, [isBreak]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          // Track study minutes (every 60 seconds of focus)
          if (!isBreak && (prev - 1) % 60 === 0 && prev > 1) {
            handleMinutePassed();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isBreak, timeLeft, handleMinutePassed, handleSessionEnd]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const skipSession = () => {
    setIsActive(false);
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
  };

  if (!progress) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const goalPct = Math.min(100, (todayMinutes / progress.dailyGoalMin) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1">⏱️ Study Timer</h2>
        <p className="text-sm text-text-muted">Pomodoro technique to maximize your focus</p>
      </div>

      <div className="card text-center py-12 space-y-8 border-border-2 shadow-xl bg-gradient-to-br from-bg-1 to-bg-2">
        <div className="space-y-2">
          <div className={cn(
            "text-xs font-bold uppercase tracking-[0.2em]",
            isBreak ? "text-green-accent" : "text-blue-secondary"
          )}>
            {isBreak ? "Break Time" : "Focus Session"}
          </div>
          <div className="font-mono text-8xl font-black text-text-primary leading-none tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest pt-4">
            Session {sessionCount} of 4 · Standard Pomodoro
          </div>
        </div>

        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={toggleTimer}
            className={cn(
              "w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all active:scale-90",
              isActive ? "bg-bg-3 text-text-primary" : "bg-blue-primary shadow-blue-primary/20 hover:bg-blue-secondary"
            )}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <button onClick={resetTimer} className="w-14 h-14 rounded-2xl bg-bg-2 border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
            <RotateCcw size={24} />
          </button>
          <button onClick={skipSession} className="w-14 h-14 rounded-2xl bg-bg-2 border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
            <SkipForward size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="font-bold text-sm flex items-center gap-2">
            <Target size={18} className="text-blue-secondary" /> Today&apos;s Progress
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs text-text-muted font-medium">Focused minutes today</span>
            <span className="text-sm font-bold text-blue-secondary">{todayMinutes} min</span>
          </div>
          <div className="h-2 bg-bg-3 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${goalPct}%` }} className="h-full bg-blue-primary rounded-full" />
          </div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Goal: {progress.dailyGoalMin} min</div>
        </div>

        <div className="card bg-bg-2 border-border-2 flex flex-col justify-center p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-violet-accent/10 text-violet-accent"><Brain size={20} /></div>
            <h4 className="text-sm font-bold text-text-primary">Why Pomodoro?</h4>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Studying in 25-minute bursts with 5-minute breaks helps maintain high levels of concentration and prevents mental fatigue during long IELTS prep sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
