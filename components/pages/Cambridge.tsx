"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Book, 
  Headphones, 
  PenTool, 
  Mic, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  Loader2,
  Trophy,
  AlertCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { callGroq } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav } from "@/lib/audio";

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
}

const CAMBRIDGE_BOOKS: Book[] = [
  {
    id: "c19",
    title: "Cambridge IELTS 19",
    year: "2024",
    tests: [
      { id: "c19-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing"] },
      { id: "c19-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing"] },
      { id: "c19-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing"] },
      { id: "c19-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing"] }
    ]
  },
  {
    id: "c18",
    title: "Cambridge IELTS 18",
    year: "2023",
    tests: [
      { id: "c18-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing"] },
      { id: "c18-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing"] },
      { id: "c18-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing"] },
      { id: "c18-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing"] }
    ]
  },
  {
    id: "c17",
    title: "Cambridge IELTS 17",
    year: "2022",
    tests: [
      { id: "c17-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing"] },
      { id: "c17-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing"] },
      { id: "c17-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing"] },
      { id: "c17-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing"] }
    ]
  },
  {
    id: "c16",
    title: "Cambridge IELTS 16",
    year: "2021",
    tests: [
      { id: "c16-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing"] },
      { id: "c16-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing"] },
      { id: "c16-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing"] },
      { id: "c16-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing"] }
    ]
  },
  {
    id: "c15",
    title: "Cambridge IELTS 15",
    year: "2020",
    tests: [
      { id: "c15-t1", label: "Test 1", skills: ["Reading", "Listening", "Writing"] },
      { id: "c15-t2", label: "Test 2", skills: ["Reading", "Listening", "Writing"] },
      { id: "c15-t3", label: "Test 3", skills: ["Reading", "Listening", "Writing"] },
      { id: "c15-t4", label: "Test 4", skills: ["Reading", "Listening", "Writing"] }
    ]
  }
];

const TEST_DATA: Record<string, any> = {
  "c19-t1": {
    reading: {
      title: "The Impact of Urban Green Spaces",
      passage: `Urban green spaces, such as parks, gardens, and urban forests, play a crucial role in enhancing the quality of life in cities. Research has shown that access to green spaces can significantly reduce stress levels and improve mental health. Furthermore, these areas help to mitigate the urban heat island effect, where cities become significantly warmer than their surrounding rural areas due to human activities and the concentration of heat-absorbing materials like concrete and asphalt.

In addition to environmental benefits, urban green spaces provide social advantages. They serve as communal areas where people can interact, fostering a sense of community. For children, parks offer essential spaces for physical activity and play, which are vital for healthy development. However, as cities continue to grow and densify, the preservation and creation of green spaces face significant challenges, including high land values and competing development interests.`,
      questions: [
        { id: 1, type: "true-false", question: "Urban green spaces can help reduce stress levels.", answer: "TRUE" },
        { id: 2, type: "true-false", question: "Cities are usually cooler than rural areas.", answer: "FALSE" },
        { id: 3, type: "true-false", question: "Green spaces have no social benefits for children.", answer: "FALSE" }
      ]
    },
    listening: {
      title: "Library Membership Inquiry",
      transcript: `Librarian: Good morning! How can I help you today?
Student: Hi, I'd like to inquire about joining the library. I'm a new student here.
Librarian: Welcome! To join, you'll need your student ID card and a proof of address, like a utility bill or a rental agreement.
Student: I have my ID card, but I don't have a utility bill yet. Will a letter from the university work?
Librarian: Yes, a formal letter from the university confirming your address is perfectly fine.
Student: Great. And how many books can I borrow at once?
Librarian: Undergraduate students can borrow up to 10 books for a period of two weeks.`,
      questions: [
        { id: 1, type: "gap-fill", question: "To join the library, the student needs an ID card and proof of _______.", answer: "address" },
        { id: 2, type: "gap-fill", question: "Undergraduates can borrow a maximum of _______ books.", answer: "10" }
      ]
    }
  }
};

export default function Cambridge() {
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [essay, setEssay] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  // Audio state for Cambridge Listening
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Analysis state
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGradeEssay = async () => {
    if (!activeBook || !activeTest) return;
    setIsGrading(true);
    setFeedback(null);
    const systemPrompt = `You are an IELTS Writing Examiner. Grade the student's Writing Task 2 essay from ${activeBook.title} ${activeTest.label}.
    Provide:
    1. Overall Band Score (0-9).
    2. Feedback on: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
    3. 2-3 specific suggestions for improvement.
    Use markdown for formatting. Keep it professional and accurate.`;

    try {
      const result = await callGroq(`Essay:\n${essay}`, systemPrompt);
      setFeedback(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleGenerateAudio = async (text: string) => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read the following IELTS listening script in its entirety, clearly and at a natural pace. Ensure you read every single word from start to finish without stopping early: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          maxOutputTokens: 4096, // Increased to ensure longer scripts are not cut off
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        // Ensure even length for 16-bit samples
        const evenLen = len % 2 === 0 ? len : len - 1;
        const bytes = new Uint8Array(evenLen);
        for (let i = 0; i < evenLen; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pcmData = new Int16Array(bytes.buffer);
        const wavBlob = pcmToWav(pcmData, 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
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

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const renderListening = () => {
    const data = TEST_DATA[activeTest?.id || ""]?.listening;
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
          <div className="ml-auto">
            <button 
              onClick={() => {
                if (audioUrl) {
                  if (isPlaying) audioRef.current?.pause();
                  else audioRef.current?.play();
                  setIsPlaying(!isPlaying);
                } else {
                  handleGenerateAudio(data.transcript);
                }
              }}
              disabled={isGeneratingAudio}
              className="btn btn-primary px-6 flex items-center gap-2"
            >
              {isGeneratingAudio ? <Loader2 size={18} className="animate-spin" /> : isPlaying ? "Pause Audio" : "Play Audio"}
            </button>
            {audioUrl && (
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden" 
              />
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
                    className="w-full bg-white border border-border-2 rounded-xl p-3 text-sm focus:border-blue-secondary outline-none"
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
              onClick={() => setShowResults(true)}
              className="btn btn-primary w-full mt-10"
              disabled={Object.keys(userAnswers).length < 2}
            >
              Check Answers
            </button>
          </div>

          <div className="card bg-white border-border-2 p-8">
            <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Transcript Preview</h4>
            <div className="text-xs text-text-secondary leading-relaxed space-y-2 italic">
              {data.transcript.split('\n').map((line: string, i: number) => <p key={i}>{line}</p>)}
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
          <button onClick={() => { setActiveSkill(null); setShowResults(false); setUserAnswers({}); setAudioUrl(null); setIsPlaying(false); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
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

  const renderReading = () => {
    const data = TEST_DATA[activeTest?.id || ""]?.reading;
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
        <div className="card bg-white border-border-2 p-8 overflow-y-auto max-h-[600px] shadow-sm">
          <h3 className="text-2xl font-serif font-black mb-6 text-blue-secondary">{data.title}</h3>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed text-text-primary space-y-4">
            {data.passage.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
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
                            : "bg-white text-text-muted border-border-2 hover:border-blue-secondary/50"
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
              onClick={() => setShowResults(true)}
              className="btn btn-primary w-full mt-10"
              disabled={Object.keys(userAnswers).length < 3}
            >
              Check Answers
            </button>
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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => { setActiveSkill(null); setFeedback(null); setEssay(""); }} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back to {activeTest.label}
          </button>
          <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">
            {activeBook.title} — {activeTest.label} — Writing Task 2
          </div>
        </div>

        <div className="card bg-bg-2 border-blue-primary/30 p-8">
          <h3 className="text-xl font-serif font-bold mb-4">Writing Task 2 Practice</h3>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed italic">
            &quot;Some people believe that technology has made our lives more complex, while others argue it has simplified them. Discuss both views and give your own opinion.&quot;
          </p>
          
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Type your essay here (minimum 250 words)..."
            className="w-full bg-bg-1 border border-border-2 rounded-2xl p-6 text-sm text-text-primary focus:border-blue-primary outline-none min-h-[400px] resize-none font-serif leading-relaxed mb-6"
          />

          <div className="flex justify-between items-center">
            <div className="text-xs text-text-muted">
              Word Count: {essay.trim() ? essay.trim().split(/\s+/).length : 0}
            </div>
            <button 
              onClick={handleGradeEssay}
              disabled={isGrading || essay.length < 100}
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
            className="card bg-blue-dim/10 border-blue-primary/20"
          >
            <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-4">
              <Trophy size={16} /> AI Examiner Feedback
            </div>
            <div className="prose prose-invert prose-sm max-w-none markdown-body">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </motion.div>
        )}
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

        <div className="card bg-bg-2 border-blue-primary/30 text-center py-12">
          <div className="w-16 h-16 bg-blue-dim rounded-full flex items-center justify-center text-blue-secondary mx-auto mb-6 shadow-xl shadow-blue-primary/10">
            <Book size={32} />
          </div>
          <h3 className="text-2xl font-serif font-bold mb-4">Practice Mode: {activeTest.label}</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed mb-8">
            This module allows you to practice individual sections from the official Cambridge IELTS books. AI will grade your responses and provide band-score feedback.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button 
              onClick={() => setActiveSkill("Listening")}
              className="btn btn-primary py-4 flex flex-col items-center gap-2 group"
            >
              <Headphones size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Listening</span>
            </button>
            <button 
              onClick={() => setActiveSkill("Reading")}
              className="btn btn-primary py-4 flex flex-col items-center gap-2 group"
            >
              <Book size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Reading</span>
            </button>
            <button 
              onClick={() => setActiveSkill("Writing")}
              className="btn btn-primary py-4 flex flex-col items-center gap-2 group"
            >
              <PenTool size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Writing</span>
            </button>
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
          <div className="bg-blue-dim/20 px-4 py-2 rounded-2xl border border-blue-primary/10">
            <div className="text-[10px] text-blue-secondary font-black uppercase tracking-widest mb-0.5">Available Books</div>
            <div className="text-sm font-bold text-text-primary">15 — 19</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-secondary to-blue-primary flex flex-col items-center justify-center p-4 text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">IELTS</div>
                <div className="font-serif text-4xl font-black leading-none mb-1">{book.id.replace('c', '')}</div>
                <div className="text-[8px] font-bold uppercase tracking-widest opacity-60">Academic</div>
                <div className="absolute bottom-4 left-0 right-0 text-[10px] font-black uppercase tracking-widest opacity-40">{book.year}</div>
              </div>
              {activeBook?.id === book.id && (
                <div className="absolute inset-0 bg-blue-secondary/20 backdrop-blur-[2px] flex items-center justify-center">
                  <CheckCircle size={48} className="text-white drop-shadow-lg" />
                </div>
              )}
            </div>
            <div className="text-xs font-black text-text-primary uppercase tracking-widest group-hover:text-blue-secondary transition-colors">
              Book {book.id.replace('c', '')}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeBook && (
          <motion.div
            key={activeBook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-serif text-2xl font-black text-text-primary">
                Select a Test from <span className="text-blue-secondary">Book {activeBook.id.replace('c', '')}</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeBook.tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => setActiveTest(test)}
                  className="card bg-bg-2 hover:border-blue-primary transition-all p-6 text-left group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileText size={64} />
                  </div>
                  <div className="font-serif text-xl font-black text-text-primary group-hover:text-blue-secondary transition-colors mb-4">{test.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {test.skills.map((s, i) => (
                      <span key={i} className="text-[9px] font-black text-text-muted uppercase tracking-widest bg-bg-3 px-2 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
