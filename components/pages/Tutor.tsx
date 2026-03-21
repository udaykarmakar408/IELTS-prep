"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  PenTool, 
  Mic, 
  Lightbulb, 
  X, 
  ChevronRight,
  Loader2,
  Trash2
} from "lucide-react";
import { callGemini } from "@/lib/gemini";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";

export default function Tutor() {
  const [mode, setMode] = useState<"chat" | "writing" | "speaking" | "tips">("chat");
  const [input, setInput] = useState("");
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [progress?.chatHistory, isLoading]);

  const getSystemInstruction = () => {
    if (!progress || !progress.bands) return "";
    return `You are an expert IELTS tutor named Aria, with 15+ years experience. You are tutoring ${progress.name} who is targeting Band ${progress.target}.
Current skill bands: ${Object.entries(progress.bands).filter(([,v])=>v>0).map(([k,v])=>`${k}: Band ${v}`).join(', ') || 'not yet assessed'}.

Your teaching style:
• Be specific, practical, and genuinely encouraging — never vague.
• Use concrete IELTS examples.
• Give structured feedback using markdown: **bold** for key terms, numbered lists for steps.
• For writing/speaking analysis: always give an estimated band score and 3 actionable improvement tips.
• Reference the 4 IELTS marking criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.

Respond in clean markdown. Use ## for section headers, **bold** for emphasis.`;
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading || !progress) return;

    const userMessage = text.trim();
    setInput("");
    setIsLoading(true);

    const newHistory = [...progress.chatHistory, { role: "user" as const, content: userMessage }];
    const updatedProgress = { ...progress, chatHistory: newHistory };
    setProgress(updatedProgress);
    saveProgress(updatedProgress);

    try {
      const response = await callGemini(userMessage, getSystemInstruction());
      const finalHistory = [...newHistory, { role: "assistant" as const, content: response }];
      const finalProgress = { ...updatedProgress, chatHistory: finalHistory };
      setProgress(finalProgress);
      saveProgress(finalProgress);
    } catch (error) {
      console.error(error);
      const errorHistory = [...newHistory, { role: "assistant" as const, content: "⚠️ Sorry, I encountered an error. Please check your connection and try again." }];
      setProgress({ ...updatedProgress, chatHistory: errorHistory });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeEssay = () => {
    if (!essay.trim()) return;
    setMode("chat");
    handleSend(`Please analyze this IELTS writing and give a detailed band score breakdown based on official criteria:\n\n${essay}`);
    setEssay("");
    if (progress) {
      const updated = { ...progress, essaysWritten: (progress.essaysWritten || 0) + 1 };
      setProgress(updated);
      saveProgress(updated);
    }
  };

  const clearHistory = () => {
    if (progress) {
      const updated = { ...progress, chatHistory: [] };
      setProgress(updated);
      saveProgress(updated);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-bg-1/50 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-accent flex items-center justify-center text-white shadow-lg shadow-violet-accent/20">
            <Bot size={20} />
          </div>
          <div>
            <div className="text-sm font-serif font-black text-text-primary tracking-tight">Aria <span className="text-violet-accent">AI</span></div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Expert IELTS Coach</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearHistory} className="p-2.5 rounded-xl bg-white/5 text-text-muted hover:text-red-accent hover:bg-red-accent/10 transition-all" title="Clear History">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-1.5 p-3 bg-white/5 border-b border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: "chat", label: "Chat", icon: Bot },
          { id: "writing", label: "Writing", icon: PenTool },
          { id: "speaking", label: "Speaking", icon: Mic },
          { id: "tips", label: "Tips", icon: Lightbulb },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              mode === t.id ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:bg-white/10 hover:text-text-primary"
            )}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <AnimatePresence mode="wait">
        {mode === "writing" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/5 border-b border-white/5 p-6 space-y-4 overflow-hidden"
          >
            <div className="text-[10px] font-black text-blue-secondary uppercase tracking-[0.2em]">AI Essay Grader</div>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Paste your Task 1 or Task 2 essay here..."
              className="w-full bg-bg/50 border border-white/10 rounded-2xl p-4 text-sm text-text-primary focus:border-blue-primary outline-none min-h-[160px] resize-none font-serif leading-relaxed transition-all"
            />
            <div className="flex gap-3">
              <button onClick={handleAnalyzeEssay} className="btn btn-primary flex-1">Analyze Essay</button>
              <button onClick={() => setMode("chat")} className="btn btn-ghost">Cancel</button>
            </div>
          </motion.div>
        )}

        {mode === "speaking" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-bg-2 border-b border-border p-4 space-y-4 overflow-hidden"
          >
            <div className="text-xs font-bold text-violet-accent uppercase tracking-wider">Speaking Practice</div>
            <div className="p-3 bg-bg-1 border border-border-2 rounded-xl italic text-sm text-text-secondary leading-relaxed">
              &quot;Describe a book or film that had a significant impact on you. You should say: what it was about, when you read/watched it, and why it affected you.&quot;
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setMode("chat"); handleSend("I want to practice the speaking cue card about a book or film."); }} className="btn btn-primary btn-sm flex-1 bg-violet-accent hover:bg-violet-accent/80">Start Practice</button>
              <button onClick={() => setMode("chat")} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {progress?.chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-60">
            <Bot size={48} className="text-blue-secondary" />
            <div>
              <h4 className="font-serif text-xl font-bold mb-2">Hello! I&apos;m Aria.</h4>
              <p className="text-sm text-text-muted max-w-xs">I&apos;m your personal IELTS coach. Ask me anything about the exam, or paste an essay for feedback.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {[
                "How can I improve my Reading score?",
                "Explain Task 2 essay structure",
                "Give me 10 academic words for Environment",
              ].map((q, i) => (
                <button key={i} onClick={() => handleSend(q)} className="text-xs p-2.5 rounded-lg border border-border hover:bg-bg-2 transition-colors text-left flex justify-between items-center group">
                  {q} <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {progress?.chatHistory.map((msg, i) => (
          <div key={i} className={cn("flex items-start gap-4", msg.role === "user" ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
              msg.role === "assistant" ? "bg-violet-accent text-white" : "bg-blue-primary text-white"
            )}>
              {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={cn(
              "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-xl backdrop-blur-sm",
              msg.role === "assistant" 
                ? "bg-white/5 rounded-tl-none text-text-primary border border-white/5" 
                : "bg-blue-primary/10 rounded-tr-none text-text-primary border border-blue-primary/20"
            )}>
              <div className="prose prose-invert prose-sm max-w-none font-medium">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-accent text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot size={16} />
            </div>
            <div className="bg-bg-2 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-secondary" />
              <span className="text-xs text-text-muted font-medium">Aria is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-bg border-t border-border">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Aria anything about IELTS..."
            className="flex-1 bg-bg-2 border border-border-2 rounded-2xl px-4 py-3 text-sm text-text-primary focus:border-blue-primary outline-none resize-none max-h-32 min-h-[48px] custom-scrollbar"
            rows={1}
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-2xl bg-blue-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-primary/20 hover:bg-blue-secondary transition-colors flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
