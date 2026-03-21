"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  BookOpen, 
  Trophy, 
  Star,
  ArrowLeft,
  PlayCircle
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

const COURSE_DATA = [
  {
    id: "L1",
    title: "Foundation",
    icon: "🌱",
    color: "text-green-accent",
    bg: "bg-green-accent/10",
    lessons: [
      { id: "L1-1", title: "IELTS Overview", type: "theory", xp: 20 },
      { id: "L1-2", title: "Scoring System", type: "theory", xp: 20 },
      { id: "L1-3", title: "Test Day Strategy", type: "strategy", xp: 25 },
    ]
  },
  {
    id: "L2",
    title: "Reading Basics",
    icon: "📖",
    color: "text-blue-secondary",
    bg: "bg-blue-secondary/10",
    lessons: [
      { id: "L2-1", title: "Skimming & Scanning", type: "skill", xp: 30 },
      { id: "L2-2", title: "True/False/Not Given", type: "skill", xp: 35 },
      { id: "L2-3", title: "Matching Headings", type: "skill", xp: 35 },
    ]
  },
  {
    id: "L3",
    title: "Writing Task 1",
    icon: "📊",
    color: "text-violet-accent",
    bg: "bg-violet-accent/10",
    lessons: [
      { id: "L3-1", title: "Line & Bar Charts", type: "writing", xp: 40 },
      { id: "L3-2", title: "Maps & Processes", type: "writing", xp: 45 },
      { id: "L3-3", title: "Data Comparison", type: "writing", xp: 45 },
    ]
  },
  {
    id: "L4",
    title: "Listening Mastery",
    icon: "🎧",
    color: "text-amber-accent",
    bg: "bg-amber-accent/10",
    lessons: [
      { id: "L4-1", title: "Predicting Answers", type: "skill", xp: 30 },
      { id: "L4-2", title: "Spelling & Numbers", type: "skill", xp: 30 },
      { id: "L4-3", title: "Section 4 Strategies", type: "strategy", xp: 40 },
    ]
  },
  {
    id: "L5",
    title: "Speaking Confidence",
    icon: "🎤",
    color: "text-pink-accent",
    bg: "bg-pink-accent/10",
    lessons: [
      { id: "L5-1", title: "Part 1 Fluency", type: "speaking", xp: 35 },
      { id: "L5-2", title: "Cue Card Structure", type: "speaking", xp: 45 },
      { id: "L5-3", title: "Part 3 Abstract Ideas", type: "speaking", xp: 50 },
    ]
  },
  {
    id: "L6",
    title: "Writing Task 2",
    icon: "✍️",
    color: "text-blue-primary",
    bg: "bg-blue-primary/10",
    lessons: [
      { id: "L6-1", title: "Essay Structures", type: "writing", xp: 50 },
      { id: "L6-2", title: "Cohesion & Coherence", type: "writing", xp: 55 },
      { id: "L6-3", title: "Complex Grammar", type: "writing", xp: 60 },
    ]
  }
];

export default function Course() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const generateLessonContent = async (lesson: any) => {
    setActiveLesson(lesson);
    setIsGenerating(true);
    setLessonContent(null);
    try {
      const prompt = `Create a comprehensive IELTS lesson for the topic: "${lesson.title}".
      Lesson Type: ${lesson.type}
      Target Band: 7.5+
      Include:
      1. Introduction to the concept.
      2. Key strategies or vocabulary.
      3. Examples with explanations.
      4. A small practice exercise (text-based).
      Return in clean Markdown.`;
      
      const result = await callGemini(prompt, "You are an expert IELTS tutor.");
      setLessonContent(result);
    } catch (error) {
      console.error(error);
      setLessonContent("Failed to load lesson content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteLesson = (lessonId: string, xp: number) => {
    if (!progress) return;
    if (progress.completedLessons.includes(lessonId)) {
      setActiveLesson(null);
      setLessonContent(null);
      return;
    }

    const updated = {
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
      courseXP: (progress.courseXP || 0) + xp,
    };
    setProgress(updated);
    saveProgress(updated);
    setActiveLesson(null);
    setLessonContent(null);
  };

  if (!progress) return null;

  if (activeLesson) {
    return (
      <div className="space-y-6">
        <button onClick={() => { setActiveLesson(null); setLessonContent(null); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Course
        </button>
        
        <div className="card border-blue-primary/30 bg-gradient-to-br from-bg-1 to-bg-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-xs font-bold text-blue-secondary uppercase tracking-widest mb-1">{activeLesson.type}</div>
              <h2 className="text-2xl font-serif font-bold">{activeLesson.title}</h2>
            </div>
            <div className="bg-blue-dim text-blue-secondary px-3 py-1 rounded-lg text-xs font-bold">+{activeLesson.xp} XP</div>
          </div>

          <div className="prose prose-invert max-w-none space-y-4 text-text-secondary leading-relaxed">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 size={40} className="animate-spin text-blue-secondary" />
                <p className="text-sm font-medium text-text-muted animate-pulse">Aria is preparing your lesson...</p>
              </div>
            ) : lessonContent ? (
              <div dangerouslySetInnerHTML={{ __html: lessonContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
            ) : (
              <p>Select a lesson to begin your journey.</p>
            )}
          </div>

          {!isGenerating && lessonContent && (
            <div className="mt-10">
              <button 
                onClick={() => handleCompleteLesson(activeLesson.id, activeLesson.xp)}
                className="btn btn-primary w-full py-4"
              >
                Complete Lesson & Earn {activeLesson.xp} XP
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">🎓 IELTS Course</h2>
          <p className="text-sm text-text-muted">Structured curriculum from Band 0 to 9</p>
        </div>
        <div className="flex items-center gap-4 bg-bg-2 p-3 rounded-2xl border border-border shadow-sm">
          <div className="text-center px-2">
            <div className="text-lg font-black text-blue-secondary leading-none">{progress.courseXP || 0}</div>
            <div className="text-[10px] text-text-muted font-bold uppercase mt-1">Total XP</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center px-2">
            <div className="text-lg font-black text-green-accent leading-none">{progress.completedLessons.length}</div>
            <div className="text-[10px] text-text-muted font-bold uppercase mt-1">Lessons</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {COURSE_DATA.map((level, idx) => {
          const isUnlocked = idx === 0 || progress.completedLessons.length >= idx * 2;
          const lessonsDone = level.lessons.filter(l => progress.completedLessons.includes(l.id)).length;
          const pct = Math.round((lessonsDone / level.lessons.length) * 100);

          return (
            <div key={level.id} className={cn("space-y-4", !isUnlocked && "opacity-60")}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm", level.bg)}>
                    {isUnlocked ? level.icon : <Lock size={18} className="text-text-muted" />}
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-base", level.color)}>{level.title}</h3>
                    <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Level {idx + 1} · {level.lessons.length} Lessons</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-text-primary">{pct}% Done</div>
                  <div className="w-24 h-1.5 bg-bg-3 rounded-full mt-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className={cn("h-full rounded-full", level.color.replace('text', 'bg'))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {level.lessons.map((lesson) => {
                  const isDone = progress.completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => isUnlocked && generateLessonContent(lesson)}
                      disabled={!isUnlocked}
                      className={cn(
                        "card flex items-center gap-3 text-left transition-all group",
                        isDone ? "border-green-accent/30 bg-green-accent/5" : "hover:border-blue-primary/50",
                        !isUnlocked && "cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isDone ? "bg-green-accent text-white" : "bg-bg-3 text-text-muted group-hover:bg-blue-dim group-hover:text-blue-secondary"
                      )}>
                        {isDone ? <CheckCircle2 size={16} /> : <PlayCircle size={18} />}
                      </div>
                      <div className="flex-1 min-width-0">
                        <div className={cn("text-xs font-bold truncate", isDone ? "text-text-secondary" : "text-text-primary")}>{lesson.title}</div>
                        <div className="text-[9px] text-text-muted font-bold uppercase tracking-tighter mt-0.5">{lesson.type} · +{lesson.xp} XP</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
