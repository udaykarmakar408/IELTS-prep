"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Volume2,
  FileText,
  PenTool,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { GoogleGenAI, Modality } from "@google/genai";

const LISTENING_SECTIONS = [
  {
    id: "sec1",
    title: "University Accommodation Enquiry",
    type: "Conversation",
    difficulty: "Easy",
    script: "ACCOMMODATION OFFICER: Good morning, Riverside University Student Services, how can I help you? STUDENT: Hello. I am calling about student accommodation for next year. I have just been offered a place on the biology course. OFFICER: Congratulations! Could I take some details? Your full name first, please. STUDENT: David Kamara. That is K-A-M-A-R-A.",
    questions: [
      { q: "Q1. Student surname:", answer: "Kamara" },
      { q: "Q2. Course:", answer: "Biology" },
    ]
  },
  {
    id: "sec2",
    title: "City Museum Audio Tour",
    type: "Monologue",
    difficulty: "Medium",
    script: "Welcome to Hartfield City Museum. I am Sarah and I will be your guide today. The museum has three floors covering over two thousand years of local history. On the ground floor, you will find our collection of Roman artifacts discovered right here in the city center. The first floor is dedicated to the industrial revolution, while the top floor houses our modern art gallery. Please note that the museum cafe on the second floor closes at 4:30 PM, thirty minutes before the museum itself.",
    questions: [
      { q: "Q1. What time does the cafe close?", answer: "4:30" },
      { q: "Q2. Which floor has Roman artifacts?", answer: "Ground" },
    ]
  },
  {
    id: "sec3",
    title: "Environmental Science Lecture",
    type: "Lecture",
    difficulty: "Hard",
    script: "Today we are discussing the impact of microplastics on marine ecosystems. Microplastics, defined as plastic particles smaller than five millimeters, have become a ubiquitous pollutant in our oceans. They originate from various sources, including the breakdown of larger plastic debris and the release of microbeads from personal care products. These tiny particles are often ingested by marine organisms, ranging from tiny zooplankton to large whales, leading to physical harm and the bioaccumulation of toxic chemicals throughout the food web.",
    questions: [
      { q: "Q1. Maximum size of microplastics (mm):", answer: "5" },
      { q: "Q2. One source of microplastics mentioned:", answer: "microbeads" },
    ]
  }
];

export default function Listening() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeSection, setActiveSection] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const generateAudio = useCallback(async (text: string) => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this IELTS listening script clearly: ${text}` }] }],
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
        const blob = await fetch(`data:audio/mp3;base64,${base64Audio}`).then(res => res.blob());
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        throw new Error("Failed to generate audio data");
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      setAudioError("Could not generate audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection && !audioUrl && !isGeneratingAudio) {
      generateAudio(activeSection.script);
    }
  }, [activeSection, audioUrl, isGeneratingAudio, generateAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const pct = (audio.currentTime / audio.duration) * 100;
      setPlaybackProgress(pct);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (playbackProgress >= 100) audio.currentTime = 0;
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleCheck = () => {
    setShowResults(true);
    if (progress) {
      const updated = { ...progress, studyMinutes: (progress.studyMinutes || 0) + 15 };
      saveProgress(updated);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setPlaybackProgress(0);
      if (isPlaying) audioRef.current.play();
    }
  };

  if (!progress) return null;

  if (activeSection) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => { 
            setActiveSection(null); 
            setIsPlaying(false); 
            setPlaybackProgress(0); 
            setShowResults(false); 
            setAudioUrl(null);
            setAudioError(null);
          }} 
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Sections
        </button>

        <div className="card bg-gradient-to-br from-blue-dim/20 to-bg-1 border-blue-dim/30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-primary flex items-center justify-center text-white shadow-lg shadow-blue-primary/20">
              <Volume2 size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">{activeSection.title}</h3>
              <div className="text-xs text-text-muted font-medium uppercase tracking-wider">{activeSection.type} · {activeSection.difficulty}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${playbackProgress}%` }} className="h-full bg-blue-primary" />
            </div>
            
            {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

            <div className="flex items-center justify-between">
              <button 
                onClick={handlePlay} 
                disabled={isGeneratingAudio || !!audioError}
                className="w-12 h-12 rounded-full bg-blue-primary text-white flex items-center justify-center hover:bg-blue-secondary transition-colors disabled:opacity-50"
              >
                {isGeneratingAudio ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>
              
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                {isGeneratingAudio ? "Generating Audio..." : audioError ? "Audio Error" : isPlaying ? "🔊 Playing Audio..." : playbackProgress >= 100 ? "✅ Audio Complete" : "Ready to Play"}
              </div>

              <button onClick={resetAudio} className="p-2 text-text-muted hover:text-text-primary transition-colors">
                <RotateCcw size={18} />
              </button>
            </div>

            {audioError && (
              <div className="flex items-center gap-2 text-red-accent text-[10px] font-bold uppercase mt-2">
                <AlertCircle size={14} /> {audioError}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="font-bold text-sm flex items-center gap-2 px-1">
            <PenTool size={16} className="text-blue-secondary" /> Practice Questions
          </div>
          {activeSection.questions.map((q: any, i: number) => (
            <div key={i} className="card border-border">
              <div className="text-xs font-bold text-text-primary mb-3">{q.q}</div>
              <input
                type="text"
                value={userAnswers[i] || ""}
                onChange={(e) => setUserAnswers({ ...userAnswers, [i]: e.target.value })}
                placeholder="Your answer..."
                disabled={showResults}
                className={cn(
                  "w-full bg-bg-2 border border-border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all",
                  showResults && userAnswers[i]?.toLowerCase() === q.answer.toLowerCase() && "border-green-accent bg-green-accent/5 text-green-accent",
                  showResults && userAnswers[i]?.toLowerCase() !== q.answer.toLowerCase() && "border-red-accent bg-red-accent/5 text-red-accent"
                )}
              />
              {showResults && (
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                  {userAnswers[i]?.toLowerCase() === q.answer.toLowerCase() 
                    ? <span className="text-green-accent">Correct!</span> 
                    : <span className="text-red-accent">Incorrect. Answer: {q.answer}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {!showResults ? (
          <button onClick={handleCheck} className="btn btn-primary w-full py-4">Check Answers</button>
        ) : (
          <div className="space-y-3">
            <button onClick={() => setShowResults(false)} className="btn btn-ghost w-full py-4">Try Again</button>
            <div className="card bg-bg-2 border-border-2">
              <div className="flex items-center gap-2 text-text-muted font-bold text-[10px] uppercase tracking-widest mb-3">
                <FileText size={14} /> Transcript
              </div>
              <p className="text-xs text-text-secondary leading-relaxed italic whitespace-pre-wrap">{activeSection.script}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1">🎧 Listening Practice</h2>
        <p className="text-sm text-text-muted">IELTS-style audio with real-time player and questions</p>
      </div>

      <div className="space-y-4">
        {LISTENING_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec)}
            className="card w-full text-left hover:border-blue-primary group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-bg-2 flex items-center justify-center text-blue-secondary group-hover:scale-110 transition-transform">
              <Headphones size={24} />
            </div>
            <div className="flex-1 min-width-0">
              <div className="font-bold text-sm text-text-primary mb-1 truncate">{sec.title}</div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "tag",
                  sec.difficulty === "Easy" ? "tag-green" : "tag-amber"
                )}>{sec.difficulty}</span>
                <span className="tag tag-gray">{sec.type}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
