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
      playNextChunk();
    };

    source.start();
  }, []);

  const startSession = useCallback(async () => {
    try {
      setStatus("connecting");
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are a friendly and professional IELTS Speaking Examiner. 
          Your goal is to help the student practice their speaking skills.
          
          Current Mode: ${mode === "part1" ? "Part 1 (Introduction & Interview)" : mode === "part2" ? "Part 2 (Long Turn/Cue Card)" : mode === "part3" ? "Part 3 (Discussion)" : mode === "mock" ? "Full Mock Test (Parts 1, 2, and 3)" : "General Practice"}.
          Topic: ${topic || "General IELTS Speaking Practice"}.
          
          ${mode === "part1" ? "Part 1 Instructions: Ask 3-4 simple questions about hobbies, home, or work." : ""}
          ${mode === "part2" ? "Part 2 Instructions: Provide a cue card topic (if not already specified) and ask the student to speak for 2 minutes. Listen carefully and do not interrupt until they finish or 2 minutes pass." : ""}
          ${mode === "part3" ? "Part 3 Instructions: Ask follow-up, abstract questions related to the Part 2 topic. Challenge the student to provide detailed, complex answers." : ""}
          ${mode === "mock" ? "Mock Test Instructions: Conduct a full IELTS Speaking test. Start with Part 1 (3-4 mins), then Part 2 (3-4 mins including prep), then Part 3 (4-5 mins). Manage the time and transition between parts naturally." : ""}
          
          Conduct the conversation naturally. Ask follow-up questions. 
          Provide brief, encouraging feedback if they struggle, but keep the flow of a real interview.
          Speak clearly and at a moderate pace.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus("active");
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-2xl bg-bg-1 border border-border-2 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[700px]">
        {/* Header */}
        <div className="p-6 border-b border-border-2 flex items-center justify-between bg-bg-2/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-primary/10 flex items-center justify-center text-blue-primary">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-black text-text-primary">Aria Live</h3>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  status === "active" ? "bg-green-500 animate-pulse" : "bg-text-muted"
                )} />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {status === "connecting" ? "Connecting..." : status === "active" ? "Live Session" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-bg-2 hover:bg-bg-3 flex items-center justify-center text-text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-8 overflow-y-auto custom-scrollbar">
          {status === "connecting" && (
            <div className="space-y-4">
              <Loader2 size={48} className="text-blue-primary animate-spin mx-auto" />
              <p className="text-text-secondary font-medium">Initializing secure voice channel...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 max-w-sm">
              <div className="w-16 h-16 bg-red-accent/10 rounded-full flex items-center justify-center text-red-accent mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary">Connection Failed</h4>
                <p className="text-sm text-text-muted leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => { setError(null); startSession(); }}
                className="btn btn-primary w-full"
              >
                Try Again
              </button>
            </div>
          )}

          {status === "active" && (
            <div className="w-full space-y-12">
              {/* Visualizer Placeholder */}
              <div className="flex items-center justify-center gap-1 h-24">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: isPlayingRef.current ? [20, 60, 20] : [10, 15, 10]
                    }}
                    transition={{ 
                      duration: 0.5, 
                      repeat: Infinity, 
                      delay: i * 0.05,
                      ease: "easeInOut"
                    }}
                    className="w-2 rounded-full bg-blue-primary/40"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-serif text-2xl font-black text-text-primary">
                  {topic ? `Practicing: ${topic}` : "Free Conversation"}
                </h4>
                <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
                  Speak naturally. Aria is listening and will respond in real-time.
                </p>
              </div>

              {/* Transcription Area */}
              <div className="w-full bg-bg-2/50 rounded-2xl p-6 border border-border-2 text-left space-y-4 min-h-[120px]">
                <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  <MessageSquare size={12} /> Live Transcription
                </div>
                <p className="text-sm text-text-secondary italic leading-relaxed">
                  {aiTranscription || "Aria will start speaking shortly..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-8 bg-bg-2/50 border-t border-border-2 flex items-center justify-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
              isMuted ? "bg-red-accent text-white" : "bg-bg-1 text-text-primary hover:bg-bg-3 border border-border-2"
            )}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          <button 
            onClick={onClose}
            className="w-20 h-20 rounded-full bg-red-accent text-white flex items-center justify-center shadow-xl shadow-red-accent/20 hover:scale-105 transition-transform"
          >
            <PhoneOff size={32} />
          </button>

          <button 
            className="w-16 h-16 rounded-full bg-bg-1 text-text-primary hover:bg-bg-3 border border-border-2 flex items-center justify-center transition-all shadow-lg"
          >
            <Volume2 size={28} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
