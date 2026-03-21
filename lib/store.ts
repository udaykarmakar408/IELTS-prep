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
  writingHistory: { task: string; text: string; feedback: string; band: number | null; words: number; date: string }[];
  studyMinutes: number;
  dailyGoalMin: number;
  knownWords: string[];
  studyLog: Record<string, number>;
  examDate: string | null;
}

const STORAGE_KEY = "ielts_pro_v1";

export const defaultProgress: UserProgress = {
  name: "Learner",
  target: 7.5,
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
  writingHistory: [],
  studyMinutes: 0,
  dailyGoalMin: 60,
  knownWords: [],
  studyLog: {},
  examDate: null,
};

import { supabase } from "./supabase";

export async function getProgress(): Promise<UserProgress> {
  if (typeof window === "undefined") return defaultProgress;
  
  // Try Supabase first
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('progress_data')
      .eq('id', user.id)
      .single();
    if (data && !error) {
      const merged = { ...defaultProgress, ...data.progress_data };
      // Ensure nested objects and arrays are not null/undefined
      if (!merged.bands) merged.bands = defaultProgress.bands;
      if (!merged.studyLog) merged.studyLog = defaultProgress.studyLog;
      if (!merged.mockHistory) merged.mockHistory = defaultProgress.mockHistory;
      if (!merged.bandHistory) merged.bandHistory = defaultProgress.bandHistory;
      if (!merged.quizHistory) merged.quizHistory = defaultProgress.quizHistory;
      if (!merged.errorLog) merged.errorLog = defaultProgress.errorLog;
      if (!merged.writingHistory) merged.writingHistory = defaultProgress.writingHistory;
      if (!merged.knownWords) merged.knownWords = defaultProgress.knownWords;
      if (!merged.studyDays) merged.studyDays = defaultProgress.studyDays;
      return merged;
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultProgress;
  try {
    const parsed = JSON.parse(stored);
    const merged = { ...defaultProgress, ...parsed };
    // Ensure nested objects and arrays are not null/undefined
    if (!merged.bands) merged.bands = defaultProgress.bands;
    if (!merged.studyLog) merged.studyLog = defaultProgress.studyLog;
    if (!merged.mockHistory) merged.mockHistory = defaultProgress.mockHistory;
    if (!merged.bandHistory) merged.bandHistory = defaultProgress.bandHistory;
    if (!merged.quizHistory) merged.quizHistory = defaultProgress.quizHistory;
    if (!merged.errorLog) merged.errorLog = defaultProgress.errorLog;
    if (!merged.writingHistory) merged.writingHistory = defaultProgress.writingHistory;
    if (!merged.knownWords) merged.knownWords = defaultProgress.knownWords;
    if (!merged.studyDays) merged.studyDays = defaultProgress.studyDays;
    return merged;
  } catch (e) {
    return defaultProgress;
  }
}

export async function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  
  // Save locally
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  // Sync to Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('user_progress').upsert({
      id: user.id,
      progress_data: progress,
      updated_at: new Date().toISOString()
    });
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
