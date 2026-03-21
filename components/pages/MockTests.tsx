"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
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
import { callGemini } from "@/lib/gemini";
import { cn, getBandColor } from "@/lib/utils";

import { ChartDisplay } from "@/components/ChartDisplay";

const TESTS = [
  { 
    id: "wt1-1", 
    label: "Writing Task 1 (Line Graph)", 
    skill: "writing", 
    mins: 20, 
    icon: FileText, 
    color: "text-blue-secondary", 
    desc: "The graph below shows the consumption of fish and some different kinds of meat in a European country between 1979 and 2004.",
    chartType: "line",
    chartData: [
      { year: '1979', Beef: 220, Lamb: 150, Chicken: 140, Fish: 60 },
      { year: '1984', Beef: 200, Lamb: 130, Chicken: 160, Fish: 55 },
      { year: '1989', Beef: 180, Lamb: 110, Chicken: 190, Fish: 50 },
      { year: '1994', Beef: 160, Lamb: 90, Chicken: 220, Fish: 52 },
      { year: '1999', Beef: 140, Lamb: 70, Chicken: 240, Fish: 48 },
      { year: '2004', Beef: 120, Lamb: 60, Chicken: 250, Fish: 45 },
    ]
  },
  { 
    id: "wt1-2", 
    label: "Writing Task 1 (Process Diagram)", 
    skill: "writing", 
    mins: 20, 
    icon: FileText, 
    color: "text-blue-secondary", 
    desc: "The diagram below shows how solar panels can be used to provide electricity for domestic use.",
    chartType: "diagram",
    chartData: [
      { label: "1. Solar Panels capture sunlight" },
      { label: "2. Inverter converts DC to AC" },
      { label: "3. Electrical Panel distributes power" },
      { label: "4. Utility Meter tracks usage" },
      { label: "5. Grid backup for night use" },
    ]
  },
  { 
    id: "wt1-3", 
    label: "Writing Task 1 (Table)", 
    skill: "writing", 
    mins: 20, 
    icon: FileText, 
    color: "text-blue-secondary", 
    desc: "The table below shows the percentage of the population and the number of people living in poverty in different regions of the world in 2010.",
    chartType: "table",
    chartData: [
      { Region: 'South Asia', 'Poverty (%)': 43, 'Millions': 510 },
      { Region: 'Sub-Saharan Africa', 'Poverty (%)': 41, 'Millions': 380 },
      { Region: 'East Asia', 'Poverty (%)': 15, 'Millions': 280 },
      { Region: 'Latin America', 'Poverty (%)': 11, 'Millions': 65 },
      { Region: 'Middle East', 'Poverty (%)': 4, 'Millions': 12 },
    ]
  },
  { id: "wt2-1", label: "Writing Task 2 (Opinion Essay)", skill: "writing", mins: 40, icon: PenTool, color: "text-violet-accent", desc: "Some people think that it is best to work for the same organization for one's whole life. Others think that it is better to change jobs frequently. Discuss both views and give your opinion." },
  { id: "wt2-2", label: "Writing Task 2 (Problem/Solution)", skill: "writing", mins: 40, icon: PenTool, color: "text-violet-accent", desc: "In many countries, the amount of crime is increasing. What are the main causes of this and what solutions can you suggest?" },
  { id: "speaking", label: "Speaking Full Simulation", skill: "speaking", mins: 15, icon: Mic, color: "text-pink-accent", desc: "Complete Parts 1, 2 & 3 with an AI examiner." },
  { id: "reading-1", label: "Reading: Section 1", skill: "reading", mins: 20, icon: BookOpen, color: "text-green-accent", desc: "Academic reading passage: 'The History of Glass'. Includes True/False/Not Given and Note Completion questions." },
  { id: "reading-2", label: "Reading: Section 2", skill: "reading", mins: 20, icon: BookOpen, color: "text-green-accent", desc: "Academic reading passage: 'The Impact of Digital Technology on Education'. Includes Matching Headings and Multiple Choice." },
  { id: "listening-1", label: "Listening: Section 1", skill: "listening", mins: 10, icon: Headphones, color: "text-amber-accent", desc: "A conversation between a customer and a travel agent about booking a holiday. Form completion." },
  { id: "listening-2", label: "Listening: Section 2", skill: "listening", mins: 10, icon: Headphones, color: "text-amber-accent", desc: "A talk by a museum guide about the history of a local landmark. Map labeling." },
  { id: "full", label: "Full Mock Test (Beta)", skill: "all", mins: 165, icon: Trophy, color: "text-blue-primary", desc: "Simulate the entire IELTS exam (L, R, W) in one sitting." },
];

export default function MockTests() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testTask, setTestTask] = useState<string | null>(null);
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [estimatedBand, setEstimatedBand] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [reviewedQuestions, setReviewedQuestions] = useState<number[]>([]);

  const toggleReview = () => {
    setReviewedQuestions(prev => 
      prev.includes(currentQuestion) 
        ? prev.filter(q => q !== currentQuestion) 
        : [...prev, currentQuestion]
    );
  };

  const generateTask = async (test: any) => {
    setActiveTest(test);
    setIsGeneratingTask(true);
    setTestTask(null);
    setFeedback(null);
    setAnswer("");
    
    try {
      const prompt = `Generate a realistic IELTS ${test.label} task.
      Skill: ${test.skill}
      Description: ${test.desc}
      If it's Writing Task 1, describe a chart or process.
      If it's Writing Task 2, provide a prompt.
      If it's Reading, provide a short passage and 3 questions.
      Return in clean Markdown.`;
      
      const result = await callGemini(prompt, "You are an IELTS examiner.");
      setTestTask(result);
      setTimeLeft(test.mins * 60);
    } catch (error) {
      console.error(error);
      setTestTask("Failed to generate task. Please try again.");
    } finally {
      setIsGeneratingTask(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || isSubmitting || !progress || !activeTest) return;
    setIsSubmitting(true);

    const systemPrompt = `You are a strict IELTS examiner. Analyze the student's response for ${activeTest.label}. 
    Task was: ${testTask}
    Provide a detailed band score breakdown (0-9) for each criterion and an overall band.
    Be honest and critical. Use markdown for formatting.
    Format your response exactly as:
    📊 BAND SCORES
    Criterion 1: [score]/9
    Criterion 2: [score]/9
    Criterion 3: [score]/9
    Criterion 4: [score]/9
    ━━━━━━━━━━━━━━━
    Overall Band: [score]

    📝 DETAILED FEEDBACK
    [Feedback text]

    ✅ 3 IMPROVEMENTS
    1. [Tip 1]
    2. [Tip 2]
    3. [Tip 3]`;

    try {
      const result = await callGemini(`TASK: ${activeTest.desc}\n\nSTUDENT RESPONSE:\n${answer}`, systemPrompt);
      setFeedback(result);

      const bandMatch = result.match(/Overall Band:\s*([0-9]\.?[0-9]?)/i);
      const band = bandMatch ? parseFloat(bandMatch[1]) : null;
      setEstimatedBand(band);

      if (band) {
        const updated = {
          ...progress,
          bands: activeTest.skill === "all" 
            ? { ...progress.bands, reading: band, writing: band, listening: band } 
            : { ...progress.bands, [activeTest.skill]: band },
          bandHistory: [...progress.bandHistory, { date: new Date().toISOString().split("T")[0], band, skill: activeTest.skill }],
          mockHistory: [...progress.mockHistory, { date: new Date().toISOString().split("T")[0], test: activeTest.label, band, skill: activeTest.skill }],
        };
        setProgress(updated);
        saveProgress(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [activeTest, answer, progress, isSubmitting, testTask]);

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
    generateTask(test);
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
          {!feedback ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Pane: Task/Passage */}
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 bg-white overflow-y-auto p-4 md:p-8 custom-scrollbar h-[40vh] md:h-full">
                {isGeneratingTask ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={40} className="animate-spin text-blue-primary" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Test Content...</p>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-serif font-bold text-gray-800">{activeTest.label}</h2>
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

                    {activeTest.skill === 'listening' && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-primary/10 rounded-full flex items-center justify-center text-blue-primary">
                              <Volume2 size={20} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-800">Audio Recording</div>
                              <div className="text-[10px] text-gray-400 uppercase font-bold">Section 1 of 4</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 bg-blue-primary hover:bg-blue-primary/90 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
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

                    {activeTest.skill === 'speaking' && (
                      <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative mb-8 group">
                        <Image 
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                          alt="AI Examiner" 
                          fill
                          className="object-cover opacity-80"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-white font-bold text-xs uppercase tracking-widest">Aria (Examiner) - Live</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                            <Mic size={32} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-serif">
                      <div dangerouslySetInnerHTML={{ __html: (testTask || activeTest.desc).replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800">$1</strong>').replace(/\n/g, '<br/>') }} />
                    </div>

                    {activeTest.chartData && (
                      <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <ChartDisplay type={activeTest.chartType} data={activeTest.chartData} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Pane: Input */}
              <div className="w-full md:w-1/2 bg-[#F4F7F9] overflow-y-auto p-4 md:p-8 custom-scrollbar h-[60vh] md:h-full">
                <div className="max-w-2xl mx-auto h-full flex flex-col">
                  {testTask && !isGeneratingTask && (
                    <>
                      <div className="flex-1 relative mb-6">
                        <textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Type your response here..."
                          className="w-full h-full bg-white border border-gray-200 rounded-xl p-8 text-gray-800 focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary outline-none resize-none font-serif leading-relaxed text-lg shadow-sm"
                        />
                        <div className="absolute bottom-6 right-6 flex items-center gap-4">
                          <div className="px-3 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Word Count: {answer.trim() ? answer.trim().split(/\s+/).length : 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleSubmit}
                          disabled={!answer.trim() || isSubmitting}
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
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100" dangerouslySetInnerHTML={{ __html: feedback.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800">$1</strong>').replace(/\n/g, '<br/>') }} />
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
            className="card text-left hover:border-blue-primary group flex flex-col h-full"
          >
            <div className={cn("p-3 rounded-2xl bg-bg-2 w-fit mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3", test.color)}>
              <test.icon size={28} />
            </div>
            <div className="font-bold text-base text-text-primary mb-1">{test.label}</div>
            <div className="text-xs text-text-muted mb-6 flex-1">{test.desc}</div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="tag tag-gray">⏱ {test.mins} min</span>
                <span className="tag tag-blue">AI Scored</span>
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
