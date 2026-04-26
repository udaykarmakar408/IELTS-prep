"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Volume2,
  FileText,
  PenTool,
  Loader2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Bot,
  ClipboardList,
  Type,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  BookOpenCheck,
  Headphones
} from "lucide-react";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { calculateListeningBand, calculateReadingBand } from "@/lib/ielts";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq, callGroqJSON } from "@/lib/groq";
import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav } from "@/lib/audio";
import ReactMarkdown from "react-markdown";

import { LISTENING_SECTIONS, LISTENING_SAMPLES, ListeningSection, Sample } from "@/lib/data/ielts_content";


export default function Listening() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeModuleTab, setActiveModuleTab] = useState<"practice" | "samples" | "ai-test">("practice");
  const [activeSection, setActiveSection] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [notes, setNotes] = useState("");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [highlightedVocab, setHighlightedVocab] = useState<string[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [isFullTest, setIsFullTest] = useState(false);
  const [fullTestSections, setFullTestSections] = useState<ListeningSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isGeneratingFullTest, setIsGeneratingFullTest] = useState(false);
  const [activeTab, setActiveTab] = useState<"questions" | "script" | "feedback" | "notes" | "transcript" | "vocab">("questions");

  const [dynamicSections, setDynamicSections] = useState<ListeningSection[]>(LISTENING_SECTIONS);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  useEffect(() => {
    // Automatically generate more content on mount to provide a dynamic experience
    if (dynamicSections.length <= LISTENING_SECTIONS.length) {
      generateMoreSections();
    }
  }, []);

  const generateMoreSections = async () => {
    setIsGeneratingMore(true);
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string", enum: ["Part 1", "Part 2", "Part 3", "Part 4"] },
          difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
          script: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                q: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                answer: { type: "string" },
                explanation: { type: "string" }
              },
              required: ["id", "q", "answer"]
            }
          }
        },
        required: ["id", "title", "type", "difficulty", "script", "questions"]
      }
    };

    const difficulty = progress?.difficulty || "intermediate";
    const prompt = `Generate 4 new unique IELTS Listening practice sections (one for each Part 1-4) tailored for a ${difficulty} level student. 
    (Beginner: Clearer audio scenarios, more predictable answers.
     Intermediate: Standard exam complexity.
     Advanced: Complex accents, heavy use of distractors, subtle paraphrasing).
    
    Ensure high academic quality and varied topics. 
    Part 1: Social context, 2 speakers.
    Part 2: Social context, 1 speaker.
    Part 3: Educational/Training context, 2-4 speakers.
    Part 4: Academic lecture, 1 speaker.`;

    try {
      const result = await callGroqJSON(prompt, schema);
      if (result && Array.isArray(result)) {
        const newSections = result.map((s: any) => ({
          ...s,
          id: `dynamic-${Date.now()}-${s.id}`
        }));
        setDynamicSections(prev => [...prev, ...newSections]);
      }
    } catch (error) {
      console.error("Failed to generate more sections:", error);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const highlightVocab = async () => {
    if (!activeSection) return;
    setIsHighlighting(true);
    const systemPrompt = `You are an IELTS vocabulary expert. Extract 5-8 high-level (Band 9.0) vocabulary words or phrases from the following transcript.
    Return ONLY a JSON array of strings.
    Example: ["ubiquitous", "bioaccumulation", "mitigate"]`;

    try {
      const result = await callGroq(activeSection.script, systemPrompt);
      setHighlightedVocab(JSON.parse(result || "[]"));
    } catch (error) {
      console.error(error);
    } finally {
      setIsHighlighting(false);
    }
  };
  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const generateFullTest = async () => {
    setIsGeneratingFullTest(true);
    setFeedback(null);
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          difficulty: { type: "string" },
          script: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["completion", "multiple-choice", "matching", "short-answer"] },
                q: { type: "string" },
                options: { type: "array", items: { type: "string" }, description: "Only for multiple-choice" },
                answer: { type: "string" },
                explanation: { type: "string" }
              },
              required: ["id", "type", "q", "answer"]
            }
          }
        },
        required: ["id", "title", "type", "difficulty", "script", "questions"]
      }
    };

    const difficulty = progress?.difficulty || "intermediate";
    const prompt = `Generate a full-length IELTS Listening test with 4 sections tailored for ${difficulty} level. 
    Difficulty Focus: ${difficulty === "beginner" ? "Focus on clarity and common social interactions" : difficulty === "advanced" ? "Extreme complexity, fast speech, and complex academic topics" : "Standard Cambridge IELTS complexity"}.
    
    Section 1: A conversation between two people in a social context.
    Section 2: A monologue in a social context.
    Section 3: A conversation between 2-4 people in an academic context.
    Section 4: A monologue on an academic subject.`;

    try {
      const sections = await callGroqJSON(prompt, schema, "You are an IELTS Listening expert.");
      setFullTestSections(sections);
      setIsFullTest(true);
      setCurrentSectionIndex(0);
      setActiveSection(sections[0]);
      
      const intro = `Part 1. You will hear a conversation between two people in a social context. First, you have some time to look at questions 1 to 10. [PAUSE] Now listen carefully and answer questions 1 to 10.`;
      const outro = `That is the end of Part 1. You now have half a minute to check your answers. [PAUSE]`;
      generateAudio(`${intro}\n\n${sections[0].script}\n\n${outro}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingFullTest(false);
    }
  };

  const nextSection = () => {
    if (currentSectionIndex < fullTestSections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setActiveSection(fullTestSections[nextIndex]);
      setUserAnswers({});
      setShowResults(false);
      setAudioUrl(null);
      
      const intro = `Part ${nextIndex + 1}. You will hear a ${fullTestSections[nextIndex].title}. First, you have some time to look at questions 1 to 10. [PAUSE] Now listen carefully and answer questions 1 to 10.`;
      const outro = `That is the end of Part ${nextIndex + 1}. You now have half a minute to check your answers. [PAUSE]`;
      generateAudio(`${intro}\n\n${fullTestSections[nextIndex].script}\n\n${outro}`);
    } else {
      setIsFullTest(false);
      setActiveSection(null);
    }
  };

  const generateAudio = useCallback(async (text: string) => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    try {
      if (!text) throw new Error("No script provided for audio generation");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "undefined") {
        throw new Error("Gemini API key is missing or invalid. Please ensure GEMINI_API_KEY is set in your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Split text into chunks for better reliability with long scripts
      // We split by sentences to maintain natural flow
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const processedChunks: string[] = [];
      let currentChunk = "";
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > 1000) {
          processedChunks.push(currentChunk);
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }
      if (currentChunk) processedChunks.push(currentChunk);

      const audioParts: Uint8Array[] = [];
      
      for (const chunk of processedChunks) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ 
            parts: [{ 
              text: `Read the following IELTS listening script clearly and at a natural pace: ${chunk}` 
            }] 
          }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        let base64Audio = "";
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                base64Audio = part.inlineData.data;
                break;
              }
            }
          }
        }

        if (base64Audio) {
          const cleanBase64 = base64Audio.replace(/[\s\r\n]/g, '');
          const binaryString = atob(cleanBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          audioParts.push(bytes);
        }
      }

      if (audioParts.length > 0) {
        const totalLength = audioParts.reduce((acc, curr) => acc + curr.length, 0);
        const combinedBytes = new Uint8Array(totalLength);
        let offset = 0;
        for (const part of audioParts) {
          combinedBytes.set(part, offset);
          offset += part.length;
        }
        
        const evenLen = totalLength - (totalLength % 2);
        const pcmBuffer = new ArrayBuffer(evenLen);
        const pcmBytes = new Uint8Array(pcmBuffer);
        pcmBytes.set(combinedBytes.subarray(0, evenLen));
        const pcmData = new Int16Array(pcmBuffer);
        
        if (pcmData.length === 0) {
          throw new Error("Decoded PCM data is empty");
        }
        
        const wavBlob = pcmToWav(pcmData, 24000);
        const url = URL.createObjectURL(wavBlob);
        
        setAudioUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } else {
        throw new Error("The AI model did not return any audio data.");
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      setAudioError(error instanceof Error ? error.message : "Could not generate audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection && !audioUrl && !isGeneratingAudio) {
      const sectionIdx = fullTestSections.findIndex(s => s.id === activeSection.id);
      const idx = sectionIdx !== -1 ? sectionIdx : 0;
      const intro = `Part ${idx + 1}. You will hear a ${activeSection.title}. First, you have some time to look at questions 1 to 10. [PAUSE] Now listen carefully and answer questions 1 to 10.`;
      const outro = `That is the end of Part ${idx + 1}. You now have half a minute to check your answers. [PAUSE]`;
      generateAudio(`${intro}\n\n${activeSection.script}\n\n${outro}`);
    }
  }, [activeSection, audioUrl, isGeneratingAudio, generateAudio, fullTestSections]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleCheck = async () => {
    setShowResults(true);
    setIsAnalyzing(true);
    
    let correctCount = 0;
    activeSection.questions.forEach((q: any, i: number) => {
      if (userAnswers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        correctCount++;
      }
    });

    const band = calculateListeningBand(correctCount);

    if (progress) {
      const updated = {
        ...progress,
        bands: { ...progress.bands, listening: band },
        bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: "listening" }],
        mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: `Practice: ${activeSection.title}`, band, skill: "listening" }],
        studyMinutes: (progress.studyMinutes || 0) + 15,
      };
      setProgress(updated);
      saveProgress(updated);
    }

    try {
      const difficulty = progress?.difficulty || "intermediate";
      const prompt = `You are an IELTS Listening tutor. A student has completed a listening task at ${difficulty} level.
      Task Title: ${activeSection.title}
      Transcript: ${activeSection.script}
      Questions and Correct Answers: ${JSON.stringify(activeSection.questions)}
      Student's Answers: ${JSON.stringify(userAnswers)}
      
      Provide constructive feedback for a ${difficulty} learner. Analyze their mistakes if any. Explain why the correct answers are correct based on the transcript. Give tips for improving listening skills for this type of task (${activeSection.type}).
      Use markdown for formatting. Keep it concise but helpful.`;

      const result = await callGroq(prompt, "You are an IELTS Listening tutor.");
      setFeedback(result || "No feedback generated.");
    } catch (error) {
      console.error("Feedback generation error:", error);
      setFeedback("Could not generate AI feedback at this time.");
    } finally {
      setIsAnalyzing(false);
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

        <div className="card bg-gradient-to-br from-blue-dim/20 to-bg-1 border-blue-dim/30 p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-primary flex items-center justify-center text-white shadow-lg shadow-blue-primary/20">
              <Volume2 size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base md:text-lg leading-tight">{activeSection.title}</h3>
              <div className="text-[9px] md:text-xs text-text-muted font-medium uppercase tracking-wider">{activeSection.type} · {activeSection.difficulty}</div>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            {audioUrl ? (
              <AudioPlayer 
                src={audioUrl} 
                onEnded={() => setPlaybackProgress(100)}
                className="bg-transparent border-none shadow-none p-0"
              />
            ) : (
              <div className="h-24 flex flex-col items-center justify-center bg-bg-2/50 rounded-xl border border-dashed border-border-2 gap-3">
                {isGeneratingAudio ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-blue-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Generating Audio...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} className="text-red-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-accent">{audioError || "Audio not available"}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5 mb-6">
          {[
            { id: 'questions', label: 'Questions', icon: ClipboardList },
            { id: 'notes', label: 'Scratchpad', icon: PenTool },
            { id: 'transcript', label: 'Transcript', icon: FileText },
            { id: 'vocab', label: 'Vocabulary', icon: Type },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id 
                  ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" 
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary"
              )}
            >
              <tab.icon size={14} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                {activeSection.questions.map((q: any, i: number) => (
                  <div key={i} className="card border-border hover:border-blue-primary/30 transition-all group rounded-xl">
                    <div className="flex gap-4">
                      <div className="text-lg font-serif font-black text-blue-secondary opacity-50 group-hover:opacity-100 transition-opacity">{i + 1}.</div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm text-text-primary font-medium leading-relaxed">{q.q}</p>
                        <input
                          type="text"
                          value={userAnswers[i] || ""}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [i]: e.target.value })}
                          placeholder="Type your answer..."
                          disabled={showResults}
                          className={cn(
                            "input w-full",
                            showResults && userAnswers[i]?.toLowerCase() === q.answer.toLowerCase() && "border-green-accent bg-green-accent/5 text-green-accent",
                            showResults && userAnswers[i]?.toLowerCase() !== q.answer.toLowerCase() && "border-red-accent bg-red-accent/5 text-red-accent"
                          )}
                        />
                        {showResults && (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            {userAnswers[i]?.toLowerCase() === q.answer.toLowerCase() 
                              ? <span className="text-green-accent flex items-center gap-1"><CheckCircle2 size={12} /> Correct</span> 
                              : <span className="text-red-accent flex items-center gap-1"><AlertCircle size={12} /> Correct Answer: {q.answer}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!showResults ? (
                <button 
                  onClick={handleCheck} 
                  disabled={Object.keys(userAnswers).length === 0}
                  className="btn btn-primary w-full py-6 text-base shadow-2xl shadow-blue-primary/30"
                >
                  <ClipboardList size={20} />
                  Check My Answers
                </button>
              ) : (
                <div className="space-y-6">
                  <div className="card bg-blue-dim/10 border-blue-primary/20 p-8 rounded-2xl">
                    <div className="flex items-center gap-2 text-blue-secondary font-black text-xs uppercase tracking-widest mb-4">
                      <Sparkles size={16} /> AI Tutor Feedback
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                          <Loader2 size={24} className="animate-spin text-blue-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Aria is analyzing your performance...</span>
                        </div>
                      ) : (
                        <ReactMarkdown>{feedback}</ReactMarkdown>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {isFullTest && currentSectionIndex < fullTestSections.length - 1 ? (
                      <button onClick={nextSection} className="btn btn-primary flex-1 py-4">
                        Next Section ({currentSectionIndex + 2}/4)
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setShowResults(false);
                          setFeedback(null);
                          setUserAnswers({});
                          setActiveTab('questions');
                        }} 
                        className="btn btn-primary flex-1 py-4"
                      >
                        Try Again
                      </button>
                    )}
                    <button 
                      onClick={() => { 
                        setActiveSection(null); 
                        setIsFullTest(false); 
                        setShowResults(false);
                        setAudioUrl(null);
                      }} 
                      className="btn btn-ghost px-8 py-4"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Take notes while listening</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your notes here... (e.g., spelling, dates, names)"
                className="textarea h-[400px] custom-scrollbar leading-relaxed"
              />
            </motion.div>
          )}

          {activeTab === 'transcript' && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-8 bg-white/5 border-white/10 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-blue-primary font-black text-xs uppercase tracking-widest">
                  <FileText size={16} /> Transcript
                </div>
                <button 
                  onClick={highlightVocab}
                  disabled={isHighlighting}
                  className="text-[10px] font-black text-blue-secondary uppercase tracking-widest flex items-center gap-2 hover:underline disabled:opacity-50 bg-blue-primary/10 px-4 py-2 rounded-full"
                >
                  {isHighlighting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                  {highlightedVocab.length > 0 ? "Refresh Vocab" : "Highlight Key Vocab"}
                </button>
              </div>
              
              <div className="prose prose-invert prose-sm md:prose-base max-w-none text-text-secondary leading-loose font-medium italic">
                {activeSection.script}
              </div>

              {highlightedVocab.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/5">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Key Vocabulary from this section</div>
                  <div className="flex flex-wrap gap-3">
                    {highlightedVocab.map((word, i) => (
                      <span key={i} className="px-4 py-2 bg-blue-dim/20 border border-blue-primary/20 rounded-xl text-xs text-blue-secondary font-bold shadow-sm">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'vocab' && (
            <motion.div 
              key="vocab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full bg-bg-2 rounded-xl border border-border-2 p-8 flex flex-col items-center justify-center text-center"
            >
              {highlightedVocab.length > 0 ? (
                <div className="w-full space-y-8">
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Key Vocabulary from this section</div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {highlightedVocab.map((word, i) => (
                      <span key={i} className="px-5 py-3 bg-blue-dim/20 border border-blue-primary/20 rounded-xl text-sm text-blue-secondary font-black shadow-sm hover:scale-105 transition-transform cursor-default">
                        {word}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={highlightVocab}
                    className="text-[10px] font-black text-blue-primary uppercase tracking-widest hover:underline"
                  >
                    Refresh Analysis
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-text-muted mx-auto">
                    <Sparkles size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-serif font-black text-text-primary">Vocab Lab</h4>
                    <p className="text-xs text-text-muted max-w-xs leading-relaxed">Aria can extract high-level vocabulary from the listening script to help you improve your lexical resource.</p>
                  </div>
                  <button 
                    onClick={highlightVocab}
                    disabled={isHighlighting || !activeSection}
                    className="btn btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {isHighlighting ? <Loader2 size={16} className="animate-spin" /> : "Analyze Script"}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

    return (
    <div className="space-y-16 pb-20">
      {/* Listening Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-bg-1 border border-white/5 p-8 md:p-12 lg:p-16">
        <div className="absolute inset-0 recipe-atmospheric-bg opacity-30" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-primary/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-end justify-between gap-12">
          <div className="max-w-3xl min-w-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="recipe-editorial-label mb-8 flex items-center gap-3"
            >
              <div className="w-8 h-px bg-blue-secondary/30" />
              <Headphones size={16} className="text-blue-secondary" /> Receptive Skills
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="recipe-editorial-h1 mb-2"
            >
              Listening <span className="text-blue-primary">Lab</span>
            </motion.h2>

            <div className="flex items-center gap-2 mb-8 px-4 py-1.5 bg-blue-primary/10 border border-blue-primary/20 rounded-full w-fit">
              <Sparkles size={14} className="text-blue-primary" />
              <span className="text-[10px] font-bold text-blue-primary uppercase tracking-[0.2em]">
                Level: {progress.difficulty} {progress.adaptiveDifficulty && "(Adaptive)"}
              </span>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary leading-relaxed font-medium max-w-2xl"
            >
              Immersive IELTS Listening simulations with AI-generated audio, 
              real-time transcriptions, and deep performance analytics.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap md:flex-nowrap bg-bg-2/50 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl"
          >
            {[
              { id: "practice", label: "Practice", icon: Headphones },
              { id: "samples", label: "Samples", icon: FileText },
              { id: "ai-test", label: "AI Test", icon: Sparkles },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveModuleTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                  activeModuleTab === tab.id 
                    ? "bg-blue-primary text-white shadow-xl shadow-blue-primary/30 scale-105" 
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

      {activeModuleTab === "practice" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Practice Sections</h3>
            <button
              onClick={generateMoreSections}
              disabled={isGeneratingMore}
              className="flex items-center gap-2 text-[10px] font-bold text-violet-accent uppercase tracking-widest hover:underline disabled:opacity-50"
            >
              {isGeneratingMore ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {isGeneratingMore ? "Generating..." : "Generate More Practice Content"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dynamicSections.map((section) => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section); setUserAnswers({}); setShowResults(false); setFeedback(null); }}
                className="group relative flex flex-col text-left bg-bg-1 border border-white/5 rounded-xl overflow-hidden transition-all hover:border-blue-primary/30 hover:shadow-xl hover:shadow-blue-primary/5 active:scale-[0.98] p-8 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                    section.difficulty === "Easy" ? "bg-green-accent/10 text-green-accent" : 
                    section.difficulty === "Medium" ? "bg-amber-accent/10 text-amber-accent" : "bg-red-accent/10 text-red-accent"
                  )}>{section.difficulty}</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {section.type}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-black text-text-primary group-hover:text-blue-primary transition-colors">{section.title}</h3>
                <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed">
                  {section.script.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{section.questions.length} Questions</span>
                  <div className="w-10 h-10 rounded-full bg-bg-2 border border-white/5 flex items-center justify-center group-hover:bg-blue-primary group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={generateMoreSections}
              disabled={isGeneratingMore}
              className="group flex items-center gap-3 px-8 py-4 bg-bg-2 border border-border rounded-xl hover:border-indigo-500/50 transition-all active:scale-95 disabled:opacity-50"
            >
              {isGeneratingMore ? (
                <Loader2 size={20} className="animate-spin text-indigo-600" />
              ) : (
                <Sparkles size={20} className="text-indigo-600 group-hover:animate-pulse" />
              )}
              <span className="text-sm font-bold text-text-primary">
                {isGeneratingMore ? "Generating New Content..." : "Generate More Practice Content"}
              </span>
            </button>
          </div>
        </div>
      )}

      {activeModuleTab === "samples" && (
        <div className="space-y-6">
          {LISTENING_SAMPLES.map((sample) => (
            <div key={sample.id} className="card bg-bg-2 border-border-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="tag tag-blue">{sample.type}</span>
                  <h3 className="font-bold text-text-primary">{sample.title}</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-bg-1 rounded-xl border border-border-2 text-sm text-text-secondary italic leading-relaxed">
                  <div className="text-[10px] font-bold text-blue-primary uppercase tracking-widest mb-2">Script Snippet</div>
                  "{sample.script}"
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-text-primary">Question: {sample.question}</div>
                </div>
                <div className="p-4 bg-green-accent/5 border border-green-accent/20 rounded-xl">
                  <div className="text-[10px] font-bold text-green-accent uppercase tracking-widest mb-1">Correct Answer</div>
                  <div className="text-sm font-bold text-text-primary mb-2">{sample.answer}</div>
                  <div className="text-[10px] text-text-muted leading-relaxed">
                    <span className="font-bold">Explanation:</span> {sample.explanation}
                  </div>
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
          <div className="w-20 h-20 rounded-2xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
            <Sparkles size={40} />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold mb-2">AI-Generated Full Test</h3>
            <p className="text-sm text-text-muted">
              Aria will generate a complete IELTS Listening test with 4 sections and realistic audio scripts.
            </p>
          </div>
          <button 
            onClick={generateFullTest}
            disabled={isGeneratingFullTest}
            className="btn btn-primary px-8 py-4 flex items-center gap-2"
          >
            {isGeneratingFullTest ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isGeneratingFullTest ? "Generating Test..." : "Generate Full Test"}
          </button>
        </div>
      )}
    </div>
  );
}
