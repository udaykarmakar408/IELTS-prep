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
import { callGroq, callGroqJSON } from "@/lib/groq";
import { GoogleGenAI, Modality } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

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
  const [selectedItem, setSelectedItem] = useState<PracticeItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskData, setTaskData] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Audio state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Generate 2000+ items (simulated)
  const items: PracticeItem[] = Array.from({ length: 2000 }, (_, i) => ({
    id: i + 1,
    title: `IELTS ${activeSkill.charAt(0).toUpperCase() + activeSkill.slice(1)} Practice Module #${i + 1}`,
    skill: activeSkill,
    difficulty: i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard"
  }));

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, visibleCount);

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
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read the following IELTS listening script clearly and at a natural pace: ${text}` }] }],
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
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pcmData = new Int16Array(bytes.buffer);
        const wavBlob = pcmToWav(pcmData, 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, []);

  const handleSelectItem = async (item: PracticeItem) => {
    setSelectedItem(item);
    setIsGenerating(true);
    setTaskData(null);
    setUserAnswers({});
    setShowResults(false);
    setFeedback(null);
    setAudioUrl(null);

    let prompt = "";
    let schema: any = {};

    if (item.skill === "listening") {
      schema = {
        type: "object",
        properties: {
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
        required: ["script", "questions"]
      };
      prompt = `Generate a full-length IELTS Listening section (approx 5-8 mins of speech) for Module #${item.id}. Difficulty: ${item.difficulty}. Include exactly 5-10 questions.`;
    } else if (item.skill === "reading") {
      schema = {
        type: "object",
        properties: {
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
        required: ["passage", "questions"]
      };
      prompt = `Generate a full-length IELTS Reading passage (approx 700-900 words) for Module #${item.id}. Difficulty: ${item.difficulty}. Include exactly 5-10 questions.`;
    } else if (item.skill === "writing") {
      schema = {
        type: "object",
        properties: {
          prompt: { type: "string" },
          type: { type: "string" },
          sampleAnswer: { type: "string" }
        },
        required: ["prompt", "type", "sampleAnswer"]
      };
      prompt = `Generate a full-length IELTS Writing Task 2 topic for Module #${item.id}. Difficulty: ${item.difficulty}. Include a high-scoring sample answer.`;
    } else if (item.skill === "speaking") {
      schema = {
        type: "object",
        properties: {
          topic: { type: "string" },
          part1: { type: "array", items: { type: "string" } },
          part2: { type: "string" },
          part3: { type: "array", items: { type: "string" } }
        },
        required: ["topic", "part1", "part2", "part3"]
      };
      prompt = `Generate a full IELTS Speaking test outline (Parts 1, 2, and 3) for Module #${item.id}. Difficulty: ${item.difficulty}.`;
    }

    try {
      const data = await callGroqJSON(prompt, schema, "You are an IELTS expert examiner.");
      setTaskData(data);
      if (item.skill === "listening") {
        generateAudio(data.script);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswers = async () => {
    setShowResults(true);
    setIsGenerating(true);
    
    let prompt = "";
    if (activeSkill === "writing") {
      prompt = `Assess this IELTS Writing response for Module #${selectedItem?.id}:\n\nPrompt: ${taskData.prompt}\n\nUser Response: ${userAnswers.writing}\n\nProvide a band score and detailed feedback.`;
    } else if (activeSkill === "speaking") {
      prompt = `Assess this IELTS Speaking practice session for Module #${selectedItem?.id}:\n\nTopic: ${taskData.topic}\n\nUser Notes/Transcript: ${userAnswers.speaking}\n\nProvide a band score and feedback.`;
    } else {
      // For listening/reading, we can just compare answers
      const correctCount = taskData.questions.filter((q: any) => 
        userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
      ).length;
      setFeedback(`You got ${correctCount} out of ${taskData.questions.length} correct.`);
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
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder={`Search 2000+ ${activeSkill} modules by title or ID...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-bg-1 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary transition-all text-sm font-medium"
            />
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
            </div>

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
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-bold text-text-primary flex items-center gap-2">
                        <BookOpenCheck size={18} className="text-blue-primary" />
                        Questions
                      </h4>
                      <div className="space-y-4">
                        {taskData.questions.map((q: any, idx: number) => (
                          <div key={q.id} className="space-y-2">
                            <div className="text-sm font-medium text-text-primary">{idx + 1}. {q.q}</div>
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
                                userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? "text-emerald-500" : "text-red-500"
                              )}>
                                {userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                Correct Answer: {q.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSkill === "reading" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-text-primary uppercase tracking-widest text-xs">Passage</h4>
                      <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed bg-bg-1 p-6 rounded-2xl border border-border h-[500px] overflow-y-auto custom-scrollbar">
                        <ReactMarkdown>{taskData.passage}</ReactMarkdown>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-text-primary uppercase tracking-widest text-xs">Questions</h4>
                      <div className="space-y-6">
                        {taskData.questions.map((q: any, idx: number) => (
                          <div key={q.id} className="space-y-2">
                            <div className="text-sm font-medium text-text-primary">{idx + 1}. {q.q}</div>
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
                                userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? "text-emerald-500" : "text-red-500"
                              )}>
                                {userAnswers[q.id]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                Correct Answer: {q.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSkill === "writing" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-bg-2 rounded-2xl border border-border">
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">{taskData.type}</div>
                      <div className="text-lg font-bold text-text-primary leading-relaxed">{taskData.prompt}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-text-primary">Your Response</h4>
                        <span className="text-xs text-text-muted">{userAnswers.writing?.split(/\s+/).filter(Boolean).length || 0} words</span>
                      </div>
                      <textarea 
                        value={userAnswers.writing || ""}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, writing: e.target.value }))}
                        disabled={showResults}
                        placeholder="Type your essay here (min 250 words)..."
                        className="w-full h-80 p-6 bg-bg-1 border border-border rounded-2xl text-sm focus:ring-2 focus:ring-blue-primary/20 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {activeSkill === "speaking" && (
                  <div className="space-y-8">
                    <div className="p-6 bg-bg-2 rounded-2xl border border-border text-center">
                      <h4 className="text-xl font-bold text-text-primary mb-2">{taskData.topic}</h4>
                      <p className="text-sm text-text-muted">Practice these questions using the Speaking Lab or record your notes below.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="text-xs font-black text-blue-primary uppercase tracking-widest">Part 1</div>
                        <ul className="space-y-2">
                          {taskData.part1.map((q: string, i: number) => (
                            <li key={i} className="text-sm text-text-secondary leading-relaxed">• {q}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="text-xs font-black text-violet-accent uppercase tracking-widest">Part 2</div>
                        <div className="p-4 bg-bg-1 rounded-xl border border-border text-sm text-text-secondary leading-relaxed italic">
                          {taskData.part2}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-xs font-black text-emerald-accent uppercase tracking-widest">Part 3</div>
                        <ul className="space-y-2">
                          {taskData.part3.map((q: string, i: number) => (
                            <li key={i} className="text-sm text-text-secondary leading-relaxed">• {q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-text-primary">Practice Notes / Transcript</h4>
                      <textarea 
                        value={userAnswers.speaking || ""}
                        onChange={(e) => setUserAnswers(prev => ({ ...prev, speaking: e.target.value }))}
                        disabled={showResults}
                        placeholder="Paste your transcript or type your practice notes here for AI assessment..."
                        className="w-full h-40 p-6 bg-bg-1 border border-border rounded-2xl text-sm focus:ring-2 focus:ring-blue-primary/20 outline-none resize-none"
                      />
                    </div>
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
                          <ReactMarkdown>{feedback || "Calculating results..."}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {taskData.sampleAnswer && (
                        <div className="p-8 bg-bg-2 border border-border rounded-3xl">
                          <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <MessageSquare size={24} />
                            Model Answer
                          </h4>
                          <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed italic">
                            <ReactMarkdown>{taskData.sampleAnswer}</ReactMarkdown>
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
    </div>
  );
}
