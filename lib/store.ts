"use client";

export interface UserProgress {
  name: string;
  target: number;
  created: string;
  lastSeen: string;
  streak: number;
  bestStreak: number;
  studyDays: string[];
  bands: {
    reading: number;
    writing: number;
    speaking: number;
    listening: number;
  };
  bandHistory: { date: string; band: number; skill: string }[];
  quizHistory: { date: string; score: number; correct: number; total: number }[];
  dailyQuizDone: string | null;
  mockHistory: { date: string; test: string; band: number | null; skill: string }[];
  completedLessons: string[];
  badges: string[];
  chatHistory: { role: "user" | "assistant"; content: string }[];
  roadmapDay: number;
  vocabLearned: number;
  essaysWritten: number;
  courseXP: number;
  errorLog: { cat: string; error: string; correction: string; note: string; date: string; resolved: boolean }[];
  mistakeAnalysis: { date: string; insight: string; recommendations: string[] } | null;
  writingHistory: { task: string; text: string; feedback: string; band: number | null; words: number; date: string }[];
  grammarHistory: { sentence: string; analysis: string; date: string }[];
  studyMinutes: number;
  dailyGoalMin: number;
  knownWords: string[];
  studyLog: Record<string, number>;
  examDate: string | null;
  dailyBriefing: { date: string; content: string } | null;
  dailyWord: { date: string; word: string; type: string; band: string; def: string; example: string } | null;
  dailyGrammar: { date: string; title: string; tip: string; bad: string; good: string } | null;
  achievements: { id: string; title: string; description: string; unlocked: boolean; date?: string }[];
}

const STORAGE_KEY = "ielts_pro_v1";

export const defaultProgress: UserProgress = {
  name: "Learner",
  target: 9,
  created: new Date().toISOString().split("T")[0],
  lastSeen: new Date().toISOString().split("T")[0],
  streak: 0,
  bestStreak: 0,
  studyDays: [],
  bands: { reading: 0, writing: 0, speaking: 0, listening: 0 },
  bandHistory: [],
  quizHistory: [],
  dailyQuizDone: null,
  mockHistory: [],
  completedLessons: [],
  badges: [],
  chatHistory: [],
  roadmapDay: 1,
  vocabLearned: 0,
  essaysWritten: 0,
  courseXP: 0,
  errorLog: [],
  mistakeAnalysis: null,
  writingHistory: [],
  grammarHistory: [],
  studyMinutes: 0,
  dailyGoalMin: 60,
  knownWords: [],
  studyLog: {},
  examDate: null,
  dailyBriefing: null,
  dailyWord: null,
  dailyGrammar: null,
  achievements: [
    { id: "first_step", title: "First Step", description: "Complete your first lesson", unlocked: false },
    { id: "streak_3", title: "Consistency is Key", description: "Maintain a 3-day streak", unlocked: false },
    { id: "band_7", title: "High Achiever", description: "Reach Band 7 in any skill", unlocked: false },
    { id: "vocab_100", title: "Word Master", description: "Learn 100 new words", unlocked: false },
    { id: "mock_test", title: "Test Ready", description: "Complete your first full mock test", unlocked: false }
  ],
};

import { supabase } from "./supabase";

function mergeProgress(data: any): UserProgress {
  const merged = { ...defaultProgress, ...data };
  
  // Ensure nested objects and arrays are correctly initialized
  merged.bands = { ...defaultProgress.bands, ...(data?.bands || {}) };
  merged.studyLog = { ...defaultProgress.studyLog, ...(data?.studyLog || {}) };
  
  // Ensure arrays are initialized
  const arrayFields: (keyof UserProgress)[] = [
    'studyDays', 'bandHistory', 'quizHistory', 'mockHistory', 
    'completedLessons', 'badges', 'chatHistory', 'errorLog', 
    'writingHistory', 'grammarHistory', 'knownWords'
  ];
  
  arrayFields.forEach(field => {
    if (!Array.isArray(merged[field])) {
      (merged as any)[field] = [...(defaultProgress[field] as any[])];
    }
  });

  return merged;
}

export async function getProgress(): Promise<UserProgress> {
  if (typeof window === "undefined") return defaultProgress;
  
  // Try Supabase first
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('progress_data')
          .eq('id', user.id)
          .single();
        if (data && !error) {
          return mergeProgress(data.progress_data);
        }
      }
    } catch (e) {
      console.error("Supabase fetch error:", e);
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultProgress;
  try {
    const parsed = JSON.parse(stored);
    return mergeProgress(parsed);
  } catch (e) {
    return defaultProgress;
  }
}

export async function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  
  // Save locally
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  // Sync to Supabase
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_progress').upsert({
          id: user.id,
          progress_data: progress,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Supabase sync error:", e);
    }
  }
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().split("T")[0];
  if (progress.studyDays.includes(today)) return progress;

  const newStudyDays = [...progress.studyDays, today].sort();
  let streak = 1;
  for (let i = newStudyDays.length - 1; i > 0; i--) {
    const d1 = new Date(newStudyDays[i]);
    const d2 = new Date(newStudyDays[i - 1]);
    const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }

  return {
    ...progress,
    studyDays: newStudyDays,
    streak,
    bestStreak: Math.max(streak, progress.bestStreak),
    lastSeen: today,
  };
}
