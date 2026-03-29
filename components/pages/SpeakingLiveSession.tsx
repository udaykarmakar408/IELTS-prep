"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Loader2, 
  MessageSquare,
  Sparkles,
  Phone,
  PhoneOff,
  AlertCircle
} from "lucide-react";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { cn } from "@/lib/utils";

interface SpeakingLiveSessionProps {
  onClose: () => void;
  topic?: string;
  mode?: "part1" | "part2" | "part3" | "full" | "mock";
}

export default function SpeakingLiveSession({ onClose, topic, mode = "full" }: SpeakingLiveSessionProps) {
  const [status, setStatus] = useState<"connecting" | "active" | "error" | "closed">("connecting");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [aiTranscription, setAiTranscription] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
  }, []);

  const playNextChunk = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current || !audioContextRef.current) {
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;
    
    // Convert PCM to Float32
    const float32Data = new Float32Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      float32Data[i] = chunk[i] / 32768.0;
    }

    const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 16000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length === 0) {
        setIsSpeaking(false);
      }
      playNextChunk();
    };

    source.start();
  }, []);

  const startSession = useCallback(async () => {
    try {
      setStatus("connecting");
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are a certified, high-level IELTS Speaking Examiner aiming for Band 9.0 standards. 
          Your goal is to conduct a realistic, challenging, and professional speaking test.
          
          Current Mode: ${mode === "part1" ? "Part 1 (Introduction & Interview)" : mode === "part2" ? "Part 2 (Long Turn/Cue Card)" : mode === "part3" ? "Part 3 (Discussion)" : mode === "mock" ? "Full Mock Test (Parts 1, 2, and 3)" : "General Practice"}.
          Topic: ${topic || "General IELTS Speaking Practice"}.
          
          ${mode === "part1" ? "Part 1 Instructions: Ask 3-4 sophisticated questions about hobbies, home, work, or abstract topics. Use natural follow-up questions." : ""}
          ${mode === "part2" ? "Part 2 Instructions: Provide a complex cue card topic (if not already specified) and ask the student to speak for 2 minutes. Listen carefully and do not interrupt until they finish or 2 minutes pass. Use standard IELTS phrasing." : ""}
          ${mode === "part3" ? "Part 3 Instructions: Ask deep, abstract, and analytical follow-up questions related to the Part 2 topic. Challenge the student to provide detailed, complex, and well-structured answers suitable for Band 9.0." : ""}
          ${mode === "mock" ? "Mock Test Instructions: Conduct a full IELTS Speaking test. Start with Part 1 (3-4 mins), then Part 2 (3-4 mins including prep), then Part 3 (4-5 mins). Manage the time and transition between parts naturally and professionally." : ""}
          
          Conduct the conversation naturally using sophisticated examiner language. Ask probing follow-up questions. 
          Maintain a professional yet neutral tone, typical of a real IELTS interview.
          Speak clearly and at a natural pace.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus("active");
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              setIsSpeaking(true);
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  // Decode base64 to Int16Array
                  const binaryString = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const int16Data = new Int16Array(bytes.buffer);
                  audioQueueRef.current.push(int16Data);
                  playNextChunk();
                }
              }
            }

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              setIsSpeaking(false);
            }

            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setAiTranscription(prev => prev + " " + message.serverContent?.modelTurn?.parts?.[0]?.text);
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            setStatus("error");
          },
          onclose: () => {
            setStatus("closed");
          }
        }
      });

      sessionRef.current = session;

      // Setup Audio Capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || status !== "active") return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
        }

        // Send to Gemini
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
        });
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Failed to access microphone or connect to AI.");
      setStatus("error");
    }
  }, [topic, isMuted, status, playNextChunk]);

  useEffect(() => {
    startSession();
    return cleanup;
  }, []);

  return (
    <motion.div 
      id="speaking-live-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-bg/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-4xl h-full max-h-[800px] bg-bg-2 border border-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-bg-3/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-text-primary">Aria Live</h3>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  status === "active" ? "bg-green-accent animate-pulse" : 
                  status === "connecting" ? "bg-amber-accent animate-pulse" : "bg-red-accent"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  {status === "active" ? "Live Session" : status === "connecting" ? "Connecting..." : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl bg-bg-1 text-text-muted hover:text-red-accent hover:bg-red-accent/10 transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-1000",
              isSpeaking ? "bg-blue-primary/20 scale-110" : "bg-violet-accent/10 scale-100"
            )} />
          </div>

          {/* AI Avatar / Waveform */}
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ 
                  scale: isSpeaking ? [1, 1.1, 1] : 1,
                  rotate: isSpeaking ? [0, 5, -5, 0] : 0
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={cn(
                  "w-48 h-48 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500",
                  isSpeaking ? "bg-blue-primary text-white scale-105" : "bg-violet-accent text-white"
                )}
              >
                <Sparkles size={64} className={cn(isSpeaking ? "animate-pulse" : "")} />
              </motion.div>
              
              {/* Animated Rings */}
              <AnimatePresence>
                {isSpeaking && (
                  <>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0.2 }}
                      exit={{ scale: 2, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 border-2 border-blue-primary rounded-[2.5rem]"
                    />
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.8, opacity: 0.1 }}
                      exit={{ scale: 2.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                      className="absolute inset-0 border-2 border-blue-primary rounded-[2.5rem]"
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center space-y-2">
              <h4 className="font-serif text-2xl font-bold text-text-primary">
                {isSpeaking ? "Aria is speaking..." : "Aria is listening..."}
              </h4>
              <p className="text-sm text-text-muted font-medium max-w-xs mx-auto">
                {status === "active" ? "Speak naturally as you would in a real IELTS interview." : "Please wait while we establish a secure connection."}
              </p>
            </div>

            {/* Simulated Waveform */}
            <div className="flex items-center gap-1 h-12">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: isSpeaking ? [10, Math.random() * 40 + 10, 10] : [4, Math.random() * 8 + 4, 4]
                  }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className={cn(
                    "w-1 rounded-full transition-colors duration-500",
                    isSpeaking ? "bg-blue-primary" : "bg-text-muted/30"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Transcriptions */}
          <div className="w-full max-w-2xl space-y-4 relative z-10">
            <AnimatePresence mode="wait">
              {aiTranscription && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black text-violet-accent uppercase tracking-[0.2em] mb-2">
                    <MessageSquare size={12} /> Aria
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {aiTranscription}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 py-10 border-t border-border bg-bg-3/50 flex flex-col items-center space-y-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90",
                isMuted ? "bg-red-accent text-white shadow-red-accent/20" : "bg-bg-1 text-text-muted border border-border hover:bg-bg-2"
              )}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button 
              onClick={onClose}
              className="w-20 h-20 rounded-[2rem] bg-red-accent text-white flex items-center justify-center shadow-2xl shadow-red-accent/40 hover:scale-105 active:scale-95 transition-all"
            >
              <PhoneOff size={32} />
            </button>
            <button 
              className="w-16 h-16 rounded-2xl bg-bg-1 text-text-muted border border-border flex items-center justify-center hover:bg-bg-2 transition-all active:scale-90"
            >
              <Volume2 size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            <span>Topic: {topic || "General"}</span>
            <div className="w-1 h-1 bg-border rounded-full" />
            <span>Mode: {mode.toUpperCase()}</span>
          </div>
        </div>

        {/* Error Overlay */}
        {status === "error" && (
          <div className="absolute inset-0 z-50 bg-bg/90 backdrop-blur-md flex items-center justify-center p-8">
            <div className="max-w-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-accent/10 text-red-accent flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Connection Failed</h4>
                <p className="text-sm text-text-muted leading-relaxed">{error || "We couldn't connect to the AI examiner. Please check your internet and try again."}</p>
              </div>
              <button 
                onClick={() => { setStatus("connecting"); startSession(); }}
                className="btn btn-primary w-full py-4"
              >
                Try Again
              </button>
              <button onClick={onClose} className="btn btn-ghost w-full">Close Session</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
