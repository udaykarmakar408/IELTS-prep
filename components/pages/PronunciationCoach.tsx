"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  Square, 
  RotateCcw, 
  Sparkles, 
  X, 
  ChevronRight, 
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from "@/lib/utils";

interface PronunciationCoachProps {
  onClose: () => void;
}

const PRACTICE_SENTENCES = [
  "The rapid advancement of technology has significantly altered our daily lives.",
  "It is essential to maintain a healthy balance between work and personal life.",
  "Many people believe that international travel broadens one's perspective.",
  "Environmental conservation is a critical issue that requires global cooperation.",
  "The government should invest more in public infrastructure and education.",
  "Learning a second language can open up numerous career opportunities.",
  "Urbanization has led to both economic growth and social challenges.",
  "Art and culture play a vital role in the development of a society."
];

export default function PronunciationCoach({ onClose }: PronunciationCoachProps) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{
    clarity: { score: number; feedback: string };
    intonation: { score: number; feedback: string };
    stress: { score: number; feedback: string };
    overall: string;
    transcript: string;
  } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        analyzeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        
        const prompt = `Analyze the pronunciation of the user's audio for the following sentence: "${PRACTICE_SENTENCES[currentSentenceIndex]}"
        
        Evaluate based on:
        1. Clarity: Precision of individual sounds (vowels/consonants).
        2. Intonation: Natural rising and falling pitch patterns.
        3. Word Stress: Correct emphasis on syllables.
        
        Provide a detailed analysis in JSON format.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-preview",
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: "audio/webm" } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                clarity: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING }
                  },
                  required: ["score", "feedback"]
                },
                intonation: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING }
                  },
                  required: ["score", "feedback"]
                },
                stress: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING }
                  },
                  required: ["score", "feedback"]
                },
                overall: { type: Type.STRING },
                transcript: { type: Type.STRING }
              },
              required: ["clarity", "intonation", "stress", "overall", "transcript"]
            }
          }
        });

        const result = JSON.parse(response.text || "{}");
        setFeedback(result);
      };
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextSentence = () => {
    setCurrentSentenceIndex((prev) => (prev + 1) % PRACTICE_SENTENCES.length);
    setFeedback(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-bg/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-4xl bg-bg-2 border border-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-bg-3/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-accent/10 text-amber-accent flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-text-primary">Pronunciation Coach</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Real-time Voice Analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl bg-bg-1 text-text-muted hover:text-red-accent hover:bg-red-accent/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-12">
            {/* Sentence Display */}
            <div className="text-center space-y-6">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-accent">Practice Sentence {currentSentenceIndex + 1}</div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary leading-tight">
                "{PRACTICE_SENTENCES[currentSentenceIndex]}"
              </h2>
              <button 
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-primary hover:underline"
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(PRACTICE_SENTENCES[currentSentenceIndex]);
                  utterance.rate = 0.9;
                  window.speechSynthesis.speak(utterance);
                }}
              >
                <Volume2 size={16} /> Listen to Model
              </button>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <AnimatePresence>
                  {isRecording && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0.2 }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-red-accent rounded-full"
                    />
                  )}
                </AnimatePresence>
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isAnalyzing}
                  className={cn(
                    "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl",
                    isRecording ? "bg-red-accent text-white scale-110" : "bg-bg-1 text-text-muted border-4 border-border hover:border-amber-accent hover:text-amber-accent",
                    isAnalyzing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isAnalyzing ? <Loader2 size={32} className="animate-spin" /> : isRecording ? <Square size={32} /> : <Mic size={32} />}
                </button>
              </div>
              <p className="text-sm font-medium text-text-muted">
                {isAnalyzing ? "Analyzing your voice..." : isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
              </p>
            </div>

            {/* Feedback Display */}
            <AnimatePresence>
              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Clarity", data: feedback.clarity, color: "blue" },
                      { label: "Intonation", data: feedback.intonation, color: "violet" },
                      { label: "Word Stress", data: feedback.stress, color: "emerald" }
                    ].map((item, i) => (
                      <div key={i} className="p-6 rounded-3xl bg-bg-3 border border-border">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.label}</span>
                          <span className={cn(
                            "text-lg font-black",
                            item.color === "blue" ? "text-blue-primary" : item.color === "violet" ? "text-violet-accent" : "text-emerald-accent"
                          )}>{item.data.score.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{item.data.feedback}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 rounded-[2rem] bg-amber-accent/5 border border-amber-accent/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles size={20} className="text-amber-accent" />
                      <h4 className="font-bold text-text-primary">Overall Feedback</h4>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed mb-6">{feedback.overall}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                      <CheckCircle2 size={12} className="text-green-accent" /> Transcript: "{feedback.transcript}"
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button 
                      onClick={nextSentence}
                      className="btn btn-primary px-10 py-4 flex items-center gap-2"
                    >
                      Next Sentence <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
