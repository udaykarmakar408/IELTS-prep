"use client";

import React, { useState } from "react";
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
import { callGemini } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";

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
  }
];

export default function Cambridge() {
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [essay, setEssay] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
      const result = await callGemini(`Essay:\n${essay}`, systemPrompt);
      setFeedback(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

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
            <button className="btn btn-primary py-4 flex flex-col items-center gap-2 group">
              <Headphones size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Listening</span>
            </button>
            <button className="btn btn-primary py-4 flex flex-col items-center gap-2 group">
              <Book size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Reading</span>
            </button>
            <button className="btn btn-primary py-4 flex flex-col items-center gap-2 group">
              <PenTool size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Writing</span>
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
      <div>
        <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-1">
          <FileText size={14} /> Official Practice
        </div>
        <h2 className="font-serif text-3xl font-bold mb-1">Cambridge IELTS</h2>
        <p className="text-sm text-text-muted">Practice with official Cambridge IELTS past papers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CAMBRIDGE_BOOKS.map((book) => (
          <div key={book.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">
                {book.title}
              </h4>
              <span className="text-[10px] font-bold text-text-muted bg-bg-2 px-2 py-0.5 rounded-full">{book.year}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {book.tests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => { setActiveBook(book); setActiveTest(test); }}
                  className="card bg-bg-2 hover:border-blue-primary transition-all p-4 text-left group"
                >
                  <div className="font-bold text-sm text-text-primary group-hover:text-blue-secondary transition-colors mb-2">{test.label}</div>
                  <div className="flex flex-wrap gap-1">
                    {test.skills.map((s, i) => (
                      <span key={i} className="text-[8px] font-bold text-text-muted uppercase tracking-tighter bg-bg-3 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-br from-blue-dim to-bg-1 border-blue-primary/20 p-8 text-center">
        <Trophy size={48} className="mx-auto mb-4 text-blue-secondary opacity-50" />
        <h3 className="text-xl font-serif font-bold mb-2">The Gold Standard</h3>
        <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
          Cambridge IELTS books are the most accurate representation of the real exam. Practicing with these materials is essential for understanding the test format and difficulty level.
        </p>
      </div>
    </div>
  );
}
