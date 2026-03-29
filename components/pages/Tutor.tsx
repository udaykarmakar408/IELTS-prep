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
import { callGroqChat } from "@/lib/groq";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";

export default function Tutor() {
  const [mode, setMode] = useState<"chat" | "writing" | "speaking" | "tips">("chat");
  const [input, setInput] = useState("");
  const [essay, setEssay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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
    const currentBands = Object.entries(progress.bands)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k}: Band ${v}`)
      .join(", ") || "not yet assessed";

    return `You are Aria, an elite IELTS tutor with over 15 years of experience helping students achieve Band 8.0 and 9.0. 
You are currently tutoring ${progress.name}, who has a target score of Band ${progress.target}.
Current performance levels: ${currentBands}.

Your mission is to provide high-impact, practical coaching that bridges the gap between their current level and their target.

### Core Directives:
1. **Be Specific & Practical**: Never give generic advice like "work on your grammar." Instead, say "Your use of articles is inconsistent; specifically, you often omit 'the' before unique nouns like 'government' or 'environment'."
2. **IELTS Marking Criteria**: Always frame your feedback around the four official pillars:
   - **Writing/Speaking**: Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
   - **Reading/Listening**: Focus on specific question types (e.g., True/False/Not Given, Matching Headings).
3. **Band-Specific Guidance**: If the user is at Band 6.0 and wants 9.0, explain exactly what "complex structures" or "less common lexical items" they need to use to move up.
4. **Encouraging yet Rigorous**: Maintain a supportive tone but do not sugarcoat errors. Precision is key to improvement.
5. **Formatting**: 
   - Use **Markdown** for all responses.
   - Use ## for main headers.
   - Use **bold** for emphasis on key terms or corrections.
   - Use > for example sentences or quotes.
   - Use bullet points or numbered lists for actionable steps.

### Interaction Rules:
- If the user provides a sentence or essay, provide a detailed breakdown with an estimated band score and a "Path to 9.0" (or their target) section.
- If they ask for vocabulary, provide 5-10 high-level synonyms with example sentences in an IELTS context.
- **Always** conclude with a small, manageable "Next Step" for the user to practice.
- **NEVER** use generic praise. If they did well, explain *why* it was good in terms of the marking criteria.

### Tone & Style:
- Professional, academic, yet accessible.
- Use British English spelling (e.g., 'summarise', 'colour', 'centre') as it's common in IELTS.
- Act as a mentor, not just a chatbot.

Respond in a way that makes the student feel they are getting a premium, one-on-one tutoring session.`;
  };

  const QUICK_PROMPTS = [
    { label: "Check Grammar", prompt: "Can you check the grammar of this sentence: " },
    { label: "Explain Word", prompt: "What does this word mean in an IELTS context: " },
    { label: "Speaking Practice", prompt: "Let's practice a Part 1 Speaking topic about " },
    { label: "Writing Tips", prompt: "Give me 3 tips to improve my Coherence and Cohesion in Task 2." },
    { label: "Vocabulary", prompt: "Give me 5 academic synonyms for the word " }
  ];

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
      const chatHistory = updatedProgress.chatHistory.map(msg => ({
        role: msg.role === "assistant" ? "assistant" as const : "user" as const,
        content: msg.content
      }));

      const response = await callGroqChat([
        { role: "system", content: getSystemInstruction() },
        ...chatHistory
      ]);

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

  if (!progress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-primary/20 border-t-blue-primary rounded-full animate-spin" />
          <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Loading Aria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full space-y-8 pb-4">
      {/* Tutor Hero Section */}
      <div className="relative overflow-hidden rounded-2xl recipe-atmospheric-bg p-10 md:p-16 text-white shadow-2xl shadow-blue-primary/20 shrink-0 border border-blue-primary/20">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
          <Bot size={300} />
        </div>
        <div className="relative z-10 space-y-8 max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Sparkles size={20} className="text-blue-secondary animate-pulse" />
            </div>
            <div className="recipe-editorial-label text-blue-secondary">AI Personal Mentor</div>
          </div>
          <div className="space-y-4">
            <h3 className="recipe-editorial-h1 text-white leading-[0.85]">
              MEET ARIA
            </h3>
            <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-80 max-w-2xl">
              Your elite IELTS coach. Master grammar, expand your vocabulary, and receive expert feedback on every task.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Chat Sidebar/Modes */}
        <div className="w-full lg:w-72 flex flex-row lg:flex-col gap-3 shrink-0 overflow-x-auto lg:overflow-y-auto no-scrollbar pb-2 lg:pb-0">
          {(["chat", "writing", "speaking", "tips"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-4 px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border whitespace-nowrap lg:whitespace-normal group",
                mode === m 
                  ? "bg-blue-primary text-white border-blue-primary shadow-xl shadow-blue-primary/30 scale-[1.02]" 
                  : "bg-bg-2 text-text-muted border-border hover:bg-bg-3 hover:border-blue-primary/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                mode === m ? "bg-white/20" : "bg-bg-3 text-text-muted group-hover:text-blue-secondary"
              )}>
                {m === "chat" && <Bot size={20} />}
                {m === "writing" && <PenTool size={20} />}
                {m === "speaking" && <Mic size={20} />}
                {m === "tips" && <Lightbulb size={20} />}
              </div>
              <span className="flex-1 text-left">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
              {mode === m && <ChevronRight size={16} className="opacity-50" />}
            </button>
          ))}
          
          <div className="hidden lg:block mt-auto p-8 recipe-hardware-widget border-blue-primary/10">
            <div className="recipe-editorial-label text-blue-secondary mb-3">Target Objective</div>
            <div className="text-4xl font-black text-text-primary tracking-tighter">Band {progress?.target || "9.0"}</div>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-green-accent animate-pulse" />
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Aria is active</div>
            </div>
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col bg-bg-2 border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/5 min-h-[600px] relative">
          <div className="bg-bg-3/80 backdrop-blur-xl px-8 py-6 border-b border-border flex items-center justify-between shrink-0 relative z-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-primary/10 flex items-center justify-center text-blue-primary border border-blue-primary/20 shadow-inner">
                <Bot size={28} />
              </div>
              <div>
                <div className="text-lg font-bold text-text-primary">Aria</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-accent animate-pulse" />
                  <span className="text-[10px] text-green-accent font-black uppercase tracking-widest">Expert Mode</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {showClearConfirm ? (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <button 
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 rounded-xl bg-bg-1 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary border border-border transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      const newP = { ...progress, chatHistory: [] };
                      setProgress(newP);
                      saveProgress(newP);
                      setShowClearConfirm(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-accent hover:bg-red-500/20 border border-red-500/20 transition-all"
                  >
                    Confirm Clear
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="w-12 h-12 rounded-2xl bg-bg-1 text-text-muted hover:text-red-accent border border-border transition-all flex items-center justify-center hover:bg-red-500/5 hover:border-red-500/20"
                  title="Clear Chat"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar relative z-10"
          >
            {progress?.chatHistory.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-xl mx-auto py-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-primary/20 blur-[60px] rounded-full animate-pulse" />
                  <div className="relative w-28 h-28 rounded-xl bg-blue-dim/10 flex items-center justify-center text-blue-primary border border-blue-primary/20 rotate-6 shadow-2xl">
                    <Bot size={56} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="recipe-editorial-h1 text-4xl">How can I help you today?</h4>
                  <p className="text-lg text-text-muted leading-relaxed font-medium">
                    I can help you with grammar, vocabulary, or practice specific IELTS tasks. Choose a suggestion below or type your own question.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(qp.prompt)}
                      className="px-6 py-4 bg-bg-1 border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest text-text-muted hover:text-blue-secondary hover:border-blue-primary/30 hover:bg-bg-3 transition-all shadow-sm active:scale-95"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {progress?.chatHistory.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-6 max-w-[90%] md:max-w-[80%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg",
                  msg.role === "user" ? "bg-blue-primary text-white shadow-blue-primary/20" : "bg-bg-3 text-blue-secondary border border-border"
                )}>
                  {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={cn(
                  "p-6 md:p-8 rounded-2xl text-base leading-relaxed font-medium",
                  msg.role === "user" 
                    ? "bg-blue-primary text-white rounded-tr-none shadow-2xl shadow-blue-primary/20" 
                    : "bg-bg-1 border border-border rounded-tl-none text-text-primary shadow-xl shadow-black/5"
                )}>
                  <div className="prose prose-invert prose-lg max-w-none markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-6 max-w-[80%]">
                <div className="w-10 h-10 rounded-xl bg-bg-3 text-blue-secondary border border-border flex items-center justify-center shrink-0 mt-1">
                  <Bot size={18} />
                </div>
                <div className="p-6 bg-bg-1 border border-border rounded-2xl rounded-tl-none shadow-xl shadow-black/5">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-secondary/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-secondary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-blue-secondary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 md:p-10 bg-bg-3/80 backdrop-blur-xl border-t border-border shrink-0 relative z-20">
            <div className="relative group max-w-5xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Aria anything..."
                className="input w-full pl-8 pr-20 py-6 text-lg"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-blue-primary text-white flex items-center justify-center hover:bg-blue-secondary transition-all disabled:opacity-50 disabled:scale-90 shadow-xl shadow-blue-primary/20 active:scale-95"
              >
                <Send size={24} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-6 px-4 max-w-5xl mx-auto">
              <div className="flex items-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-primary/40" />
                AI-Powered Tutoring Session
              </div>
              <div className="flex items-center gap-6">
                <button className="text-[10px] font-black text-text-muted hover:text-blue-secondary transition-colors uppercase tracking-widest">Help Center</button>
                <button className="text-[10px] font-black text-text-muted hover:text-blue-secondary transition-colors uppercase tracking-widest">Keyboard Shortcuts</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
