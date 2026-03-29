"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  CheckCircle2,
  Play,
  RotateCcw,
  AlertCircle,
  Loader2,
  X,
  Zap
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { UserProgress, getProgress, saveProgress } from "@/lib/store";
import { cn, getBandColor } from "@/lib/utils";
import { GRAMMAR_TIPS, WORDS_OF_THE_DAY } from "@/lib/content";
import { callGroq } from "@/lib/groq";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import Markdown from "react-markdown";

interface DashboardProps {
  setActivePage: (page: string) => void;
}

export default function Dashboard({ setActivePage }: DashboardProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [isCheckingChallenge, setIsCheckingChallenge] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);
  const [userChallengeAnswer, setUserChallengeAnswer] = useState("");
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerTime, setTimerTime] = useState(25 * 60);
  const [motivation, setMotivation] = useState("");

  const MOTIVATION_QUOTES = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Sometimes later becomes never. Do it now.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn’t just find you. You have to go out and get it.",
    "The harder you work for something, the greater you’ll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don’t stop when you’re tired. Stop when you’re done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It’s going to be hard, but hard does not mean impossible.",
    "Don’t wait for opportunity. Create it.",
    "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
    "The key to success is to focus on goals, not obstacles.",
    "Dream it. Believe it. Build it."
  ];

  useEffect(() => {
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    setMotivation(randomQuote);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timerTime > 0) {
      interval = setInterval(() => {
        setTimerTime(prev => prev - 1);
      }, 1000);
    } else if (timerTime === 0 && isTimerActive) {
      setIsTimerActive(false);
      // Update study minutes when timer finishes
      if (progress) {
        const updated = { ...progress, studyMinutes: (progress.studyMinutes || 0) + 25 };
        setProgress(updated);
        saveProgress(updated);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerTime, progress]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      
      // Generate daily briefing if needed
      const today = new Date().toISOString().split("T")[0];
      if (!p.dailyBriefing || p.dailyBriefing.date !== today) {
        generateBriefing(p);
      }
      
      if (!p.dailyWord || p.dailyWord.date !== today) {
        generateDailyWord(p);
      }

      if (!p.dailyGrammar || p.dailyGrammar.date !== today) {
        generateDailyGrammar(p);
      }
      
      generateDailyChallenge();
    };
    load();
  }, []);

  const generateDailyWord = async (p: UserProgress) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const systemPrompt = `You are an IELTS expert. Generate a high-level academic word suitable for IELTS Band 7-9.
      Return ONLY a JSON object in this format:
      {
        "word": "...",
        "type": "noun | verb | adj | adv",
        "band": "7+ | 8+ | 9",
        "def": "...",
        "example": "..."
      }`;
      
      const result = await callGroq("Generate a random IELTS academic word.", systemPrompt);
      const cleaned = result.replace(/```json|```/g, "").trim();
      const word = JSON.parse(cleaned);
      
      const updated = { ...p, dailyWord: { ...word, date: today } };
      setProgress(updated);
      await saveProgress(updated);
    } catch (error) {
      console.error("Failed to generate daily word:", error);
    }
  };

  const generateDailyGrammar = async (p: UserProgress) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const systemPrompt = `You are an IELTS expert. Generate a high-impact grammar tip for IELTS students.
      Return ONLY a JSON object in this format:
      {
        "title": "...",
        "tip": "...",
        "bad": "Incorrect example sentence",
        "good": "Corrected example sentence"
      }`;
      
      const result = await callGroq("Generate a random IELTS grammar tip.", systemPrompt);
      const cleaned = result.replace(/```json|```/g, "").trim();
      const tip = JSON.parse(cleaned);
      
      const updated = { ...p, dailyGrammar: { ...tip, date: today } };
      setProgress(updated);
      await saveProgress(updated);
    } catch (error) {
      console.error("Failed to generate daily grammar tip:", error);
    }
  };

  const generateDailyChallenge = async () => {
    setIsCheckingChallenge(true);
    try {
      const systemPrompt = `You are an IELTS expert. Generate a single, concise "1-Minute Challenge" for an IELTS student.
      The challenge should be one of these types: "grammar", "vocab", "idiom", or "spelling".
      Provide the question, the correct answer, and a brief explanation.
      Return ONLY a JSON object in this format:
      {
        "type": "grammar | vocab | idiom | spelling",
        "question": "...",
        "answer": "...",
        "explanation": "..."
      }`;
      
      const result = await callGroq("Generate a random IELTS challenge.", systemPrompt);
      const cleaned = result.replace(/```json|```/g, "").trim();
      const challenge = JSON.parse(cleaned);
      
      setDailyChallenge(challenge);
      setUserChallengeAnswer("");
      setChallengeFeedback(null);
    } catch (error) {
      console.error("Failed to generate challenge:", error);
      // Fallback to a static one if AI fails
      setDailyChallenge({ 
        type: "grammar", 
        question: "Identify the error: 'He have been living here for five years.'", 
        answer: "has", 
        explanation: "The subject 'He' is third-person singular, so it requires 'has' instead of 'have'." 
      });
    } finally {
      setIsCheckingChallenge(false);
    }
  };

  const checkChallenge = async () => {
    if (!userChallengeAnswer.trim() || !dailyChallenge) return;
    setIsCheckingChallenge(true);
    try {
      const prompt = `The student's answer to the challenge "${dailyChallenge.question}" is "${userChallengeAnswer}". 
      The correct answer is "${dailyChallenge.answer}". 
      Is the student's answer correct or close enough? 
      Return ONLY a JSON object: {"isCorrect": boolean, "feedback": "Short explanation"}`;
      
      const result = await callGroq(prompt, "You are an IELTS expert. Return only JSON.");
      const cleaned = result.replace(/```json|```/g, "").trim();
      const feedback = JSON.parse(cleaned);
      
      setChallengeFeedback(feedback.isCorrect ? `Correct! ${feedback.feedback}` : `Not quite. ${feedback.feedback}`);
      
      if (feedback.isCorrect && progress) {
        const updated = { ...progress, courseXP: (progress.courseXP || 0) + 10 };
        setProgress(updated);
        saveProgress(updated);
      }
    } catch (error) {
      console.error("Failed to check challenge:", error);
      const isCorrect = userChallengeAnswer.toLowerCase().includes(dailyChallenge.answer.toLowerCase());
      setChallengeFeedback(isCorrect ? `Correct! ${dailyChallenge.explanation}` : `Not quite. The answer is "${dailyChallenge.answer}". ${dailyChallenge.explanation}`);
    } finally {
      setIsCheckingChallenge(false);
    }
  };

  const generateBriefing = async (p: UserProgress, force = false) => {
    const today = new Date().toISOString().split("T")[0];
    if (!force && p.dailyBriefing && p.dailyBriefing.date === today) return;
    
    setIsGeneratingBriefing(true);
    setBriefingError(null);
    try {
      const avgBand = Object.values(p.bands).filter(v => v > 0).reduce((a, b, _, arr) => a + b / arr.length, 0).toFixed(1);
      
      // Get recent errors for context
      const recentErrors = p.errorLog.slice(-3).map(e => e.error).join(", ");
      const weakSkills = Object.entries(p.bands)
        .filter(([_, v]) => v > 0 && v < p.target)
        .map(([k, _]) => k)
        .join(", ");

      const prompt = `You are Aria, an expert IELTS tutor. Provide a high-impact, personalized daily briefing for ${p.name}. 
      Target: Band ${p.target}. Current Avg: ${avgBand}. 
      Weak Skills: ${weakSkills || "None identified yet"}.
      Recent Mistakes: ${recentErrors || "None logged yet"}.
      Progress: ${p.completedLessons.length} lessons done, ${p.essaysWritten} essays written.
      
      Structure:
      1. One short sentence of encouragement based on their streak (${p.streak} days).
      2. One specific, actionable task for today targeting their weak skills or recent mistakes.
      3. A "Band 9 Secret" tip related to their target.
      
      Keep it under 70 words total. Use bold for emphasis. Be direct and expert.`;
      
      const content = await callGroq(prompt, "You are Aria, an expert IELTS tutor.");
      const updated = { ...p, dailyBriefing: { date: today, content } };
      setProgress(updated);
      await saveProgress(updated);
    } catch (e) {
      console.error("Briefing generation failed:", e);
      setBriefingError("Aria is currently unavailable. Please try again later.");
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  if (!progress) return null;

  // Use date-based index for daily rotation as fallback
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const grammarTip = progress.dailyGrammar || (GRAMMAR_TIPS[dayOfYear % GRAMMAR_TIPS.length] as any);
  const wordOfDay = progress.dailyWord || (WORDS_OF_THE_DAY[dayOfYear % WORDS_OF_THE_DAY.length] as any);
  const totalLessons = 32;
  const lessonsDone = progress.completedLessons.length;
  const progressPct = Math.round((lessonsDone / totalLessons) * 100);

  const skillBands = [
    { key: "reading", label: "Reading", color: "text-blue-secondary", bg: "bg-blue-secondary" },
    { key: "writing", label: "Writing", color: "text-violet-accent", bg: "bg-violet-accent" },
    { key: "speaking", label: "Speaking", color: "text-pink-accent", bg: "bg-pink-accent" },
    { key: "listening", label: "Listening", color: "text-green-accent", bg: "bg-green-accent" },
  ];

  const avgBand = ((progress.bands.listening + progress.bands.reading + progress.bands.writing + progress.bands.speaking) / 4).toFixed(1);

  const startRandomPractice = () => {
    const pages = ["quiz", "tests", "speaking", "speaking-lab", "vocab", "grammar", "listening", "reading", "writing"];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    setActivePage(randomPage);
  };

  // Derive recent activity from progress
  const getRecentActivity = () => {
    const activities: any[] = [];
    
    progress.writingHistory.slice(-3).forEach(h => {
      activities.push({
        type: "Writing",
        detail: `Task: ${h.task.substring(0, 30)}...`,
        time: new Date(h.date).toLocaleDateString(),
        timestamp: new Date(h.date).getTime(),
        icon: PenTool,
        color: "text-blue-secondary"
      });
    });
    
    progress.quizHistory.slice(-3).forEach(h => {
      activities.push({
        type: "Quiz",
        detail: `Score: ${h.score}%`,
        time: new Date(h.date).toLocaleDateString(),
        timestamp: new Date(h.date).getTime(),
        icon: CheckCircle2,
        color: "text-green-accent"
      });
    });

    progress.mockHistory.slice(-3).forEach(h => {
      activities.push({
        type: "Mock Test",
        detail: `Band ${h.band || "—"} achieved`,
        time: new Date(h.date).toLocaleDateString(),
        timestamp: new Date(h.date).getTime(),
        icon: FileText,
        color: "text-pink-accent"
      });
    });

    progress.grammarHistory.slice(-3).forEach(h => {
      activities.push({
        type: "Grammar",
        detail: `Practice session`,
        time: new Date(h.date).toLocaleDateString(),
        timestamp: new Date(h.date).getTime(),
        icon: Type,
        color: "text-amber-accent"
      });
    });

    if (progress.vocabLearned > 0) {
      activities.push({
        type: "Vocabulary",
        detail: `Learned ${progress.vocabLearned} words`,
        time: "Today",
        timestamp: Date.now(),
        icon: BookOpen,
        color: "text-violet-accent"
      });
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  };

  const recentActivities = getRecentActivity();
  const dailyGoalPct = Math.min(100, Math.round(((progress.studyMinutes || 0) / (progress.dailyGoalMin || 60)) * 100));

  const radarData = [
    { subject: 'Reading', A: progress.bands.reading || 4, fullMark: 9 },
    { subject: 'Writing', A: progress.bands.writing || 4, fullMark: 9 },
    { subject: 'Speaking', A: progress.bands.speaking || 4, fullMark: 9 },
    { subject: 'Listening', A: progress.bands.listening || 4, fullMark: 9 },
    { subject: 'Vocab', A: Math.min(9, (progress.vocabLearned / 50) * 9) || 4, fullMark: 9 },
    { subject: 'Grammar', A: Math.min(9, (progress.grammarHistory.length / 10) * 9) || 4, fullMark: 9 },
  ];

  const dailyTasks = [
    { label: "Daily Quiz", id: "quiz", done: !!progress.dailyQuizDone },
    { label: "Learn 5 Words", id: "vocab", done: progress.vocabLearned >= 5 },
    { label: "Study for 60m", id: "timer", done: progress.studyMinutes >= 60 },
    { label: "Review Flashcards", id: "flashcards", done: progress.vocabLearned > 0 },
  ];
  const tasksDoneCount = dailyTasks.filter(t => t.done).length;
  const tasksPct = Math.round((tasksDoneCount / dailyTasks.length) * 100);

  return (
    <motion.div 
      id="dashboard-root" 
      className="space-y-6 pb-12"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Hero Card */}
      <motion.div 
        id="dashboard-hero" 
        className="card-blue overflow-hidden relative p-8 md:p-14 group min-h-[450px] flex flex-col justify-center rounded-3xl"
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        }}
      >
        <div className="absolute inset-0 recipe-atmospheric-bg opacity-40" />
        <div id="hero-logo-bg" className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Logo className="w-48 h-48 md:w-96 md:h-96" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="recipe-editorial-label mb-6 flex items-center gap-3">
                <div className="w-8 h-px bg-blue-secondary/30" />
                <Sparkles size={14} className="text-blue-secondary animate-pulse" />
                <span>{motivation || "Personalized Learning"}</span>
              </div>
              <h3 className="recipe-editorial-h1 mb-8">
                Hello, <br/>
                <span className="text-blue-secondary">{progress.name}</span>
              </h3>
              <p className="text-xl text-text-secondary max-w-md leading-relaxed font-medium">
                {progress.streak >= 3 
                  ? `You're on a ${progress.streak}-day winning streak! Your consistency is the key to mastering the IELTS.` 
                  : "Your journey to Band 9.0 starts with a single step. Let's practice today."}
              </p>
            </motion.div>
            
            <div className="flex flex-wrap gap-6">
              <button onClick={() => setActivePage("course")} className="btn btn-primary px-10 py-5 text-sm shadow-2xl shadow-blue-primary/40">
                Continue Learning
              </button>
              <button onClick={startRandomPractice} className="btn btn-ghost px-10 py-5 text-sm border border-white/10">
                Quick Practice
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end">
            <motion.div 
              className="recipe-hardware-widget w-full max-w-[300px] aspect-square flex flex-col items-center justify-center relative group/band rounded-3xl border-white/10"
              whileHover={{ scale: 1.05, rotate: 1 }}
            >
              <div className="absolute inset-0 bg-blue-primary/5 opacity-0 group-hover/band:opacity-100 transition-opacity rounded-3xl" />
              <div className="recipe-hardware-label mb-6">Predicted Band</div>
              <div className="font-serif text-9xl font-black text-blue-secondary leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                {avgBand === "0.0" ? "—" : avgBand}
              </div>
              <div className="recipe-hardware-label mt-8 flex items-center gap-3">
                <span>Target</span>
                <span className="text-text-primary font-black text-lg">{progress.target}</span>
              </div>
              
              {/* Decorative hardware elements */}
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-white/10" />
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10" />
              <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/10" />
              <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-white/10" />
            </motion.div>
          </div>
        </div>

        <div className="mt-20 space-y-6">
          <div className="flex justify-between items-end">
            <div className="recipe-hardware-label">Overall course progress</div>
            <div className="font-mono text-sm font-black text-blue-secondary">{progressPct}%</div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
              className="h-full bg-blue-primary relative shadow-[0_0_20px_rgba(13,122,246,0.6)]"
            >
              <div className="absolute inset-0 animate-shimmer" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div 
        className="card p-6 overflow-hidden"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Study Activity</div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Last 12 Weeks</div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-between">
          {Array.from({ length: 84 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (83 - i));
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = progress?.studyDays.includes(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <motion.div 
                key={i}
                className={cn(
                  "w-3 h-3 md:w-4 md:h-4 rounded-sm transition-colors duration-500",
                  hasActivity ? "bg-blue-primary shadow-[0_0_8px_rgba(13,122,246,0.3)]" : "bg-bg-3",
                  isToday && !hasActivity && "border border-blue-primary/50"
                )}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                title={dateStr}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-[9px] text-text-muted font-bold uppercase tracking-widest">
          <span>Less</span>
          <div className="w-2.5 h-2.5 bg-bg-3 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-primary/40 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-primary/70 rounded-sm" />
          <div className="w-2.5 h-2.5 bg-blue-primary rounded-sm" />
          <span>More</span>
        </div>
      </motion.div>

      {/* Enhanced Daily Goal Tracker & Skill Improvement */}
      <div id="dashboard-main-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          id="daily-progress-card" 
          className="lg:col-span-2 card bg-gradient-to-br from-blue-primary to-blue-secondary text-white border-none p-8 relative overflow-hidden group"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-dim/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                <Trophy size={12} /> Daily Study Goal
              </div>
              <h3 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-none">
                {dailyGoalPct}% Complete
              </h3>
              <p className="text-blue-dim text-sm max-w-xs leading-relaxed">
                You&apos;ve studied for <span className="text-white font-bold">{progress.studyMinutes || 0} mins</span> today. Only <span className="text-white font-bold">{Math.max(0, (progress.dailyGoalMin || 60) - (progress.studyMinutes || 0))} mins</span> left to reach your goal!
              </p>
              <div className="flex items-center gap-4 pt-2">
                <button 
                  onClick={() => setActivePage("course")}
                  className="px-6 py-2.5 bg-white text-blue-primary font-bold text-xs rounded-xl shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all"
                >
                  Continue Learning
                </button>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-primary bg-blue-dim/30 flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/user${i}/32/32`} 
                        alt="User" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-blue-primary bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold">
                    +12
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-dim uppercase tracking-widest">Studying now</span>
              </div>
            </div>

            <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${(dailyGoalPct / 100) * 283} 283` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black leading-none">{progress.studyMinutes || 0}</span>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Mins</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          id="skill-improvement-card" 
          className="card bg-bg-2 border-border-2 p-6 flex flex-col justify-between group"
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-accent/10 text-amber-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Skill Focus</div>
                <div className="text-lg font-black text-text-primary">Writing Lab</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-text-secondary flex items-center justify-between">
                <span>Improvement Area</span>
                <span className="text-blue-secondary">Cohesion</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase">
                  <span>Current Proficiency</span>
                  <span>65%</span>
                </div>
                <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-primary"
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Aria suggests focusing on <span className="text-text-primary font-bold">Complex Sentences</span> to boost your Writing band from 6.5 to 9.0.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActivePage("writing")}
            className="w-full py-3 mt-6 bg-bg-3 hover:bg-bg-1 border border-border-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-blue-secondary transition-all"
          >
            Start Targeted Practice
          </button>
        </motion.div>
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
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", action.bg)}>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Day Streak", value: progress.streak, icon: Flame, color: "text-amber-accent" },
            { label: "Quizzes", value: progress.quizHistory.length, icon: PenTool, color: "text-blue-secondary" },
            { label: "Mock Tests", value: progress.mockHistory.length, icon: FileText, color: "text-violet-accent" },
            { label: "Lessons", value: lessonsDone, icon: BookOpen, color: "text-green-accent" },
          ].map((stat, i) => (
            <div key={i} className="card flex flex-col items-center justify-center text-center hover:scale-105 cursor-default group p-6">
              <div className={cn("p-2 rounded-xl bg-bg-2 mb-2 transition-colors group-hover:bg-bg-3", stat.color)}>
                <stat.icon size={20} />
              </div>
              <div className="font-serif text-2xl font-black text-text-primary">{stat.value}</div>
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="card p-6 flex flex-col items-center justify-center bg-bg-2 border-border-2">
          <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-4 w-full text-left flex items-center gap-2">
            <Target size={14} className="text-blue-secondary" /> Skill Mastery
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Aria's Daily Briefing & Daily Challenge */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card recipe-atmospheric-bg border-blue-primary/20 relative overflow-hidden p-8 md:p-12 rounded-xl">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-primary/10 rounded-xl flex items-center justify-center shadow-inner border border-blue-primary/20">
                <Bot size={28} className="text-blue-secondary" />
              </div>
              <div>
                <div className="recipe-editorial-label">Daily Intelligence</div>
                <h4 className="font-serif text-2xl font-bold text-text-primary">Aria&apos;s Briefing</h4>
              </div>
            </div>
            <button 
              onClick={() => generateBriefing(progress, true)}
              disabled={isGeneratingBriefing}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-blue-secondary hover:bg-white/10 transition-all disabled:opacity-50"
              title="Refresh Briefing"
            >
              <RotateCcw size={16} className={isGeneratingBriefing ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="relative z-10">
            {isGeneratingBriefing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-primary rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-blue-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-3 h-3 bg-blue-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="recipe-hardware-label">Aria is synthesizing your data...</span>
              </div>
            ) : briefingError ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-red-accent/10 rounded-full flex items-center justify-center mx-auto text-red-accent">
                  <AlertCircle size={32} />
                </div>
                <p className="text-sm text-text-muted font-medium">{briefingError}</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert prose-lg max-w-none text-text-secondary leading-relaxed font-medium"
              >
                <div className="bg-white/5 p-8 rounded-xl border border-white/5 shadow-inner">
                  <Markdown>{progress.dailyBriefing?.content || "Getting your briefing ready..."}</Markdown>
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="absolute -bottom-20 -right-20 opacity-5 pointer-events-none transform rotate-12 scale-150">
            <Bot size={300} />
          </div>
        </div>

        <div className="card bg-bg-2 border-border-2 p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-orange-500/10 transition-colors" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="recipe-editorial-label text-amber-accent">
                <Zap size={14} className="inline mr-2 animate-pulse" /> 1-Min Challenge
              </div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 shadow-lg shadow-orange-500/5"
              >
                <Flame size={16} className="text-orange-500" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{progress.streak || 0}d Streak</span>
              </motion.div>
            </div>
            {dailyChallenge && (
              <div className="space-y-6">
                <div className="p-6 bg-bg-1 rounded-xl border border-border-2 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500/50" />
                  <div className="recipe-hardware-label mb-3 flex items-center gap-2">
                    <BookOpen size={14} /> {dailyChallenge.type}
                  </div>
                  <p className="text-lg text-text-primary font-serif font-bold leading-tight">{dailyChallenge.question}</p>
                </div>
                
                <AnimatePresence mode="wait">
                  {!challengeFeedback ? (
                    <motion.div 
                      key="input"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <input 
                        type="text" 
                        value={userChallengeAnswer}
                        onChange={(e) => setUserChallengeAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="input w-full"
                      />
                      <button 
                        onClick={checkChallenge}
                        disabled={!userChallengeAnswer.trim() || isCheckingChallenge}
                        className="btn w-full py-4 bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 border-none"
                      >
                        {isCheckingChallenge ? <Loader2 size={20} className="animate-spin" /> : "Submit Answer"}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="feedback"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-8 rounded-2xl border-2 shadow-2xl relative overflow-hidden",
                        challengeFeedback.startsWith("Correct") 
                          ? "bg-green-500/5 border-green-500/20 text-green-500" 
                          : "bg-red-500/5 border-red-500/20 text-red-500"
                      )}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                          challengeFeedback.startsWith("Correct") ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
                        )}>
                          {challengeFeedback.startsWith("Correct") ? <CheckCircle2 size={24} /> : <X size={24} />}
                        </div>
                        <div>
                          <div className="recipe-editorial-label opacity-60">
                            {challengeFeedback.startsWith("Correct") ? "Excellent!" : "Try Again"}
                          </div>
                          <h5 className="font-bold text-base text-text-primary">
                            {challengeFeedback.startsWith("Correct") ? "Perfect" : "Keep Going"}
                          </h5>
                        </div>
                      </div>
                      
                      <p className="text-sm text-text-secondary leading-relaxed mb-8 font-medium italic">
                        {challengeFeedback}
                      </p>

                      <button 
                        onClick={generateDailyChallenge}
                        className="w-full py-4 bg-bg-1 border border-border-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary hover:bg-bg-2 transition-all flex items-center justify-center gap-3"
                      >
                        <RotateCcw size={14} /> Next Challenge
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div className="mt-10 pt-8 border-t border-border-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">
              <span>Goal Completion</span>
              <span className="text-orange-500">{tasksPct}%</span>
            </div>
            <div className="h-2 bg-bg-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${tasksPct}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-amber-accent to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Study Plan & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 card p-8 bg-bg-2 border-border-2"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-primary/10 rounded-full flex items-center justify-center text-blue-primary">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-text-primary tracking-tight">Your Study Plan</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Optimized for Band {progress.target}</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-blue-secondary uppercase tracking-widest hover:underline">View Full Schedule</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { day: "Today", task: "Writing Task 2", time: "45m", status: "In Progress", color: "bg-blue-primary" },
              { day: "Tomorrow", task: "Listening Section 3", time: "30m", status: "Upcoming", color: "bg-bg-3" },
              { day: "Sun, 29 Mar", task: "Full Mock Test", time: "2h 45m", status: "Upcoming", color: "bg-bg-3" },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-bg-1 border border-border-2 relative overflow-hidden group">
                <div className={cn("absolute top-0 left-0 w-1 h-full", item.color)} />
                <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-2">{item.day}</div>
                <div className="text-sm font-black text-text-primary mb-1">{item.task}</div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold">
                    <Clock size={12} /> {item.time}
                  </div>
                  <div className={cn("text-[8px] font-black uppercase px-2 py-1 rounded-md", item.status === "In Progress" ? "bg-blue-primary/10 text-blue-primary" : "bg-bg-3 text-text-muted")}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="card p-8 bg-bg-2 border-border-2"
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-accent/10 rounded-full flex items-center justify-center text-green-accent">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-text-primary tracking-tight">Recent Activity</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Your latest achievements</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", activity.color.replace('text-', 'bg-') + '/10')}>
                  <activity.icon size={18} className={activity.color} />
                </div>
                <div className="flex-1 border-b border-border-2 pb-4 group-last:border-none">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-black text-text-primary uppercase tracking-tight">{activity.type}</div>
                    <div className="text-[8px] text-text-muted font-bold uppercase tracking-widest">{activity.time}</div>
                  </div>
                  <p className="text-[10px] text-text-secondary font-medium">{activity.detail}</p>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center">
                <p className="text-xs text-text-muted font-medium italic">No recent activity. Start practicing!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Skill Analysis & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          className="card p-8 bg-bg-2 border-border-2"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-primary/10 rounded-full flex items-center justify-center text-blue-primary">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-text-primary tracking-tight">Skill Analysis</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Your current performance profile</p>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Listening', A: progress.bands.listening || 4, fullMark: 9 },
                { subject: 'Reading', A: progress.bands.reading || 4, fullMark: 9 },
                { subject: 'Writing', A: progress.bands.writing || 4, fullMark: 9 },
                { subject: 'Speaking', A: progress.bands.speaking || 4, fullMark: 9 },
                { subject: 'Grammar', A: Math.min(9, (progress.grammarHistory.length / 10) * 9) || 5, fullMark: 9 },
                { subject: 'Vocab', A: Math.min(9, (progress.vocabLearned / 100) * 9) || 5, fullMark: 9 },
              ]}>
                <PolarGrid stroke="#2D3748" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#A0AEC0', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 9]} tick={false} axisLine={false} />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#3182CE"
                  fill="#3182CE"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '8px', fontSize: '10px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-bg-1 border border-border-2">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Strongest Skill</div>
              <div className="text-sm font-black text-green-accent uppercase">Vocabulary</div>
            </div>
            <div className="p-4 rounded-xl bg-bg-1 border border-border-2">
              <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Needs Focus</div>
              <div className="text-sm font-black text-red-accent uppercase">Listening</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card p-8 bg-bg-2 border-border-2"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-accent/10 rounded-full flex items-center justify-center text-amber-accent">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-text-primary tracking-tight">Achievements</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Your learning milestones</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {progress.achievements.slice(0, 4).map((ach, i) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl border transition-all duration-300",
                ach.unlocked ? "bg-bg-1 border-border-2" : "bg-bg-1/50 border-border-2 opacity-50 grayscale"
              )}>
                <div className="text-2xl mb-2">{ach.unlocked ? "🏆" : "🔒"}</div>
                <div className="text-xs font-black text-text-primary mb-1">{ach.title}</div>
                <div className="text-[10px] text-text-muted leading-tight">{ach.description}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Daily Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Grammar Tip of the Day */}
        <div className="card bg-gradient-to-br from-amber-accent/10 to-bg-1 border-amber-accent/20 p-6">
          <div className="flex items-center gap-2 text-amber-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
            <Book size={14} /> Grammar Tip
          </div>
          <p className="text-sm text-text-primary font-bold mb-2">{grammarTip.title || grammarTip.t}</p>
          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            {grammarTip.tip}
          </p>
          <div className="space-y-2 p-3 bg-bg-2/50 rounded-xl border border-white/5">
            <div className="text-[10px] text-red-accent/80 flex items-start gap-2">
              <span className="font-black">❌</span> {grammarTip.bad}
            </div>
            <div className="text-[10px] text-green-accent/80 flex items-start gap-2">
              <span className="font-black">✅</span> {grammarTip.good}
            </div>
          </div>
        </div>

        {/* Word of the Day Preview */}
        <div className="card bg-gradient-to-br from-violet-accent/10 to-bg-1 border-violet-accent/20 p-6">
          <div className="flex items-center gap-2 text-violet-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} /> Word of the Day
          </div>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-serif text-2xl font-black text-text-primary uppercase tracking-tighter mb-1">{wordOfDay.word || wordOfDay.w}</h4>
              <p className="text-[10px] text-text-muted italic mb-3">{wordOfDay.type || wordOfDay.pos} · Band {wordOfDay.band}</p>
              <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">{wordOfDay.def}</p>
              <div className="p-3 bg-violet-accent/5 border border-violet-accent/10 rounded-xl italic text-[11px] text-text-primary/80">
                &quot;{wordOfDay.example || wordOfDay.ex}&quot;
              </div>
            </div>
            <button onClick={() => setActivePage("vocab")} className="btn btn-ghost p-2 rounded-full border-violet-accent/20 text-violet-accent ml-2">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Study Timer Today */}
        <div className="card p-6 bg-gradient-to-br from-bg-1 to-bg-2 border-violet-accent/20">
          <div className="flex justify-between items-center mb-6">
            <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
              <Clock size={16} className="text-violet-accent" /> Quick Timer
            </div>
            <button onClick={() => setActivePage("timer")} className="text-[10px] font-bold text-blue-secondary hover:underline uppercase tracking-widest flex items-center gap-1">
              Full App <ChevronRight size={10} />
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center py-2">
            <div className="font-mono text-4xl font-black text-text-primary mb-4 tracking-tighter">
              {formatTimer(timerTime)}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsTimerActive(!isTimerActive)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  isTimerActive 
                    ? "bg-bg-3 text-text-primary border border-border" 
                    : "bg-violet-accent text-white shadow-lg shadow-violet-accent/20"
                )}
              >
                {isTimerActive ? "Pause" : "Start Focus"}
              </button>
              <button 
                onClick={() => { setIsTimerActive(false); setTimerTime(25 * 60); }}
                className="p-2 rounded-xl bg-bg-2 border border-border text-text-muted hover:text-text-primary transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Today&apos;s Goal</span>
              <span className="text-xs font-black text-violet-accent">{progress.studyMinutes || 0} / {progress.dailyGoalMin} min</span>
            </div>
            <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((progress.studyMinutes || 0) / progress.dailyGoalMin) * 100)}%` }}
                className="h-full bg-violet-accent rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Skill Bands Summary */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
              <Target size={16} className="text-blue-secondary" /> Skill Bands
            </div>
            <button onClick={() => setActivePage("analytics")} className="text-[10px] font-bold text-blue-secondary hover:underline uppercase tracking-widest flex items-center gap-1">
              Stats <ChevronRight size={10} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {skillBands.map((skill) => {
              const val = (progress && progress.bands) ? (progress.bands[skill.key as keyof typeof progress.bands] || 0) : 0;
              return (
                <div key={skill.key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-text-muted uppercase">{skill.label}</span>
                    <span className={cn("text-xs font-black", skill.color)}>{val || "—"}</span>
                  </div>
                  <div className="h-1 bg-bg-3 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", skill.bg)} style={{ width: `${(val / 9) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" /> Achievements
          </div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            {progress.achievements?.filter(a => a.unlocked).length || 0} / {progress.achievements?.length || 0} Unlocked
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {progress.achievements?.map((achievement) => (
            <div 
              key={achievement.id}
              className={cn(
                "p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-3",
                achievement.unlocked 
                  ? "bg-amber-500/5 border-amber-500/20" 
                  : "bg-bg-2 border-border opacity-60 grayscale"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                achievement.unlocked ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-bg-3 text-text-muted"
              )}>
                <Trophy size={20} />
              </div>
              <div>
                <div className="text-xs font-black text-text-primary mb-1">{achievement.title}</div>
                <div className="text-[10px] text-text-muted leading-tight">{achievement.description}</div>
                {achievement.unlocked && achievement.date && (
                  <div className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-2">
                    {new Date(achievement.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function HeadphonesIcon({ size, className }: { size: number, className?: string }) {
  return <Headphones size={size} className={className} />;
}
