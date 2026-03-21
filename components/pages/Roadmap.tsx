"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Flag,
  Target,
  Rocket,
  Trophy,
  Sparkles,
  Loader2, 
  X,
  Edit2
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

const ROADMAP_PHASES = [
  {
    phase: "Foundation",
    week: "Weeks 1–2",
    icon: Rocket,
    color: "text-blue-secondary",
    bg: "bg-blue-secondary/10",
    tasks: [
      "IELTS format overview & scoring system",
      "Vocabulary: 10 new words/day",
      "Identify current band level",
      "Basic grammar review: tenses, articles",
    ]
  },
  {
    phase: "Skill Development",
    week: "Weeks 3–6",
    icon: Target,
    color: "text-violet-accent",
    bg: "bg-violet-accent/10",
    tasks: [
      "Reading: all 14 question types",
      "Writing Task 1: charts, graphs",
      "Writing Task 2: all 5 essay types",
      "Speaking Parts 1, 2 & 3 strategies",
    ]
  },
  {
    phase: "Exam Practice",
    week: "Weeks 7–10",
    icon: Flag,
    color: "text-pink-accent",
    bg: "bg-pink-accent/10",
    tasks: [
      "Timed full reading sections",
      "Full writing tasks under exam conditions",
      "Speaking simulation with AI feedback",
      "Listening under test conditions",
    ]
  },
  {
    phase: "Final Polish",
    week: "Weeks 11–12",
    icon: Trophy,
    color: "text-green-accent",
    bg: "bg-green-accent/10",
    tasks: [
      "2-3 full mock tests per week",
      "Targeted weak-area drilling",
      "Final exam strategies",
      "Review entire error log",
    ]
  }
];

export default function Roadmap() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newTarget, setNewTarget] = useState(7.5);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      if (p) setNewTarget(p.target);
    };
    load();
  }, []);

  const updateGoal = () => {
    if (!progress) return;
    const updated = { ...progress, target: newTarget };
    setProgress(updated);
    saveProgress(updated);
    setIsEditingGoal(false);
  };

  const generateAIPlan = async () => {
    if (!progress || !progress.bands) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a personalized 7-day IELTS study plan for ${progress.name}.
      Target Band: ${progress.target}
      Current Strengths/Weaknesses: ${Object.entries(progress.bands).map(([k,v]) => `${k}: ${v}`).join(', ')}
      Focus on the weakest areas while maintaining the strongest.
      Provide a specific task for each day.
      Return in clean markdown with ## for days.`;
      
      const result = await callGemini(prompt, "You are an expert IELTS study planner.");
      setAiPlan(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateDay = (val: number) => {
    if (!progress) return;
    const updated = { ...progress, roadmapDay: val };
    setProgress(updated);
    saveProgress(updated);
  };

  if (!progress) return null;

  const currentDay = progress.roadmapDay || 1;
  const pct = Math.round((currentDay / 90) * 100);

  return (
    <div className="space-y-8">
      <div className="card-blue p-8 md:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="text-[10px] text-blue-secondary font-black uppercase tracking-[0.2em]">Your Journey</div>
            <h2 className="font-serif text-4xl md:text-5xl font-black text-text-primary leading-tight tracking-tight">
              90-Day <span className="text-blue-secondary">Roadmap</span>
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <p className="text-sm text-text-secondary font-medium tracking-wide">Targeting Band {progress.target}+</p>
              <button onClick={() => setIsEditingGoal(true)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-blue-secondary hover:bg-blue-primary hover:text-white transition-all shadow-lg shadow-black/20">
                <Edit2 size={12} />
              </button>
            </div>
          </div>
          <button 
            onClick={generateAIPlan} 
            disabled={isGenerating}
            className="btn btn-primary bg-violet-accent hover:bg-violet-accent/80 shadow-xl shadow-violet-accent/30 px-8 py-4"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            <span className="uppercase tracking-widest text-xs font-black">{isGenerating ? "Planning..." : "AI Weekly Plan"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isEditingGoal && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card bg-bg-2 border-blue-primary/30 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-blue-secondary uppercase tracking-widest">Set Your Target Band</div>
              <button onClick={() => setIsEditingGoal(false)} className="text-text-muted hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-4">
              <input 
                type="number" 
                step="0.5" 
                min="4" 
                max="9" 
                value={newTarget} 
                onChange={(e) => setNewTarget(parseFloat(e.target.value))}
                className="flex-1 bg-bg border border-border-2 rounded-xl px-4 py-2 text-sm text-text-primary outline-none focus:border-blue-primary"
              />
              <button onClick={updateGoal} className="btn btn-primary px-6">Save Goal</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiPlan && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-bg-2 border-violet-accent/30 overflow-hidden"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-violet-accent/5">
              <div className="text-xs font-bold text-violet-accent uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} /> Your AI-Generated Weekly Plan
              </div>
              <button onClick={() => setAiPlan(null)} className="text-text-muted hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 prose prose-invert prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: aiPlan.replace(/## (.*?)\n/g, '<h3 class="text-violet-accent font-bold mt-4 mb-2">$1</h3>').replace(/\n/g, '<br/>') }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card p-8 bg-white/5 border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Current Progress</span>
            <div className="text-xl font-serif font-black text-text-primary">Day {currentDay} of 90</div>
          </div>
          <div className="text-3xl font-serif font-black text-blue-secondary">{pct}%</div>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-8 relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className="h-full bg-gradient-to-r from-blue-primary via-blue-secondary to-violet-accent rounded-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
          </motion.div>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] block">Update your journey</label>
            <input 
              type="range" 
              min="1" 
              max="90" 
              value={currentDay} 
              onChange={(e) => handleUpdateDay(parseInt(e.target.value))}
              className="w-full accent-blue-primary cursor-pointer h-2 bg-white/5 rounded-full appearance-none hover:accent-blue-secondary transition-all"
            />
          </div>
          <div className="p-4 bg-blue-primary/5 rounded-2xl border border-blue-primary/10 italic text-sm text-text-secondary text-center font-medium leading-relaxed">
            &quot;{pct < 25 ? "Great start! The habit is forming. Keep showing up daily." :
             pct < 50 ? "You&apos;re building real momentum. Stay consistent!" :
             pct < 75 ? "Over halfway! You&apos;ve proven you can do this. Push through!" :
             "Almost there! The finish line is in sight. Give it everything!"}&quot;
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-6">
          <Calendar size={14} /> Recommended Daily Schedule
        </div>
        <div className="space-y-3">
          {[
            { time: "08:00 AM", task: "Vocabulary & Reading Drill (30m)", icon: "📖" },
            { time: "12:00 PM", task: "Listening Practice (20m)", icon: "🎧" },
            { time: "06:00 PM", task: "Writing Task or Speaking Simulation (45m)", icon: "🎤" },
            { time: "09:00 PM", task: "Review Error Log & Daily Quiz (15m)", icon: "✅" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-bg-2/50 rounded-xl border border-border/50">
              <div className="text-[10px] font-mono font-bold text-text-muted w-16">{item.time}</div>
              <div className="text-xl">{item.icon}</div>
              <div className="text-xs text-text-secondary font-medium">{item.task}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {ROADMAP_PHASES.map((p, i) => {
          const isCurrent = currentDay > i * 22 && currentDay <= (i + 1) * 22;
          const isCompleted = currentDay > (i + 1) * 22;

          return (
            <div key={i} className={cn(
              "card border-border transition-all",
              isCurrent && "border-blue-primary shadow-lg shadow-blue-primary/5",
              !isCurrent && !isCompleted && "opacity-60"
            )}>
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm", p.bg)}>
                  <p.icon size={24} className={p.color} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-text-primary">{p.phase}</h3>
                    {isCompleted && <CheckCircle2 size={16} className="text-green-accent" />}
                  </div>
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{p.week}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                {p.tasks.map((task, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <div className={cn("mt-1 flex-shrink-0", isCompleted ? "text-green-accent" : "text-text-muted")}>
                      {isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    </div>
                    <span className="text-xs text-text-secondary leading-relaxed">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
