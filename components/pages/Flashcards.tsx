"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Trophy,
  Clock,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Flashcard {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  level: number; // SRS level: 0-5
  nextReview: string; // ISO date
}

const DEFAULT_CARDS: Flashcard[] = [
  { id: "1", word: "Mitigate", definition: "To make something less severe, serious, or painful.", example: "Drainage schemes have helped to mitigate the problem.", category: "Academic", level: 0, nextReview: new Date().toISOString() },
  { id: "2", word: "Exacerbate", definition: "To make a problem, bad situation, or negative feeling worse.", example: "The exorbitant cost of land in urban areas only exacerbated the problem.", category: "Academic", level: 0, nextReview: new Date().toISOString() },
  { id: "3", word: "Pragmatic", definition: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.", example: "A pragmatic approach to politics.", category: "Academic", level: 0, nextReview: new Date().toISOString() },
  { id: "4", word: "Ubiquitous", definition: "Present, appearing, or found everywhere.", example: "Cowboy hats are ubiquitous in Texas.", category: "Academic", level: 0, nextReview: new Date().toISOString() },
  { id: "5", word: "Paradigm", definition: "A typical example or pattern of something; a model.", example: "There is a new paradigm for public service in the digital age.", category: "Academic", level: 0, nextReview: new Date().toISOString() },
];

export default function Flashcards() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [view, setView] = useState<"study" | "list">("study");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      
      // In a real app, we'd store cards in progress. For now, let's use local storage specifically for flashcards
      const storedCards = localStorage.getItem("ielts_flashcards");
      if (storedCards) {
        setCards(JSON.parse(storedCards));
      } else {
        setCards(DEFAULT_CARDS);
        localStorage.setItem("ielts_flashcards", JSON.stringify(DEFAULT_CARDS));
      }
    };
    load();
  }, []);

  const saveCards = (newCards: Flashcard[]) => {
    setCards(newCards);
    localStorage.setItem("ielts_flashcards", JSON.stringify(newCards));
  };

  const handleLevelUpdate = (wordId: string, success: boolean) => {
    const newCards = cards.map(card => {
      if (card.id === wordId) {
        const newLevel = success ? Math.min(card.level + 1, 5) : Math.max(card.level - 1, 0);
        // Simple SRS: level 0 = now, 1 = 1 day, 2 = 3 days, 3 = 1 week, 4 = 2 weeks, 5 = 1 month
        const days = [0, 1, 3, 7, 14, 30][newLevel];
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + days);
        
        return { ...card, level: newLevel, nextReview: nextReview.toISOString() };
      }
      return card;
    });
    
    saveCards(newCards);
    setIsFlipped(false);
    
    // Move to next card if available
    const nextIndex = cards.findIndex((c, i) => i > currentIndex && new Date(c.nextReview) <= new Date());
    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
    } else {
      // If no more cards to review, just stay or show completion
    }
  };

  const reviewCards = cards.filter(c => new Date(c.nextReview) <= new Date());
  const currentCard = reviewCards[currentIndex] || null;

  if (!progress) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">🎴 Flashcards</h2>
          <p className="text-sm text-text-muted">Master vocabulary with Spaced Repetition (SRS)</p>
        </div>
        <div className="flex bg-bg-2 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setView("study")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === "study" ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            Study Now
          </button>
          <button 
            onClick={() => setView("list")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              view === "list" ? "bg-blue-primary text-white shadow-lg shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            Word List
          </button>
        </div>
      </div>

      {view === "study" ? (
        <div className="max-w-xl mx-auto space-y-8">
          {reviewCards.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-2">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Card {currentIndex + 1} of {reviewCards.length}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-bg-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-primary transition-all duration-500" 
                      style={{ width: `${((currentIndex + 1) / reviewCards.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div 
                className="relative h-80 perspective-1000 cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d transition-all duration-500"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden card border-2 border-blue-primary/20 bg-gradient-to-br from-bg-1 to-bg-2 flex flex-col items-center justify-center p-8 text-center shadow-xl group-hover:border-blue-primary/40 transition-colors">
                    <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-[0.2em] mb-4">IELTS Vocabulary</div>
                    <h3 className="text-4xl font-serif font-black text-text-primary mb-2">{currentCard?.word}</h3>
                    <div className="text-xs text-text-muted mt-8 flex items-center gap-2 opacity-50">
                      <Sparkles size={12} /> Click to reveal definition
                    </div>
                  </div>

                  {/* Back */}
                  <div 
                    className="absolute inset-0 backface-hidden card border-2 border-green-accent/20 bg-gradient-to-br from-bg-1 to-bg-2 flex flex-col items-center justify-center p-8 text-center shadow-xl rotate-y-180"
                  >
                    <div className="text-[10px] font-bold text-green-accent uppercase tracking-[0.2em] mb-4">Definition</div>
                    <p className="text-lg font-medium text-text-primary mb-6 leading-relaxed">
                      {currentCard?.definition}
                    </p>
                    <div className="w-full h-px bg-border my-4" />
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Example</div>
                    <p className="text-sm italic text-text-secondary">
                      &quot;{currentCard?.example}&quot;
                    </p>
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {isFlipped && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLevelUpdate(currentCard!.id, false); }}
                      className="btn bg-red-accent/10 border-red-accent/20 text-red-accent hover:bg-red-accent hover:text-white py-4 flex flex-col items-center gap-1"
                    >
                      <XCircle size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Hard / Forgot</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleLevelUpdate(currentCard!.id, true); }}
                      className="btn bg-green-accent/10 border-green-accent/20 text-green-accent hover:bg-green-accent hover:text-white py-4 flex flex-col items-center gap-1"
                    >
                      <CheckCircle2 size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Easy / Remembered</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="card border-dashed border-border-2 p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-green-accent/10 rounded-full flex items-center justify-center text-green-accent mx-auto">
                <Trophy size={40} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold mb-2">All Caught Up!</h3>
                <p className="text-sm text-text-muted">You&apos;ve reviewed all your cards for today. Come back tomorrow for more!</p>
              </div>
              <button onClick={() => setView("list")} className="btn btn-primary">Add More Words</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your vocabulary..."
                className="w-full bg-bg-2 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-blue-primary outline-none"
              />
            </div>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus size={16} /> Add New Word
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.filter(c => c.word.toLowerCase().includes(searchQuery.toLowerCase())).map((card) => (
              <div key={card.id} className="card hover:border-blue-primary transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-serif font-bold text-lg text-text-primary">{card.word}</h4>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      card.level === 0 ? "bg-bg-3 text-text-muted" : "bg-blue-dim text-blue-secondary"
                    )}>
                      Level {card.level}
                    </div>
                    <button className="text-text-muted hover:text-red-accent transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2 mb-4">{card.definition}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-tighter">
                    <Clock size={10} /> Next: {new Date(card.nextReview).toLocaleDateString()}
                  </div>
                  <span className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest">{card.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
