"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Play, 
  Square, 
  RefreshCw, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  Clock,
  Lightbulb,
  MessageSquare,
  Trophy
} from "lucide-react";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

const CUE_CARDS = [
  { topic: "A person who has influenced you", categories: ["People", "Experience"] },
  { topic: "A place you would like to visit in the future", categories: ["Places", "Travel"] },
  { topic: "A book you read recently", categories: ["Media", "Hobbies"] },
  { topic: "An important decision you made", categories: ["Life", "Experience"] },
  { topic: "A piece of technology you find useful", categories: ["Tech", "Objects"] },
];

export default function SpeakingLab() {
  const [activeCard, setActiveCard] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cueCardData, setCueCardData] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [phase, setPhase] = useState<"prep" | "speak" | "feedback">("prep");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startPractice = async (topic?: string) => {
    setIsGenerating(true);
    setFeedback(null);
    setPhase("prep");
    setTimer(60); // 1 minute prep time
    setIsTimerActive(true);
    
    try {
      const prompt = `Generate an IELTS Speaking Part 2 Cue Card for the topic: "${topic || "A random interesting topic"}".
      Include:
      1. The main topic statement (Describe a...)
      2. 4 bullet points (You should say: who/what/where/when, why, how you felt, etc.)
      Return in JSON format: { "topic": "...", "bullets": ["...", "...", "...", "..."] }`;
      
      const result = await callGemini(prompt, "You are an IELTS Speaking examiner.");
      const data = JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
      setCueCardData(data);
    } catch (error) {
      console.error(error);
      setCueCardData({ topic: topic || "A random interesting topic", bullets: ["Who it was", "When it happened", "What you did", "Why it was important"] });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && isTimerActive) {
      if (phase === "prep") {
        setPhase("speak");
        setTimer(120); // 2 minutes speaking time
      } else {
        setIsTimerActive(false);
        // In a real app, we'd record audio here. For now, we'll simulate the user "finishing".
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer, phase]);

  const getAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Simulate an IELTS Speaking Part 2 feedback for the topic: "${cueCardData.topic}".
      Provide:
      1. Estimated Band (7.0-8.5)
      2. Fluency & Coherence feedback
      3. Lexical Resource (Vocabulary) suggestions
      4. Grammatical Range & Accuracy tips
      5. Pronunciation focus
      Return in clean Markdown.`;
      
      const result = await callGemini(prompt, "You are a senior IELTS examiner.");
      setFeedback(result);
      setPhase("feedback");
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card-blue p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 pointer-events-none">
          <Mic className="w-32 h-32 md:w-48 md:h-48" />
        </div>
        <div className="relative z-10 space-y-3 md:space-y-4">
          <div className="text-[9px] md:text-[10px] text-blue-secondary font-black uppercase tracking-[0.2em]">Speaking Lab</div>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-text-primary leading-tight tracking-tight">
            Cue Card <span className="text-blue-secondary">Mastery</span>
          </h2>
          <p className="text-xs md:text-base text-text-secondary max-w-md leading-relaxed">
            Practice IELTS Speaking Part 2 with AI-generated cue cards, timed sessions, and expert feedback.
          </p>
        </div>
      </div>

      {!cueCardData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted px-1">Popular Topics</h3>
            <div className="grid gap-3">
              {CUE_CARDS.map((card, i) => (
                <button 
                  key={i}
                  onClick={() => startPractice(card.topic)}
                  className="card text-left hover:border-blue-primary group flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-sm text-text-primary mb-1">{card.topic}</div>
                    <div className="flex gap-2">
                      {card.categories.map(cat => (
                        <span key={cat} className="text-[9px] font-bold text-text-muted uppercase tracking-tighter bg-bg-2 px-2 py-0.5 rounded-md">{cat}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-violet-accent/10 to-bg-1 border-violet-accent/20 flex flex-col items-center justify-center text-center p-10">
            <div className="w-16 h-16 bg-violet-accent rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-violet-accent/20">
              <Sparkles size={32} />
            </div>
            <h3 className="font-serif text-2xl font-black text-text-primary mb-2">Surprise Me!</h3>
            <p className="text-xs text-text-secondary mb-8 max-w-[200px]">Let Aria generate a random, challenging topic for you.</p>
            <button 
              onClick={() => startPractice()}
              disabled={isGenerating}
              className="btn btn-primary bg-violet-accent hover:bg-violet-accent/80 border-none w-full"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : "Generate Random Card"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setCueCardData(null)} className="text-xs font-bold text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={14} /> Change Topic
            </button>
            <div className={cn(
              "flex items-center gap-3 font-mono text-2xl font-black px-6 py-2 rounded-2xl border",
              timer < 15 ? "text-red-accent border-red-accent/30 bg-red-accent/5 animate-pulse" : "text-blue-secondary border-blue-secondary/30 bg-blue-secondary/5"
            )}>
              <Clock size={24} /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div className="card border-blue-primary/30 bg-bg-2 p-6 md:p-8">
                <div className="text-[9px] md:text-[10px] text-blue-secondary font-black uppercase tracking-[0.2em] mb-3 md:mb-4">IELTS Speaking Part 2</div>
                <h3 className="font-serif text-2xl md:text-3xl font-black text-text-primary mb-4 md:mb-6 leading-tight">
                  {cueCardData.topic}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <p className="text-[10px] md:text-sm font-bold text-text-muted uppercase tracking-widest">You should say:</p>
                  <ul className="space-y-2 md:space-y-3">
                    {cueCardData.bullets.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-text-secondary">
                        <div className="w-5 h-5 rounded-full bg-blue-secondary/10 flex items-center justify-center text-blue-secondary text-[10px] font-bold mt-0.5">{i+1}</div>
                        <span className="text-xs md:text-sm font-medium">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] md:text-xs text-text-muted italic mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border/50">
                    And explain why this was significant to you.
                  </p>
                </div>
              </div>

              {phase === "speak" && (
                <div className="card bg-red-accent/5 border-red-accent/20 flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-red-accent rounded-full flex items-center justify-center text-white mb-4 md:mb-6 animate-pulse shadow-2xl shadow-red-accent/40">
                    <Mic size={40} />
                  </div>
                  <h4 className="text-lg md:text-xl font-serif font-black text-text-primary mb-2">Recording in Progress</h4>
                  <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest font-bold">Speak for 1-2 minutes</p>
                  <button 
                    onClick={() => { setIsTimerActive(false); setTimer(0); }}
                    className="btn btn-ghost mt-6 md:mt-8 border-red-accent/30 text-red-accent hover:bg-red-accent hover:text-white"
                  >
                    <Square size={16} /> Finish Speaking
                  </button>
                </div>
              )}

              {phase === "prep" && (
                <div className="card bg-amber-accent/5 border-amber-accent/20 flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-accent rounded-full flex items-center justify-center text-white mb-4 md:mb-6 shadow-2xl shadow-amber-accent/40">
                    <Clock size={40} />
                  </div>
                  <h4 className="text-lg md:text-xl font-serif font-black text-text-primary mb-2">Preparation Time</h4>
                  <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest font-bold">Take notes on your structure</p>
                  <button 
                    onClick={() => { setPhase("speak"); setTimer(120); }}
                    className="btn btn-primary bg-amber-accent hover:bg-amber-accent/80 border-none mt-6 md:mt-8"
                  >
                    Start Speaking Now
                  </button>
                </div>
              )}

              {timer === 0 && phase === "speak" && !feedback && (
                <div className="card bg-green-accent/5 border-green-accent/20 flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-green-accent rounded-full flex items-center justify-center text-white mb-4 md:mb-6 shadow-2xl shadow-green-accent/40">
                    <Trophy size={40} />
                  </div>
                  <h4 className="text-lg md:text-xl font-serif font-black text-text-primary mb-2">Time&apos;s Up!</h4>
                  <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest font-bold">Great job completing the session</p>
                  <button 
                    onClick={getAIAnalysis}
                    disabled={isAnalyzing}
                    className="btn btn-primary bg-green-accent hover:bg-green-accent/80 border-none mt-6 md:mt-8 w-full max-w-xs"
                  >
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : "Get AI Analysis"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card bg-bg-2 border-border">
                <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-4">
                  <Lightbulb size={14} /> Quick Tips
                </div>
                <ul className="space-y-4">
                  {[
                    "Use all 1 minute of prep time to write keywords.",
                    "Don't just answer the bullets; tell a story.",
                    "Use a variety of tenses (past, present, future).",
                    "Keep speaking until the examiner stops you.",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-[11px] text-text-secondary leading-relaxed">
                      <div className="w-1 h-1 rounded-full bg-blue-secondary mt-1.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card bg-gradient-to-br from-violet-accent/10 to-bg-1 border-violet-accent/30"
                >
                  <div className="flex items-center gap-2 text-violet-accent font-bold text-xs uppercase tracking-widest mb-4">
                    <MessageSquare size={14} /> AI Analysis
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: feedback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                  <button onClick={() => setCueCardData(null)} className="btn btn-ghost w-full mt-6 border-violet-accent/20 text-violet-accent">
                    Try Another Topic
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
