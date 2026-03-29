"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { saveProgress, defaultProgress } from "@/lib/store";
import { ChevronRight, Sparkles } from "lucide-react";

interface SetupProps {
  onComplete: () => void;
}

export default function Setup({ onComplete }: SetupProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(9.0);

  const handleFinish = async () => {
    if (!name.trim()) return;
    const progress = {
      ...defaultProgress,
      name: name.trim(),
      target: target,
      studyDays: [new Date().toISOString().split("T")[0]],
      lastSeen: new Date().toISOString().split("T")[0],
      streak: 1,
    };
    await saveProgress(progress);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-primary to-violet-accent shadow-2xl shadow-blue-primary/30 mb-6"
          >
            <Sparkles size={40} className="text-white" />
          </motion.div>
          <h1 className="font-serif text-3xl font-bold mb-2">Uday&apos;s <span className="text-blue-secondary">IELTS</span></h1>
          <p className="text-text-muted text-lg">Your personal AI-powered IELTS coach</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card border-border-2 shadow-2xl"
            >
              <h2 className="font-serif text-xl font-bold mb-2">Welcome! 👋</h2>
              <p className="text-sm text-text-muted mb-6">Progress saved locally — no account needed. Works on any device.</p>
              
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">What should I call you?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name..."
                className="input mb-6"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
              />
              
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                className="btn btn-primary w-full py-4 text-base disabled:opacity-50"
              >
                Continue <ChevronRight size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card border-border-2 shadow-2xl"
            >
              <h2 className="font-serif text-xl font-bold mb-2">Target Band Score</h2>
              <p className="text-sm text-text-muted mb-6">What IELTS band are you aiming for?</p>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                  <button
                    key={b}
                    onClick={() => setTarget(b)}
                    className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      target === b 
                        ? "bg-blue-dim border-2 border-blue-primary text-blue-secondary shadow-lg shadow-blue-primary/10" 
                        : "bg-bg-2 border-2 border-transparent text-text-muted hover:border-border-2"
                    }`}
                  >
                    {b.toFixed(1)}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleFinish}
                className="btn btn-primary w-full py-4 text-base"
              >
                🚀 Start My IELTS Journey
              </button>
              
              <button 
                onClick={() => setStep(1)}
                className="w-full text-center text-text-muted text-sm mt-4 hover:text-text-secondary transition-colors"
              >
                Go Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
