"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  PenTool, 
  Mic, 
  BookOpen, 
  Headphones, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Trophy,
  Flag,
  Settings,
  HelpCircle,
  Volume2,
  Play,
  Pause
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { callGroq, callGroqJSON } from "@/lib/groq";
import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav } from "@/lib/audio";
import { cn, getBandColor } from "@/lib/utils";
import Markdown from "react-markdown";

import { ChartDisplay } from "@/components/ChartDisplay";

interface GeneratedTask {
  title: string;
  passage?: string;
  script?: string;
  prompt?: string;
  modelAnswer?: string;
  chartType?: string;
  chartData?: any;
  speakingParts?: {
    part1: string[];
    part2: string;
    part3: string[];
  };
  questions: {
    id: number;
    text: string;
    type: "mcq" | "gap-fill" | "tfng" | "matching";
    options?: string[];
    answer: string;
  }[];
}

const TESTS = [
  { 
    id: "writing-t1", 
    label: "Writing Task 1 (Academic)", 
    skill: "writing", 
    mins: 20, 
    icon: FileText, 
    color: "text-blue-secondary", 
    desc: "Analyze a chart, graph, or diagram and summarize the main features in at least 150 words.",
  },
  { 
    id: "writing-t2", 
    label: "Writing Task 2 (Essay)", 
    skill: "writing", 
    mins: 40, 
    icon: PenTool, 
    color: "text-violet-accent", 
    desc: "Write a formal essay of at least 250 words in response to a specific point of view, argument, or problem.",
  },
  { 
    id: "reading-full", 
    label: "Reading Full Section", 
    skill: "reading", 
    mins: 60, 
    icon: BookOpen, 
    color: "text-green-accent", 
    desc: "Three academic passages with 40 questions total. Tests reading for gist, main ideas, and detail.",
  },
  { 
    id: "listening-full", 
    label: "Listening Full Section", 
    skill: "listening", 
    mins: 30, 
    icon: Headphones, 
    color: "text-amber-accent", 
    desc: "Four recorded sections with 40 questions. Tests understanding of main ideas and specific factual information.",
  },
  { 
    id: "speaking-full", 
    label: "Speaking Full Simulation", 
    skill: "speaking", 
    mins: 15, 
    icon: Mic, 
    color: "text-pink-accent", 
    desc: "A three-part face-to-face interview with an AI examiner covering personal topics and abstract discussion.",
  },
  { 
    id: "full-mock", 
    label: "Full Mock Test (L, R, W, S)", 
    skill: "all", 
    mins: 180, 
    icon: Trophy, 
    color: "text-blue-primary", 
    desc: "The complete IELTS experience. Simulate the entire exam in one sitting with real-time AI scoring across all four skills.",
  },
];

export default function MockTests() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testTask, setTestTask] = useState<GeneratedTask | null>(null);
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [writingAnswer, setWritingAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [estimatedBand, setEstimatedBand] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [reviewedQuestions, setReviewedQuestions] = useState<number[]>([]);
  const [testStage, setTestStage] = useState<"listening" | "reading" | "writing" | "speaking" | "result" | null>(null);
  const [fullTestResults, setFullTestResults] = useState<any>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [speakingStage, setSpeakingStage] = useState<"part1" | "part2" | "part3" | null>(null);
  const [speakingPrompt, setSpeakingPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speakingPartIndex, setSpeakingPartIndex] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleNextSpeakingPart = () => {
    if (!testTask?.speakingParts) return;
    
    let nextPrompt = "";
    if (speakingStage === "part1") {
      if (speakingPartIndex < testTask.speakingParts.part1.length - 1) {
        setSpeakingPartIndex(prev => prev + 1);
        nextPrompt = testTask.speakingParts.part1[speakingPartIndex + 1];
        setSpeakingPrompt(nextPrompt);
      } else {
        setSpeakingStage("part2");
        nextPrompt = testTask.speakingParts.part2;
        setSpeakingPrompt(nextPrompt);
        setSpeakingPartIndex(0);
      }
    } else if (speakingStage === "part2") {
      setSpeakingStage("part3");
      setSpeakingPartIndex(0);
      nextPrompt = testTask.speakingParts.part3[0];
      setSpeakingPrompt(nextPrompt);
    } else if (speakingStage === "part3") {
      if (speakingPartIndex < testTask.speakingParts.part3.length - 1) {
        setSpeakingPartIndex(prev => prev + 1);
        nextPrompt = testTask.speakingParts.part3[speakingPartIndex + 1];
        setSpeakingPrompt(nextPrompt);
      } else {
        handleSubmit();
        return;
      }
    }

    if (nextPrompt) {
      generateAudio(nextPrompt, true);
    }
  };

  const toggleReview = () => {
    setReviewedQuestions(prev => 
      prev.includes(currentQuestion) 
        ? prev.filter(q => q !== currentQuestion) 
        : [...prev, currentQuestion]
    );
  };

  const generateAudio = async (text: string, isSpeaking: boolean = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsGeneratingAudio(true);
    setIsPlaying(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Split text into chunks of ~1000 characters for Gemini TTS limits
      const chunks = text.match(/.{1,1000}(?:\s|$)/g) || [text];
      const audioChunks: Int16Array[] = [];

      for (const chunk of chunks) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: isSpeaking ? `As an IELTS examiner, ask this question naturally: ${chunk}` : chunk }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: isSpeaking ? 'Fenrir' : 'Kore' } } },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const binaryString = atob(base64Audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
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
        const url = URL.createObjectURL(wavBlob);
        const audio = new Audio(url);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
        
        if (isSpeaking) {
          audio.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const generateTask = useCallback(async (test: any, stage?: string) => {
    setActiveTest(test);
    setIsGeneratingTask(true);
    setTestTask(null);
    setFeedback(null);
    setUserAnswers({});
    setWritingAnswer("");
    setCurrentQuestion(1);
    setSpeakingPartIndex(0);
    
    const currentSkill = stage || test.skill;
    setGenerationStep(`Analyzing ${currentSkill} requirements...`);
    
    // Set stage-specific timing for full mock test
    if (test.id === 'full-mock') {
      const stageMins: Record<string, number> = {
        listening: 30,
        reading: 60,
        writing: 60,
        speaking: 15
      };
      setTimeLeft(stageMins[currentSkill] * 60);
    } else {
      setTimeLeft(test.mins * 60);
    }

    try {
      setGenerationStep(`Generating challenging ${currentSkill} content...`);
      
      const prompt = `Generate a realistic, challenging Academic IELTS task EXCLUSIVELY for the ${currentSkill} section.
      Difficulty: Band 9.0 level. Use complex academic vocabulary and sophisticated grammatical structures.
      
      CRITICAL: ONLY return data for the ${currentSkill} skill. DO NOT include fields for other skills.
      
      If ${currentSkill} is 'writing': Provide a prompt (Task 1 or Task 2), chartType (if Task 1), chartData (if Task 1), and a modelAnswer (Band 9.0 level).
      If ${currentSkill} is 'reading': Provide a 1000-1200 word academic passage and 10 questions (mcq, gap-fill, tfng). Ensure questions are strictly answerable ONLY from the passage.
      If ${currentSkill} is 'listening': Provide a detailed script for a conversation or talk (at least 1500 words for a 5-8 minute experience) and 10 questions.
      If ${currentSkill} is 'speaking': Provide 3 parts of questions. Part 1: Personal (3-4 questions), Part 2: Cue Card (topic + 4 bullets), Part 3: Discussion (3-4 abstract questions). Also provide a modelAnswer for Part 2 (Cue Card).
      
      Return as JSON matching this structure:
      {
        "title": "string",
        "passage": "string (only if reading)",
        "script": "string (only if listening)",
        "prompt": "string (only if writing)",
        "modelAnswer": "string (only if writing or speaking)",
        "chartType": "string (only if writing task 1)",
        "chartData": "any (only if writing task 1)",
        "speakingParts": { "part1": ["string"], "part2": "string", "part3": ["string"] } (only if speaking),
        "questions": [
          { "id": number, "text": "string", "type": "mcq|gap-fill|tfng", "options": ["string"] (optional), "answer": "string" }
        ] (only if reading or listening)
      }`;
      
      const result = await callGroqJSON(prompt, "You are an expert IELTS content creator for the British Council. You strictly follow formatting constraints.");
      setTestTask(result as any);
      
      if (currentSkill === 'listening' && result.script) {
        setGenerationStep("Generating high-quality audio...");
        generateAudio(result.script);
      }

      if (currentSkill === 'speaking' && result.speakingParts) {
        setSpeakingStage("part1");
        const firstPrompt = result.speakingParts.part1[0];
        setSpeakingPrompt(firstPrompt);
        generateAudio(firstPrompt, true);
      }
    } catch (error) {
      console.error(error);
      setTestTask({ title: "Error", questions: [], prompt: "Failed to generate task. Please try again." });
    } finally {
      setIsGeneratingTask(false);
      setGenerationStep("");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !progress || !activeTest) return;
    setIsSubmitting(true);

    const isWriting = activeTest.skill === 'writing' || testStage === 'writing';
    const isSpeaking = activeTest.skill === 'speaking' || testStage === 'speaking';
    
    let submission = "";
    if (isWriting) submission = writingAnswer;
    else if (isSpeaking) submission = "Simulated Speaking Session Completed.";
    else submission = JSON.stringify(userAnswers);

    const systemPrompt = `You are a strict, world-class IELTS examiner. Analyze the student's performance.
    Task was: ${JSON.stringify(testTask)}
    Student Submission: ${submission}
    
    If Writing: Evaluate based on Task Response, Coherence/Cohesion, Lexical Resource, Grammatical Range/Accuracy.
    If Speaking: Evaluate based on Fluency/Coherence, Lexical Resource, Grammatical Range/Accuracy, Pronunciation.
    If Reading/Listening: Compare userAnswers to the correct answers in the task.
    
    Provide a detailed breakdown, an Overall Band (0-9), and a "Path to 9.0" section with specific, actionable steps to reach Band 9.0 from the current level.
    Format as Markdown. End with "Overall Band: X.X"`;

    try {
      const result = await callGroq(`Evaluate this IELTS ${activeTest.skill} submission.`, systemPrompt);
      
      const bandMatch = result.match(/Overall Band:\s*([0-9]\.?[0-9]?)/i);
      const band = bandMatch ? parseFloat(bandMatch[1]) : 6.0;

      if (activeTest.id === 'full-mock') {
        const nextStageMap: any = { listening: "reading", reading: "writing", writing: "speaking", speaking: "result" };
        const currentSkill = testStage || "listening";
        const nextStage = nextStageMap[currentSkill];
        
        const newResults = { ...fullTestResults, [currentSkill]: { band, feedback: result, modelAnswer: testTask?.modelAnswer } };
        setFullTestResults(newResults);
        
        if (nextStage === "result") {
          const avg = Object.values(newResults).reduce((acc: number, curr: any) => acc + curr.band, 0) / 4;
          setEstimatedBand(Math.round(avg * 2) / 2);
          setTestStage("result");
        } else {
          setTestStage(nextStage);
          generateTask(activeTest, nextStage);
        }
      } else {
        setFeedback(result);
        setEstimatedBand(band);

        if (band) {
          setFeedback(result);
          setEstimatedBand(band);
          
          const updated = {
            ...progress,
            bands: { ...progress.bands, [activeTest.skill]: band },
            bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: activeTest.skill }],
            mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: activeTest.label, band, skill: activeTest.skill }],
          };
          setProgress(updated);
          saveProgress(updated);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [activeTest, writingAnswer, userAnswers, progress, isSubmitting, testTask, testStage, fullTestResults, generateTask]);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  useEffect(() => {
    let timer: any;
    if (activeTest && timeLeft > 0 && !feedback) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeTest && !feedback) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [activeTest, timeLeft, feedback, handleSubmit]);

  const startTest = (test: any) => {
    if (test.id === 'full-mock') {
      setTestStage("listening");
      generateTask(test, "listening");
    } else {
      generateTask(test);
    }
  };

  if (!progress) return null;

  if (activeTest) {
    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
      <div className="fixed inset-0 bg-[#F4F7F9] z-[200] flex flex-col text-[#333]">
        {/* IELTS Official Style Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-primary rounded flex items-center justify-center text-white font-black text-xs">I</div>
              <span className="font-bold text-sm tracking-tight text-gray-800 uppercase">IELTS Academic</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Candidate</span>
              <span className="text-xs font-bold text-gray-700 leading-none">{progress.name || "Guest User"}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {testStage && testStage !== "result" && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-dim/20 text-blue-secondary rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-secondary/20">
                Stage: {testStage}
              </div>
            )}
            {testTask && !feedback && (
              <div className={cn(
                "flex items-center gap-3 px-4 py-1.5 rounded-lg border-2 font-mono text-lg font-black transition-colors",
                timeLeft < 300 ? "border-red-500 text-red-600 bg-red-50" : "border-gray-200 text-gray-700 bg-gray-50"
              )}>
                <Clock size={18} /> {formatTime(timeLeft)}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><Settings size={18} /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><HelpCircle size={18} /></button>
              <button 
                onClick={() => { setActiveTest(null); setTestTask(null); setFeedback(null); }}
                className="ml-4 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded uppercase tracking-wider transition-colors"
              >
                Exit Test
              </button>
            </div>
          </div>
        </header>

        {/* Main Test Area */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {isGeneratingTask ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white">
              <div className="max-w-md w-full text-center space-y-8 p-12">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-4 border-blue-primary/10 rounded-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={64} className="animate-spin text-blue-primary" />
                  </div>
                  <div className="w-32 h-32 mx-auto flex items-center justify-center">
                    <PenTool size={32} className="text-blue-primary animate-bounce" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-bold text-gray-800">Question Generator</h3>
                  <p className="text-sm text-gray-500 font-medium animate-pulse">{generationStep}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-primary"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !feedback || (testStage && testStage !== "result") ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Pane: Task/Passage */}
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 bg-white overflow-y-auto p-4 md:p-8 custom-scrollbar h-[40vh] md:h-full">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold text-gray-800">{testTask?.title || activeTest.label}</h2>
                    <button 
                      onClick={toggleReview}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors",
                        reviewedQuestions.includes(currentQuestion) ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                      )}
                    >
                      <Flag size={12} fill={reviewedQuestions.includes(currentQuestion) ? "currentColor" : "none"} /> Review
                    </button>
                  </div>

                  {(activeTest.skill === 'listening' || testStage === 'listening') && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-primary/10 rounded-full flex items-center justify-center text-blue-primary">
                            {isGeneratingAudio ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800">
                              {isGeneratingAudio ? "Preparing Audio..." : "Audio Recording Ready"}
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase font-bold">
                              {isGeneratingAudio ? "AI is generating the script" : "Listen carefully (Plays once in real exam)"}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={toggleAudio}
                          disabled={isGeneratingAudio || !audioRef.current}
                          className="w-12 h-12 bg-blue-primary hover:bg-blue-primary/90 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                        >
                          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                        </button>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-primary"
                          initial={{ width: 0 }}
                          animate={{ width: isPlaying ? "100%" : "0%" }}
                          transition={{ duration: 600, ease: "linear" }}
                        />
                      </div>
                    </div>
                  )}

                  {testTask?.speakingParts && (
                    <div className="space-y-8">
                      <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative group">
                        <img 
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                          alt="AI Examiner" 
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                          <div className={cn("w-3 h-3 rounded-full animate-pulse", isRecording ? "bg-red-500" : "bg-green-500")} />
                          <span className="text-white font-bold text-xs uppercase tracking-widest">
                            {isRecording ? "Recording..." : "Aria (Examiner) - Waiting"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-blue-primary/5 border border-blue-primary/10 rounded-2xl p-8 text-center space-y-4">
                        <div className="text-[10px] font-bold text-blue-primary uppercase tracking-[0.2em]">
                          Speaking {speakingStage?.toUpperCase()}
                        </div>
                        <h3 className="text-xl font-serif font-bold text-gray-800 italic">
                          "{speakingPrompt}"
                        </h3>
                        <p className="text-xs text-gray-500">
                          {speakingStage === 'part2' ? "You have 1 minute to prepare. Speak for 2 minutes." : "Answer the question naturally."}
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <button 
                          onMouseDown={() => setIsRecording(true)}
                          onMouseUp={() => setIsRecording(false)}
                          className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl",
                            isRecording ? "bg-red-500 scale-110 shadow-red-500/20" : "bg-blue-primary hover:bg-blue-primary/90 shadow-blue-primary/20"
                          )}
                        >
                          <Mic size={32} className="text-white" />
                        </button>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Hold to Speak
                        </p>
                        
                        <button 
                          onClick={handleNextSpeakingPart}
                          className="mt-4 px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-xs uppercase tracking-widest"
                        >
                          {speakingStage === 'part3' && speakingPartIndex === (testTask.speakingParts.part3.length - 1) ? "Finish Speaking" : "Next Question"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-serif">
                    {testTask?.passage && (activeTest.skill === 'reading' || testStage === 'reading') && <Markdown>{testTask.passage}</Markdown>}
                    {testTask?.prompt && (activeTest.skill === 'writing' || testStage === 'writing') && <Markdown>{testTask.prompt}</Markdown>}
                    {!testTask && <Markdown>{activeTest.desc}</Markdown>}
                  </div>

                  {testTask?.chartData && (activeTest.skill === 'writing' || testStage === 'writing') && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <ChartDisplay type={testTask.chartType || "line"} data={testTask.chartData} />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Pane: Input */}
              <div className="w-full md:w-1/2 bg-[#F4F7F9] overflow-y-auto p-4 md:p-8 custom-scrollbar h-[60vh] md:h-full">
                <div className="max-w-2xl mx-auto h-full flex flex-col">
                  {testTask && (
                    <>
                      <div className="flex-1 relative mb-6">
                        {(activeTest.skill === 'writing' || testStage === 'writing') ? (
                          <div className="h-full flex flex-col">
                            <textarea
                              value={writingAnswer}
                              onChange={(e) => setWritingAnswer(e.target.value)}
                              placeholder="Type your essay response here..."
                              className="flex-1 w-full bg-white border border-gray-200 rounded-xl p-8 text-gray-800 focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary outline-none resize-none font-serif leading-relaxed text-lg shadow-sm"
                            />
                            <div className="mt-4 flex items-center justify-between">
                              <div className="px-3 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Word Count: {writingAnswer.trim() ? writingAnswer.trim().split(/\s+/).length : 0}
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase">Min: {activeTest.id.includes('t1') ? 150 : 250} words</div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {testTask.questions.map((q, idx) => (
                              <div 
                                key={q.id} 
                                className={cn(
                                  "p-6 bg-white border rounded-xl transition-all",
                                  currentQuestion === q.id ? "border-blue-primary ring-1 ring-blue-primary/10 shadow-md" : "border-gray-200"
                                )}
                                onClick={() => setCurrentQuestion(q.id)}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                    {q.id}
                                  </div>
                                  <div className="flex-1 space-y-4">
                                    <p className="text-sm font-bold text-gray-800">{q.text}</p>
                                    
                                    {q.type === 'mcq' && q.options && (
                                      <div className="grid grid-cols-1 gap-2">
                                        {q.options.map(opt => (
                                          <button
                                            key={opt}
                                            onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                            className={cn(
                                              "text-left px-4 py-3 rounded-lg border text-sm transition-all",
                                              userAnswers[q.id] === opt 
                                                ? "bg-blue-primary/5 border-blue-primary text-blue-primary font-bold" 
                                                : "bg-white border-gray-100 hover:border-gray-300 text-gray-600"
                                            )}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    {q.type === 'gap-fill' && (
                                      <input 
                                        type="text"
                                        value={userAnswers[q.id] || ""}
                                        onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        placeholder="Type your answer..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-primary/20 outline-none"
                                      />
                                    )}

                                    {q.type === 'tfng' && (
                                      <div className="flex gap-2">
                                        {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                                          <button
                                            key={opt}
                                            onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                            className={cn(
                                              "flex-1 py-2 rounded-lg border text-[10px] font-bold transition-all",
                                              userAnswers[q.id] === opt 
                                                ? "bg-blue-primary border-blue-primary text-white" 
                                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                            )}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-auto">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="flex-1 bg-blue-primary hover:bg-blue-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Finalizing Submission...</> : "Finish Section"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : testStage === "result" ? (
            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-12 custom-scrollbar">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-blue-primary rounded-3xl rotate-12 flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-primary/20">
                    <Trophy size={48} className="-rotate-12" />
                  </div>
                  <h2 className="text-5xl font-serif font-bold text-gray-900">Test Report Form</h2>
                  <p className="text-gray-500 text-lg">Official AI-generated performance analysis</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {['Listening', 'Reading', 'Writing', 'Speaking'].map((skill) => {
                    const data = fullTestResults[skill.toLowerCase()];
                    return (
                      <div key={skill} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{skill}</div>
                        <div className="text-4xl font-black text-gray-900 mb-2">
                          {data ? data.band : "—"}
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-primary"
                            initial={{ width: 0 }}
                            animate={{ width: data ? `${(data.band / 9) * 100}%` : 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-1 bg-gray-900 p-12 text-white flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-serif font-bold mb-2">Overall Band</h3>
                        <p className="text-gray-400 text-sm">Based on the average of all sections</p>
                      </div>
                      <div className="py-12">
                        <div className="text-9xl font-black text-blue-primary leading-none">
                          {estimatedBand || "6.5"}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">CEFR Level</span>
                          <span className="font-bold">C1 Advanced</span>
                        </div>
                        <div className="h-px bg-white/10" />
                        <p className="text-xs text-gray-400 italic">
                          "Your performance indicates a strong command of the language with some minor inaccuracies."
                        </p>
                      </div>
                    </div>
                    <div className="lg:col-span-2 p-12 space-y-8 overflow-y-auto max-h-[600px] custom-scrollbar">
                      <h3 className="text-xl font-bold text-gray-800">Detailed Feedback</h3>
                      {Object.entries(fullTestResults).map(([skill, data]: [string, any]) => (
                        <div key={skill} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-primary/10 flex items-center justify-center text-blue-primary font-bold text-xs uppercase">
                              {skill[0]}
                            </div>
                            <h4 className="font-bold text-gray-700 uppercase tracking-widest text-xs">{skill} Analysis</h4>
                          </div>
                          <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <Markdown>{data.feedback}</Markdown>
                          </div>
                          {data.modelAnswer && (
                            <div className="bg-blue-primary/5 p-6 rounded-2xl border border-blue-primary/10 space-y-3">
                              <h5 className="text-[10px] font-black text-blue-primary uppercase tracking-widest">Band 9.0 Model Answer</h5>
                              <div className="prose prose-sm max-w-none text-gray-700 italic">
                                <Markdown>{data.modelAnswer}</Markdown>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => window.print()}
                    className="px-8 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <FileText size={18} /> Download PDF
                  </button>
                  <button 
                    onClick={() => { setActiveTest(null); setFeedback(null); setTestStage(null); }} 
                    className="px-12 py-4 bg-blue-primary text-white font-bold rounded-2xl hover:bg-blue-primary/90 shadow-xl shadow-blue-primary/20 transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-white p-12 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-green-500/20">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-gray-800">Test Completed</h2>
                  <p className="text-gray-500">Your performance has been evaluated by our AI Examiner.</p>
                  
                  {estimatedBand && (
                    <div className="inline-flex flex-col items-center p-6 bg-blue-50 border border-blue-100 rounded-3xl mt-4">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-2">Estimated Overall Band</span>
                      <span className="text-6xl font-black text-blue-primary leading-none">{estimatedBand}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} /> Performance Analysis
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <Markdown>{feedback}</Markdown>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Trophy size={14} /> Next Steps
                    </h4>
                    <div className="space-y-4">
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                        <div className="font-bold text-gray-800 mb-1">Review Mistakes</div>
                        <p className="text-xs text-gray-500">Go through the detailed feedback to understand your grammatical errors.</p>
                      </div>
                      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                        <div className="font-bold text-gray-800 mb-1">Practice Vocabulary</div>
                        <p className="text-xs text-gray-500">Use the Vocabulary Builder to learn academic words used in your feedback.</p>
                      </div>
                      <button onClick={() => { setActiveTest(null); setFeedback(null); }} className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-all">
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* CDI Style Navigation Bar */}
        {!feedback && (
          <footer className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-1 md:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button 
                  key={n}
                  onClick={() => setCurrentQuestion(n)}
                  className={cn(
                    "w-7 h-7 md:w-8 md:h-8 rounded text-[9px] md:text-[10px] font-bold transition-all relative flex-shrink-0",
                    currentQuestion === n ? "bg-blue-primary text-white shadow-md shadow-blue-primary/20" : "bg-gray-100 text-gray-400 hover:bg-gray-200",
                    reviewedQuestions.includes(n) && "border-2 border-amber-400"
                  )}
                >
                  {n}
                  {reviewedQuestions.includes(n) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </button>
              ))}
              <div className="w-6 h-8 flex items-center justify-center text-gray-300">...</div>
              <button className="w-8 h-8 bg-gray-100 text-gray-400 rounded text-[10px] font-bold hover:bg-gray-200 flex-shrink-0">40</button>
            </div>
            <div className="flex items-center gap-2 md:gap-4 ml-4">
              <button 
                onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))}
                className="px-3 md:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[9px] md:text-[10px] font-bold rounded uppercase tracking-wider transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentQuestion(prev => Math.min(40, prev + 1))}
                className="px-3 md:px-6 py-2 bg-blue-primary hover:bg-blue-primary/90 text-white text-[9px] md:text-[10px] font-bold rounded uppercase tracking-wider shadow-lg shadow-blue-primary/20 transition-all"
              >
                Next
              </button>
            </div>
          </footer>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1">📝 Mock Test Centre</h2>
        <p className="text-sm text-text-muted">Exam-conditions practice with AI band-score feedback</p>
      </div>

      {progress.mockHistory && progress.mockHistory.length > 0 && (
        <div className="card border-blue-dim/30 bg-blue-dim/5">
          <h4 className="text-xs font-bold text-blue-secondary uppercase tracking-widest mb-4">Recent Results</h4>
          <div className="space-y-3">
            {progress.mockHistory.slice(-3).reverse().map((test, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-bg-1 rounded-xl border border-border">
                <div>
                  <div className="text-sm font-bold">{test.test}</div>
                  <div className="text-[10px] text-text-muted font-medium">{test.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-text-muted font-bold uppercase">{test.skill}</span>
                  <div className="bg-blue-dim text-blue-secondary px-3 py-1 rounded-lg text-sm font-black">Band {test.band}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TESTS.map((test) => (
          <button
            key={test.id}
            onClick={() => startTest(test)}
            className="card text-left hover:border-blue-primary group flex flex-col h-full relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <div className="px-2 py-1 bg-blue-primary/10 text-blue-primary text-[10px] font-bold rounded uppercase tracking-widest">
                GROQ AI
              </div>
            </div>
            <div className={cn("p-3 rounded-2xl bg-bg-2 w-fit mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3", test.color)}>
              <test.icon size={28} />
            </div>
            <div className="font-bold text-base text-text-primary mb-1">{test.label}</div>
            <div className="text-xs text-text-muted mb-6 flex-1">{test.desc}</div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="tag tag-gray">⏱ {test.mins} min</span>
                <span className="tag tag-blue">Academic</span>
              </div>
              <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>

      <div className="card bg-bg-2 border-dashed border-border-2 flex items-center gap-4 p-6">
        <div className="w-12 h-12 rounded-full bg-bg-3 flex items-center justify-center text-blue-secondary flex-shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary mb-1">More tests coming soon</h4>
          <p className="text-xs text-text-muted">We&apos;re adding full-length Reading and Listening sections based on Cambridge 19.</p>
        </div>
      </div>
    </div>
  );
}
