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
  ClipboardList,
  History,
  Check,
  X,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateListeningBand, calculateReadingBand } from "@/lib/ielts";
import { GoogleGenAI, Modality } from "@google/genai";
import { callGroq, callGroqJSON } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { ChartDisplay } from "@/components/ChartDisplay";
import { getProgress, saveProgress, type UserProgress } from "@/lib/store";

import { 
  LISTENING_SECTIONS, 
  READING_PASSAGES, 
  SPEAKING_TOPICS, 
  WRITING_SAMPLES 
} from "@/lib/data/ielts_content";

type Skill = "listening" | "reading" | "writing" | "speaking";

interface PracticeItem {
  id: number;
  title: string;
  skill: Skill;
  difficulty: "Easy" | "Medium" | "Hard";
  part: string;
}

export default function PracticeLibrary() {
  const [visibleCount, setVisibleCount] = useState(24);
  const [activeSkill, setActiveSkill] = useState<Skill>("listening");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [partFilter, setPartFilter] = useState<string>("All");
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
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  useEffect(() => {
    getProgress().then(setProgress);
  }, []);

  const toggleComplete = async (e: React.MouseEvent, item: PracticeItem) => {
    e.stopPropagation();
    if (!progress) return;

    const id = `${item.skill}-${item.id}`;
    const isCompleted = progress.completedPracticeIds.includes(id);
    
    const updated = {
      ...progress,
      completedPracticeIds: isCompleted 
        ? progress.completedPracticeIds.filter(i => i !== id)
        : [...progress.completedPracticeIds, id]
    };
    
    setProgress(updated);
    await saveProgress(updated);
  };

  const ensureString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') {
      return val.text || val.content || val.passage || val.script || val.prompt || val.topic || JSON.stringify(val);
    }
    return String(val || "");
  };

  const TOPICS_BY_CATEGORY: Record<string, string[]> = {
    "Education": ["Education Systems", "Online Learning", "Academic Success", "Student Life", "Vocational Training", "Language Learning", "Higher Education", "Early Childhood Education", "Special Education", "Lifelong Learning", "Educational Technology", "Standardized Testing"],
    "Technology": ["Artificial Intelligence", "Social Media", "Digital Privacy", "Automation", "Space Exploration", "Cybersecurity", "Blockchain", "Internet of Things", "Virtual Reality", "Quantum Computing", "5G Networks", "E-commerce Trends"],
    "Environment": ["Climate Change", "Renewable Energy", "Wildlife Conservation", "Sustainable Cities", "Pollution", "Marine Biology", "Deforestation", "Waste Management", "Biodiversity", "Ocean Acidification", "Circular Economy", "Green Architecture"],
    "Health": ["Modern Lifestyle", "Public Health", "Mental Well-being", "Nutrition", "Sports & Fitness", "Medical Advancements", "Aging Population", "Epidemiology", "Telemedicine", "Genetic Engineering", "Alternative Medicine", "Sleep Hygiene"],
    "Society": ["Urbanization", "Global Economy", "Social Equality", "Crime & Punishment", "Family Structures", "Human Rights", "Migration", "Demographics", "Gender Roles", "Poverty Alleviation", "Globalization", "Community Development"],
    "Culture": ["Traditions", "Art & Literature", "Language & Linguistics", "Tourism", "Fashion & Design", "History & Archaeology", "Philosophy & Ethics", "Music & Entertainment", "Cultural Heritage", "Cuisine & Gastronomy", "Cinema & Media", "Festivals & Rituals"],
    "Business": ["Entrepreneurship", "Corporate Responsibility", "Marketing Strategies", "Remote Work", "Consumer Behavior", "Financial Literacy", "Leadership Styles", "Supply Chain", "Small Businesses", "Gig Economy", "Investment Trends", "Work-Life Balance"],
    "Science": ["Astrophysics", "Genetics", "Chemistry in Daily Life", "Physics Wonders", "Neuroscience", "Evolutionary Biology", "Materials Science", "Robotics", "Microbiology", "Geology", "Psychology", "Forensic Science"]
  };

  const ALL_TOPICS = Object.values(TOPICS_BY_CATEGORY).flat();

  const SKILL_PARTS: Record<Skill, string[]> = {
    listening: ["Part 1", "Part 2", "Part 3", "Part 4"],
    reading: ["Passage 1", "Passage 2", "Passage 3"],
    writing: ["Task 1", "Task 2"],
    speaking: ["Part 1", "Part 2", "Part 3"]
  };

  // Generate 2000+ items (simulated but more dynamic)
  const items = React.useMemo(() => {
    const staticItems: PracticeItem[] = [];
    
    if (activeSkill === "listening") {
      LISTENING_SECTIONS.forEach((s, i) => {
        const part = s.title.split(':')[0].trim();
        staticItems.push({ id: 10000 + i, title: s.title, skill: "listening", difficulty: s.difficulty, part });
      });
    } else if (activeSkill === "reading") {
      READING_PASSAGES.forEach((p, i) => {
        const part = `Passage ${i + 1}`;
        staticItems.push({ id: 20000 + i, title: p.title, skill: "reading", difficulty: p.difficulty, part });
      });
    } else if (activeSkill === "speaking") {
      SPEAKING_TOPICS.forEach((t, i) => {
        const part = t.title.split(':')[0].trim();
        staticItems.push({ id: 30000 + i, title: t.title, skill: "speaking", difficulty: "Medium", part });
      });
    } else if (activeSkill === "writing") {
      WRITING_SAMPLES.forEach((s, i) => {
        const part = s.title.split(':')[0].trim();
        staticItems.push({ id: 40000 + i, title: s.title, skill: "writing", difficulty: "Hard", part });
      });
    }

    const generatedItems = Array.from({ length: 2000 }, (_, i) => {
      const topic = ALL_TOPICS[i % ALL_TOPICS.length];
      const parts = SKILL_PARTS[activeSkill];
      const part = parts[i % parts.length];
      
      return {
        id: i + 1,
        title: `${topic}: ${part}`,
        skill: activeSkill,
        difficulty: i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard",
        part: part
      } as PracticeItem;
    });

    return [...staticItems, ...generatedItems];
  }, [activeSkill]);

  const filteredItems = items.filter(item => 
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toString() === searchQuery) &&
    (difficultyFilter === "All" || item.difficulty === difficultyFilter) &&
    (partFilter === "All" || item.part === partFilter)
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

    const userDifficulty = progress?.difficulty || "intermediate";
    const itemDifficulty = item.difficulty;

    try {
      if (item.skill === "listening") {
        const parts = [];
        const partPrompts: Record<string, string> = {
          "Part 1": `Part 1: Social context, 2 speakers (10 questions). Everyday social situation. Difficulty: ${itemDifficulty} (matching ${userDifficulty} level student).`,
          "Part 2": `Part 2: Social context, 1 speaker (10 questions). Monologue on a social topic. Difficulty: ${itemDifficulty} (matching ${userDifficulty} level student).`,
          "Part 3": `Part 3: Educational context, 2-4 speakers (10 questions). Discussion between students. Difficulty: ${itemDifficulty} (matching ${userDifficulty} level student).`,
          "Part 4": `Part 4: Academic lecture, 1 speaker (10 questions). Formal lecture. Difficulty: ${itemDifficulty} (matching ${userDifficulty} level student).`
        };

        const partToGenerate = item.part || "Part 1";
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
          `Generate a FULL IELTS Listening ${partPrompts[partToGenerate]} for the topic: ${item.title}. 
          Adapt content for ${itemDifficulty} difficulty for a ${userDifficulty} level learner. 
          The script MUST be detailed and realistic.
          Questions must be challenging and answerable ONLY from the script.`,
          partSchema,
          "You are an expert IELTS Listening examiner."
        );
        parts.push(partData);
        
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
          `Extract 10 high-level Band 9.0 vocabulary words from this script: ${partData.script}`,
          keyVocabSchema,
          "You are an IELTS vocabulary expert."
        );

        const data = { parts, keyVocabulary: keyVocab };
        setTaskData(data);
        const fullScript = data.parts.map((p: any) => p.script).join("\n\n[NEW SECTION]\n\n");
        generateAudio(fullScript);
      } else if (item.skill === "reading") {
        const parts = [];
        const passagePrompts: Record<string, string> = {
          "Passage 1": `Passage 1: Descriptive/factual (13 questions). Topic: ${item.title}. Difficulty: ${itemDifficulty} (for ${userDifficulty} student).`,
          "Passage 2": `Passage 2: Discursive/analytical (13 questions). Topic: ${item.title}. Difficulty: ${itemDifficulty} (for ${userDifficulty} student).`,
          "Passage 3": `Passage 3: Complex argument/opinion (14 questions). Topic: ${item.title}. Difficulty: ${itemDifficulty} (for ${userDifficulty} student).`
        };

        const partToGenerate = item.part || "Passage 1";
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
          `Generate a FULL IELTS Reading ${passagePrompts[partToGenerate]} for the topic: ${item.title}. 
          Difficulty: ${itemDifficulty} for a ${userDifficulty} level learner. 
          The passage MUST be academic in tone.
          Questions must be challenging and require deep understanding of the text.`,
          passageSchema,
          "You are an expert IELTS Reading examiner."
        );
        parts.push(passageData);

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
          `Extract 10 high-level Band 9.0 vocabulary words from this passage: ${passageData.passage}`,
          keyVocabSchema,
          "You are an IELTS vocabulary expert."
        );

        const data = { parts, keyVocabulary: keyVocab };
        setTaskData(data);
      } else if (item.skill === "writing") {
        const taskPrompts: Record<string, string> = {
          "Task 1": `Task 1: Academic Report (150 words). Topic: ${item.title}. Difficulty: ${itemDifficulty}.`,
          "Task 2": `Task 2: Discursive Essay (250 words). Topic: ${item.title}. Difficulty: ${itemDifficulty}.`
        };

        const partToGenerate = item.part || "Task 1";
        const writingSchema = {
          type: "object",
          properties: {
            task1: {
              type: "object",
              properties: {
                prompt: { type: "string" },
                modelAnswer: { type: "string" }
              },
              required: ["prompt", "modelAnswer"]
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
          required: ["task1", "task2"]
        };

        const writingData = await callGroqJSON(
          `Generate an IELTS Writing ${taskPrompts[partToGenerate]} for a ${userDifficulty} level student. 
          Difficulty: ${itemDifficulty}. 
          Include a high-level model answer.`,
          writingSchema,
          "You are an expert IELTS Writing examiner."
        );
        setTaskData(writingData);
      } else if (item.skill === "speaking") {
        const speakingSchema = {
          type: "object",
          properties: {
            parts: {
              type: "object",
              properties: {
                part1: { type: "string" },
                part2: { type: "string" },
                part3: { type: "string" }
              },
              required: ["part1", "part2", "part3"]
            },
            modelAnswer: { type: "string" },
            keyVocabulary: { type: "string" }
          },
          required: ["parts", "modelAnswer", "keyVocabulary"]
        };

        const speakingData = await callGroqJSON(
          `Generate a FULL IELTS Speaking test for the topic: ${item.title}. 
          Focus specifically on ${item.part || "all parts"}.
          Difficulty: ${itemDifficulty} for a ${userDifficulty} student. 
          Include a model answer and key vocabulary.`,
          speakingSchema,
          "You are an expert IELTS Speaking examiner."
        );
        setTaskData(speakingData);
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
    let band = 6.0;
    let result = "";

    const userDifficulty = progress?.difficulty || "intermediate";
    if (activeSkill === "writing") {
      prompt = `Assess this IELTS Writing response for Module #${selectedItem?.id} at ${userDifficulty} level:\n\nTask 1 Prompt: ${taskData.task1.prompt}\nTask 2 Prompt: ${taskData.task2.prompt}\n\nUser Response: ${userAnswers.writing}\n\nProvide a detailed band score breakdown for both tasks and a "Path to 9.0" section with specific, actionable steps based on their current ${userDifficulty} level. Format as Markdown. End with "Overall Band: X.X"`;
    } else if (activeSkill === "speaking") {
      prompt = `Assess this IELTS Speaking practice session for Module #${selectedItem?.id} at ${userDifficulty} level:\n\nParts 1, 2, 3 Prompts: ${JSON.stringify(taskData.parts)}\n\nUser Notes/Transcript: ${userAnswers.speaking}\n\nProvide a detailed band score breakdown and a "Path to 9.0" section with specific, actionable steps based on their current ${userDifficulty} level. Format as Markdown. End with "Overall Band: X.X"`;
    } else {
      // For listening/reading, we can just compare answers
      const allQuestions = taskData.parts?.flatMap((p: any) => p.questions) || taskData.questions || [];
      const correctCount = allQuestions.filter((q: any) => 
        userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
      ).length;
      
      band = activeSkill === "listening" ? calculateListeningBand(correctCount) : calculateReadingBand(correctCount);
      result = `You got ${correctCount} out of ${allQuestions.length} correct. Estimated Band: ${band}`;
      setFeedback(result);
      
      if (progress) {
        const id = `${activeSkill}-${selectedItem?.id}`;
        const updated = {
          ...progress,
          bands: { ...progress.bands, [activeSkill]: band },
          bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: activeSkill }],
          mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: `Practice: ${activeSkill}`, band, skill: activeSkill }],
          studyMinutes: (progress.studyMinutes || 0) + 20,
          completedPracticeIds: Array.from(new Set([...progress.completedPracticeIds, id])),
          practiceHistory: [
            {
              id,
              title: selectedItem?.title || "Untitled Practice",
              skill: activeSkill,
              date: new Date().toISOString(),
              score: correctCount,
              total: allQuestions.length,
              band,
              answers: userAnswers,
              taskData,
              feedback: result
            },
            ...progress.practiceHistory
          ]
        };
        setProgress(updated);
        saveProgress(updated);
      }
      setIsGenerating(false);
      return;
    }

    try {
      result = await callGroq(prompt, "You are an IELTS examiner.");
      setFeedback(result);
      
      const bandMatch = result.match(/Overall Band:\s*([0-9]\.?[0-9]?)/i);
      band = bandMatch ? parseFloat(bandMatch[1]) : 6.0;

      if (progress) {
        const id = `${activeSkill}-${selectedItem?.id}`;
        const updated = {
          ...progress,
          bands: { ...progress.bands, [activeSkill]: band },
          bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: activeSkill }],
          mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: `Practice: ${activeSkill}`, band, skill: activeSkill }],
          studyMinutes: (progress.studyMinutes || 0) + 20,
          completedPracticeIds: Array.from(new Set([...progress.completedPracticeIds, id])),
          practiceHistory: [
            {
              id,
              title: selectedItem?.title || "Untitled Practice",
              skill: activeSkill,
              date: new Date().toISOString(),
              band,
              answers: userAnswers,
              taskData,
              feedback: result
            },
            ...progress.practiceHistory
          ]
        };
        setProgress(updated);
        saveProgress(updated);
      }
    } catch (error) {
      console.error("Assessment failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Practice Library Hero Section */}
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
              <ClipboardList size={16} className="text-blue-secondary" /> Resource Hub
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="recipe-editorial-h1 mb-2"
            >
              Practice <span className="text-blue-primary">Library</span>
            </motion.h2>

            <div className="flex items-center gap-2 mb-8 px-4 py-1.5 bg-blue-primary/10 border border-blue-primary/20 rounded-full w-fit">
              <Sparkles size={14} className="text-blue-primary" />
              <span className="text-[10px] font-bold text-blue-primary uppercase tracking-[0.2em]">
                Target Level: {progress?.difficulty || "intermediate"}
              </span>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary leading-relaxed font-medium max-w-2xl"
            >
              Access 2000+ AI-generated IELTS practice modules across all skills. 
              Filter by difficulty, topic, or specific question types.
            </motion.p>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setShowHistory(true)}
                className="btn btn-secondary flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest"
              >
                <History size={16} /> Practice History
              </button>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap md:flex-nowrap bg-bg-2/50 backdrop-blur-xl p-2 rounded-2xl border border-white/5 shadow-2xl"
          >
            {(["listening", "reading", "writing", "speaking"] as Skill[]).map((skill) => (
              <button 
                key={skill}
                onClick={() => { setActiveSkill(skill); setSelectedItem(null); setTaskData(null); }}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500",
                  activeSkill === skill 
                    ? "bg-blue-primary text-white shadow-xl shadow-blue-primary/30 scale-105" 
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                )}
              >
                {skill === "listening" && <Headphones size={14} />}
                {skill === "reading" && <BookOpen size={14} />}
                {skill === "writing" && <PenTool size={14} />}
                {skill === "speaking" && <Mic size={14} />}
                <span className="hidden md:inline">{skill}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {!selectedItem ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-primary transition-colors" size={20} />
              <input 
                type="text"
                placeholder={`Search 2000+ ${activeSkill} modules by topic, title or ID...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex bg-bg-2 p-1 rounded-xl border border-border shadow-inner gap-1">
                {["All", "Easy", "Medium", "Hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      difficultyFilter === diff 
                        ? "bg-white text-blue-primary shadow-sm" 
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="flex bg-bg-2 p-1 rounded-xl border border-border shadow-inner gap-1">
                <select
                  value={partFilter}
                  onChange={(e) => setPartFilter(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none text-text-muted hover:text-text-primary transition-all cursor-pointer"
                >
                  <option value="All">All Parts</option>
                  {SKILL_PARTS[activeSkill].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setSearchQuery("")}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                searchQuery === "" ? "bg-blue-primary text-white border-blue-primary" : "bg-bg-2 text-text-muted border-border hover:border-blue-primary/50"
              )}
            >
              All Topics
            </button>
            {Object.keys(TOPICS_BY_CATEGORY).map(cat => (
              <button
                key={cat}
                onClick={() => setSearchQuery(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                  searchQuery === cat ? "bg-blue-primary text-white border-blue-primary" : "bg-bg-2 text-text-muted border-border hover:border-blue-primary/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isCompleted = progress?.completedPracticeIds?.includes(`${item.skill}-${item.id}`);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleSelectItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectItem(item);
                    }
                  }}
                  className={cn(
                    "bg-bg-1 border rounded-xl text-left group transition-all p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden cursor-pointer",
                    isCompleted ? "border-emerald-accent/30 bg-emerald-accent/5" : "border-white/5 hover:border-blue-primary/30 hover:shadow-xl hover:shadow-blue-primary/5"
                  )}
                >
                  {isCompleted && (
                    <div className="absolute top-0 right-0 p-2 bg-emerald-accent text-white rounded-bl-xl shadow-lg">
                      <Check size={12} />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <span className={cn(
                          "tag text-[10px]",
                          item.difficulty === "Easy" ? "tag-emerald" : item.difficulty === "Medium" ? "tag-blue" : "tag-violet"
                        )}>
                          {item.difficulty}
                        </span>
                        <span className="tag tag-blue text-[10px]">
                          {item.part}
                        </span>
                      </div>
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
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => toggleComplete(e, item)}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          isCompleted ? "bg-emerald-accent text-white" : "bg-bg-2 text-text-muted hover:text-emerald-accent hover:bg-emerald-accent/10"
                        )}
                        title={isCompleted ? "Mark as Incomplete" : "Mark as Done"}
                      >
                        {isCompleted ? <CheckCircle2 size={14} /> : <Check size={14} />}
                      </button>
                      <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
                <div className="flex items-center gap-4">
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-blue-primary font-bold text-sm animate-pulse">
                      <Loader2 className="animate-spin" size={18} />
                      AI Generating...
                    </div>
                  )}
                  {!isGenerating && taskData && (
                    <button 
                      onClick={() => handleSelectItem(selectedItem)}
                      className="btn btn-ghost px-4 py-2 text-[10px] rounded-lg flex items-center gap-2"
                    >
                      <RotateCcw size={14} />
                      Regenerate Task
                    </button>
                  )}
                </div>
              </div>

            {taskData && (
              <div className="space-y-8">
                <div className="space-y-8">
                  {activeSkill === "listening" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-bg-2 rounded-xl border border-border flex flex-col items-center gap-4">
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
                                  className="input w-full"
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
                          <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-xl border border-border h-[500px] overflow-y-auto custom-scrollbar">
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
                                  className="input w-full"
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
                        <div className="p-6 bg-bg-2 rounded-xl border border-border">
                          <div className="text-[10px] font-bold text-blue-primary uppercase tracking-widest mb-2">Writing Task 1</div>
                          <div className="prose prose-sm max-w-none text-text-primary leading-relaxed mb-6">
                            <ReactMarkdown>{ensureString(taskData.task1.prompt)}</ReactMarkdown>
                          </div>
                          {taskData.task1.chartData && (
                            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                              <ChartDisplay 
                                type={taskData.task1.chartType as any} 
                                data={taskData.task1.chartData} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="p-6 bg-bg-2 rounded-xl border border-border">
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
                        className="textarea h-96"
                      />
                    </div>

                    {showResults && (
                      <div className="p-8 bg-bg-2 border border-border rounded-2xl space-y-6">
                        <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                          Model Answers (Band 9.0)
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="text-xs font-bold text-blue-primary uppercase tracking-widest">Task 1 Model Answer</div>
                            <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-xl border border-border">
                              <ReactMarkdown>{ensureString(taskData.task1.modelAnswer)}</ReactMarkdown>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="text-xs font-bold text-violet-accent uppercase tracking-widest">Task 2 Model Answer</div>
                            <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-xl border border-border">
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
                    <div className="p-6 bg-bg-2 rounded-xl border border-border text-center">
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
                        className="textarea h-40"
                      />
                    </div>

                    {showResults && taskData.modelAnswer && (
                      <div className="p-8 bg-bg-2 border border-border rounded-2xl">
                        <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                          Model Answer (Band 9.0)
                        </h4>
                        <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-xl border border-border">
                          <ReactMarkdown>{ensureString(taskData.modelAnswer)}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>

                <div className="flex justify-center pt-8">
                  {!showResults ? (
                    <button 
                      onClick={submitAnswers}
                      disabled={isGenerating || (activeSkill === "writing" && !userAnswers.writing) || (activeSkill === "speaking" && !userAnswers.speaking)}
                      className="btn btn-primary px-12 py-4 rounded-xl shadow-xl shadow-blue-primary/20 flex items-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      Submit for Assessment
                    </button>
                  ) : (
                    <div className="w-full space-y-6">
                      <div className="p-8 bg-blue-dim border border-blue-primary/20 rounded-2xl">
                        <h4 className="text-lg font-bold text-blue-secondary mb-4 flex items-center gap-2">
                          <Trophy size={24} />
                          AI Assessment & Feedback
                        </h4>
                        <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed">
                          <ReactMarkdown>{ensureString(feedback || "Calculating results...")}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {taskData.keyVocabulary && (
                        <div className="p-8 bg-bg-2 border border-border rounded-2xl">
                          <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Sparkles size={24} className="text-amber-accent" />
                            Key Vocabulary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(taskData.keyVocabulary) ? taskData.keyVocabulary.map((item: any, i: number) => (
                              <div key={i} className="p-4 bg-bg-1 rounded-xl border border-border">
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
                        <div className="p-8 bg-bg-2 border border-border rounded-2xl">
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
            )}
          </div>
        </motion.div>
      )}
      {/* Practice History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-bg-1 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-bg-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-primary/10 flex items-center justify-center text-blue-primary">
                    <History size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Practice History</h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Review your past sessions</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowHistory(false);
                    setSelectedHistoryItem(null);
                  }}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex">
                {/* List of sessions */}
                <div className={cn(
                  "w-full md:w-1/3 border-r border-white/5 overflow-y-auto p-4 space-y-3 bg-bg-1/50",
                  selectedHistoryItem && "hidden md:block"
                )}>
                  {progress?.practiceHistory && progress.practiceHistory.length > 0 ? (
                    progress.practiceHistory.map((session, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedHistoryItem(session)}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all border flex flex-col gap-2",
                          selectedHistoryItem?.date === session.date 
                            ? "bg-blue-primary/10 border-blue-primary/30" 
                            : "bg-bg-2/50 border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "tag text-[9px]",
                            session.skill === "listening" ? "tag-blue" :
                            session.skill === "reading" ? "tag-emerald" :
                            session.skill === "writing" ? "tag-violet" : "tag-amber"
                          )}>
                            {session.skill}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-text-primary line-clamp-1">{session.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1 text-emerald-accent font-bold text-xs">
                            <Trophy size={12} />
                            Band {session.band}
                          </div>
                          {session.score !== undefined && (
                            <span className="text-[10px] text-text-muted font-bold">
                              {session.score}/{session.total}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                      <ClipboardList size={48} className="mb-4 text-text-muted" />
                      <p className="text-sm font-bold text-text-muted uppercase tracking-widest">No history yet</p>
                      <p className="text-xs text-text-muted mt-2">Complete a practice to see it here.</p>
                    </div>
                  )}
                </div>

                {/* Session Details */}
                <div className={cn(
                  "flex-1 overflow-y-auto p-8",
                  !selectedHistoryItem && "hidden md:flex items-center justify-center text-center opacity-30"
                )}>
                  {selectedHistoryItem ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setSelectedHistoryItem(null)}
                          className="md:hidden flex items-center gap-2 text-blue-primary font-bold text-xs uppercase tracking-widest mb-4"
                        >
                          <ArrowLeft size={14} /> Back to list
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-bg-2 rounded-2xl border border-white/5">
                        <div>
                          <h3 className="text-2xl font-bold text-text-primary mb-2">{selectedHistoryItem.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-text-muted">
                            <span className="flex items-center gap-1.5">
                              <FileText size={14} /> {selectedHistoryItem.skill.charAt(0).toUpperCase() + selectedHistoryItem.skill.slice(1)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <History size={14} /> {new Date(selectedHistoryItem.date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-emerald-accent/10 p-4 rounded-xl border border-emerald-accent/20">
                          <div className="w-12 h-12 rounded-lg bg-emerald-accent flex items-center justify-center text-white shadow-lg shadow-emerald-accent/20">
                            <Trophy size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-accent uppercase tracking-widest">Final Band</p>
                            <p className="text-2xl font-black text-text-primary">{selectedHistoryItem.band}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-8">
                        <section>
                          <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <MessageSquare size={20} className="text-blue-primary" />
                            Examiner Feedback
                          </h4>
                          <div className="bg-bg-2 p-6 rounded-2xl border border-white/5 prose prose-invert max-w-none">
                            <ReactMarkdown>{selectedHistoryItem.feedback}</ReactMarkdown>
                          </div>
                        </section>

                        <section>
                          <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <ClipboardList size={20} className="text-violet-accent" />
                            Your Answers
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(selectedHistoryItem.answers).map(([id, answer]: [string, any]) => (
                              <div key={id} className="p-4 bg-bg-2 rounded-xl border border-white/5 flex flex-col gap-1">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Question {id}</span>
                                <p className="text-text-primary font-medium">{answer}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-xs">
                      <History size={64} className="mx-auto mb-6 text-blue-primary/20" />
                      <h3 className="text-xl font-bold text-text-primary mb-2">Select a Session</h3>
                      <p className="text-sm text-text-muted">Choose a practice session from the list to review your performance and feedback.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
