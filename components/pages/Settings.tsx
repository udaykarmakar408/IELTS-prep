"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  User, 
  Target, 
  Calendar, 
  Clock, 
  Trash2, 
  Download, 
  Upload, 
  Shield,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { getProgress, saveProgress, UserProgress, defaultProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

interface SettingsProps {
  progress: UserProgress | null;
  onUpdate: () => void;
}

export default function Settings({ progress: initialProgress, onUpdate }: SettingsProps) {
  const [name, setName] = useState(initialProgress?.name || "");
  const [target, setTarget] = useState(initialProgress?.target || 9.0);
  const [difficulty, setDifficulty] = useState(initialProgress?.difficulty || "intermediate");
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(initialProgress?.adaptiveDifficulty ?? true);
  const [isSaved, setIsSaved] = useState(false);

  // Sync local state if initialProgress changes (e.g., from another update)
  useEffect(() => {
    if (initialProgress) {
      setName(initialProgress.name);
      setTarget(initialProgress.target);
    }
  }, [initialProgress]);

  const handleSave = async () => {
    if (!initialProgress || !name.trim()) return;
    const updated: UserProgress = { 
      ...initialProgress, 
      name: name.trim(), 
      target,
      difficulty: difficulty as any,
      adaptiveDifficulty
    };
    await saveProgress(updated);
    setIsSaved(true);
    onUpdate();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleThemeToggle = async (theme: "light" | "dark") => {
    if (!initialProgress) return;
    // When toggling theme, we also preserve the current name/target from inputs
    const updated = { 
      ...initialProgress, 
      theme,
      name: name.trim() || initialProgress.name,
      target 
    };
    await saveProgress(updated);
    onUpdate();
  };

  const handleGoalChange = async (m: number) => {
    if (!initialProgress) return;
    const updated = { ...initialProgress, dailyGoalMin: m };
    await saveProgress(updated);
    onUpdate();
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const exportData = () => {
    if (!initialProgress) return;
    const blob = new Blob([JSON.stringify(initialProgress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ielts_progress_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!initialProgress) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1">⚙️ Settings</h2>
        <p className="text-sm text-text-muted">Customize your IELTS preparation experience</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="card space-y-6">
          <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest">
            <User size={14} /> Your Profile
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 block">Target Band Score</label>
              <div className="grid grid-cols-3 gap-2">
                {[7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                  <button
                    key={b}
                    onClick={() => setTarget(b)}
                    className={cn(
                      "py-2.5 rounded-xl font-bold text-sm transition-all",
                      target === b 
                        ? "bg-blue-dim border-2 border-blue-primary text-blue-secondary" 
                        : "bg-bg-2 border-2 border-transparent text-text-muted hover:border-border-2"
                    )}
                  >
                    {b.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Preparation Intensity (Difficulty)</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "beginner", label: "Beginner", desc: "Focus on basics (Band < 5.5)" },
                  { id: "intermediate", label: "Intermediate", desc: "Standard Practice (Band 5.5-7.0)" },
                  { id: "advanced", label: "Advanced", desc: "High Stakes (Band 7.0+)" }
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => {
                      setDifficulty(level.id as any);
                      setAdaptiveDifficulty(false);
                    }}
                    className={cn(
                      "flex-1 min-w-[140px] p-4 rounded-xl border-2 text-left transition-all",
                      difficulty === level.id && !adaptiveDifficulty
                        ? "bg-blue-primary/10 border-blue-primary text-blue-primary"
                        : "bg-bg-2 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="text-xs font-bold mb-1">{level.label}</div>
                    <div className="text-[10px] opacity-70 leading-tight">{level.desc}</div>
                  </button>
                ))}
                <button
                  onClick={() => setAdaptiveDifficulty(true)}
                  className={cn(
                    "flex-1 min-w-[140px] p-4 rounded-xl border-2 text-left transition-all",
                    adaptiveDifficulty
                      ? "bg-amber-accent/10 border-amber-accent text-amber-accent"
                      : "bg-bg-2 border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="text-xs font-bold mb-1">Adaptive AI</div>
                  <div className="text-[10px] opacity-70 leading-tight">Syncs level with your band score automatically</div>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className={cn(
              "btn w-full py-3.5 transition-all",
              isSaved ? "bg-green-accent text-white" : "btn-primary"
            )}
          >
            {isSaved ? <><CheckCircle2 size={18} /> Settings Saved</> : "Save Changes"}
          </button>
        </div>

        {/* Theme Selection */}
        <div className="card space-y-6">
          <div className="flex items-center gap-2 text-amber-accent font-bold text-xs uppercase tracking-widest">
            <Target size={14} /> Appearance
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 block">Application Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeToggle("light")}
                className={cn(
                  "flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all border-2",
                  initialProgress.theme === "light" 
                    ? "bg-amber-accent/10 border-amber-accent text-amber-accent" 
                    : "bg-bg-2 border-transparent text-text-muted hover:border-border-2"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-white border border-gray-200" />
                Light Mode
              </button>
              <button
                onClick={() => handleThemeToggle("dark")}
                className={cn(
                  "flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all border-2",
                  initialProgress.theme === "dark" || !initialProgress.theme
                    ? "bg-blue-primary/10 border-blue-primary text-blue-secondary" 
                    : "bg-bg-2 border-transparent text-text-muted hover:border-border-2"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-black border border-white/20" />
                Dark Mode
              </button>
            </div>
          </div>
        </div>

        {/* Study Goals */}
        <div className="card space-y-6">
          <div className="flex items-center gap-2 text-violet-accent font-bold text-xs uppercase tracking-widest">
            <Clock size={14} /> Daily Study Goal
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90, 120, 180, 240].map((m) => (
                <button
                  key={m}
                  onClick={() => handleGoalChange(m)}
                  className={cn(
                    "py-2.5 rounded-xl font-bold text-xs transition-all",
                    initialProgress.dailyGoalMin === m 
                      ? "bg-violet-accent/10 border-2 border-violet-accent text-violet-accent" 
                      : "bg-bg-2 border-2 border-transparent text-text-muted hover:border-border-2"
                  )}
                >
                  {m >= 60 ? `${m/60}h` : `${m}m`}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-text-muted font-medium italic">Current goal: <span className="text-violet-accent font-bold">{initialProgress.dailyGoalMin} minutes per day</span></div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card space-y-6">
          <div className="flex items-center gap-2 text-text-muted font-bold text-xs uppercase tracking-widest">
            <Shield size={14} /> Data & Privacy
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">All your progress is stored locally in your browser. We don&apos;t store any personal data on our servers.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button onClick={exportData} className="btn btn-ghost border-border-2 text-xs py-3">
              <Download size={16} /> Export Backup
            </button>
            <button onClick={handleReset} className="btn btn-ghost border-red-accent/30 text-red-accent hover:bg-red-accent/5 text-xs py-3">
              <Trash2 size={16} /> Reset All Data
            </button>
          </div>
        </div>

        <div className="text-center opacity-40 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Uday&apos;s IELTS v5.0</div>
          <div className="text-[9px] mt-1">Built with Gemini 2.0 Flash AI</div>
        </div>
      </div>
    </div>
  );
}
