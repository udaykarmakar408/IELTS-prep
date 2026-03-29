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
  Clock,
  Volume2,
  VolumeX,
  MicOff,
  Loader2,
  Sparkles,
  FileText
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq, callGroqChat, callGroqJSON } from "@/lib/groq";
import { GoogleGenAI, Modality } from "@google/genai";
import ReactMarkdown from "react-markdown";
import SpeakingLiveSession from "./SpeakingLiveSession";

import { SPEAKING_TOPICS, SPEAKING_SAMPLES, Sample, Topic } from "@/lib/data/ielts_content";


export default function Speaking() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeModuleTab, setActiveModuleTab] = useState<"practice" | "samples" | "ai-test">("practice");
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [timerState, setTimerState] = useState<"idle" | "prep" | "speak">("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [simulationMode, setSimulationMode] = useState<"none" | "part1" | "part2" | "part3" | "full">("none");
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightedVocab, setHighlightedVocab] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'vocab' | 'feedback'>('chat');
  const [isLiveSessionOpen, setIsLiveSessionOpen] = useState(false);
  const [liveMode, setLiveMode] = useState<"part1" | "part2" | "part3" | "full" | "mock">("full");
  const [dynamicTopics, setDynamicTopics] = useState<Topic[]>(SPEAKING_TOPICS);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
    // Automatically generate more content on mount to provide a dynamic experience
    if (dynamicTopics.length <= SPEAKING_TOPICS.length) {
      generateMoreTopics();
    }
  }, []);

  const generateMoreTopics = async () => {
    setIsGeneratingMore(true);
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          difficulty: { type: "string", enum: ["Medium", "Hard"] },
          bullets: { type: "array", items: { type: "string" } },
          hints: { type: "string" }
        },
        required: ["id", "title", "difficulty", "bullets", "hints"]
      }
    };

    const prompt = `Generate 3 new unique IELTS Speaking Part 2 topics (Cue Cards). 
    Each topic should include a title, 4 bullet points (what the user should say), and examiner hints.
    Ensure high academic quality and varied themes.`;

    try {
      const result = await callGroqJSON(prompt, schema);
      if (result && Array.isArray(result)) {
        const newTopics = result.map((t: any) => ({
          ...t,
          id: `dynamic-${Date.now()}-${t.id}`
        }));
        setDynamicTopics(prev => [...prev, ...newTopics]);
      }
    } catch (error) {
      console.error("Failed to generate more topics:", error);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const highlightVocab = async () => {
    if (messages.length === 0) return;
    setIsHighlighting(true);
    const transcript = messages.map(m => m.text).join("\n");
    const systemPrompt = `You are an IELTS vocabulary expert. Extract 8-10 high-level (Band 9.0) vocabulary words or idioms from the following speaking transcript.
    Return ONLY a JSON array of strings.`;

    try {
      const result = await callGroq(transcript, systemPrompt);
      setHighlightedVocab(JSON.parse(result || "[]"));
      setActiveTab('vocab');
    } catch (error) {
      console.error(error);
    } finally {
      setIsHighlighting(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const speakText = async (text: string) => {
    if (!isVoiceMode) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        audio.play();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

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

    const systemPrompt = `You are a certified, high-level IELTS Speaking Examiner with 20+ years of experience, aiming for Band 9.0 standards. 
    Mode: ${mode === "part1" ? "Part 1 (Introduction & Interview)" : mode === "part2" ? "Part 2 (Long Turn/Cue Card)" : "Part 3 (Discussion)"}.
    
    Conduct a realistic, challenging speaking test. 
    Part 1: Ask 3-4 sophisticated questions about hobbies, home, work, or abstract topics.
    Part 2: Provide a complex cue card topic and ask the student to speak for 2 minutes.
    Part 3: Ask deep, abstract, and analytical follow-up questions related to the Part 2 topic.
    
    STRICT BAND 9.0 STANDARDS:
    - Fluency: Speaks fluently with only rare repetition or self-correction; any hesitation is content-related rather than to find words or grammar.
    - Vocabulary: Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'.
    - Grammar: Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'.
    - Pronunciation: Uses a full range of pronunciation features with precision and subtlety; is effortless to understand throughout.
    
    Be professional, use natural examiner language. Start by introducing yourself and asking the first question.`;

    try {
      const initialMessage = await callGroq("Start the speaking test.", systemPrompt);
      setMessages([{ role: "model", text: initialMessage }]);
      if (isVoiceMode) speakText(initialMessage);
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
      const history = newMessages.map(m => ({ role: m.role === "user" ? "user" as const : "assistant" as const, content: m.text }));
      const response = await callGroqChat([
        { role: "system", content: "Continue the IELTS speaking test. Ask the next question or provide the cue card if it's Part 2." },
        ...history
      ]);
      setMessages([...newMessages, { role: "model", text: response }]);
      if (isVoiceMode) speakText(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const endSimulation = async () => {
    setIsTyping(true);
    const systemPrompt = `You are a certified Senior IELTS Speaking Examiner. Analyze the following IELTS speaking test transcript against STRICT Band 9.0 criteria.
    
    BAND 9.0 DESCRIPTORS:
    1. Fluency and Coherence: Speaks fluently with only rare repetition or self-correction; hesitation is content-related; uses a full range of cohesive features.
    2. Lexical Resource: Uses a wide range of vocabulary with very natural and sophisticated control; rare minor errors occur only as 'slips'.
    3. Grammatical Range and Accuracy: Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'.
    4. Pronunciation: Uses a full range of features with precision and subtlety; is effortless to understand throughout.
    
    Provide a detailed evaluation:
    - Overall Band Score (0-9)
    - Detailed breakdown for each of the 4 criteria
    - Specific examples from the transcript
    - Band 9.0 Upgrades: For 3-5 sentences from the student, show a "Band 9.0 Upgrade" version and explain why it's better.
    - Key improvement needed to reach or maintain Band 9.0
    
    Format your response with clear headings and an Overall Band score at the end. Use markdown for the upgrades section.`;

    const transcript = messages.map(m => `${m.role === "user" ? "Student" : "Examiner"}: ${m.text}`).join("\n");

    try {
      const result = await callGroq(`Transcript:\n${transcript}`, systemPrompt);
      setFeedback(result);
      
      // Update progress
      if (progress) {
        const bandMatch = result.match(/Overall Band:\s*([0-9]\.?[0-9]?)/i);
        const band = bandMatch ? parseFloat(bandMatch[1]) : 6.5; // Default if not found
        const updated = {
          ...progress,
          bands: { ...progress.bands, speaking: band },
          bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: "speaking" }],
          mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: `Practice: Speaking ${simulationMode}`, band, skill: "speaking" }],
          studyMinutes: (progress.studyMinutes || 0) + 15,
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
        <div className="card card-blue p-8 rounded-2xl">
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
      <div className="flex flex-col h-[calc(100dvh-140px)] md:h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <button onClick={() => setSimulationMode("none")} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-xs md:text-sm">
            <ArrowLeft size={16} /> Quit Session
          </button>
          <div className="text-[9px] md:text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            IELTS Speaking {simulationMode.toUpperCase()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 p-3 md:p-4 bg-bg-2 rounded-xl border border-border-2 mb-3 md:mb-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex flex-col max-w-[90%] md:max-w-[85%]",
              m.role === "user" ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed",
                m.role === "user" ? "bg-blue-primary text-white rounded-tr-none" : "bg-bg border border-border-2 text-text-secondary rounded-tl-none"
              )}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-text-muted text-[10px] md:text-xs animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-secondary" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-secondary" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-secondary" />
              Examiner is thinking...
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pb-2 md:pb-0">
          <div className="flex gap-2 flex-1">
            <button 
              onClick={toggleListening} 
              className={cn(
                "btn px-3 md:px-4",
                isListening ? "bg-red-accent text-white animate-pulse" : "bg-bg-2 text-text-muted border border-border-2"
              )}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={isListening ? "Listening..." : "Type your response..."}
              className="input flex-1 bg-bg border border-border-2 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm text-text-primary focus:border-blue-primary outline-none transition-colors"
            />
            <button onClick={handleSendMessage} disabled={isTyping} className="btn btn-primary px-4 md:px-6">
              Send
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsVoiceMode(!isVoiceMode)} 
              className={cn(
                "btn px-4 text-[10px] md:text-xs h-10 md:h-auto",
                isVoiceMode ? "bg-blue-dim text-blue-secondary border-blue-secondary/30" : "bg-bg-2 text-text-muted border border-border-2"
              )}
            >
              {isVoiceMode ? <Volume2 size={16} className="mr-2" /> : <VolumeX size={16} className="mr-2" />}
              {isVoiceMode ? "Voice ON" : "Voice OFF"}
            </button>
            <button onClick={endSimulation} className="btn btn-ghost px-4 text-[10px] md:text-xs h-10 md:h-auto">
              End & Grade
            </button>
          </div>
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

        <div className="card card-blue p-8 rounded-2xl">
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
          <div className="card text-center py-12 space-y-8 border-blue-primary rounded-2xl">
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

        <div className="pt-4">
          <button 
            onClick={() => setIsLiveSessionOpen(true)}
            className="btn btn-primary bg-blue-primary/10 text-blue-primary hover:bg-blue-primary/20 border-blue-primary/30 w-full py-4 rounded-xl flex items-center justify-center gap-3 group"
          >
            <Sparkles size={20} className="group-hover:animate-pulse" />
            <span className="font-bold">Discuss this topic with Live AI</span>
          </button>
        </div>

        <AnimatePresence>
          {isLiveSessionOpen && (
            <SpeakingLiveSession 
              onClose={() => setIsLiveSessionOpen(false)} 
              topic={activeTopic.title}
              mode="part2"
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Speaking Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-bg-1 border border-white/5 p-8 md:p-12 lg:p-16">
        <div className="absolute inset-0 recipe-atmospheric-bg opacity-30" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-accent/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-end justify-between gap-12">
          <div className="max-w-3xl min-w-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="recipe-editorial-label mb-8 flex items-center gap-3"
            >
              <div className="w-8 h-px bg-violet-accent/30" />
              <Volume2 size={16} className="text-violet-accent" /> Productive Skills
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="recipe-editorial-h1 mb-8"
            >
              Speaking <span className="text-violet-accent">Center</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary leading-relaxed font-medium max-w-2xl"
            >
              Master all 3 parts of the IELTS speaking test with real-time AI 
              simulations, voice analysis, and personalized feedback.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap md:flex-nowrap bg-bg-2/50 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl"
          >
            {[
              { id: "practice", label: "Practice", icon: Volume2 },
              { id: "samples", label: "Samples", icon: FileText },
              { id: "ai-test", label: "AI Test", icon: Sparkles },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveModuleTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                  activeModuleTab === tab.id 
                    ? "bg-violet-accent text-white shadow-xl shadow-violet-accent/30 scale-105" 
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                )}
              >
                <tab.icon size={14} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isLiveSessionOpen && (
          <SpeakingLiveSession 
            onClose={() => setIsLiveSessionOpen(false)} 
            topic={undefined}
            mode={liveMode}
          />
        )}
      </AnimatePresence>

      <div className="card bg-gradient-to-br from-blue-primary/10 via-bg-1 to-bg-2 border-blue-primary/20 p-8 md:p-12 rounded-xl shadow-2xl shadow-blue-primary/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Sparkles size={180} />
        </div>
        <div className="relative z-10">
          <div className="recipe-editorial-label text-blue-secondary mb-6">
            <Sparkles size={14} className="animate-pulse" /> Speaking Topic of the Day
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <h3 className="recipe-editorial-h1 text-3xl md:text-4xl mb-4">Describe a person who has influenced you.</h3>
              <p className="text-sm text-text-muted italic mb-6 font-medium">Part 2 Cue Card · High Priority Analysis</p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="tag tag-blue px-4 py-1.5 rounded-lg">Inspirational</span>
                <span className="tag tag-blue px-4 py-1.5 rounded-lg">Role Model</span>
                <span className="tag tag-blue px-4 py-1.5 rounded-lg">Resilience</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveTopic(SPEAKING_TOPICS[0])}
              className="btn btn-primary px-10 py-4 text-sm shadow-xl shadow-blue-primary/20"
            >
              Practice Now <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-bg-1 border-white/5 p-8 rounded-xl shadow-xl">
          <div className="recipe-hardware-label text-amber-accent mb-6">
            <Sparkles size={14} /> Vocabulary Booster
          </div>
          <div className="space-y-4">
              {[
                { word: "Ubiquitous", meaning: "Present, appearing, or found everywhere.", band: "9.0" },
                { word: "Mitigate", meaning: "Make less severe, serious, or painful.", band: "9.0" },
                { word: "Pragmatic", meaning: "Dealing with things sensibly and realistically.", band: "9.0" }
              ].map((v, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-bg-2/50 rounded-xl border border-white/5 hover:border-amber-accent/30 transition-all group">
                <div>
                  <div className="text-base font-bold text-text-primary group-hover:text-amber-accent transition-colors">{v.word}</div>
                  <div className="text-xs text-text-muted leading-relaxed">{v.meaning}</div>
                </div>
                <div className="bg-amber-accent/10 text-amber-accent px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Band {v.band}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-bg-1 border-white/5 p-8 rounded-xl shadow-xl">
          <div className="recipe-hardware-label text-violet-accent mb-6">
            <MessageSquare size={14} /> Common Idioms
          </div>
          <div className="space-y-4">
            {[
              { idiom: "A piece of cake", meaning: "Something very easy to do.", usage: "The exam was a piece of cake." },
              { idiom: "Break the ice", meaning: "Do or say something to relieve tension.", usage: "He told a joke to break the ice." },
              { idiom: "Under the weather", meaning: "Feeling slightly unwell.", usage: "I'm feeling a bit under the weather today." }
            ].map((id, i) => (
              <div key={i} className="p-4 bg-bg-2/50 rounded-xl border border-white/5 hover:border-violet-accent/30 transition-all group">
                <div className="text-base font-bold text-text-primary group-hover:text-violet-accent transition-colors">{id.idiom}</div>
                <div className="text-xs text-text-muted mb-2 leading-relaxed">{id.meaning}</div>
                <div className="text-[10px] text-violet-accent font-bold italic uppercase tracking-wider">"{id.usage}"</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeModuleTab === "practice" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "part1", label: "Part 1", title: "Introduction", desc: "Personal questions", color: "blue" },
              { id: "part2", label: "Part 2", title: "Cue Card", desc: "Long turn talk", color: "violet" },
              { id: "part3", label: "Part 3", title: "Discussion", desc: "Abstract topics", color: "emerald" }
            ].map((sim) => (
              <div
                key={sim.id}
                className={cn(
                  "card text-left group transition-all flex flex-col justify-between",
                  sim.color === "blue" ? "hover:border-blue-primary" : sim.color === "violet" ? "hover:border-violet-accent" : "hover:border-emerald-accent"
                )}
              >
                <div>
                  <div className={cn(
                    "text-[10px] font-bold uppercase tracking-widest mb-1",
                    sim.color === "blue" ? "text-blue-secondary" : sim.color === "violet" ? "text-violet-accent" : "text-emerald-accent"
                  )}>
                    {sim.label}
                  </div>
                  <div className="font-bold text-text-primary mb-1">{sim.title}</div>
                  <div className="text-xs text-text-muted mb-4">{sim.desc}</div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startSimulation(sim.id as any)}
                    className="btn btn-ghost w-full py-2 text-[10px] font-bold uppercase tracking-widest border border-border-2 hover:bg-bg-2"
                  >
                    Text Practice
                  </button>
                  <button
                    onClick={() => {
                      setLiveMode(sim.id as any);
                      setIsLiveSessionOpen(true);
                    }}
                    className={cn(
                      "btn w-full py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2",
                      sim.color === "blue" ? "bg-blue-primary text-white" : sim.color === "violet" ? "bg-violet-accent text-white" : "bg-emerald-accent text-white"
                    )}
                  >
                    <Mic size={12} />
                    Voice Chat
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-bg-2 border-border-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest">
                  <Lightbulb size={14} /> Vocabulary Booster
                </div>
                <button className="text-[10px] font-bold text-blue-primary uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {[
                  { word: "Resilient", def: "Able to withstand or recover quickly from difficult conditions.", band: "9.0" },
                  { word: "Inquisitive", def: "Having or showing an interest in learning things; curious.", band: "9.0" },
                  { word: "Profound", def: "Very great or intense; having or showing great knowledge.", band: "9.0" }
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-bg-1 rounded-lg border border-border">
                    <div>
                      <div className="text-xs font-bold text-text-primary">{v.word}</div>
                      <div className="text-[10px] text-text-muted truncate max-w-[180px]">{v.def}</div>
                    </div>
                    <span className="tag tag-blue text-[9px]">{v.band}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-bg-2 border-border-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-violet-accent font-bold text-[10px] uppercase tracking-widest">
                  <MessageSquare size={14} /> Common Idioms
                </div>
                <button className="text-[10px] font-bold text-violet-accent uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {[
                  { idiom: "Once in a blue moon", usage: "Very rarely.", band: "9.0" },
                  { idiom: "Piece of cake", usage: "Something very easy.", band: "9.0" },
                  { idiom: "Break the ice", usage: "Start a conversation.", band: "9.0" }
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-bg-1 rounded-lg border border-border">
                    <div>
                      <div className="text-xs font-bold text-text-primary italic">"{v.idiom}"</div>
                      <div className="text-[10px] text-text-muted">{v.usage}</div>
                    </div>
                    <span className="tag tag-violet text-[9px]">{v.band}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Part 2 Cue Cards</h3>
              <button
                onClick={generateMoreTopics}
                disabled={isGeneratingMore}
                className="flex items-center gap-2 text-[10px] font-bold text-violet-accent uppercase tracking-widest hover:underline disabled:opacity-50"
              >
                {isGeneratingMore ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isGeneratingMore ? "Generating..." : "Generate More Topics"}
              </button>
            </div>
            <div className="space-y-3">
              {dynamicTopics.map((topic) => (
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
        </>
      )}

      {activeModuleTab === "samples" && (
        <div className="space-y-6">
          {SPEAKING_SAMPLES.map((sample) => (
            <div key={sample.id} className="card bg-bg-2 border-border-2 p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="tag tag-blue">{sample.type}</span>
                  <h3 className="font-bold text-text-primary">{sample.title}</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Prompt</div>
                  <div className="text-sm font-bold text-text-primary">{sample.prompt}</div>
                </div>
                <div className="p-4 bg-bg-1 rounded-xl border border-border-2 text-sm text-text-secondary italic leading-relaxed">
                  <div className="text-[10px] font-bold text-blue-primary uppercase tracking-widest mb-2">Model Answer</div>
                  "{sample.modelAnswer}"
                </div>
                <div className="p-4 bg-violet-accent/5 border border-violet-accent/20 rounded-xl">
                  <div className="text-[10px] font-bold text-violet-accent uppercase tracking-widest mb-1">Examiner Analysis (Band {sample.band})</div>
                  <div className="text-xs text-text-secondary leading-relaxed">
                    {sample.analysis}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeModuleTab === "ai-test" && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-violet-accent/10 text-violet-accent flex items-center justify-center">
            <Sparkles size={40} />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">AI Mock Speaking Test</h3>
            <p className="text-sm text-text-muted">
              Experience a full 15-minute IELTS Speaking test (Parts 1, 2, and 3) with our AI examiner. You'll receive a detailed band score and feedback.
            </p>
          </div>
          <button 
            onClick={() => { setLiveMode("mock"); setIsLiveSessionOpen(true); }}
            className="btn btn-primary bg-violet-accent hover:bg-violet-accent/80 border-none px-8 py-4 flex items-center gap-2"
          >
            <Mic size={20} />
            Start Full Mock Test
          </button>
        </div>
      )}
    </div>
  );
}
