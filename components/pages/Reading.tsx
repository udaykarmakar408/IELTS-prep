"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  PenTool,
  Trophy,
  AlertCircle
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

const READING_PASSAGES = [
  {
    id: "p1",
    title: "The Evolution of Language",
    difficulty: "Medium",
    mins: 20,
    text: `Language is one of the most complex and fascinating aspects of human behavior. It is not merely a tool for communication but a fundamental part of our identity and culture. Linguists have long debated the origins of language, with some suggesting it evolved from primitive gestures, while others believe it emerged as a result of cognitive shifts in the human brain.\n\nOne prominent theory, proposed by Noam Chomsky, is that humans are born with an innate "universal grammar" that allows them to acquire language rapidly during childhood. This theory suggests that the underlying structure of all human languages is remarkably similar, despite the vast diversity of vocabulary and syntax found across the globe.\n\nIn contrast, other researchers emphasize the role of social interaction and cultural transmission in language development. They argue that language is a learned behavior, passed down from generation to generation through imitation and reinforcement. According to this view, the specific features of a language are shaped by the environment and the needs of the community that speaks it.`,
    questions: [
      { id: "q1", type: "mcq", q: "What is the main topic of the passage?", options: ["The history of linguistics", "The origins and development of language", "Noam Chomsky's biography", "The importance of vocabulary"], answer: 1 },
      { id: "q2", type: "tf", q: "Noam Chomsky believes language is entirely learned through social interaction.", options: ["True", "False", "Not Given"], answer: 1 },
      { id: "q3", type: "mcq", q: "According to the passage, what is 'universal grammar'?", options: ["A set of rules for all animals", "An innate human capacity for language", "A dictionary of all words", "A social construct"], answer: 1 }
    ]
  },
  {
    id: "p2",
    title: "Renewable Energy in the 21st Century",
    difficulty: "Hard",
    mins: 25,
    text: `As the world grapples with the challenges of climate change and dwindling fossil fuel reserves, the transition to renewable energy sources has become a global priority. Solar, wind, and hydroelectric power are leading the way, offering cleaner and more sustainable alternatives to coal and oil.\n\nSolar energy, in particular, has seen significant advancements in recent years. The cost of photovoltaic cells has plummeted, making solar power increasingly competitive with traditional energy sources. Large-scale solar farms are being constructed in sun-drenched regions, while rooftop panels are becoming a common sight in urban areas.\n\nWind energy is another rapidly growing sector. Modern wind turbines are more efficient and quieter than their predecessors, and offshore wind farms are tapping into the vast energy potential of the oceans. However, the intermittent nature of wind and solar power remains a challenge, requiring the development of advanced energy storage systems, such as large-scale batteries and pumped-storage hydropower.`,
    questions: [
      { id: "q1", type: "mcq", q: "Which energy source has seen a significant drop in cost?", options: ["Coal", "Solar", "Wind", "Hydroelectric"], answer: 1 },
      { id: "q2", type: "tf", q: "Offshore wind farms are less efficient than onshore ones.", options: ["True", "False", "Not Given"], answer: 2 },
      { id: "q3", type: "mcq", q: "What is a major challenge for wind and solar power?", options: ["High maintenance costs", "Intermittency", "Lack of public support", "Noise pollution"], answer: 1 }
    ]
  }
];

export default function Reading() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activePassage, setActivePassage] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activePassage && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activePassage, timeLeft, showResults]);

  const startPassage = (passage: any) => {
    setActivePassage(passage);
    setUserAnswers({});
    setShowResults(false);
    setTimeLeft(passage.mins * 60);
  };

  const handleCheck = () => {
    setShowResults(true);
    if (progress) {
      const correctCount = activePassage.questions.filter((q: any, i: number) => userAnswers[i] === q.answer).length;
      const score = (correctCount / activePassage.questions.length) * 9;
      
      const updated = { 
        ...progress, 
        studyMinutes: (progress.studyMinutes || 0) + activePassage.mins,
        bands: { ...progress.bands, reading: Math.max(progress.bands?.reading || 0, score) }
      };
      saveProgress(updated);
      setProgress(updated);
    }
  };

  if (!progress) return null;

  if (activePassage) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActivePassage(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className={cn(
            "flex items-center gap-2 font-mono text-sm",
            timeLeft < 300 ? "text-red-accent animate-pulse" : "text-blue-secondary"
          )}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card bg-bg-2 border-border-2 h-[600px] overflow-y-auto custom-scrollbar">
              <h3 className="font-serif font-bold text-xl mb-4 sticky top-0 bg-bg-2 py-2 border-b border-border-2">{activePassage.title}</h3>
              <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
                {activePassage.text}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold text-sm flex items-center gap-2 px-1">
              <PenTool size={16} className="text-blue-secondary" /> Reading Questions
            </div>
            <div className="space-y-4 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activePassage.questions.map((q: any, i: number) => (
                <div key={i} className="card border-border">
                  <div className="text-xs font-bold text-text-primary mb-3">{i + 1}. {q.q}</div>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => !showResults && setUserAnswers({ ...userAnswers, [i]: optIdx })}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-xs transition-all",
                          userAnswers[i] === optIdx 
                            ? "bg-blue-primary border-blue-primary text-white" 
                            : "bg-bg border-border-2 text-text-secondary hover:border-blue-primary",
                          showResults && optIdx === q.answer && "border-green-accent bg-green-accent/10 text-green-accent",
                          showResults && userAnswers[i] === optIdx && optIdx !== q.answer && "border-red-accent bg-red-accent/10 text-red-accent"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!showResults ? (
              <button onClick={handleCheck} className="btn btn-primary w-full py-4">Submit Answers</button>
            ) : (
              <div className="card bg-blue-dim/10 border-blue-primary/20 text-center py-6">
                <Trophy size={32} className="mx-auto text-yellow-500 mb-2" />
                <div className="text-xl font-black text-blue-primary">
                  Band {((activePassage.questions.filter((q: any, i: number) => userAnswers[i] === q.answer).length / activePassage.questions.length) * 9).toFixed(1)}
                </div>
                <button onClick={() => setActivePassage(null)} className="btn btn-ghost mt-4">Try Another Passage</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">📖 Reading Academy</h2>
          <p className="text-sm text-text-muted">Master IELTS reading with academic passages and practice</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-accent/10 text-emerald-accent flex items-center justify-center">
          <BookOpen size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {READING_PASSAGES.map((passage) => (
          <button
            key={passage.id}
            onClick={() => startPassage(passage)}
            className="card w-full text-left hover:border-blue-primary group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                "tag",
                passage.difficulty === "Medium" ? "tag-amber" : "tag-red"
              )}>{passage.difficulty}</span>
              <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                <Clock size={10} /> {passage.mins} Mins
              </span>
            </div>
            <h3 className="font-bold text-text-primary mb-2 group-hover:text-blue-primary transition-colors">{passage.title}</h3>
            <p className="text-xs text-text-muted line-clamp-2 mb-4">
              {passage.text.substring(0, 150)}...
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{passage.questions.length} Questions</span>
              <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
