"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  Loader2, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  BookOpenCheck,
  Trophy,
  MessageSquare,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateListeningBand, calculateReadingBand } from "@/lib/ielts";
import { GoogleGenAI, Modality } from "@google/genai";
import { callGroq, callGroqJSON } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { ChartDisplay } from "@/components/ChartDisplay";

type Skill = "listening" | "reading" | "writing" | "speaking";

interface PracticeItem {
  id: number;
  title: string;
  skill: Skill;
  difficulty: "Easy" | "Medium" | "Hard";
}

export default function PracticeLibrary() {
  const [visibleCount, setVisibleCount] = useState(24);
  const [activeSkill, setActiveSkill] = useState<Skill>("listening");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<PracticeItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const ensureString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') {
      return val.text || val.content || val.passage || val.script || val.prompt || val.topic || JSON.stringify(val);
    }
    return String(val || "");
  };

  const TOPICS = [
    "Education & Technology",
    "Environment & Sustainability",
    "Global Economy",
    "Health & Modern Lifestyle",
    "Culture & Traditions",
    "Urbanization & Housing",
    "Work & Career Development",
    "Media & Communication",
    "Science & Innovation",
    "Social Issues & Equality",
    "Travel & Tourism",
    "Art & Literature",
    "Sports & Health",
    "Crime & Punishment",
    "Family & Relationships"
  ];

  // Generate 2000+ items (simulated but more dynamic)
  const items = React.useMemo(() => {
    return Array.from({ length: 2000 }, (_, i) => {
      const topic = TOPICS[i % TOPICS.length];
      return {
        id: i + 1,
        title: `${topic}: ${activeSkill.charAt(0).toUpperCase() + activeSkill.slice(1)} Module #${i + 1}`,
        skill: activeSkill,
        difficulty: i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard"
      } as PracticeItem;
    });
  }, [activeSkill]);

  const filteredItems = items.filter(item => 
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toString() === searchQuery) &&
    (difficultyFilter === "All" || item.difficulty === difficultyFilter)
  ).slice(0, visibleCount);

  const [showTranscript, setShowTranscript] = useState(false);

  const pcmToWav = (pcmData: Int16Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length * 2, true);

    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(44 + i * 2, pcmData[i], true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const generateAudio = useCallback(async (text: string) => {
    setIsGeneratingAudio(true);
    setAudioUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Split text into chunks to avoid TTS limits and ensure full length
      // Use a more robust splitting method for long scripts
      const chunks = text.split(/(?<=[.!?])\s+/);
      const pcmChunks: Int16Array[] = [];
      
      // Process in small batches to avoid overwhelming the API but keep it fast
      for (let i = 0; i < chunks.length; i += 2) {
        const batch = chunks.slice(i, i + 2);
        const batchPromises = batch.map(chunk => 
          ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: chunk.trim() }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          })
        );
        
        const results = await Promise.all(batchPromises);
        
        for (const response of results) {
          const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }
            pcmChunks.push(new Int16Array(bytes.buffer));
          }
        }
      }

      if (pcmChunks.length > 0) {
        // Concatenate all PCM chunks
        const totalLength = pcmChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedPcm = new Int16Array(totalLength);
        let offset = 0;
        for (const chunk of pcmChunks) {
          combinedPcm.set(chunk, offset);
          offset += chunk.length;
        }

        const wavBlob = pcmToWav(combinedPcm, 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, []);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectItem = async (item: PracticeItem) => {
    setSelectedItem(item);
    setIsGenerating(true);
    setGenerationError(null);
    setTaskData(null);
    setUserAnswers({});
    setShowResults(false);
    setFeedback(null);
    setAudioUrl(null);
    setShowTranscript(false);

    try {
      if (item.skill === "listening") {
        const parts = [];
        const partPrompts = [
          "Part 1: Social context, 2 speakers (10 questions). Everyday social situation, e.g., booking a hotel or asking for information. Include a mix of form completion and multiple choice.",
          "Part 2: Social context, 1 speaker (10 questions). Monologue on a social topic, e.g., a local facility or a radio talk. Include map/plan labeling or matching questions.",
          "Part 3: Educational context, 2-4 speakers (10 questions). Discussion between students or a student and a tutor. Focus on academic discussion and multiple choice.",
          "Part 4: Academic lecture, 1 speaker (10 questions). A formal lecture on an academic subject. Focus on note completion or summary completion."
        ];

        for (let i = 0; i < 4; i++) {
          const partSchema = {
            type: "object",
            properties: {
              title: { type: "string" },
              script: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    q: { type: "string" },
                    answer: { type: "string" }
                  },
                  required: ["id", "q", "answer"]
                }
              }
            },
            required: ["title", "script", "questions"]
          };
          const partData = await callGroqJSON(
            `Generate a FULL IELTS Listening ${partPrompts[i]} for the topic: ${item.title}. 
            Difficulty: Band 9.0 (Highest Standard). 
            The script MUST be extremely detailed, natural, and approximately 1000-1200 words to ensure a realistic 6-8 minute duration per part. 
            Include natural pauses, hesitations, and corrections (self-repair) as found in real IELTS tests.
            Questions must be challenging and answerable ONLY from the script.`,
            partSchema,
            "You are an expert IELTS Listening examiner and content creator for Band 9.0 materials."
          );
          parts.push(partData);
        }
        
        const keyVocabSchema = {
          type: "array",
          items: {
            type: "object",
            properties: {
              word: { type: "string" },
              definition: { type: "string" },
              example: { type: "string" }
            }
          }
        };
        const keyVocab = await callGroqJSON(
          `Extract 10 high-level Band 9.0 vocabulary words from these scripts: ${parts.map(p => p.script).join(" ")}`,
          keyVocabSchema,
          "You are an IELTS vocabulary expert."
        );

        const data = { parts, keyVocabulary: keyVocab };
        setTaskData(data);
        const fullScript = data.parts.map((p: any) => p.script).join("\n\n[NEW SECTION]\n\n");
        generateAudio(fullScript);
      } else if (item.skill === "reading") {
        const parts = [];
        const passagePrompts = [
          "Passage 1: Descriptive/factual (13 questions). Topic: ${item.title}. Focus on True/False/Not Given and Note Completion.",
          "Passage 2: Discursive/analytical (13 questions). Topic: ${item.title}. Focus on Matching Headings and Multiple Choice.",
          "Passage 3: Complex argument (14 questions). Topic: ${item.title}. Focus on Yes/No/Not Given and Summary Completion."
        ];

        for (let i = 0; i < 3; i++) {
          const passageSchema = {
            type: "object",
            properties: {
              title: { type: "string" },
              passage: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    q: { type: "string" },
                    answer: { type: "string" }
                  },
                  required: ["id", "q", "answer"]
                }
              }
            },
            required: ["title", "passage", "questions"]
          };
          const passageData = await callGroqJSON(
            `Generate a FULL IELTS Academic Reading ${passagePrompts[i]} 
            Difficulty: Band 9.0 (Highest Standard). 
            The passage MUST be 1200-1500 words, using sophisticated academic vocabulary and complex sentence structures. 
            Questions must be highly challenging and answerable ONLY from the passage.`,
            passageSchema,
            "You are an expert IELTS Reading examiner and content creator for Band 9.0 materials."
          );
          parts.push(passageData);
        }

        const keyVocabSchema = {
          type: "array",
          items: {
            type: "object",
            properties: {
              word: { type: "string" },
              definition: { type: "string" },
              example: { type: "string" }
            }
          }
        };
        const keyVocab = await callGroqJSON(
          `Extract 10 high-level Band 9.0 vocabulary words from these passages: ${parts.map(p => p.passage).join(" ")}`,
          keyVocabSchema,
          "You are an IELTS vocabulary expert."
        );

        setTaskData({ parts, keyVocabulary: keyVocab });
      } else if (item.skill === "writing") {
        const schema = {
          type: "object",
          properties: {
            title: { type: "string" },
            task1: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                chartType: { type: "string" },
                chartData: { type: "object" },
                modelAnswer: { type: "string" }
              },
              required: ["prompt", "chartType", "chartData", "modelAnswer"]
            },
            task2: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                modelAnswer: { type: "string" }
              },
              required: ["prompt", "modelAnswer"]
            }
          },
          required: ["title", "task1", "task2"]
        };
        const data = await callGroqJSON(
          `Generate a FULL Academic IELTS Writing section (Task 1 and Task 2) for ${item.title}. Difficulty: Band 9.0. Task 1 MUST be a Map, Process Diagram, or complex Chart. Provide Band 9.0 model answers.`,
          schema,
          "You are an IELTS Writing expert."
        );
        setTaskData(data);
      } else if (item.skill === "speaking") {
        const schema = {
          type: "object",
          properties: {
            title: { type: "string" },
            parts: {
              type: "object",
              properties: {
                part1: { type: "array", items: { type: "string" } },
                part2: { type: "string" },
                part3: { type: "array", items: { type: "string" } }
              },
              required: ["part1", "part2", "part3"]
            },
            modelAnswer: { type: "string" }
          },
          required: ["title", "parts", "modelAnswer"]
        };
        const data = await callGroqJSON(
          `Generate a FULL IELTS Speaking test (Parts 1, 2, and 3) for the topic: ${item.title}. 
          Difficulty: Band 9.0 (Highest Standard). 
          Part 1 should have 4-5 questions. 
          Part 2 should be a full cue card with 4 bullet points. 
          Part 3 should have 4-5 abstract, analytical questions related to the Part 2 topic. 
          Provide a Band 9.0 model answer for the entire test.`,
          schema,
          "You are an expert IELTS Speaking examiner."
        );
        setTaskData(data);
        
        // Generate audio for the examiner's prompts
        const fullSpeakingScript = [
          "Part 1 questions:",
          ...data.parts.part1,
          "Part 2 cue card:",
          data.parts.part2,
          "Part 3 questions:",
          ...data.parts.part3
        ].join("\n\n");
        generateAudio(fullSpeakingScript);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setGenerationError("Failed to generate practice content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswers = async () => {
    setShowResults(true);
    setIsGenerating(true);
    
    let prompt = "";
    if (activeSkill === "writing") {
      prompt = `Assess this IELTS Writing response for Module #${selectedItem?.id}:\n\nTask 1 Prompt: ${taskData.task1.prompt}\nTask 2 Prompt: ${taskData.task2.prompt}\n\nUser Response: ${userAnswers.writing}\n\nProvide a detailed band score breakdown for both tasks and a "Path to 9.0" section with specific, actionable steps to reach Band 9.0 from the current level.`;
    } else if (activeSkill === "speaking") {
      prompt = `Assess this IELTS Speaking practice session for Module #${selectedItem?.id}:\n\nParts 1, 2, 3 Prompts: ${JSON.stringify(taskData.parts)}\n\nUser Notes/Transcript: ${userAnswers.speaking}\n\nProvide a detailed band score breakdown and a "Path to 9.0" section with specific, actionable steps to reach Band 9.0 from the current level.`;
    } else {
      // For listening/reading, we can just compare answers
      const allQuestions = taskData.parts?.flatMap((p: any) => p.questions) || taskData.questions || [];
      const correctCount = allQuestions.filter((q: any) => 
        userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
      ).length;
      
      const band = activeSkill === "listening" ? calculateListeningBand(correctCount) : calculateReadingBand(correctCount);
      setFeedback(`You got ${correctCount} out of ${allQuestions.length} correct. Estimated Band: ${band}`);
      setIsGenerating(false);
      return;
    }

    try {
      const result = await callGroq(prompt, "You are an IELTS examiner.");
      setFeedback(result);
    } catch (error) {
      console.error("Assessment failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-serif text-3xl font-bold mb-2 flex items-center gap-3">
            <ClipboardList className="text-blue-primary" size={32} />
            Practice Library
          </h2>
          <p className="text-text-muted">Access 2000+ AI-generated IELTS practice modules across all skills.</p>
        </div>
        
        <div className="flex bg-bg-2 p-1 rounded-2xl border border-border shadow-inner">
          {(["listening", "reading", "writing", "speaking"] as Skill[]).map((skill) => (
            <button
              key={skill}
              onClick={() => { setActiveSkill(skill); setSelectedItem(null); setTaskData(null); }}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeSkill === skill 
                  ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" 
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {!selectedItem ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-primary transition-colors" size={20} />
              <input 
                type="text"
                placeholder={`Search 2000+ ${activeSkill} modules by title or ID...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-bg-1 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary transition-all text-sm font-medium"
              />
            </div>
            <div className="flex bg-bg-2 p-1 rounded-2xl border border-border shadow-inner">
              {["All", "Easy", "Medium", "Hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    difficultyFilter === diff 
                      ? "bg-white text-blue-primary shadow-sm" 
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                onClick={() => handleSelectItem(item)}
                className="card text-left group hover:border-blue-primary transition-all p-6 flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                      "tag text-[10px]",
                      item.difficulty === "Easy" ? "tag-emerald" : item.difficulty === "Medium" ? "tag-blue" : "tag-violet"
                    )}>
                      {item.difficulty}
                    </span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">#{item.id}</span>
                  </div>
                  <h3 className="font-bold text-text-primary group-hover:text-blue-primary transition-colors leading-tight">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    {activeSkill === "listening" && <Headphones size={12} />}
                    {activeSkill === "reading" && <BookOpen size={12} />}
                    {activeSkill === "writing" && <PenTool size={12} />}
                    {activeSkill === "speaking" && <Mic size={12} />}
                    {activeSkill}
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            ))}
          </div>
          
          {items.length > visibleCount && searchQuery === "" && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={() => setVisibleCount(prev => prev + 24)}
                className="btn btn-secondary px-10 py-4 font-black uppercase tracking-widest text-xs flex items-center gap-3 group"
              >
                <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                Load More Modules
              </button>
            </div>
          )}
          
          {filteredItems.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-bg-2 rounded-full flex items-center justify-center mx-auto text-text-muted">
                <Search size={32} />
              </div>
              <p className="text-text-muted font-medium">No modules found matching your search.</p>
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <button 
            onClick={() => { setSelectedItem(null); setTaskData(null); }}
            className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} />
            Back to Library
          </button>

          <div className="card p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="tag tag-blue">Module #{selectedItem.id}</span>
                  <span className="tag tag-violet">{selectedItem.difficulty}</span>
                </div>
                <h3 className="text-2xl font-bold text-text-primary">{selectedItem.title}</h3>
              </div>
              {isGenerating && (
                <div className="flex items-center gap-2 text-blue-primary font-bold text-sm animate-pulse">
                  <Loader2 className="animate-spin" size={18} />
                  AI Generating Content...
                </div>
              )}
              {generationError && (
                <div className="flex items-center gap-4">
                  <div className="text-xs text-red-500 font-bold flex items-center gap-2">
                    <AlertCircle size={14} />
                    {generationError}
                  </div>
                  <button 
                    onClick={() => handleSelectItem(selectedItem)}
                    className="btn btn-primary px-4 py-2 text-[10px]"
                  >
                    Retry
                  </button>
                </div>
              )}

            {taskData && (
              <div className="space-y-8">
                {activeSkill === "listening" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-bg-2 rounded-2xl border border-border flex flex-col items-center gap-4">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Audio Track</div>
                      {isGeneratingAudio ? (
                        <div className="flex items-center gap-2 text-text-muted text-xs">
                          <Loader2 className="animate-spin" size={14} />
                          Synthesizing Audio...
                        </div>
                      ) : audioUrl ? (
                        <div className="w-full max-w-sm">
                          <AudioPlayer 
                            src={audioUrl} 
                            className="bg-transparent border-none shadow-none p-0"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-red-500">Audio failed to load</div>
                      )}
                      
                      {audioUrl && (
                        <button 
                          onClick={() => setShowTranscript(!showTranscript)}
                          className="text-[10px] font-bold text-blue-primary hover:underline uppercase tracking-widest"
                        >
                          {showTranscript ? "Hide Transcript" : "Show Transcript"}
                        </button>
                      )}
                      {showTranscript && taskData.parts && (
                        <div className="w-full p-4 bg-bg-1 border border-border rounded-xl text-xs text-text-muted leading-relaxed max-h-48 overflow-y-auto">
                          {taskData.parts.map((p: any, i: number) => (
                            <div key={i} className="mb-4">
                              <p className="font-bold mb-1">{p.title}</p>
                              <ReactMarkdown>{ensureString(p.script)}</ReactMarkdown>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-12">
                      {taskData.parts?.map((part: any, pIdx: number) => (
                        <div key={pIdx} className="space-y-6">
                          <h4 className="font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                            <BookOpenCheck size={18} className="text-blue-primary" />
                            {part.title}
                          </h4>
                          <div className="space-y-4">
                            {part.questions?.map((q: any, idx: number) => (
                              <div key={`listening-${q.id || idx}`} className="space-y-2">
                                <div className="text-sm font-medium text-text-primary">{q.id}. {ensureString(q.q)}</div>
                                <input 
                                  type="text"
                                  value={userAnswers[q.id] || ""}
                                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  disabled={showResults}
                                  placeholder="Type your answer..."
                                  className="w-full p-3 bg-bg-1 border border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-primary/20 outline-none"
                                />
                                {showResults && (
                                  <div className={cn(
                                    "text-xs font-bold flex items-center gap-1.5",
                                    userAnswers[q.id]?.toLowerCase().trim() === String(q.answer || "").toLowerCase().trim() ? "text-emerald-500" : "text-red-500"
                                  )}>
                                    {userAnswers[q.id]?.toLowerCase().trim() === String(q.answer || "").toLowerCase().trim() ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    Correct Answer: {ensureString(q.answer)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSkill === "reading" && (
                  <div className="space-y-12">
                    {taskData.parts?.map((part: any, pIdx: number) => (
                      <div key={pIdx} className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-border pb-12 last:border-0">
                        <div className="space-y-4">
                          <h4 className="font-bold text-text-primary uppercase tracking-widest text-xs">{part.title}</h4>
                          <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-2xl border border-border h-[500px] overflow-y-auto custom-scrollbar">
                            <ReactMarkdown>{ensureString(part.passage)}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <h4 className="font-bold text-text-primary uppercase tracking-widest text-xs">Questions</h4>
                          <div className="space-y-6">
                            {part.questions?.map((q: any, idx: number) => (
                              <div key={`reading-${q.id || idx}`} className="space-y-2">
                                <div className="text-sm font-medium text-text-primary">{q.id}. {ensureString(q.q)}</div>
                                <input 
                                  type="text"
                                  value={userAnswers[q.id] || ""}
                                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  disabled={showResults}
                                  placeholder="Type your answer..."
                                  className="w-full p-3 bg-bg-1 border border-border rounded-xl text-sm focus:ring-2 focus:ring-blue-primary/20 outline-none"
                                />
                                {showResults && (
                                  <div className={cn(
                                    "text-xs font-bold flex items-center gap-1.5",
                                    userAnswers[q.id]?.toLowerCase().trim() === String(q.answer || "").toLowerCase().trim() ? "text-emerald-500" : "text-red-500"
                                  )}>
                                    {userAnswers[q.id]?.toLowerCase().trim() === String(q.answer || "").toLowerCase().trim() ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    Correct Answer: {ensureString(q.answer)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSkill === "writing" && taskData.task1 && taskData.task2 && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-6 bg-bg-2 rounded-2xl border border-border">
                          <div className="text-[10px] font-bold text-blue-primary uppercase tracking-widest mb-2">Writing Task 1</div>
                          <div className="prose prose-sm max-w-none text-text-primary leading-relaxed mb-6">
                            <ReactMarkdown>{ensureString(taskData.task1.prompt)}</ReactMarkdown>
                          </div>
                          {taskData.task1.chartData && (
                            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                              <ChartDisplay 
                                type={taskData.task1.chartType as any} 
                                data={taskData.task1.chartData} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="p-6 bg-bg-2 rounded-2xl border border-border">
                          <div className="text-[10px] font-bold text-violet-accent uppercase tracking-widest mb-2">Writing Task 2</div>
                          <div className="prose prose-sm max-w-none text-text-primary leading-relaxed">
                            <ReactMarkdown>{ensureString(taskData.task2.prompt)}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-text-primary">Your Response (Task 1 & 2)</h4>
                        <span className="text-xs text-text-muted">{userAnswers.writing?.split(/\s+/).filter(Boolean).length || 0} words</span>
                      </div>
                      <textarea 
                        value={userAnswers.writing || ""}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, writing: e.target.value }))}
                        disabled={showResults}
                        placeholder="Type both Task 1 and Task 2 responses here. Clearly label them."
                        className="w-full h-96 p-6 bg-bg-1 border border-border rounded-2xl text-sm focus:ring-2 focus:ring-blue-primary/20 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {showResults && (
                      <div className="p-8 bg-bg-2 border border-border rounded-3xl space-y-6">
                        <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                          Model Answers (Band 9.0)
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="text-xs font-bold text-blue-primary uppercase tracking-widest">Task 1 Model Answer</div>
                            <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-2xl border border-border">
                              <ReactMarkdown>{ensureString(taskData.task1.modelAnswer)}</ReactMarkdown>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="text-xs font-bold text-violet-accent uppercase tracking-widest">Task 2 Model Answer</div>
                            <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-2xl border border-border">
                              <ReactMarkdown>{ensureString(taskData.task2.modelAnswer)}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSkill === "speaking" && taskData.parts && !Array.isArray(taskData.parts) && (
                  <div className="space-y-8">
                    <div className="p-6 bg-bg-2 rounded-2xl border border-border text-center">
                      <h4 className="text-xl font-bold text-text-primary mb-2">{ensureString(taskData.title)}</h4>
                      <p className="text-sm text-text-muted">Practice these questions using the Speaking Lab or record your notes below.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="text-xs font-black text-blue-primary uppercase tracking-widest">Part 1</div>
                        <ul className="space-y-2">
                          {taskData.parts.part1?.map((q: any, i: number) => (
                            <li key={`part1-${i}`} className="text-sm text-text-secondary leading-relaxed">• {ensureString(q)}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="text-xs font-black text-violet-accent uppercase tracking-widest">Part 2</div>
                        <div className="p-4 bg-bg-1 rounded-xl border border-border text-sm text-text-secondary leading-relaxed italic">
                          <ReactMarkdown>{ensureString(taskData.parts.part2)}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-xs font-black text-emerald-accent uppercase tracking-widest">Part 3</div>
                        <ul className="space-y-2">
                          {taskData.parts.part3?.map((q: any, i: number) => (
                            <li key={`part3-${i}`} className="text-sm text-text-secondary leading-relaxed">• {ensureString(q)}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-text-primary">Practice Notes / Transcript</h4>
                        <button 
                          onClick={toggleRecording}
                          className={cn(
                            "flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-xl",
                            isRecording 
                              ? "bg-red-500/10 text-red-500 animate-pulse" 
                              : "text-blue-secondary hover:text-blue-primary"
                          )}
                        >
                          <Mic size={14} />
                          {isRecording ? `Recording... ${formatTime(recordingTime)}` : "Record Practice"}
                        </button>
                      </div>
                      <textarea 
                        value={userAnswers.speaking || ""}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, speaking: e.target.value }))}
                        disabled={showResults}
                        placeholder="Paste your transcript or type your practice notes here for AI assessment..."
                        className="w-full h-40 p-6 bg-bg-1 border border-border rounded-2xl text-sm focus:ring-2 focus:ring-blue-primary/20 outline-none resize-none leading-relaxed"
                      />
                    </div>

                    {showResults && taskData.modelAnswer && (
                      <div className="p-8 bg-bg-2 border border-border rounded-3xl">
                        <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                          Model Answer (Band 9.0)
                        </h4>
                        <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-2xl border border-border">
                          <ReactMarkdown>{ensureString(taskData.modelAnswer)}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center pt-8">
                  {!showResults ? (
                    <button 
                      onClick={submitAnswers}
                      disabled={isGenerating || (activeSkill === "writing" && !userAnswers.writing) || (activeSkill === "speaking" && !userAnswers.speaking)}
                      className="btn btn-primary px-12 py-4 rounded-2xl shadow-xl shadow-blue-primary/20 flex items-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      Submit for Assessment
                    </button>
                  ) : (
                    <div className="w-full space-y-6">
                      <div className="p-8 bg-blue-dim border border-blue-primary/20 rounded-3xl">
                        <h4 className="text-lg font-bold text-blue-secondary mb-4 flex items-center gap-2">
                          <Trophy size={24} />
                          AI Assessment & Feedback
                        </h4>
                        <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed">
                          <ReactMarkdown>{ensureString(feedback || "Calculating results...")}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {taskData.keyVocabulary && (
                        <div className="p-8 bg-bg-2 border border-border rounded-3xl">
                          <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Sparkles size={24} className="text-amber-accent" />
                            Key Vocabulary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(taskData.keyVocabulary) ? taskData.keyVocabulary.map((item: any, i: number) => (
                              <div key={i} className="p-4 bg-bg-1 rounded-2xl border border-border">
                                <div className="font-bold text-blue-primary mb-1">{item.word || item.term}</div>
                                <div className="text-xs text-text-muted mb-2">{item.definition || item.meaning}</div>
                                <div className="text-[10px] text-text-secondary italic">"{item.example}"</div>
                              </div>
                            )) : (
                              <div className="prose prose-sm max-w-none text-text-secondary">
                                <ReactMarkdown>{ensureString(taskData.keyVocabulary)}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {taskData.sampleAnswer && (
                        <div className="p-8 bg-bg-2 border border-border rounded-3xl">
                          <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <MessageSquare size={24} />
                            Model Answer
                          </h4>
                          <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed italic">
                            <ReactMarkdown>{ensureString(taskData.sampleAnswer)}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center">
                        <button 
                          onClick={() => { setSelectedItem(null); setTaskData(null); }}
                          className="btn btn-ghost px-8 py-3 flex items-center gap-2 text-text-muted hover:text-text-primary"
                        >
                          <RotateCcw size={18} />
                          Try Another Module
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }
