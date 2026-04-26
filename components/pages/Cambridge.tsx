"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Book, 
  Headphones, 
  PenTool, 
  Mic, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Trophy,
  AlertCircle,
  FileText,
  History,
  Check,
  X,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { callGroq } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav } from "@/lib/audio";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { CAMBRIDGE_TEST_DATA } from "@/lib/data/cambridge_data";
import { getProgress, saveProgress, type UserProgress } from "@/lib/store";
import { calculateListeningBand, calculateReadingBand } from "@/lib/ielts";

interface Test {
  id: string;
  label: string;
  skills: string[];
}

interface Book {
  id: string;
  title: string;
  year: string;
  tests: Test[];
  color: string;
}

const CAMBRIDGE_BOOKS: Book[] = [
  {
    id: "c19",
    title: "Cambridge IELTS 19",
    year: "2024",
    color: "from-[#6366f1] to-[#4338ca]",
    tests: [
      { id: "c19-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c19-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c19-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c19-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c18",
    title: "Cambridge IELTS 18",
    year: "2023",
    color: "from-[#10b981] to-[#059669]",
    tests: [
      { id: "c18-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c18-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c18-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c18-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c17",
    title: "Cambridge IELTS 17",
    year: "2022",
    color: "from-[#f59e0b] to-[#d97706]",
    tests: [
      { id: "c17-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c17-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c17-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c17-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c16",
    title: "Cambridge IELTS 16",
    year: "2021",
    color: "from-[#ec4899] to-[#be185d]",
    tests: [
      { id: "c16-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c16-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c16-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c16-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c15",
    title: "Cambridge IELTS 15",
    year: "2020",
    color: "from-[#3b82f6] to-[#1d4ed8]",
    tests: [
      { id: "c15-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c15-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c15-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c15-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c14",
    title: "Cambridge IELTS 14",
    year: "2019",
    color: "from-[#8b5cf6] to-[#6d28d9]",
    tests: [
      { id: "c14-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c14-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c14-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c14-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c13",
    title: "Cambridge IELTS 13",
    year: "2018",
    color: "from-[#ef4444] to-[#b91c1c]",
    tests: [
      { id: "c13-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c13-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c13-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c13-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c12",
    title: "Cambridge IELTS 12",
    year: "2017",
    color: "from-[#06b6d4] to-[#0891b2]",
    tests: [
      { id: "c12-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c12-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c12-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c12-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  },
  {
    id: "c11",
    title: "Cambridge IELTS 11",
    year: "2016",
    color: "from-[#f97316] to-[#ea580c]",
    tests: [
      { id: "c11-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c11-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c11-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing", "Speaking"] },
      { id: "c11-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing", "Speaking"] }
    ]
  }
];

const TEST_DATA = CAMBRIDGE_TEST_DATA;

export default function Cambridge() {
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [essay, setEssay] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  // Audio state for Cambridge Listening
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Analysis state
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Progress state
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [speakingFeedback, setSpeakingFeedback] = useState<string | null>(null);
  const [isAnalyzingSpeaking, setIsAnalyzingSpeaking] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    getProgress().then(setProgress);
  }, []);

  const toggleComplete = async (id: string) => {
    if (!progress) return;

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

  const handleGradeEssay = async () => {
    if (!activeBook || !activeTest) return;
    setIsGrading(true);
    setFeedback(null);
    const systemPrompt = `You are an IELTS Writing Examiner. Grade the student's Writing Task 2 essay from ${activeBook.title} ${activeTest.label}.
    
    User's Current Level: ${progress?.difficulty || "intermediate"}
    (If Level is Beginner: Focusing on basic grammar and structure.
     If Level is Intermediate: Focus on coherence and vocabulary variety.
     If Level is Advanced: Focus on academic tone and complex structures).

    Provide:
    1. Overall Band Score (0-9).
    2. Feedback on: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
    3. 2-3 specific suggestions for improvement.
    Use markdown for formatting. Keep it professional and accurate.`;

    try {
      const result = await callGroq(`Essay:\n${essay}`, systemPrompt);
      setFeedback(result);

      // Save to progress
      if (progress) {
        const bandMatch = result.match(/Overall Band:\s*([0-9]\.?[0-9]?)/i);
        const band = bandMatch ? parseFloat(bandMatch[1]) : 6.0;
        const id = `cambridge-${activeTest.id}-writing`;
        
        const updated = {
          ...progress,
          completedPracticeIds: Array.from(new Set([...progress.completedPracticeIds, id])),
          practiceHistory: [
            {
              id,
              title: `${activeBook.title} ${activeTest.label} Writing`,
              skill: "writing",
              date: new Date().toISOString(),
              band,
              answers: { essay },
              taskData: { testId: activeTest.id, bookId: activeBook.id },
              feedback: result
            },
            ...progress.practiceHistory
          ]
        };
        setProgress(updated);
        await saveProgress(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleGenerateAudio = async (text: string) => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    setAudioUrl(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Split text into chunks to avoid TTS limits and ensure full length
      const chunks = text.split(/(?<=[.!?])\s+/);
      const pcmChunks: Int16Array[] = [];
      
      // Process in small batches
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
      } else {
        throw new Error("Failed to generate audio data");
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      setAudioError("Could not generate audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAnalyzeTest = async () => {
    if (!activeBook || !activeTest) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setActiveSkill("Analysis");

    const prompt = `Provide a comprehensive analysis of Cambridge IELTS ${activeBook.id.replace('c', '')} ${activeTest.label}. 
    Focus on:
    1. Difficulty level of each section (Listening, Reading, Writing).
    2. Common traps or tricky areas in this specific test.
    3. Key vocabulary and themes covered.
    4. Strategic advice for tackling this test.
    Use markdown formatting.`;

    try {
      const result = await callGroq(prompt);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleAnalyzeSpeaking = async () => {
    if (!recordedAudio || !activeBook || !activeTest) return;
    setIsAnalyzingSpeaking(true);
    setSpeakingFeedback(null);

    try {
      const response = await fetch(recordedAudio);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Audio = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const testId = activeTest?.id || "";
      const data = TEST_DATA[testId]?.speaking;
      
      const prompt = `You are an expert IELTS Speaking Examiner. Analyze the provided audio response for an IELTS Speaking Part 2 task.
      
      User's Current Level: ${progress?.difficulty || "intermediate"} (Provide feedback helpful for this level)
      
      Topic: ${data?.topic || "General Topic"}
      Prompts: ${data?.prompts?.join(', ') || "General prompts"}

      Please provide:
      1. **Estimated Band Score** (0-9) for:
         - Fluency and Coherence
         - Lexical Resource
         - Grammatical Range and Accuracy
         - Pronunciation
      2. **Overall Estimated Band Score**
      3. **Detailed Feedback** on each criteria.
      4. **Specific Suggestions for Improvement** (e.g., word stress, intonation, specific vocabulary).
      5. **A Sample High-Band Response** (Band 8.5+) for this topic.

      Format the output using clear Markdown headers and bullet points. Be encouraging but realistic.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { text: prompt },
          { inlineData: { data: base64Audio, mimeType: "audio/wav" } }
        ]
      });

      const feedbackText = result.text;
      if (!feedbackText) {
        throw new Error("AI failed to generate feedback.");
      }
      setSpeakingFeedback(feedbackText);

      // Save to progress
      if (progress) {
        const bandMatch = feedbackText.match(/Band:\s*([0-9]\.?[0-9]?)/i);
        const band = bandMatch ? parseFloat(bandMatch[1]) : 6.0;
        const id = `cambridge-${activeTest.id}-speaking`;
        
        const updated: UserProgress = {
          ...progress,
          completedPracticeIds: Array.from(new Set([...progress.completedPracticeIds, id])),
          practiceHistory: [
            {
              id,
              title: `${activeBook.title} ${activeTest.label} Speaking`,
              skill: "speaking",
              date: new Date().toISOString(),
              band,
              answers: { audio: "Recorded response" },
              taskData: { testId: activeTest.id, bookId: activeBook.id },
              feedback: feedbackText
            },
            ...progress.practiceHistory
          ]
        };
        setProgress(updated);
        await saveProgress(updated);
      }
    } catch (error) {
      console.error("Error analyzing speaking:", error);
    } finally {
      setIsAnalyzingSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const renderListening = () => {
    const testId = activeTest?.id || "";
    const data = TEST_DATA[testId]?.listening;
    if (!data) return (
      <div className="card bg-bg-2 border-dashed border-border-2 p-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
        <h3 className="text-lg font-bold mb-2">Listening Content Coming Soon</h3>
        <p className="text-sm text-text-muted">Audio and transcripts are being prepared for this test.</p>
        <button onClick={() => setActiveSkill(null)} className="btn btn-ghost mt-4">Back to Skills</button>
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="card bg-blue-dim/10 border-blue-primary/20 p-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-secondary/20">
            <Headphones size={32} />
          </div>
          <div>
            <h3 className="text-xl font-serif font-black text-text-primary">{data.title}</h3>
            <p className="text-xs text-text-muted uppercase tracking-widest font-bold">Section 1: Social Needs</p>
          </div>
          <div className="ml-auto w-full max-w-xs">
            {audioUrl ? (
              <AudioPlayer 
                src={audioUrl} 
                className="bg-transparent border-none shadow-none p-0"
              />
            ) : (
              <button 
                onClick={() => handleGenerateAudio(data.transcript || "")}
                disabled={isGeneratingAudio}
                className="btn btn-primary px-6 flex items-center gap-2 w-full"
              >
                {isGeneratingAudio ? <Loader2 size={18} className="animate-spin" /> : "Generate & Play Audio"}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card bg-bg-2 p-8">
            <h4 className="text-xs font-black text-blue-secondary uppercase tracking-widest mb-6 border-b border-blue-secondary/10 pb-2">Questions 1-2: Gap Fill</h4>
            <div className="space-y-8">
              {data.questions.map((q: any) => (
                <div key={q.id} className="space-y-3">
                  <p className="text-sm font-bold text-text-primary">{q.id}. {q.question}</p>
                  <input 
                    type="text"
                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="input"
                    placeholder="Type answer..."
                  />
                  {showResults && (
                    <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-2", userAnswers[q.id]?.toLowerCase() === q.answer.toLowerCase() ? "text-green-accent" : "text-pink-accent")}>
                      {userAnswers[q.id]?.toLowerCase() === q.answer.toLowerCase() ? "✓ Correct" : `✗ Incorrect (Answer: ${q.answer})`}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                if (!data) return;
                setShowResults(true);
                if (progress && activeTest) {
                  const correctCount = data.questions.filter((q: any) => 
                    userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
                  ).length;
                  const band = calculateListeningBand(correctCount);
                  const id = `cambridge-${activeTest.id}-listening`;
                  
                  const updated: UserProgress = {
                    ...progress,
                    completedPracticeIds: Array.from(new Set([...progress.completedPracticeIds, id])),
                    practiceHistory: [
                      {
                        id,
                        title: `${activeBook?.title} ${activeTest.label} Listening`,
                        skill: "listening",
                        date: new Date().toISOString(),
                        score: correctCount,
                        total: data.questions.length,
                        band,
                        answers: userAnswers,
                        taskData: { testId: activeTest.id, bookId: activeBook?.id || "" },
                        feedback: `Score: ${correctCount}/${data.questions.length}. Band: ${band}`
                      },
                      ...progress.practiceHistory
                    ]
                  };
                  setProgress(updated);
                  saveProgress(updated);
                }
              }}
              className="btn btn-primary w-full mt-10"
              disabled={Object.keys(userAnswers).length < (data?.questions?.length || 0)}
            >
              Check Answers
            </button>

            {showResults && data && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-2xl bg-blue-dim/10 border border-blue-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-primary/20 flex items-center justify-center text-blue-primary">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Your Result</div>
                      <div className="text-lg font-serif font-black text-text-primary">Band {calculateListeningBand(data.questions.filter((q: any) => userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()).length)}</div>
                    </div>
                  </div>
                  {!progress?.completedPracticeIds?.includes(`cambridge-${activeTest?.id}-listening`) && (
                    <button
                      onClick={() => activeTest && toggleComplete(`cambridge-${activeTest.id}-listening`)}
                      className="btn btn-primary px-4 py-2 flex items-center gap-2 text-[10px]"
                    >
                      <Check size={14} />
                      Mark as Done
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="card bg-bg-1 border-border-2 p-8">
            <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Transcript Preview</h4>
            <div className="text-xs text-text-secondary leading-relaxed space-y-2 italic">
              {data?.transcript?.split('\n').map((line: string, i: number) => <p key={i}>{line}</p>)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (activeSkill === "Listening" && activeBook && activeTest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveSkill(null); setShowResults(false); setUserAnswers({}); setAudioUrl(null); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back to {activeTest.label}
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            {activeBook.title} — {activeTest.label} — Listening
          </div>
        </div>
        {renderListening()}
      </div>
    );
  }

  if (activeSkill === "Analysis" && activeBook && activeTest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveSkill(null); setAnalysis(null); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back to {activeTest.label}
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            {activeBook.title} — {activeTest.label} — Test Analysis
          </div>
        </div>

        <div className="card bg-bg-2 border-blue-primary/30 p-8 min-h-[400px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Loader2 size={48} className="text-blue-primary animate-spin mb-4" />
              <p className="text-sm font-bold text-text-muted uppercase tracking-widest">AI is analyzing the test structure...</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert prose-sm max-w-none markdown-body"
            >
              <ReactMarkdown>{analysis || "No analysis available."}</ReactMarkdown>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const renderSpeaking = () => {
    const testId = activeTest?.id || "";
    const data = TEST_DATA[testId]?.speaking;
    if (!data) return (
      <div className="card bg-bg-2 border-dashed border-border-2 p-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
        <h3 className="text-lg font-bold mb-2">Content Coming Soon</h3>
        <p className="text-sm text-text-muted">We are currently digitizing the speaking prompts for this test.</p>
        <button onClick={() => setActiveSkill(null)} className="btn btn-ghost mt-4">Back to Skills</button>
      </div>
    );

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="card bg-bg-1 border-blue-primary/20 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-dim rounded-2xl flex items-center justify-center text-blue-secondary mx-auto shadow-xl">
            <Mic size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-text-primary mb-2">Speaking Part 2: Cue Card</h3>
            <p className="text-sm text-text-muted">Record your response for the following topic. You should speak for 1-2 minutes.</p>
          </div>
          
          <div className="card bg-bg-2 border-white/5 p-8 text-left max-w-2xl mx-auto">
            <h4 className="text-lg font-bold text-text-primary mb-4 underline decoration-blue-primary/30 underline-offset-4">{data.topic}</h4>
            <ul className="space-y-3">
              {data.prompts.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-primary mt-1.5 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-6 py-8">
            {!recordedAudio ? (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
                  isRecording 
                    ? "bg-pink-accent animate-pulse scale-110 shadow-pink-accent/40" 
                    : "bg-blue-primary hover:bg-blue-secondary shadow-blue-primary/40"
                )}
              >
                {isRecording ? <X size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-4 justify-center">
                  <AudioPlayer src={recordedAudio} />
                  <button 
                    onClick={() => { setRecordedAudio(null); setSpeakingFeedback(null); }}
                    className="p-3 bg-bg-3 hover:bg-bg-2 rounded-xl text-text-muted hover:text-pink-accent transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {!speakingFeedback && (
                  <button
                    onClick={handleAnalyzeSpeaking}
                    disabled={isAnalyzingSpeaking}
                    className="btn btn-primary flex items-center gap-2 px-8"
                  >
                    {isAnalyzingSpeaking ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {isAnalyzingSpeaking ? "Analyzing Pronunciation..." : "Get AI Feedback"}
                  </button>
                )}
              </div>
            )}
            
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
              {isRecording 
                ? `Recording: ${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')} — Click to stop` 
                : recordedAudio ? "Review your recording" : "Click to start recording"}
            </p>
          </div>
        </div>

        {speakingFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-bg-2 border-blue-primary/30 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-primary/20 flex items-center justify-center text-blue-primary">
                <Trophy size={20} />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-text-primary">Performance Analysis</h4>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Detailed AI Feedback</p>
              </div>
              <div className="ml-auto">
                {!progress?.completedPracticeIds?.includes(`cambridge-${activeTest?.id}-speaking`) && (
                  <button
                    onClick={() => activeTest && toggleComplete(`cambridge-${activeTest.id}-speaking`)}
                    className="btn btn-primary px-4 py-2 flex items-center gap-2 text-[10px]"
                  >
                    <Check size={14} />
                    Mark as Done
                  </button>
                )}
              </div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none markdown-body">
              <ReactMarkdown>{speakingFeedback}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderReading = () => {
    const testId = activeTest?.id || "";
    const data = TEST_DATA[testId]?.reading;
    if (!data) return (
      <div className="card bg-bg-2 border-dashed border-border-2 p-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
        <h3 className="text-lg font-bold mb-2">Content Coming Soon</h3>
        <p className="text-sm text-text-muted">We are currently digitizing the reading passages for this test.</p>
        <button onClick={() => setActiveSkill(null)} className="btn btn-ghost mt-4">Back to Skills</button>
      </div>
    );

    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card bg-bg-1 border-border-2 p-8 overflow-y-auto max-h-[600px] shadow-sm">
          <h3 className="text-2xl font-serif font-black mb-6 text-blue-secondary">{data.title}</h3>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-text-primary space-y-4">
            {data.passage?.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
          </div>
        </div>
        <div className="space-y-6">
          <div className="card bg-bg-2 p-8">
            <h4 className="text-xs font-black text-blue-secondary uppercase tracking-widest mb-6 border-b border-blue-secondary/10 pb-2">Questions 1-3: True, False, Not Given</h4>
            <div className="space-y-8">
              {data.questions.map((q: any) => (
                <div key={q.id} className="space-y-3">
                  <p className="text-sm font-bold text-text-primary">{q.id}. {q.question}</p>
                  <div className="flex gap-2">
                    {["TRUE", "FALSE", "NOT GIVEN"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                          userAnswers[q.id] === opt 
                            ? "bg-blue-secondary text-white border-blue-secondary shadow-lg shadow-blue-secondary/20" 
                            : "bg-bg-3 text-text-muted border-border-2 hover:border-blue-secondary/50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showResults && (
                    <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-2", userAnswers[q.id] === q.answer ? "text-green-accent" : "text-pink-accent")}>
                      {userAnswers[q.id] === q.answer ? "✓ Correct" : `✗ Incorrect (Answer: ${q.answer})`}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                if (!data) return;
                setShowResults(true);
                if (progress && activeTest) {
                  const correctCount = data.questions.filter((q: any) => 
                    userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
                  ).length;
                  const band = calculateReadingBand(correctCount);
                  const id = `cambridge-${activeTest.id}-reading`;
                  
                  const updated: UserProgress = {
                    ...progress,
                    completedPracticeIds: Array.from(new Set([...progress.completedPracticeIds, id])),
                    practiceHistory: [
                      {
                        id,
                        title: `${activeBook?.title} ${activeTest.label} Reading`,
                        skill: "reading",
                        date: new Date().toISOString(),
                        score: correctCount,
                        total: data.questions.length,
                        band,
                        answers: userAnswers,
                        taskData: { testId: activeTest.id, bookId: activeBook?.id || "" },
                        feedback: `Score: ${correctCount}/${data.questions.length}. Band: ${band}`
                      },
                      ...progress.practiceHistory
                    ]
                  };
                  setProgress(updated);
                  saveProgress(updated);
                }
              }}
              className="btn btn-primary w-full mt-10"
              disabled={Object.keys(userAnswers).length < (data?.questions?.length || 0)}
            >
              Check Answers
            </button>

            {showResults && data && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 rounded-2xl bg-blue-dim/10 border border-blue-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-primary/20 flex items-center justify-center text-blue-primary">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Your Result</div>
                      <div className="text-lg font-serif font-black text-text-primary">Band {calculateReadingBand(data.questions.filter((q: any) => userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()).length)}</div>
                    </div>
                  </div>
                  {!progress?.completedPracticeIds?.includes(`cambridge-${activeTest?.id}-reading`) && (
                    <button
                      onClick={() => activeTest && toggleComplete(`cambridge-${activeTest.id}-reading`)}
                      className="btn btn-primary px-4 py-2 flex items-center gap-2 text-[10px]"
                    >
                      <Check size={14} />
                      Mark as Done
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (activeSkill === "Reading" && activeBook && activeTest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveSkill(null); setShowResults(false); setUserAnswers({}); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back to {activeTest.label}
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            {activeBook.title} — {activeTest.label} — Reading
          </div>
        </div>
        {renderReading()}
      </div>
    );
  }

  if (activeSkill === "Writing" && activeBook && activeTest) {
    const data = TEST_DATA[activeTest.id]?.writing || {
      task1: "The chart below shows the percentage of people who used different modes of transport in a city in 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      task2: "Some people believe that technology has made our lives more complex, while others argue it has simplified them. Discuss both views and give your own opinion."
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveSkill(null); setFeedback(null); setEssay(""); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back to {activeTest.label}
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            {activeBook.title} — {activeTest.label} — Writing
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card bg-bg-2 border-blue-primary/30 p-8">
            <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-4">
              <PenTool size={14} /> Task 1: Academic Report
            </div>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed italic">
              &quot;{data.task1}&quot;
            </p>
            <button 
              onClick={() => setEssay(prev => prev || "Task 1 Response:\n\n")}
              className="btn btn-ghost text-[10px] font-bold uppercase tracking-widest"
            >
              Practice Task 1
            </button>
          </div>

          <div className="card bg-bg-2 border-blue-primary/30 p-8">
            <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-4">
              <PenTool size={14} /> Task 2: Argumentative Essay
            </div>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed italic">
              &quot;{data.task2}&quot;
            </p>
            <button 
              onClick={() => setEssay(prev => prev || "Task 2 Response:\n\n")}
              className="btn btn-ghost text-[10px] font-bold uppercase tracking-widest"
            >
              Practice Task 2
            </button>
          </div>
        </div>
        
        <div className="card bg-bg-2 border-blue-primary/30 p-8">
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Type your response here..."
            className="textarea min-h-[400px]"
          />

          <div className="flex justify-between items-center">
            <div className="text-xs text-text-muted">
              Word Count: {essay.trim() ? essay.trim().split(/\s+/).length : 0}
            </div>
            <button 
              onClick={handleGradeEssay}
              disabled={isGrading || essay.length < 50}
              className="btn btn-primary px-8"
            >
              {isGrading ? <><Loader2 size={18} className="animate-spin" /> Grading...</> : "Submit for AI Grading"}
            </button>
          </div>
        </div>

        {feedback && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-blue-dim/10 border-blue-primary/20 p-8"
          >
            <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-4">
              <Trophy size={16} /> AI Examiner Feedback
            </div>
            <div className="prose prose-invert prose-sm max-w-none markdown-body mb-8">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>

            {!progress?.completedPracticeIds?.includes(`cambridge-${activeTest?.id}-${activeSkill?.toLowerCase()}`) && (
              <button
                onClick={() => activeTest && activeSkill && toggleComplete(`cambridge-${activeTest.id}-${activeSkill.toLowerCase()}`)}
                className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 group"
              >
                <Check size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-black uppercase tracking-widest">Mark this section as Done</span>
              </button>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  if (activeSkill === "Speaking" && activeBook && activeTest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveSkill(null); setSpeakingFeedback(null); setRecordedAudio(null); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back to {activeTest.label}
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            {activeBook.title} — {activeTest.label} — Speaking
          </div>
        </div>
        {renderSpeaking()}
      </div>
    );
  }

  if (activeTest && activeBook) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back to Tests
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            {activeBook.title} — {activeTest.label}
          </div>
        </div>

        <div className="card bg-bg-2 border-blue-primary/30 text-center py-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-primary to-transparent opacity-50" />
          <div className="w-20 h-20 bg-blue-dim rounded-3xl flex items-center justify-center text-blue-secondary mx-auto mb-6 shadow-xl shadow-blue-primary/10 rotate-3 group-hover:rotate-6 transition-transform">
            <Book size={40} />
          </div>
          <h3 className="text-3xl font-serif font-black mb-4 tracking-tight">Practice Mode: {activeTest.label}</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed mb-10 font-medium">
            Master the official Cambridge IELTS papers. Get instant AI grading, detailed feedback, and track your progress toward your target band score.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto px-6">
            {[
              { name: "Listening", icon: Headphones, color: "blue" },
              { name: "Reading", icon: Book, color: "emerald" },
              { name: "Writing", icon: PenTool, color: "violet" },
              { name: "Speaking", icon: Mic, color: "orange" }
            ].map((skill) => {
              const isDone = progress?.completedPracticeIds?.includes(`cambridge-${activeTest.id}-${skill.name.toLowerCase()}`);
              return (
                <button 
                  key={skill.name}
                  onClick={() => setActiveSkill(skill.name)}
                  className={cn(
                    "relative p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-4 group overflow-hidden",
                    isDone 
                      ? "bg-emerald-accent/5 border-emerald-accent/30 text-emerald-accent" 
                      : "bg-bg-1 border-white/5 hover:border-blue-primary/50 text-text-primary hover:bg-bg-2"
                  )}
                >
                  {isDone && (
                    <div className="absolute top-0 right-0 p-2 bg-emerald-accent text-white rounded-bl-xl shadow-lg">
                      <Check size={12} />
                    </div>
                  )}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    isDone ? "bg-emerald-accent/20" : "bg-bg-3"
                  )}>
                    <skill.icon size={28} />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black uppercase tracking-[0.2em]">{skill.name}</span>
                    {isDone && <span className="text-[10px] font-bold mt-1 opacity-70">Completed</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-border-2 max-w-2xl mx-auto">
            <button 
              onClick={handleAnalyzeTest}
              className="w-full card bg-bg-1 border-blue-primary/20 hover:border-blue-primary flex items-center justify-center gap-3 py-4 group transition-all"
            >
              <Loader2 size={20} className={cn("text-blue-secondary", isAnalyzing ? "animate-spin" : "group-hover:rotate-12 transition-transform")} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-text-primary">Deep Test Analysis</span>
            </button>
          </div>
        </div>

        <div className="card bg-bg-2 border-dashed border-border-2 flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-full bg-bg-3 flex items-center justify-center text-blue-secondary flex-shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary mb-1">Coming Soon: Interactive Mode</h4>
            <p className="text-xs text-text-muted">We are currently digitizing the full Cambridge 19 question sets for a seamless interactive experience.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-1">
            <FileText size={14} /> Official Practice
          </div>
          <h2 className="font-serif text-4xl font-black mb-1 tracking-tighter">Cambridge IELTS</h2>
          <p className="text-sm text-text-muted font-medium">The Gold Standard for IELTS Preparation</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="btn btn-ghost flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest"
          >
            <History size={14} /> History
          </button>
          <div className="bg-blue-dim/20 px-4 py-2 rounded-2xl border border-blue-primary/10">
            <div className="text-[10px] text-blue-secondary font-black uppercase tracking-widest mb-0.5">Available Books</div>
            <div className="text-sm font-bold text-text-primary">11 — 19</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {CAMBRIDGE_BOOKS.map((book) => (
          <motion.button
            key={book.id}
            whileHover={{ y: -8 }}
            onClick={() => setActiveBook(book)}
            className={cn(
              "group relative flex flex-col items-center text-center transition-all duration-500",
              activeBook?.id === book.id ? "scale-105" : "opacity-70 hover:opacity-100"
            )}
          >
            <div className={cn(
              "w-full aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden relative mb-4 border-4 transition-all duration-500",
              activeBook?.id === book.id ? "border-blue-secondary shadow-blue-secondary/30" : "border-white/10"
            )}>
              {/* Book Spine Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/20 z-10 border-r border-white/10" />
              <div className="absolute left-4 top-0 bottom-0 w-1 bg-white/5 z-10" />
              
              <div className={cn("absolute inset-0 bg-gradient-to-br flex flex-col items-center justify-center p-4 text-white pl-8", book.color)}>
                <div className="absolute top-4 left-8 text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Cambridge</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">IELTS</div>
                <div className="font-serif text-5xl font-black leading-none mb-1 drop-shadow-lg">{book.id.replace('c', '')}</div>
                <div className="text-[8px] font-bold uppercase tracking-widest opacity-80 bg-black/20 px-2 py-0.5 rounded-full">Academic</div>
                <div className="absolute bottom-4 left-8 right-0 text-[10px] font-black uppercase tracking-widest opacity-40">{book.year}</div>
              </div>
              {activeBook?.id === book.id && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                  <CheckCircle size={48} className="text-white drop-shadow-xl" />
                </div>
              )}
            </div>
            <div className={cn(
              "text-xs font-black uppercase tracking-widest transition-colors",
              activeBook?.id === book.id ? "text-blue-secondary" : "text-text-primary group-hover:text-blue-secondary"
            )}>
              Book {book.id.replace('c', '')}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 pt-12 border-t border-border-2">
        <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-6">
          <Sparkles size={14} /> Recommended Resources
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Official IELTS Guide", desc: "The definitive guide from Cambridge University Press.", link: "https://www.cambridge.org/elt/blog/2021/04/22/official-cambridge-guide-ielts/" },
            { title: "IELTS Progress Check", desc: "Official practice tests with feedback from markers.", link: "https://www.ielts.org/for-test-takers/ielts-progress-check" },
            { title: "British Council Resources", desc: "Free practice materials and webinars.", link: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests" }
          ].map((res, i) => (
            <a 
              key={i}
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card bg-bg-2 border-white/5 p-6 hover:border-blue-primary/30 transition-all group"
            >
              <h4 className="font-bold text-text-primary mb-2 group-hover:text-blue-primary transition-colors">{res.title}</h4>
              <p className="text-xs text-text-muted leading-relaxed">{res.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
                Learn More <ArrowRight size={12} />
              </div>
            </a>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-bg-1 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-bg-2/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-primary/20 flex items-center justify-center text-blue-primary">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-text-primary">Cambridge Practice History</h3>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Review your previous attempts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-text-primary"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {progress?.practiceHistory?.filter(h => h.id.startsWith('cambridge-')).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-bg-2 flex items-center justify-center text-text-muted mb-4">
                      <ClipboardList size={40} />
                    </div>
                    <h4 className="text-xl font-serif font-bold text-text-primary mb-2">No History Yet</h4>
                    <p className="text-sm text-text-muted max-w-xs">Complete a Cambridge test section to see your results here.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {progress?.practiceHistory?.filter(h => h.id.startsWith('cambridge-')).map((item, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-bg-2/50 border border-white/5 rounded-2xl p-5 hover:border-blue-primary/30 transition-all cursor-pointer"
                        onClick={() => setSelectedHistoryItem(item)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                              item.skill === "listening" ? "bg-blue-secondary" : 
                              item.skill === "reading" ? "bg-emerald-accent" : "bg-violet-accent"
                            )}>
                              {item.skill === "listening" && <Headphones size={20} />}
                              {item.skill === "reading" && <Book size={20} />}
                              {item.skill === "writing" && <PenTool size={20} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-text-primary group-hover:text-blue-primary transition-colors">{item.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                  {new Date(item.date).toLocaleDateString()}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] font-black text-blue-secondary uppercase tracking-widest">
                                  Band {item.band}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-text-muted group-hover:text-blue-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {selectedHistoryItem && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHistoryItem(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl bg-bg-1 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-bg-2/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedHistoryItem(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-text-primary"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-text-primary">{selectedHistoryItem.title}</h3>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Attempted on {new Date(selectedHistoryItem.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Estimated Band</div>
                    <div className="text-2xl font-serif font-black text-blue-primary">{selectedHistoryItem.band}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest">
                      <Sparkles size={16} /> Performance Feedback
                    </div>
                    <div className="card bg-bg-2 border-blue-primary/20 p-6">
                      <div className="prose prose-invert prose-sm max-w-none markdown-body">
                        <ReactMarkdown>{selectedHistoryItem.feedback}</ReactMarkdown>
                      </div>
                    </div>

                    {selectedHistoryItem.skill === "writing" && (
                      <>
                        <div className="flex items-center gap-2 text-violet-accent font-bold text-xs uppercase tracking-widest">
                          <FileText size={16} /> Your Essay
                        </div>
                        <div className="card bg-bg-2 border-white/5 p-6 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap italic">
                          {selectedHistoryItem.answers.essay}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-emerald-accent font-bold text-xs uppercase tracking-widest">
                      <CheckCircle size={16} /> Question Review
                    </div>
                    <div className="space-y-4">
                      {selectedHistoryItem.skill !== "writing" && selectedHistoryItem.taskData?.testId && (
                        (() => {
                          const testData = TEST_DATA[selectedHistoryItem.taskData.testId];
                          const questions = selectedHistoryItem.skill === "listening" ? testData?.listening?.questions : testData?.reading?.questions;
                          
                          return questions?.map((q: any) => {
                            const userAnswer = selectedHistoryItem.answers[q.id];
                            const isCorrect = userAnswer?.toLowerCase().trim() === q.answer.toLowerCase().trim();
                            
                            return (
                              <div key={q.id} className={cn(
                                "p-4 rounded-xl border transition-all",
                                isCorrect ? "bg-emerald-accent/5 border-emerald-accent/20" : "bg-pink-accent/5 border-pink-accent/20"
                              )}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-text-primary mb-2">{q.id}. {q.question}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Your Answer</div>
                                        <div className={cn("text-xs font-bold", isCorrect ? "text-emerald-accent" : "text-pink-accent")}>
                                          {userAnswer || "(No answer)"}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Correct Answer</div>
                                        <div className="text-xs font-bold text-text-primary">{q.answer}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                    isCorrect ? "bg-emerald-accent text-white" : "bg-pink-accent text-white"
                                  )}>
                                    {isCorrect ? <Check size={16} /> : <X size={16} />}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                      {selectedHistoryItem.skill === "writing" && (
                        <div className="card bg-bg-2 border-white/5 p-6">
                          <p className="text-sm text-text-muted italic">Writing tasks are assessed by AI based on IELTS criteria. Review the feedback for detailed insights.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeBook && !activeTest && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveBook(null)}
                className="p-2 hover:bg-bg-2 rounded-full transition-colors text-text-muted hover:text-text-primary"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h3 className="text-2xl font-serif font-black text-text-primary">Book {activeBook.id.replace('c', '')} Tests</h3>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Select a practice test to begin</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeBook.tests.map((test) => {
              const isTestDone = test.skills.every(s => 
                progress?.completedPracticeIds?.includes(`cambridge-${test.id}-${s.toLowerCase()}`)
              );
              const doneCount = test.skills.filter(s => 
                progress?.completedPracticeIds?.includes(`cambridge-${test.id}-${s.toLowerCase()}`)
              ).length;

              return (
                <button
                  key={test.id}
                  onClick={() => setActiveTest(test)}
                  className={cn(
                    "card bg-bg-2 hover:border-blue-primary transition-all p-6 text-left group relative overflow-hidden",
                    isTestDone ? "border-emerald-accent/30 bg-emerald-accent/5" : ""
                  )}
                >
                  {isTestDone && (
                    <div className="absolute top-0 right-0 p-2 bg-emerald-accent text-white rounded-bl-xl shadow-lg">
                      <Check size={12} />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileText size={64} />
                  </div>
                  <div className="font-serif text-xl font-black text-text-primary group-hover:text-blue-secondary transition-colors mb-2">{test.label}</div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {test.skills.map((s, i) => {
                        const isSkillDone = progress?.completedPracticeIds?.includes(`cambridge-${test.id}-${s.toLowerCase()}`);
                        return (
                          <span 
                            key={i} 
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1",
                              isSkillDone ? "bg-emerald-accent/20 text-emerald-accent" : "bg-bg-3 text-text-muted"
                            )}
                          >
                            {isSkillDone && <Check size={8} />}
                            {s}
                          </span>
                        );
                      })}
                    </div>
                    
                    {doneCount > 0 && doneCount < test.skills.length && (
                      <div className="w-full bg-bg-3 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-primary h-full transition-all" 
                          style={{ width: `${(doneCount / test.skills.length) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {!activeBook && (
        <div className="card bg-gradient-to-br from-blue-dim/40 to-bg-1 border-blue-primary/10 p-12 text-center">
          <div className="w-20 h-20 bg-blue-dim rounded-3xl flex items-center justify-center text-blue-secondary mx-auto mb-8 shadow-2xl shadow-blue-primary/10 rotate-3">
            <Trophy size={40} />
          </div>
          <h3 className="text-2xl font-serif font-black mb-4 tracking-tight">The Gold Standard</h3>
          <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed font-medium">
            Cambridge IELTS books are the most accurate representation of the real exam. Select a book above to start practicing with official past papers.
          </p>
        </div>
      )}
    </div>
  );
}
