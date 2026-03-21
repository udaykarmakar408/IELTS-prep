"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ArrowLeft,
  Lightbulb,
  MessageSquare,
  Clock
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGemini, callGeminiChat } from "@/lib/gemini";

interface Topic {
  id: string;
  title: string;
  bullets: string[];
  hints: string;
}

const SPEAKING_TOPICS: Topic[] = [
  {
    id: "t1",
    title: "Describe a person who has influenced you.",
    bullets: [
      "Who this person is",
      "How you know them",
      "What qualities they have",
      "Explain why they influenced you"
    ],
    hints: "Think about a teacher, family member, or mentor. Focus on specific qualities like resilience or kindness."
  },
  {
    id: "t2",
    title: "Describe a place in nature you have visited.",
    bullets: [
      "Where this place is",
      "When you visited it",
      "What you did there",
      "Explain how you felt about it"
    ],
    hints: "Use sensory details: what you saw, heard, and felt. Use adjectives like 'tranquil', 'breathtaking', or 'serene'."
  },
  {
    id: "t3",
    title: "Describe a useful piece of technology you own.",
    bullets: [
      "What it is",
      "How long you have had it",
      "What you use it for",
      "Explain why it is useful to you"
    ],
    hints: "Don't just say 'smartphone'. Think about a specific app, a laptop, or even a kitchen appliance. Focus on utility."
  },
  {
    id: "t4",
    title: "Describe a time you helped someone.",
    bullets: [
      "Who you helped",
      "What the situation was",
      "How you helped them",
      "Explain how you felt about it"
    ],
    hints: "Use narrative tenses (Past Simple, Past Continuous). Focus on the emotional outcome and the impact of your help."
  },
  {
    id: "t5",
    title: "Describe a book or film that had a significant impact on you.",
    bullets: [
      "What it was about",
      "When you read/watched it",
      "Why it affected you",
      "Explain if you would recommend it to others"
    ],
    hints: "Focus on the theme or message. Use words like 'thought-provoking', 'inspiring', or 'eye-opening'."
  }
];

import ReactMarkdown from "react-markdown";

export default function Speaking() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [timerState, setTimerState] = useState<"idle" | "prep" | "speak">("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [simulationMode, setSimulationMode] = useState<"none" | "part1" | "part2" | "part3" | "full">("none");
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const startSimulation = async (mode: typeof simulationMode) => {
    setSimulationMode(mode);
    setMessages([]);
    setFeedback(null);
    setIsTyping(true);

    const systemPrompt = `You are a certified IELTS Speaking Examiner. 
    Mode: ${mode === "part1" ? "Part 1 (Introduction & Interview)" : mode === "part2" ? "Part 2 (Long Turn/Cue Card)" : "Part 3 (Discussion)"}.
    Conduct a realistic speaking test. 
    Part 1: Ask 3-4 simple questions about hobbies, home, or work.
    Part 2: Provide a cue card topic and ask the student to speak for 2 minutes.
    Part 3: Ask follow-up, abstract questions related to the Part 2 topic.
    Be professional, encouraging, and strictly follow IELTS standards.
    Start by introducing yourself and asking the first question.`;

    try {
      const initialMessage = await callGemini("Start the speaking test.", systemPrompt);
      setMessages([{ role: "model", text: initialMessage }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    const newMessages = [...messages, { role: "user" as const, text: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsTyping(true);

    try {
      const history = newMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await callGeminiChat(history, "Continue the IELTS speaking test. Ask the next question or provide the cue card if it's Part 2.");
      setMessages([...newMessages, { role: "model", text: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const endSimulation = async () => {
    setIsTyping(true);
    const systemPrompt = `Analyze the following IELTS speaking test transcript. 
    Provide a detailed band score (0-9) and feedback on:
    1. Fluency and Coherence
    2. Lexical Resource (Vocabulary)
    3. Grammatical Range and Accuracy
    4. Pronunciation (estimate based on text/flow)
    Provide specific examples from the transcript and tips for improvement.
    Format your response with clear headings and an Overall Band score.`;

    const transcript = messages.map(m => `${m.role === "user" ? "Student" : "Examiner"}: ${m.text}`).join("\n");

    try {
      const result = await callGemini(`Transcript:\n${transcript}`, systemPrompt);
      setFeedback(result);
      
      // Update progress
      if (progress) {
        const bandMatch = result.match(/Overall Band:\s*([0-9]\.?[0-9]?)/i);
        const band = bandMatch ? parseFloat(bandMatch[1]) : 6.5; // Default if not found
        const updated = {
          ...progress,
          bands: { ...progress.bands, speaking: band },
          bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: "speaking" }]
        };
        setProgress(updated);
        saveProgress(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
      setSimulationMode("none");
    }
  };

  const startPrep = () => {
    setTimerState("prep");
    setTimeLeft(60);
  };

  const startSpeaking = () => {
    setTimerState("speak");
    setTimeLeft(120);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerState !== "idle" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerState === "prep") {
      startSpeaking();
    } else if (timeLeft === 0 && timerState === "speak") {
      setTimerState("idle");
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerState, timeLeft]);

  if (!progress) return null;

  if (feedback) {
    return (
      <div className="space-y-6">
        <button onClick={() => setFeedback(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Speaking
        </button>
        <div className="card card-blue">
          <h3 className="text-xl font-serif font-bold mb-4">Exam Feedback</h3>
          <div className="prose prose-invert prose-sm max-w-none markdown-body">
            <ReactMarkdown>
              {feedback}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  if (simulationMode !== "none") {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSimulationMode("none")} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Quit Session
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            IELTS Speaking {simulationMode.toUpperCase()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-bg-2 rounded-2xl border border-border-2 mb-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex flex-col max-w-[85%]",
              m.role === "user" ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                m.role === "user" ? "bg-blue-primary text-white rounded-tr-none" : "bg-bg border border-border-2 text-text-secondary rounded-tl-none"
              )}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-text-muted text-xs animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-secondary" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-secondary" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-secondary" />
              Examiner is thinking...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your response..."
            className="flex-1 bg-bg border border-border-2 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-blue-primary outline-none transition-colors"
          />
          <button onClick={handleSendMessage} disabled={isTyping} className="btn btn-primary px-6">
            Send
          </button>
          <button onClick={endSimulation} className="btn btn-ghost px-4 text-xs">
            End & Grade
          </button>
        </div>
      </div>
    );
  }

  if (activeTopic) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

    return (
      <div className="space-y-6">
        <button onClick={() => { setActiveTopic(null); setTimerState("idle"); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Topics
        </button>

        <div className="card card-blue">
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest mb-2">IELTS Speaking Part 2 — Cue Card</div>
          <h3 className="text-xl font-serif font-bold mb-6 leading-relaxed">{activeTopic.title}</h3>
          <div className="text-xs text-text-muted font-bold uppercase tracking-wider mb-3">You should say:</div>
          <ul className="space-y-2 mb-6">
            {activeTopic.bullets.map((b: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-primary mt-1.5 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {timerState === "idle" ? (
          <div className="space-y-4">
            <div className="card bg-bg-2 border-border-2">
              <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-2">
                <Lightbulb size={14} /> Examiner Hints
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{activeTopic.hints}</p>
            </div>
            <button onClick={startPrep} className="btn btn-primary w-full py-4">
              <Clock size={20} /> Start Timed Practice
            </button>
          </div>
        ) : (
          <div className="card text-center py-10 space-y-6 border-blue-primary">
            <div className="text-xs font-bold text-blue-secondary uppercase tracking-widest">
              {timerState === "prep" ? "Preparation Time" : "Speaking Time"}
            </div>
            <div className={cn(
              "font-mono text-7xl font-black leading-none",
              timeLeft <= 10 ? "text-red-accent animate-pulse" : "text-text-primary"
            )}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-text-muted max-w-xs mx-auto">
              {timerState === "prep" 
                ? "Read the cue card carefully and make brief notes." 
                : "Speak clearly and naturally for 2 minutes."}
            </p>
            <div className="flex justify-center gap-3">
              {timerState === "prep" && (
                <button onClick={startSpeaking} className="btn btn-primary px-8">Start Speaking Now</button>
              )}
              <button onClick={() => setTimerState("idle")} className="btn btn-ghost px-8">Reset</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">🎤 Speaking Center</h2>
          <p className="text-sm text-text-muted">Master all 3 parts of the IELTS speaking test</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: "part1", label: "Part 1", title: "Introduction", desc: "Personal questions", color: "blue" },
          { id: "part2", label: "Part 2", title: "Cue Card", desc: "Long turn talk", color: "violet" },
          { id: "part3", label: "Part 3", title: "Discussion", desc: "Abstract topics", color: "emerald" }
        ].map((sim) => (
          <button
            key={sim.id}
            onClick={() => startSimulation(sim.id as any)}
            className={cn(
              "card text-left group hover:-translate-y-1 transition-all",
              sim.color === "blue" ? "hover:border-blue-primary" : sim.color === "violet" ? "hover:border-violet-accent" : "hover:border-emerald-accent"
            )}
          >
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-widest mb-1",
              sim.color === "blue" ? "text-blue-secondary" : sim.color === "violet" ? "text-violet-accent" : "text-emerald-accent"
            )}>
              {sim.label}
            </div>
            <div className="font-bold text-text-primary mb-1">{sim.title}</div>
            <div className="text-xs text-text-muted">{sim.desc}</div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Part 2 Cue Cards</h3>
        </div>
        <div className="space-y-3">
          {SPEAKING_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setActiveTopic(topic)}
              className="card w-full text-left hover:border-blue-primary group flex items-center justify-between"
            >
              <div className="flex-1 min-width-0">
                <div className="font-bold text-sm text-text-primary mb-1 truncate">{topic.title}</div>
                <div className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Tap to practice with timer</div>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
