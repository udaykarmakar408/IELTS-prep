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
  onUpdate: () => void;
}

export default function Settings({ onUpdate }: SettingsProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(7.5);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      setName(p.name);
      setTarget(p.target);
    };
    load();
  }, []);

  const handleSave = () => {
    if (!progress || !name.trim()) return;
    const updated = { ...progress, name: name.trim(), target };
    setProgress(updated);
    saveProgress(updated);
    setIsSaved(true);
    onUpdate();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const exportData = () => {
    if (!progress) return;
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ielts_progress_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!progress) return null;

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
                className="w-full bg-bg-2 border border-border-2 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-blue-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 block">Target Band Score</label>
              <div className="grid grid-cols-3 gap-2">
                {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((b) => (
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
                  onClick={() => {
                    const updated = { ...progress, dailyGoalMin: m };
                    setProgress(updated);
                    saveProgress(updated);
                  }}
                  className={cn(
                    "py-2.5 rounded-xl font-bold text-xs transition-all",
                    progress.dailyGoalMin === m 
                      ? "bg-violet-accent/10 border-2 border-violet-accent text-violet-accent" 
                      : "bg-bg-2 border-2 border-transparent text-text-muted hover:border-border-2"
                  )}
                >
                  {m >= 60 ? `${m/60}h` : `${m}m`}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-text-muted font-medium italic">Current goal: <span className="text-violet-accent font-bold">{progress.dailyGoalMin} minutes per day</span></div>
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
