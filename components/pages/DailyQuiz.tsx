"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PenTool, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  Trophy, 
  Lightbulb,
  Sparkles,
  Loader2
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

const INITIAL_QUIZ = [
  { type: "Vocabulary", q: "Choose the word closest in meaning to 'UBIQUITOUS':", opts: ["Rare", "Omnipresent", "Ambiguous", "Transient"], ans: 1, exp: "Ubiquitous means present everywhere. e.g. Smartphones have become ubiquitous in modern life." },
  { type: "Grammar", q: "Choose the correct sentence:", opts: ["The number of students are increasing.", "The number of students is increasing.", "The numbers of students are increasing.", "Number of students is increasing."], ans: 1, exp: "'The number of...' takes a SINGULAR verb. 'A number of...' takes a plural verb." },
  { type: "Vocabulary", q: "Choose the word closest in meaning to 'EXACERBATE':", opts: ["Improve", "Investigate", "Worsen", "Celebrate"], ans: 2, exp: "Exacerbate means to make a problem worse. e.g. Pollution exacerbates respiratory conditions." },
  { type: "Reading", q: "In a 'True/False/Not Given' task, if the text says 'Most people like tea' and the statement is 'Everyone likes tea', the answer is:", opts: ["True", "False", "Not Given", "None of the above"], ans: 1, exp: "The statement contradicts the text ('Most' vs 'Everyone'), so it is FALSE." },
  { type: "Grammar", q: "Which of these is a complex sentence?", opts: ["I went to the store.", "I went to the store and I bought milk.", "Although it was raining, I went to the store.", "I went to the store; however, it was closed."], ans: 2, exp: "A complex sentence contains a dependent clause (starting with 'Although') and an independent clause." },
  { type: "Vocabulary", q: "What is the meaning of 'MITIGATE'?", opts: ["To make something worse", "To make something less severe", "To ignore a problem", "To increase the speed of something"], ans: 1, exp: "Mitigate means to make something less severe or painful." },
  { type: "Writing", q: "In Writing Task 1, which of the following should you NOT do?", opts: ["Paraphrase the question", "Give your opinion", "Write an overview", "Use data from the chart"], ans: 1, exp: "Writing Task 1 is a factual report. You must NOT give your personal opinion." },
  { type: "Listening", q: "If you hear 'The meeting is on the 30th of October', how should you write it to be safe?", opts: ["30 October", "October 30th", "30th Oct", "30/10"], ans: 0, exp: "'30 October' or 'October 30' are standard and safe. Avoid 'th' if not sure about word count limits." },
  { type: "Vocabulary", q: "Which word is a synonym for 'ADVOCATE'?", opts: ["Oppose", "Support", "Ignore", "Question"], ans: 1, exp: "To advocate for something means to publicly support or recommend it." },
  { type: "Grammar", q: "Identify the error: 'If I was you, I would study harder.'", opts: ["was", "would", "study", "harder"], ans: 0, exp: "In conditional sentences (subjunctive mood), 'were' is used instead of 'was' for hypothetical situations: 'If I were you...'" },
  { type: "Reading", q: "What does 'Scanning' involve?", opts: ["Reading every word carefully", "Looking for specific information like dates or names", "Getting the general idea of a text", "Summarizing a paragraph"], ans: 1, exp: "Scanning is a reading technique used to find specific facts or pieces of information quickly." },
  { type: "Writing", q: "What is the minimum word count for IELTS Writing Task 2?", opts: ["150 words", "200 words", "250 words", "300 words"], ans: 2, exp: "Task 2 requires at least 250 words. Writing less may result in a penalty." },
  { type: "Vocabulary", q: "What is the meaning of 'PRAGMATIC'?", opts: ["Idealistic", "Practical", "Emotional", "Confused"], ans: 1, exp: "Pragmatic means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations." },
  { type: "Grammar", q: "Which sentence uses the present perfect correctly?", opts: ["I have went to London twice.", "I have gone to London twice.", "I have been to London twice.", "I went to London twice."], ans: 2, exp: "'I have been to London' implies you went and returned. 'I have gone' implies you are still there." },
  { type: "Listening", q: "In the Listening test, are you penalized for spelling errors?", opts: ["No, only for wrong answers", "Yes, spelling must be correct", "Only in Section 4", "Only if the word is common"], ans: 1, exp: "Correct spelling is essential in the IELTS Listening test. Incorrectly spelled words are marked wrong." },
  { type: "Vocabulary", q: "What is an 'ANOMALY'?", opts: ["A common occurrence", "Something that deviates from what is standard", "A scientific discovery", "A type of animal"], ans: 1, exp: "An anomaly is something that deviates from what is standard, normal, or expected." },
  { type: "Reading", q: "What is 'Skimming'?", opts: ["Reading for detail", "Reading quickly to get the main idea", "Searching for keywords", "Translating the text"], ans: 1, exp: "Skimming is reading a text quickly to get a general overview of the content." },
  { type: "Grammar", q: "Which of these is a 'cohesive device'?", opts: ["However", "Beautiful", "Quickly", "Running"], ans: 0, exp: "Cohesive devices (like 'However', 'Therefore', 'In addition') help link ideas and paragraphs together." },
  { type: "Writing", q: "In Writing Task 2, how many body paragraphs are typically recommended?", opts: ["1", "2-3", "5", "As many as possible"], ans: 1, exp: "A standard Task 2 essay usually has an introduction, 2 or 3 body paragraphs, and a conclusion." },
  { type: "Vocabulary", q: "What does 'ELUCIDATE' mean?", opts: ["To make clear", "To hide", "To complicate", "To forget"], ans: 0, exp: "To elucidate means to make something clear or to explain it." },
];

export default function DailyQuiz() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [quizState, setQuizState] = useState<"home" | "active" | "results">("home");
  const [questions, setQuestions] = useState(INITIAL_QUIZ);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const startQuiz = () => {
    setQuizState("active");
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswers([]);
  };

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    
    const newAnswers = [...answers, selectedIdx];
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = (finalAnswers: number[]) => {
    if (!progress) return;
    const correct = finalAnswers.filter((a, i) => a === questions[i].ans).length;
    const score = Math.round((correct / questions.length) * 100);
    const today = new Date().toISOString().split("T")[0];

    const updated = {
      ...progress,
      dailyQuizDone: today,
      quizHistory: [...progress.quizHistory, { date: today, score, correct, total: questions.length }],
    };
    setProgress(updated);
    saveProgress(updated);
    setQuizState("results");
  };

  const generateAIQuiz = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate exactly 5 original IELTS quiz questions in JSON format. 
      Mix types: Vocabulary, Grammar, Reading.
      Each question must have exactly 4 options and an explanation.
      Return ONLY a JSON array: [{"type": "...", "q": "...", "opts": ["...", "...", "...", "..."], "ans": 0, "exp": "..."}]`;
      
      const result = await callGemini(prompt, "You are an IELTS expert. Return only valid JSON.");
      const cleanJson = result.replace(/```json|```/g, "").trim();
      const newQs = JSON.parse(cleanJson);
      setQuestions(newQs);
      startQuiz();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!progress) return null;

  if (quizState === "active") {
    const q = questions[currentIdx];
    const pct = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
          <span className="tag tag-blue">{q.type}</span>
        </div>
        <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-blue-primary" />
        </div>

        <div className="card border-border-2">
          <h3 className="text-lg font-bold text-text-primary leading-relaxed">{q.q}</h3>
        </div>

        <div className="space-y-3">
          {q.opts.map((opt, i) => {
            const isSelected = selectedIdx === i;
            const isCorrect = q.ans === i;
            const showResult = selectedIdx !== null;

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 group",
                  !showResult && "bg-bg-2 border-border-2 hover:border-blue-primary hover:translate-x-1",
                  showResult && isCorrect && "bg-green-accent/10 border-green-accent text-green-accent",
                  showResult && isSelected && !isCorrect && "bg-red-accent/10 border-red-accent text-red-accent",
                  showResult && !isSelected && !isCorrect && "bg-bg-2 border-border-2 opacity-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors",
                  !showResult && "bg-bg-1 text-text-muted group-hover:bg-blue-dim group-hover:text-blue-secondary",
                  showResult && isCorrect && "bg-green-accent text-white",
                  showResult && isSelected && !isCorrect && "bg-red-accent text-white"
                )}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-sm font-medium">{opt}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedIdx !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="card bg-bg-2 border-blue-dim/30">
                <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-2">
                  <Lightbulb size={14} /> Explanation
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{q.exp}</p>
              </div>
              <button onClick={handleNext} className="btn btn-primary w-full py-4">
                {currentIdx < questions.length - 1 ? "Next Question" : "See Results"} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (quizState === "results") {
    const lastResult = progress.quizHistory[progress.quizHistory.length - 1];
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 space-y-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-blue-dim rounded-full flex items-center justify-center text-blue-secondary shadow-xl shadow-blue-primary/10">
          <Trophy size={48} />
        </motion.div>
        <div>
          <h3 className="text-2xl font-serif font-bold mb-2">Quiz Complete!</h3>
          <div className="text-5xl font-black text-blue-secondary mb-2">{lastResult.score}%</div>
          <p className="text-text-muted">You got {lastResult.correct} out of {lastResult.total} correct.</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={startQuiz} className="btn btn-primary flex-1">Try Again</button>
          <button onClick={() => setQuizState("home")} className="btn btn-ghost flex-1">Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-10 space-y-4">
        <div className="w-20 h-20 bg-bg-2 rounded-3xl flex items-center justify-center text-blue-secondary mx-auto shadow-sm border border-border">
          <PenTool size={40} />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">Daily Quiz</h2>
          <p className="text-sm text-text-muted">Test your IELTS knowledge with 20 daily questions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={startQuiz} className="card text-left hover:border-blue-primary group p-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-dim text-blue-secondary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="font-bold text-base mb-1">Standard Quiz</h4>
          <p className="text-xs text-text-muted mb-6">Hand-picked essential IELTS questions</p>
          <div className="btn btn-primary btn-sm w-full">Start Quiz</div>
        </button>

        <button 
          onClick={generateAIQuiz} 
          disabled={isGenerating}
          className="card text-left hover:border-violet-accent group p-6 bg-gradient-to-br from-violet-accent/5 to-bg-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-accent/10 text-violet-accent flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
          </div>
          <h4 className="font-bold text-base mb-1">AI Generated Quiz</h4>
          <p className="text-xs text-text-muted mb-6">Fresh questions generated by Gemini AI</p>
          <div className="btn btn-ghost btn-sm w-full border-violet-accent/50 text-violet-accent hover:bg-violet-accent hover:text-white">
            {isGenerating ? "Generating..." : "Generate Quiz"}
          </div>
        </button>
      </div>
    </div>
  );
}
