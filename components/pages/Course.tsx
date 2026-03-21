"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
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
    roadmapPhase: "Foundation",
    lessons: [
      { id: "L1-1", title: "IELTS Overview", type: "theory", xp: 20 },
      { id: "L1-2", title: "Scoring System", type: "theory", xp: 20 },
      { id: "L1-3", title: "Test Day Strategy", type: "strategy", xp: 25 },
      { id: "L1-4", title: "Grammar: Tenses & Articles", type: "grammar", xp: 30 },
      { id: "L1-5", title: "Academic Vocabulary Intro", type: "vocab", xp: 30 },
    ],
    resources: [
      { title: "IELTS Handbook PDF", link: "#" },
      { title: "Band Descriptors Guide", link: "#" }
    ]
  },
  {
    id: "L2",
    title: "Reading Mastery",
    icon: "📖",
    color: "text-blue-secondary",
    bg: "bg-blue-secondary/10",
    roadmapPhase: "Skill Development",
    lessons: [
      { id: "L2-1", title: "Skimming & Scanning", type: "skill", xp: 30 },
      { id: "L2-2", title: "True/False/Not Given", type: "skill", xp: 35 },
      { id: "L2-3", title: "Matching Headings", type: "skill", xp: 35 },
      { id: "L2-4", title: "Multiple Choice Questions", type: "skill", xp: 35 },
      { id: "L2-5", title: "Summary Completion", type: "skill", xp: 40 },
    ],
    resources: [
      { title: "Reading Question Types Cheat Sheet", link: "#" },
      { title: "Speed Reading Exercises", link: "#" }
    ]
  },
  {
    id: "L3",
    title: "Writing Task 1",
    icon: "📊",
    color: "text-violet-accent",
    bg: "bg-violet-accent/10",
    roadmapPhase: "Skill Development",
    lessons: [
      { id: "L3-1", title: "Line & Bar Charts", type: "writing", xp: 40 },
      { id: "L3-2", title: "Maps & Processes", type: "writing", xp: 45 },
      { id: "L3-3", title: "Data Comparison", type: "writing", xp: 45 },
      { id: "L3-4", title: "Overview Writing", type: "writing", xp: 50 },
      { id: "L3-5", title: "Advanced Data Vocabulary", type: "vocab", xp: 40 },
    ],
    resources: [
      { title: "Task 1 Vocabulary List", link: "#" },
      { title: "Sample Band 9 Reports", link: "#" }
    ]
  },
  {
    id: "L4",
    title: "Listening Mastery",
    icon: "🎧",
    color: "text-amber-accent",
    bg: "bg-amber-accent/10",
    roadmapPhase: "Skill Development",
    lessons: [
      { id: "L4-1", title: "Predicting Answers", type: "skill", xp: 30 },
      { id: "L4-2", title: "Spelling & Numbers", type: "skill", xp: 30 },
      { id: "L4-3", title: "Section 4 Strategies", type: "strategy", xp: 40 },
      { id: "L4-4", title: "Map & Plan Labeling", type: "skill", xp: 35 },
      { id: "L4-5", title: "Distractors & Synonyms", type: "skill", xp: 40 },
    ],
    resources: [
      { title: "Common Spelling Pitfalls", link: "#" },
      { title: "Listening Practice Audio Pack", link: "#" }
    ]
  },
  {
    id: "L5",
    title: "Speaking Confidence",
    icon: "🎤",
    color: "text-pink-accent",
    bg: "bg-pink-accent/10",
    roadmapPhase: "Skill Development",
    lessons: [
      { id: "L5-1", title: "Part 1 Fluency", type: "speaking", xp: 35 },
      { id: "L5-2", title: "Cue Card Structure", type: "speaking", xp: 45 },
      { id: "L5-3", title: "Part 3 Abstract Ideas", type: "speaking", xp: 50 },
      { id: "L5-4", title: "Pronunciation & Intonation", type: "speaking", xp: 40 },
      { id: "L5-5", title: "Idiomatic Expressions", type: "vocab", xp: 45 },
    ],
    resources: [
      { title: "Speaking Part 2 Topics 2024", link: "#" },
      { title: "Filler Words Guide", link: "#" }
    ]
  },
  {
    id: "L6",
    title: "Writing Task 2",
    icon: "✍️",
    color: "text-blue-primary",
    bg: "bg-blue-primary/10",
    roadmapPhase: "Skill Development",
    lessons: [
      { id: "L6-1", title: "Essay Structures", type: "writing", xp: 50 },
      { id: "L6-2", title: "Cohesion & Coherence", type: "writing", xp: 55 },
      { id: "L6-3", title: "Complex Grammar", type: "writing", xp: 60 },
      { id: "L6-4", title: "Idea Generation", type: "strategy", xp: 50 },
      { id: "L6-5", title: "Counter-Arguments", type: "writing", xp: 65 },
    ],
    resources: [
      { title: "Essay Planning Template", link: "#" },
      { title: "Linking Words Masterlist", link: "#" }
    ]
  },
  {
    id: "L7",
    title: "Exam Simulation",
    icon: "⏱️",
    color: "text-red-accent",
    bg: "bg-red-accent/10",
    roadmapPhase: "Exam Practice",
    lessons: [
      { id: "L7-1", title: "Full Reading Mock", type: "mock", xp: 100 },
      { id: "L7-2", title: "Full Listening Mock", type: "mock", xp: 100 },
      { id: "L7-3", title: "Full Writing Mock", type: "mock", xp: 150 },
      { id: "L7-4", title: "Full Speaking Mock", type: "mock", xp: 150 },
    ],
    resources: [
      { title: "Official Answer Sheets", link: "#" },
      { title: "Mock Test Checklist", link: "#" }
    ]
  }
];

export default function Course() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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
      Return in clean Markdown.
      
      Also, generate 3 multiple-choice questions to test the user's understanding of this lesson.
      Return the quiz at the very end after a "---QUIZ---" separator in JSON format:
      [{"q": "...", "o": ["...", "..."], "a": 0}, ...]`;
      
      const result = await callGemini(prompt, "You are an expert IELTS tutor.");
      
      if (result.includes("---QUIZ---")) {
        const [content, quizJson] = result.split("---QUIZ---");
        setLessonContent(content.trim());
        try {
          const parsedQuiz = JSON.parse(quizJson.trim().replace(/```json|```/g, ""));
          setQuizQuestions(parsedQuiz);
          setQuizAnswers(new Array(parsedQuiz.length).fill(""));
        } catch (e) {
          console.error("Failed to parse quiz", e);
        }
      } else {
        setLessonContent(result);
      }
    } catch (error) {
      console.error(error);
      setLessonContent("Failed to load lesson content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteLesson = (lessonId: string, xp: number) => {
    if (!progress) return;
    
    const isDone = progress.completedLessons.includes(lessonId);
    
    if (!isDone) {
      const updated = {
        ...progress,
        completedLessons: [...progress.completedLessons, lessonId],
        courseXP: (progress.courseXP || 0) + xp,
      };
      setProgress(updated);
      saveProgress(updated);
    }

    setActiveLesson(null);
    setLessonContent(null);
    setShowQuiz(false);
    setQuizQuestions([]);
    setQuizAnswers([]);
    setQuizSubmitted(false);
  };

  if (!progress) return null;

  if (activeLesson) {
    return (
      <div className="space-y-6">
        <button onClick={() => { setActiveLesson(null); setLessonContent(null); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Course
        </button>
        
        <div className="card border-blue-primary/30 bg-gradient-to-br from-bg-1 to-bg-2 p-4 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest mb-1">{activeLesson.type}</div>
              <h2 className="text-xl md:text-2xl font-serif font-bold">{activeLesson.title}</h2>
            </div>
            <div className="bg-blue-dim text-blue-secondary px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold shrink-0">+{activeLesson.xp} XP</div>
          </div>

          <div className="prose prose-invert prose-sm md:prose-base max-w-none space-y-4 text-text-secondary leading-relaxed">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 size={40} className="animate-spin text-blue-secondary" />
                <p className="text-sm font-medium text-text-muted animate-pulse">Aria is preparing your lesson...</p>
              </div>
            ) : lessonContent ? (
              <>
                <div className="prose prose-invert prose-sm md:prose-base max-w-none space-y-4 text-text-secondary leading-relaxed">
                  <ReactMarkdown>{lessonContent}</ReactMarkdown>
                </div>
                
                {quizQuestions.length > 0 && (
                  <div className="mt-12 p-6 bg-bg-2 border border-border rounded-2xl">
                    <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                      <Sparkles size={20} className="text-blue-secondary" /> Lesson Quiz
                    </h3>
                    <div className="space-y-8">
                      {quizQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-4">
                          <p className="text-sm font-bold text-text-primary">{qIdx + 1}. {q.q}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.o.map((opt: string, oIdx: number) => (
                              <button
                                key={oIdx}
                                onClick={() => !quizSubmitted && setQuizAnswers(prev => {
                                  const next = [...prev];
                                  next[qIdx] = oIdx.toString();
                                  return next;
                                })}
                                className={cn(
                                  "text-left px-4 py-3 rounded-xl text-xs font-medium transition-all border",
                                  quizAnswers[qIdx] === oIdx.toString()
                                    ? "bg-blue-primary/10 border-blue-primary text-blue-secondary"
                                    : "bg-bg-1 border-border hover:border-blue-primary/50 text-text-muted",
                                  quizSubmitted && oIdx === q.a && "bg-green-accent/10 border-green-accent text-green-accent",
                                  quizSubmitted && quizAnswers[qIdx] === oIdx.toString() && oIdx !== q.a && "bg-red-accent/10 border-red-accent text-red-accent"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!quizSubmitted ? (
                      <button 
                        onClick={() => setQuizSubmitted(true)}
                        disabled={quizAnswers.includes("")}
                        className="btn btn-primary w-full mt-8 disabled:opacity-50"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <div className="mt-8 p-4 bg-green-accent/5 border border-green-accent/20 rounded-xl text-center">
                        <p className="text-sm font-bold text-green-accent mb-2">Quiz Completed!</p>
                        <p className="text-xs text-text-muted">You scored {quizAnswers.filter((ans, i) => parseInt(ans) === quizQuestions[i].a).length} out of {quizQuestions.length}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>Select a lesson to begin your journey.</p>
            )}
          </div>

          {!isGenerating && lessonContent && (
            <div className="mt-10">
              <button 
                onClick={() => handleCompleteLesson(activeLesson.id, activeLesson.xp)}
                disabled={quizQuestions.length > 0 && !quizSubmitted}
                className="btn btn-primary w-full py-4 disabled:opacity-50"
              >
                {progress.completedLessons.includes(activeLesson.id) ? "Back to Course" : `Complete Lesson & Earn ${activeLesson.xp} XP`}
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm", level.bg)}>
                    {isUnlocked ? level.icon : <Lock size={20} className="text-text-muted" />}
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-lg", level.color)}>{level.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Level {idx + 1} · {level.lessons.length} Lessons</div>
                      <div className="w-1 h-1 bg-border rounded-full" />
                      <div className="text-[10px] text-blue-secondary font-black uppercase tracking-widest">{level.roadmapPhase}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold text-text-primary">{pct}% Done</div>
                    <div className="w-32 h-2 bg-bg-3 rounded-full mt-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className={cn("h-full rounded-full", level.color.replace('text', 'bg'))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {level.lessons.map((lesson) => {
                  const isDone = progress.completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => isUnlocked && generateLessonContent(lesson)}
                      disabled={!isUnlocked}
                      className={cn(
                        "card flex items-center gap-4 text-left transition-all group p-4",
                        isDone ? "border-green-accent/30 bg-green-accent/5" : "hover:border-blue-primary/50",
                        !isUnlocked && "cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                        isDone ? "bg-green-accent text-white" : "bg-bg-3 text-text-muted group-hover:bg-blue-dim group-hover:text-blue-secondary"
                      )}>
                        {isDone ? <CheckCircle2 size={18} /> : <PlayCircle size={20} />}
                      </div>
                      <div className="flex-1 min-width-0">
                        <div className={cn("text-sm font-bold truncate", isDone ? "text-text-secondary" : "text-text-primary")}>{lesson.title}</div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-tighter mt-0.5">{lesson.type} · +{lesson.xp} XP</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {level.resources && level.resources.length > 0 && (
                <div className="mt-4 p-4 bg-bg-2/50 rounded-2xl border border-border/50">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BookOpen size={12} /> Level Resources
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {level.resources.map((res, rIdx) => (
                      <a 
                        key={rIdx} 
                        href={res.link} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-bg-1 border border-border rounded-lg text-[11px] font-bold text-text-secondary hover:text-blue-secondary hover:border-blue-secondary/30 transition-all"
                      >
                        <ChevronRight size={12} /> {res.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
