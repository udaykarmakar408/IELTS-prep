"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Mic, 
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
import { getProgress, UserProgress } from "@/lib/store";
import { callGroq } from "@/lib/groq";
import { cn } from "@/lib/utils";
import { GoogleGenAI } from "@google/genai";
import { pcmToWav } from "@/lib/audio";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeCard, setActiveCard] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [currentPart, setCurrentPart] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [phase, setPhase] = useState<"intro" | "prep" | "speak" | "feedback">("intro");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [fullTranscript, setFullTranscript] = useState<{part: number, text: string}[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<any>(null);
  const [isAnalyzingPronunciation, setIsAnalyzingPronunciation] = useState(false);
  const [markedTranscript, setMarkedTranscript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const generateAudio = async (text: string) => {
    setIsAudioLoading(true);
    try {
      // Split text into chunks of ~4000 characters to avoid Gemini limits
      const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
      const combinedChunks: string[] = [];
      let currentChunk = "";
      
      for (const chunk of chunks) {
        if ((currentChunk + chunk).length > 4000) {
          combinedChunks.push(currentChunk);
          currentChunk = chunk;
        } else {
          currentChunk += chunk;
        }
      }
      if (currentChunk) combinedChunks.push(currentChunk);

      const audioChunks: Int16Array[] = [];
      
      for (const chunkText of combinedChunks) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: `Say clearly and professionally as an IELTS examiner: ${chunkText}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Puck" },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioChunks.push(new Int16Array(bytes.buffer));
        }
      }

      if (audioChunks.length > 0) {
        // Concatenate all chunks
        const totalLength = audioChunks.reduce((acc, curr) => acc + curr.length, 0);
        const combinedPcm = new Int16Array(totalLength);
        let offset = 0;
        for (const chunk of audioChunks) {
          combinedPcm.set(chunk, offset);
          offset += chunk.length;
        }

        const wavBlob = pcmToWav(combinedPcm, 24000);
        const wavUrl = URL.createObjectURL(wavBlob);
        setAudioUrl(wavUrl);
        const audio = new Audio(wavUrl);
        audio.play();
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

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
    setPhase("intro");
    setTranscription("");
    setFullTranscript([]);
    setCurrentPart(1);
    
    const difficulty = progress?.difficulty || "intermediate";
    try {
      const prompt = `Generate a FULL IELTS Speaking Test (Parts 1, 2, and 3) for a ${difficulty} level student.
      Theme: "${topic || "A random interesting theme"}".
      
      Difficulty Focus:
      - Beginner: Familiar personal topics, simpler Part 3 questions.
      - Intermediate: Mix of personal and general social topics.
      - Advanced: Complex conceptual depth, philosophical Part 3 questions.
      
      Structure:
      - Part 1: 3-5 introductory questions about the theme.
      - Part 2: A Cue Card (Describe a...). Include 4 bullet points.
      - Part 3: 3-5 abstract discussion questions related to Part 2.
      
      Return in JSON format: 
      { 
        "theme": "...",
        "part1": ["q1", "q2", "q3"],
        "part2": { "topic": "...", "bullets": ["...", "...", "...", "..."] },
        "part3": ["q1", "q2", "q3"]
      }`;
      
      const result = await callGroq(prompt, "You are an IELTS Speaking examiner.");
      const data = JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
      setTestData(data);
      
      const audioText = `Good morning. My name is Aria, and I will be your examiner today. We will start with Part 1. I'd like to ask you some questions about ${data.theme}. First, ${data.part1[0]}`;
      generateAudio(audioText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextPart = () => {
    setFullTranscript(prev => [...prev, { part: currentPart, text: transcription }]);
    setTranscription("");
    
    if (currentPart === 1) {
      setCurrentPart(2);
      setPhase("prep");
      setTimer(60); // 1 minute prep time
      setIsTimerActive(true);
      const audioText = `Now, we move to Part 2. I'm going to give you a topic and I'd like you to speak about it for one to two minutes. You have one minute to prepare. Here is your topic: ${testData.part2.topic}. You should say: ${testData.part2.bullets.join(", ")}. Your preparation time starts now.`;
      generateAudio(audioText);
    } else if (currentPart === 2) {
      setCurrentPart(3);
      setPhase("speak");
      setTimer(300); // 5 mins for Part 3
      setIsTimerActive(true);
      const audioText = `Thank you. Now, for Part 3, I'd like to discuss some more abstract questions related to this. First, ${testData.part3[0]}. [PAUSE] Then, ${testData.part3[1] || ""}. I'll also ask you to elaborate on your views.`;
      generateAudio(audioText);
    } else {
      getAIAnalysis();
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
      const finalTranscriptText = [...fullTranscript, { part: currentPart, text: transcription }]
        .map(t => `Part ${t.part}: ${t.text}`)
        .join("\n\n");

      const prompt = `You are a Senior IELTS Speaking Examiner. Evaluate the following FULL TEST response based on the 4 official Band 9.0 criteria.
      
      User's Current Level: ${progress?.difficulty || "intermediate"}
      (Beginner: focus on basic coherence and sentence structure.
       Intermediate: focus on vocabulary range and complex grammar.
       Advanced: focus on idiomatic expression and abstract nuance).

      Theme: "${testData.theme}"
      Student Transcript:
      ${finalTranscriptText}
      
      Provide a detailed evaluation in JSON format with:
      - overallBand: Overall band score (1.0 to 9.0).
      - criteria: {
          fluencyCoherence: { score: number, feedback: string },
          lexicalResource: { score: number, feedback: string },
          grammaticalRange: { score: number, feedback: string },
          pronunciation: { score: number, feedback: string }
        }
      - detailedFeedback: A comprehensive markdown report.
      - path9: Specific, actionable steps to reach Band 9.0.
      - band9Samples: { part2: string, part3: string }
      
      Be extremely critical. Band 9.0 requires natural speed, sophisticated vocabulary, and error-free complex grammar.`;
      
      const result = await callGroq(prompt, "Return ONLY JSON.");
      let data;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        data = JSON.parse(jsonMatch ? jsonMatch[0] : result);
        setFeedback(data.detailedFeedback);
      } catch (e) {
        console.error("Failed to parse feedback JSON", e);
        setFeedback(result); // Fallback
      }

      // Generate Marked-up Transcript
      const markupPrompt = `Analyze this student transcript for an IELTS Speaking test. 
      Identify:
      1. Advanced/High-Band Vocabulary (Mark with <span class="text-blue-secondary font-bold">word</span>)
      2. Grammatical errors or awkward phrasing (Mark with <span class="text-red-accent underline decoration-dotted">phrase</span>)
      3. Good linkers/connectives (Mark with <span class="text-green-accent italic">phrase</span>)
      
      Transcript: "${finalTranscriptText}"
      
      Return the full transcript punctuated and marked with these HTML spans. Wrap in <div>.`;
      
      const markupResult = await callGroq(markupPrompt, "You are a professional IELTS editor.");
      setMarkedTranscript(markupResult);
      
      // Separate Pronunciation Analysis (Clarify it's text-based)
      const pronPrompt = `Analyze the following transcript for potential pronunciation challenges. 
      Note: This is a text-based analysis of likely mispronunciations based on the transcribed words.
      
      Transcript: "${transcription}"
      
      Identify 3-5 specific words from the transcript that are often mispronounced by non-native speakers.
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
          <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-blue-secondary/10 border border-blue-secondary/20 rounded-full w-fit">
            <Sparkles size={12} className="text-blue-secondary" />
            <span className="text-[9px] font-bold text-blue-secondary uppercase tracking-[0.1em]">
              Level: {progress?.difficulty || "intermediate"}
            </span>
          </div>
          <p className="text-xs md:text-base text-text-secondary max-w-md leading-relaxed">
            Practice IELTS Speaking Part 2 with AI-generated cue cards, timed sessions, and expert feedback.
          </p>
        </div>
      </div>

      {!testData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted px-1">Practice Themes</h3>
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
            <h3 className="font-serif text-2xl font-black text-text-primary mb-2">Full Test Simulation</h3>
            <p className="text-xs text-text-secondary mb-8 max-w-[200px]">Experience a complete 3-part IELTS Speaking test with Aria.</p>
            <button 
              onClick={() => startPractice()}
              disabled={isGenerating}
              className="btn btn-primary bg-violet-accent hover:bg-violet-accent/80 border-none w-full"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : "Start Full Test"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={() => setTestData(null)} className="text-xs font-bold text-text-muted hover:text-text-primary uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={14} /> Reset Test
            </button>
            <div className={cn(
              "flex items-center gap-3 font-mono text-2xl font-black px-6 py-2 rounded-2xl border",
              timer < 15 && timer > 0 ? "text-red-accent border-red-accent/30 bg-red-accent/5 animate-pulse" : "text-blue-secondary border-blue-secondary/30 bg-blue-secondary/5"
            )}>
              <Clock size={24} /> {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
            </div>
          </div>

          <div id="speaking-lab-main-grid" className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div id="cue-card-section" className="md:col-span-2 space-y-6 md:space-y-8">
              <div id="cue-card-display" className="card border-blue-primary/30 bg-gradient-to-br from-blue-primary/5 to-bg-1 p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col">
                <div className="absolute top-0 right-0 p-6 md:p-10">
                  <div className="tag tag-blue">Part {currentPart}</div>
                </div>
                
                <div className="flex-1">
                  <div className="text-[10px] md:text-sm text-blue-secondary font-black uppercase tracking-[0.25em] mb-6 md:mb-8">IELTS Speaking {currentPart === 2 ? "Cue Card" : "Discussion"}</div>
                  
                  {currentPart === 1 && (
                    <div className="space-y-6">
                      <h3 className="font-serif text-3xl md:text-4xl font-black text-text-primary leading-tight tracking-tight">
                        Introduction & Interview
                      </h3>
                      <p className="text-text-secondary text-lg italic">Topic: {testData.theme}</p>
                      <ul className="space-y-4">
                        {testData.part1.map((q: string, i: number) => (
                          <li key={i} className="flex gap-3 text-text-secondary">
                            <span className="text-blue-primary font-bold">•</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPart === 2 && (
                    <div className="space-y-6">
                      <h3 id="cue-card-topic" className="font-serif text-3xl md:text-5xl font-black text-text-primary mb-8 md:mb-12 leading-tight tracking-tight">
                        {testData.part2.topic}
                      </h3>
                      
                      <div className="space-y-6 md:space-y-8">
                        <p className="text-xs md:text-sm font-bold text-text-muted uppercase tracking-widest">You should say:</p>
                        <ul id="cue-card-points" className="space-y-4 md:space-y-6">
                          {testData.part2.bullets.map((bullet: string, i: number) => (
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
                  )}

                  {currentPart === 3 && (
                    <div className="space-y-6">
                      <h3 className="font-serif text-3xl md:text-4xl font-black text-text-primary leading-tight tracking-tight">
                        Two-way Discussion
                      </h3>
                      <p className="text-text-secondary text-lg italic">Abstract questions related to the topic.</p>
                      <ul className="space-y-4">
                        {testData.part3.map((q: string, i: number) => (
                          <li key={i} className="flex gap-3 text-text-secondary">
                            <span className="text-blue-primary font-bold">•</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-bg-2 flex items-center justify-center">
                      <Clock size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Duration</p>
                      <p className="text-sm font-black text-text-primary">
                        {currentPart === 1 ? "4-5 Mins" : currentPart === 2 ? "3-4 Mins" : "4-5 Mins"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-bg-2 flex items-center justify-center">
                      <Mic size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</p>
                      <p className="text-sm font-black text-text-primary uppercase">{phase}</p>
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
                  <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest font-bold mb-4">
                    {currentPart === 2 ? "Speak for 1-2 minutes" : "Answer the examiner's questions"}
                  </p>
                  
                  <div className="w-full max-w-md bg-bg-1/50 rounded-xl p-4 border border-red-accent/10 min-h-[100px] text-xs text-text-secondary italic leading-relaxed">
                    {transcription || "Listening for your voice..."}
                  </div>

                  <button 
                    onClick={() => { 
                      setIsTimerActive(false); 
                      setTimer(0); 
                      if (recognition) recognition.stop();
                      nextPart();
                    }}
                    className="btn btn-ghost mt-6 md:mt-8 border-red-accent/30 text-red-accent hover:bg-red-accent hover:text-white"
                  >
                    <Square size={16} /> {currentPart === 3 ? "Finish Test" : "Next Part"}
                  </button>
                </div>
              )}

              {phase === "intro" && (
                <div className="card bg-blue-primary/5 border-blue-primary/20 flex flex-col items-center justify-center py-8 md:py-12 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-primary rounded-full flex items-center justify-center text-white mb-4 md:mb-6 shadow-2xl shadow-blue-primary/40">
                    <Play size={40} />
                  </div>
                  <h4 className="text-lg md:text-xl font-serif font-black text-text-primary mb-2">Ready to Start?</h4>
                  <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest font-bold">Part 1: Introduction & Interview</p>
                  <button 
                    onClick={() => { 
                      setPhase("speak"); 
                      setTimer(300); 
                      setIsTimerActive(true);
                      if (recognition) {
                        try {
                          recognition.start();
                        } catch (e) {
                          console.error("Failed to start recognition", e);
                        }
                      }
                    }}
                    className="btn btn-primary bg-blue-primary hover:bg-blue-primary/80 border-none mt-6 md:mt-8"
                  >
                    Start Part 1
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
                      setIsTimerActive(true);
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
                      {markedTranscript && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="card p-8 bg-bg-2 border-white/5 shadow-inner"
                        >
                          <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-[0.25em] mb-6">
                            <Sparkles size={16} /> Analysis Transcript
                          </div>
                          <div 
                            className="text-sm text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-2xl border border-white/5"
                            dangerouslySetInnerHTML={{ __html: markedTranscript }}
                          />
                          <div className="mt-6 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-secondary">
                              <div className="w-2 h-2 rounded-full bg-blue-secondary" /> Advanced Vocabulary
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-red-accent">
                              <div className="w-2 h-2 rounded-full bg-red-accent" /> Opportunity for correction
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-green-accent">
                              <div className="w-2 h-2 rounded-full bg-green-accent" /> Cohesive Linker
                            </div>
                          </div>
                        </motion.div>
                      )}

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
                    <button onClick={() => { setTestData(null); setFeedback(null); setPronunciationFeedback(null); }} className="btn btn-ghost w-full mt-8 border-violet-accent/20 text-violet-accent hover:bg-violet-accent hover:text-white transition-all">
                      Try Another Test
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
