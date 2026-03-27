"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
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
  Trophy,
  AlertCircle,
  CheckCircle2,
  Volume2
} from "lucide-react";
import { callGroq } from "@/lib/groq";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

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
  const [transcription, setTranscription] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<any>(null);
  const [isAnalyzingPronunciation, setIsAnalyzingPronunciation] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = "en-US";

      recog.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscription(prev => prev + finalTranscript);
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
      };

      setRecognition(recog);
    }
  }, []);

  const startPractice = async (topic?: string) => {
    setIsGenerating(true);
    setFeedback(null);
    setPhase("prep");
    setTranscription("");
    setTimer(60); // 1 minute prep time
    setIsTimerActive(true);
    
    try {
      const prompt = `Generate an IELTS Speaking Part 2 Cue Card for the topic: "${topic || "A random interesting topic"}".
      Include:
      1. The main topic statement (Describe a...)
      2. 4 bullet points (You should say: who/what/where/when, why, how you felt, etc.)
      Return in JSON format: { "topic": "...", "bullets": ["...", "...", "...", "..."] }`;
      
      const result = await callGroq(prompt, "You are an IELTS Speaking examiner.");
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
        if (recognition) {
          try {
            recognition.start();
          } catch (e) {
            console.error("Failed to start recognition", e);
          }
        }
      } else {
        setIsTimerActive(false);
        if (recognition) {
          try {
            recognition.stop();
          } catch (e) {
            console.error("Failed to stop recognition", e);
          }
        }
      }
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer, phase]);

  const getAIAnalysis = async () => {
    setIsAnalyzing(true);
    setIsAnalyzingPronunciation(true);
    try {
      const prompt = `Simulate an IELTS Speaking Part 2 feedback for the topic: "${cueCardData.topic}".
      The student's transcribed response was: "${transcription || "No response recorded."}"
      
      Provide a detailed evaluation:
      1. Estimated Band (0-9)
      2. Fluency & Coherence: Analyze pace, hesitation, and logical flow.
      3. Lexical Resource: Identify good vocabulary used and suggest 5-10 more advanced words/collocations for this topic.
      4. Grammatical Range & Accuracy: Point out specific grammatical errors in the transcript and suggest corrections.
      5. Pronunciation: Based on the transcript (if available), suggest focus areas.
      
      Return in clean Markdown with bold headers.`;
      
      const result = await callGroq(prompt, "You are a senior IELTS examiner.");
      setFeedback(result);
      
      // Separate Pronunciation Analysis
      const pronPrompt = `Analyze the following transcript for potential pronunciation challenges common for IELTS students. 
      Transcript: "${transcription}"
      
      Identify 3-5 specific words from the transcript that are often mispronounced or could be improved.
      For each word, provide:
      1. The word
      2. Phonetic transcription (IPA)
      3. A tip for better pronunciation.
      
      Return in JSON format: { "score": 0-100, "words": [{ "word": "...", "ipa": "...", "tip": "..." }] }`;
      
      const pronResult = await callGroq(pronPrompt, "You are a pronunciation coach.");
      const pronData = JSON.parse(pronResult.replace(/```json\n?|\n?```/g, ''));
      setPronunciationFeedback(pronData);
      
      setPhase("feedback");
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
      setIsAnalyzingPronunciation(false);
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

          <div id="speaking-lab-main-grid" className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div id="cue-card-section" className="md:col-span-2 space-y-6 md:space-y-8">
              <div id="cue-card-display" className="card border-blue-primary/30 bg-gradient-to-br from-blue-primary/5 to-bg-1 p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col">
                <div className="absolute top-0 right-0 p-6 md:p-10">
                  <div className="tag tag-blue">Part 2</div>
                </div>
                
                <div className="flex-1">
                  <div className="text-[10px] md:text-sm text-blue-secondary font-black uppercase tracking-[0.25em] mb-6 md:mb-8">IELTS Speaking Topic</div>
                  <h3 id="cue-card-topic" className="font-serif text-3xl md:text-5xl font-black text-text-primary mb-8 md:mb-12 leading-tight tracking-tight">
                    {cueCardData.topic}
                  </h3>
                  
                  <div className="space-y-6 md:space-y-8">
                    <p className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-widest">You should say:</p>
                    <ul id="cue-card-points" className="space-y-4 md:space-y-6">
                      {cueCardData.bullets.map((bullet: string, i: number) => (
                        <li key={i} className="flex items-start gap-4 md:gap-6 text-text-secondary group">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-secondary/10 flex items-center justify-center text-blue-secondary text-[10px] md:text-xs font-black mt-0.5 group-hover:bg-blue-secondary group-hover:text-white transition-colors">
                            {i+1}
                          </div>
                          <span className="text-sm md:text-lg font-medium leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-bg-2 flex items-center justify-center">
                      <Clock size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Preparation</p>
                      <p className="text-sm font-black text-text-primary">1 Minute</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-bg-2 flex items-center justify-center">
                      <Mic size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Speaking</p>
                      <p className="text-sm font-black text-text-primary">2 Minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {phase === "speak" && (
                <div className="card bg-red-accent/5 border-red-accent/20 flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-red-accent rounded-full flex items-center justify-center text-white mb-4 md:mb-6 animate-pulse shadow-2xl shadow-red-accent/40">
                    <Mic size={40} />
                  </div>
                  <h4 className="text-lg md:text-xl font-serif font-black text-text-primary mb-2">Recording in Progress</h4>
                  <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest font-bold mb-4">Speak for 1-2 minutes</p>
                  
                  <div className="w-full max-w-md bg-bg-1/50 rounded-xl p-4 border border-red-accent/10 min-h-[100px] text-xs text-text-secondary italic leading-relaxed">
                    {transcription || "Listening for your voice..."}
                  </div>

                  <button 
                    onClick={() => { 
                      setIsTimerActive(false); 
                      setTimer(0); 
                      if (recognition) recognition.stop();
                    }}
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
                    onClick={() => { 
                      setPhase("speak"); 
                      setTimer(120); 
                      if (recognition) {
                        try {
                          recognition.start();
                        } catch (e) {
                          console.error("Failed to start recognition", e);
                        }
                      }
                    }}
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

            <div id="speaking-feedback-section" className="space-y-8">
              <div id="speaking-tips-card" className="card p-8 bg-gradient-to-br from-bg-1 to-bg-2 border-white/5">
                <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-[0.25em] mb-8">
                  <Lightbulb size={16} /> Pro Tips
                </div>
                <ul className="space-y-8">
                  {[
                    { title: "Use All Prep Time", desc: "Use the full 1 minute of prep time to write down keywords and structure your answer." },
                    { title: "Tell a Story", desc: "Don't just answer the bullets; weave them into a coherent personal narrative." },
                    { title: "Vary Your Tenses", desc: "Try to use a variety of tenses (past, present, future) to show grammatical range." },
                    { title: "Keep Speaking", desc: "Keep speaking until the examiner stops you. Fluency is key to a high band." },
                  ].map((tip, i) => (
                    <li key={i} className="space-y-2 group">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-blue-secondary group-hover:scale-150 transition-transform" />
                        <p className="text-xs font-black text-text-primary uppercase tracking-widest">{tip.title}</p>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed pl-4">
                        {tip.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {feedback && (
                <div className="space-y-6">
                  {pronunciationFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-8 bg-gradient-to-br from-blue-primary/10 to-bg-1 border-blue-primary/30 shadow-xl shadow-blue-primary/5"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-[0.25em]">
                          <Mic size={16} /> Pronunciation Analysis
                        </div>
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-bg-3"
                            />
                            <motion.circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray={175.9}
                              initial={{ strokeDashoffset: 175.9 }}
                              animate={{ strokeDashoffset: 175.9 - (175.9 * pronunciationFeedback.score) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="text-blue-primary"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-black text-text-primary">{pronunciationFeedback.score}</span>
                            <span className="text-[6px] font-bold text-text-muted uppercase">Score</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Focus Words</div>
                        {pronunciationFeedback.words.map((item: any, i: number) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="p-4 bg-bg-2/50 rounded-2xl border border-border-2 group hover:border-blue-primary/30 transition-all hover:bg-bg-1"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-text-primary">{item.word}</span>
                                <button className="p-1 text-text-muted hover:text-blue-primary transition-colors">
                                  <Volume2 size={12} />
                                </button>
                              </div>
                              <span className="text-[10px] font-mono text-blue-secondary bg-blue-secondary/10 px-2 py-0.5 rounded-md border border-blue-secondary/20">{item.ipa}</span>
                            </div>
                            <div className="flex gap-2">
                              <div className="mt-1">
                                <Sparkles size={10} className="text-amber-accent" />
                              </div>
                              <p className="text-[11px] text-text-muted leading-relaxed italic">{item.tip}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    id="speaking-feedback-display"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-8 bg-gradient-to-br from-violet-accent/10 to-bg-1 border-violet-accent/30 shadow-2xl shadow-violet-accent/5"
                  >
                    <div className="flex items-center gap-2 text-violet-accent font-bold text-[10px] uppercase tracking-[0.25em] mb-6">
                      <MessageSquare size={16} /> AI Analysis
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed markdown-body">
                      <ReactMarkdown>{feedback}</ReactMarkdown>
                    </div>
                    <button onClick={() => { setCueCardData(null); setFeedback(null); setPronunciationFeedback(null); }} className="btn btn-ghost w-full mt-8 border-violet-accent/20 text-violet-accent hover:bg-violet-accent hover:text-white transition-all">
                      Try Another Topic
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
