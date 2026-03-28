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
  Sparkles
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq, callGroqChat } from "@/lib/groq";
import { GoogleGenAI, Modality } from "@google/genai";
import ReactMarkdown from "react-markdown";
import SpeakingLiveSession from "./SpeakingLiveSession";

const SPEAKING_SAMPLES = [
  {
    id: "ss1",
    part: 1,
    topic: "Hometown",
    question: "Where is your hometown?",
    answer: "My hometown is a vibrant city located in the southern part of the country. It's famous for its historical landmarks and delicious local cuisine. I've lived there all my life, and I really enjoy the sense of community there.",
    analysis: "This answer is direct and provides relevant details. It uses good vocabulary like 'vibrant' and 'historical landmarks'."
  },
  {
    id: "ss2",
    part: 2,
    topic: "A memorable journey",
    question: "Describe a memorable journey you have taken.",
    answer: "One of the most memorable journeys I've ever had was a road trip through the mountains last summer. I went with a group of close friends, and we spent a week exploring different trails and camping under the stars. The scenery was absolutely breathtaking, and the experience brought us all much closer together.",
    analysis: "The speaker uses a range of narrative tenses and descriptive adjectives like 'memorable' and 'breathtaking'. The structure follows the cue card prompts well."
  }
];

interface Topic {
  id: string;
  title: string;
  bullets: string[];
  hints: string;
}

const SPEAKING_TOPICS: Topic[] = [
  {
    id: "t1",
    title: "Describe a person who has influenced you.",
    bullets: [
      "Who this person is",
      "How you know them",
      "What qualities they have",
      "Explain why they influenced you"
    ],
    hints: "Think about a teacher, family member, or mentor. Focus on specific qualities like resilience or kindness."
  },
  {
    id: "t2",
    title: "Describe a place in nature you have visited.",
    bullets: [
      "Where this place is",
      "When you visited it",
      "What you did there",
      "Explain how you felt about it"
    ],
    hints: "Use sensory details: what you saw, heard, and felt. Use adjectives like 'tranquil', 'breathtaking', or 'serene'."
  },
  {
    id: "t3",
    title: "Describe a useful piece of technology you own.",
    bullets: [
      "What it is",
      "How long you have had it",
      "What you use it for",
      "Explain why it is useful to you"
    ],
    hints: "Don't just say 'smartphone'. Think about a specific app, a laptop, or even a kitchen appliance. Focus on utility."
  },
  {
    id: "t4",
    title: "Describe a time you helped someone.",
    bullets: [
      "Who you helped",
      "What the situation was",
      "How you helped them",
      "Explain how you felt about it"
    ],
    hints: "Use narrative tenses (Past Simple, Past Continuous). Focus on the emotional outcome and the impact of your help."
  },
  {
    id: "t5",
    title: "Describe a book or film that had a significant impact on you.",
    bullets: [
      "What it was about",
      "When you read/watched it",
      "Why it affected you",
      "Explain if you would recommend it to others"
    ],
    hints: "Focus on the theme or message. Use words like 'thought-provoking', 'inspiring', or 'eye-opening'."
  },
  {
    id: "t6",
    title: "Describe a city you would like to visit in the future.",
    bullets: [
      "Where it is",
      "What it is famous for",
      "What you would do there",
      "Explain why you want to visit this city"
    ],
    hints: "Think about architecture, culture, or food. Use future forms like 'I would love to...' or 'I am keen on visiting...'"
  },
  {
    id: "t7",
    title: "Describe a memorable event from your childhood.",
    bullets: [
      "What the event was",
      "How old you were",
      "Who was with you",
      "Explain why it was memorable"
    ],
    hints: "Focus on emotions and specific details. Use childhood vocabulary like 'nostalgic', 'vivid memory', or 'carefree'."
  },
  {
    id: "t8",
    title: "Describe a hobby you enjoy doing in your free time.",
    bullets: [
      "What the hobby is",
      "How you started it",
      "How often you do it",
      "Explain why you enjoy it"
    ],
    hints: "Talk about the benefits of the hobby, such as stress relief or skill-building. Use 'passionate about' or 'engrossed in'."
  },
  {
    id: "t9",
    title: "Describe a piece of art you like.",
    bullets: [
      "What it is",
      "Where you saw it",
      "What it looks like",
      "Explain why you like it"
    ],
    hints: "It could be a painting, sculpture, or even a mural. Use descriptive language like 'abstract', 'vibrant', or 'intricate'."
  },
  {
    id: "t10",
    title: "Describe a time you learned a new skill.",
    bullets: [
      "What the skill was",
      "How you learned it",
      "Who helped you",
      "Explain how you felt after learning it"
    ],
    hints: "Focus on the challenge and the reward. Use 'steep learning curve', 'mastered', or 'proficient'."
  },
  {
    id: "t11",
    title: "Describe a gift you received that was special to you.",
    bullets: [
      "What the gift was",
      "Who gave it to you",
      "When you received it",
      "Explain why it was special"
    ],
    hints: "Focus on the sentimental value. Use words like 'cherished', 'thoughtful', or 'meaningful'."
  },
  {
    id: "t12",
    title: "Describe a sport you enjoy watching or playing.",
    bullets: [
      "What the sport is",
      "How it is played",
      "Why you like it",
      "Explain its popularity in your country"
    ],
    hints: "Talk about the rules, the excitement, and the community aspect. Use 'competitive', 'teamwork', or 'adrenaline rush'."
  },
  {
    id: "t13",
    title: "Describe a historical building you have visited.",
    bullets: [
      "Where it is",
      "What it looks like",
      "What its history is",
      "Explain why you found it interesting"
    ],
    hints: "Use architectural terms like 'facade', 'heritage', or 'ancient'. Focus on the significance of the building."
  },
  {
    id: "t14",
    title: "Describe a time you had a disagreement with someone.",
    bullets: [
      "Who it was with",
      "What the disagreement was about",
      "How you resolved it",
      "Explain what you learned from the experience"
    ],
    hints: "Focus on communication and conflict resolution. Use 'compromise', 'perspective', or 'reconciliation'."
  },
  {
    id: "t15",
    title: "Describe a website you visit frequently.",
    bullets: [
      "What the website is",
      "How you found it",
      "What you use it for",
      "Explain why you visit it often"
    ],
    hints: "Talk about the features, the layout, and the content. Use 'user-friendly', 'informative', or 'addictive'."
  },
  {
    id: "t16",
    title: "Describe a job you would like to have in the future.",
    bullets: [
      "What the job is",
      "What qualifications you need",
      "What the daily tasks would be",
      "Explain why you are interested in this job"
    ],
    hints: "Think about your passions and career goals. Use 'ambitious', 'fulfilling', or 'career path'."
  },
  {
    id: "t17",
    title: "Describe a festival or celebration in your country.",
    bullets: [
      "What the festival is",
      "When it takes place",
      "What people do during the festival",
      "Explain why it is important"
    ],
    hints: "Focus on traditions, food, and atmosphere. Use 'festive', 'cultural heritage', or 'communal'."
  },
  {
    id: "t18",
    title: "Describe a time you were surprised by something.",
    bullets: [
      "What the surprise was",
      "When it happened",
      "How you felt",
      "Explain why it was a surprise"
    ],
    hints: "Use descriptive language for emotions. Use 'unexpected', 'astonished', or 'speechless'."
  },
  {
    id: "t19",
    title: "Describe a piece of clothing you wear often.",
    bullets: [
      "What it is",
      "Where you got it",
      "When you wear it",
      "Explain why you like it"
    ],
    hints: "Talk about comfort, style, or a special memory. Use 'versatile', 'fashionable', or 'sentimental'."
  },
  {
    id: "t20",
    title: "Describe a journey you went on that was memorable.",
    bullets: [
      "Where you went",
      "How you traveled",
      "Who was with you",
      "Explain why it was memorable"
    ],
    hints: "Focus on the scenery, the experiences, and the people. Use 'scenic', 'adventure', or 'unforgettable'."
  },
  {
    id: "t21",
    title: "Describe a person you admire for their success.",
    bullets: [
      "Who the person is",
      "What they have achieved",
      "How they became successful",
      "Explain why you admire them"
    ],
    hints: "Focus on hard work, determination, and impact. Use 'inspirational', 'role model', or 'accomplished'."
  }
];


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

    const systemPrompt = `You are a certified IELTS Speaking Examiner. 
    Mode: ${mode === "part1" ? "Part 1 (Introduction & Interview)" : mode === "part2" ? "Part 2 (Long Turn/Cue Card)" : "Part 3 (Discussion)"}.
    Conduct a realistic speaking test. 
    Part 1: Ask 3-4 simple questions about hobbies, home, or work.
    Part 2: Provide a cue card topic and ask the student to speak for 2 minutes.
    Part 3: Ask follow-up, abstract questions related to the Part 2 topic.
    Be professional, encouraging, and strictly follow IELTS standards.
    Start by introducing yourself and asking the first question.`;

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
    const systemPrompt = `You are a certified IELTS Speaking Examiner. Analyze the following IELTS speaking test transcript. 
    Provide a detailed band score (0-9) and feedback on:
    1. Fluency and Coherence: (e.g., hesitation, repetition, use of connectives)
    2. Lexical Resource: (e.g., range of vocabulary, precision, collocations)
    3. Grammatical Range and Accuracy: (e.g., complex structures, error frequency)
    4. Pronunciation Analysis: (Analyze potential pronunciation issues based on the transcript's flow, rhythm, and word choice. Suggest specific phonemes or stress patterns to practice.)
    
    Provide specific examples from the transcript for each category.
    Format your response with clear headings and an Overall Band score at the end.`;

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
          bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: "speaking" }]
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
        <div className="card card-blue">
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

        <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 p-3 md:p-4 bg-bg-2 rounded-2xl border border-border-2 mb-3 md:mb-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "flex flex-col max-w-[90%] md:max-w-[85%]",
              m.role === "user" ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "px-3 md:px-4 py-2 md:py-3 rounded-2xl text-xs md:text-sm leading-relaxed",
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
              className="flex-1 bg-bg border border-border-2 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm text-text-primary focus:border-blue-primary outline-none transition-colors"
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

        <div className="card card-blue">
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
          <div className="card text-center py-10 space-y-6 border-blue-primary">
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
            className="btn btn-primary bg-blue-primary/10 text-blue-primary hover:bg-blue-primary/20 border-blue-primary/30 w-full py-4 rounded-2xl flex items-center justify-center gap-3 group"
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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">🎤 Speaking Center</h2>
          <p className="text-sm text-text-muted">Master all 3 parts of the IELTS speaking test</p>
        </div>
        <div className="flex bg-bg-2 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setActiveModuleTab("practice")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeModuleTab === "practice" ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            Practice
          </button>
          <button 
            onClick={() => setActiveModuleTab("samples")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeModuleTab === "samples" ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            Sample Q&A
          </button>
          <button 
            onClick={() => setActiveModuleTab("ai-test")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeModuleTab === "ai-test" ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            AI Practice Test
          </button>
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

      {/* Topic of the Day */}
      <div className="card bg-gradient-to-br from-blue-dim/20 to-bg-1 border-blue-primary/30 p-5 md:p-6">
        <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Speaking Topic of the Day
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div>
            <h3 className="font-serif text-2xl md:text-3xl font-black text-text-primary uppercase tracking-tighter mb-1">Describe a person who has influenced you.</h3>
            <p className="text-xs md:text-sm text-text-muted italic mb-3 md:mb-4">Part 2 Cue Card · High Priority</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="tag tag-blue">Inspirational</span>
              <span className="tag tag-blue">Role Model</span>
              <span className="tag tag-blue">Resilience</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTopic(SPEAKING_TOPICS[0])}
            className="btn btn-primary bg-blue-primary hover:bg-blue-primary/80 shadow-blue-primary/20 w-full md:w-auto text-xs md:text-sm"
          >
            Practice Now <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Vocabulary Booster & Idioms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-bg-2 border-border-2 p-5">
          <div className="flex items-center gap-2 text-amber-accent font-bold text-[10px] uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Vocabulary Booster
          </div>
          <div className="space-y-3">
              {[
                { word: "Ubiquitous", meaning: "Present, appearing, or found everywhere.", band: "9.0" },
                { word: "Mitigate", meaning: "Make less severe, serious, or painful.", band: "9.0" },
                { word: "Pragmatic", meaning: "Dealing with things sensibly and realistically.", band: "9.0" }
              ].map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-bg-1 rounded-xl border border-border">
                <div>
                  <div className="text-sm font-bold text-text-primary">{v.word}</div>
                  <div className="text-[10px] text-text-muted">{v.meaning}</div>
                </div>
                <div className="bg-amber-dim text-amber-accent px-2 py-1 rounded text-[10px] font-black">Band {v.band}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-bg-2 border-border-2 p-5">
          <div className="flex items-center gap-2 text-violet-accent font-bold text-[10px] uppercase tracking-widest mb-4">
            <MessageSquare size={14} /> Common Idioms
          </div>
          <div className="space-y-3">
            {[
              { idiom: "A piece of cake", meaning: "Something very easy to do.", usage: "The exam was a piece of cake." },
              { idiom: "Break the ice", meaning: "Do or say something to relieve tension.", usage: "He told a joke to break the ice." },
              { idiom: "Under the weather", meaning: "Feeling slightly unwell.", usage: "I'm feeling a bit under the weather today." }
            ].map((id, i) => (
              <div key={i} className="p-3 bg-bg-1 rounded-xl border border-border">
                <div className="text-sm font-bold text-text-primary">{id.idiom}</div>
                <div className="text-[10px] text-text-muted mb-1">{id.meaning}</div>
                <div className="text-[9px] text-violet-accent italic">"{id.usage}"</div>
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Part 2 Cue Cards</h3>
            </div>
            <div className="space-y-3">
              {SPEAKING_TOPICS.map((topic) => (
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
            <div key={sample.id} className="card bg-bg-2 border-border-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="tag tag-blue">Part {sample.part}</span>
                  <h3 className="font-bold text-text-primary">{sample.topic}</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Question</div>
                  <div className="text-sm font-bold text-text-primary">{sample.question}</div>
                </div>
                <div className="p-4 bg-bg-1 rounded-xl border border-border-2 text-sm text-text-secondary italic leading-relaxed">
                  <div className="text-[10px] font-bold text-blue-primary uppercase tracking-widest mb-2">Model Answer</div>
                  "{sample.answer}"
                </div>
                <div className="p-4 bg-violet-accent/5 border border-violet-accent/20 rounded-xl">
                  <div className="text-[10px] font-bold text-violet-accent uppercase tracking-widest mb-1">Examiner Analysis</div>
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
          <div className="w-20 h-20 rounded-3xl bg-violet-accent/10 text-violet-accent flex items-center justify-center">
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
