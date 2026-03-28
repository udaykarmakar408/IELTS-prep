"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Type, 
  Search, 
  Star, 
  BookOpen, 
  ChevronRight, 
  X,
  Plus,
  Bookmark,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGroq } from "@/lib/groq";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

import { VOCAB_DATA, Word } from "@/lib/data/vocabulary";

export default function Vocabulary() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isTesting, setIsTesting] = useState(false);
  const [testSentence, setTestSentence] = useState("");
  const [testFeedback, setTestFeedback] = useState<string | null>(null);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const checkSentence = async () => {
    if (!testSentence.trim() || !selectedWord) return;
    setIsTesting(true);
    setTestFeedback(null);
    const systemPrompt = `You are an IELTS vocabulary expert. Evaluate the student's use of the word "${selectedWord.w}" in their sentence.
    Provide:
    1. Correctness: Is the word used correctly (grammar, meaning, collocation)?
    2. IELTS Suitability: Is the context appropriate for an IELTS Writing or Speaking task?
    3. Improvement: How to make the sentence more "Band 9.0"?
    Use markdown for formatting.`;

    try {
      const result = await callGroq(`Word: ${selectedWord.w}\nSentence: ${testSentence}`, systemPrompt);
      setTestFeedback(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTesting(false);
    }
  };
  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      
      const today = new Date().toISOString().split("T")[0];
      if (!p.dailyWord || p.dailyWord.date !== today) {
        generateDailyWord(p);
      }
    };
    load();
  }, []);

  const generateDailyWord = async (p: UserProgress) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const systemPrompt = `You are an IELTS expert. Generate a high-level academic word suitable for IELTS Band 7-9.
      Return ONLY a JSON object in this format:
      {
        "word": "...",
        "type": "noun | verb | adj | adv",
        "band": "7+ | 8+ | 9",
        "def": "...",
        "example": "..."
      }`;
      
      const result = await callGroq("Generate a random IELTS academic word.", systemPrompt);
      const cleaned = result.replace(/```json|```/g, "").trim();
      const word = JSON.parse(cleaned);
      
      const updated = { ...p, dailyWord: { ...word, date: today } };
      setProgress(updated);
      await saveProgress(updated);
    } catch (error) {
      console.error("Failed to generate daily word:", error);
    }
  };

  const getAiAnalysis = async (word: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const systemPrompt = `You are an IELTS vocabulary expert. Analyze the word "${word}".
    Provide:
    1. 2-3 advanced synonyms with subtle differences in meaning.
    2. 2-3 common collocations (words that go together).
    3. An example sentence specifically for an IELTS Writing Task 2 context.
    Use markdown for formatting. Keep it concise and high-band.`;

    try {
      const result = await callGroq(`Word: ${word}`, systemPrompt);
      setAiAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleKnown = (word: string) => {
    if (!progress) return;
    const known = progress.knownWords || [];
    const isKnown = known.includes(word);
    const updated = {
      ...progress,
      knownWords: isKnown ? known.filter(w => w !== word) : [...known, word],
      vocabLearned: isKnown ? progress.vocabLearned - 1 : progress.vocabLearned + 1,
    };
    setProgress(updated);
    saveProgress(updated);
  };

  const categories = ["All", ...Array.from(new Set(VOCAB_DATA.map(w => w.category).filter(Boolean)))];

  const filteredVocab = VOCAB_DATA.filter(w => {
    const matchesSearch = w.w.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         w.def.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addCustomWord = async () => {
    if (!newWord.trim() || !progress) return;
    setIsAdding(true);
    const systemPrompt = `You are an IELTS vocabulary expert. Define the word "${newWord}".
    Provide:
    1. Part of speech (pos).
    2. Simple definition (def).
    3. High-band example sentence (ex).
    4. Estimated IELTS band (band).
    Return in JSON format: { "w": "${newWord}", "pos": "...", "def": "...", "ex": "...", "band": "..." }`;

    try {
      const result = await callGroq(`Word: ${newWord}`, systemPrompt);
      const parsed = JSON.parse(result.replace(/```json|```/g, ""));
      
      const updated = {
        ...progress,
        knownWords: [...(progress.knownWords || []), parsed.w],
        vocabLearned: (progress.vocabLearned || 0) + 1,
      };
      // Note: In a real app we'd save the word data too, but for now we'll just mark it as known
      // and maybe add it to a local state for the current session.
      setProgress(updated);
      saveProgress(updated);
      setNewWord("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!progress) return null;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 text-blue-secondary font-black text-[11px] uppercase tracking-[0.3em] mb-4">
            <Type size={16} className="text-blue-secondary" /> Lexical Resource
          </div>
          <h2 className="recipe-editorial-h1 text-5xl md:text-7xl mb-4">Vocabulary</h2>
          <p className="text-lg text-text-muted max-w-xl leading-relaxed font-medium">Master the Academic Word List and high-band vocabulary for a Band 9.0 score.</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-secondary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="w-full bg-bg-2 border border-border rounded-[2rem] pl-14 pr-6 py-5 text-base text-text-primary focus:border-blue-primary focus:ring-8 focus:ring-blue-primary/5 outline-none transition-all shadow-inner group-hover:bg-bg-3"
          />
        </div>
      </div>

      {/* Custom Word Adder */}
      <div className="recipe-hardware-widget p-8 border-blue-primary/10">
        <div className="flex items-center gap-3 text-blue-secondary font-black text-[11px] uppercase tracking-widest mb-6">
          <Plus size={16} /> Add Custom Word
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Enter a new word to analyze..."
            className="flex-1 bg-bg-1 border border-border rounded-2xl px-6 py-4 text-base text-text-primary focus:border-blue-primary outline-none shadow-inner"
          />
          <button
            onClick={addCustomWord}
            disabled={!newWord.trim() || isAdding}
            className="btn btn-primary px-10 py-4 text-xs font-black uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-blue-primary/20"
          >
            {isAdding ? <Loader2 size={20} className="animate-spin" /> : "Analyze & Add"}
          </button>
        </div>
      </div>

      {/* Word of the Day Hero */}
      {progress.dailyWord && (
        <div className="relative overflow-hidden rounded-[3rem] recipe-atmospheric-bg p-10 md:p-16 text-white shadow-2xl shadow-violet-accent/20 border border-violet-accent/20">
          <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
            <Sparkles size={300} />
          </div>
          <div className="relative z-10 space-y-8 max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <Star size={20} className="text-amber-accent fill-amber-accent animate-pulse" />
              </div>
              <div className="recipe-editorial-label text-amber-accent">Word of the Day</div>
            </div>
            <div className="space-y-4">
              <h3 className="recipe-editorial-h1 text-white leading-[0.85] uppercase">
                {progress.dailyWord.word}
              </h3>
              <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-widest opacity-80">
                <span className="px-3 py-1 bg-white/10 rounded-full border border-white/20">{progress.dailyWord.type}</span>
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="text-amber-accent">Band {progress.dailyWord.band}</span>
              </div>
            </div>
            <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-80 max-w-2xl">
              {progress.dailyWord.def}
            </p>
            <div className="flex flex-wrap gap-6 pt-6">
              <button 
                onClick={() => setSelectedWord({
                  w: progress.dailyWord!.word,
                  pos: progress.dailyWord!.type,
                  def: progress.dailyWord!.def,
                  ex: progress.dailyWord!.example,
                  band: progress.dailyWord!.band,
                  category: "Academic",
                  synonyms: []
                })}
                className="px-10 py-5 bg-white text-violet-accent rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-black/20"
              >
                Master This Word
              </button>
              <button 
                onClick={() => setIsFlashcardMode(true)}
                className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
              >
                Start Flashcards
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex bg-bg-2 p-1.5 rounded-2xl border border-border shadow-inner">
          <button 
            onClick={() => setIsFlashcardMode(false)}
            className={cn(
              "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              !isFlashcardMode ? "bg-blue-primary text-white shadow-xl shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            List View
          </button>
          <button 
            onClick={() => {
              setIsFlashcardMode(true);
              setFlashcardIndex(0);
              setIsFlipped(false);
            }}
            className={cn(
              "px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              isFlashcardMode ? "bg-blue-primary text-white shadow-xl shadow-blue-primary/20" : "text-text-muted hover:text-text-primary"
            )}
          >
            Flashcards
          </button>
        </div>
      </div>

      {/* Categories - Moved outside to be accessible in both modes */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat || "All");
              setFlashcardIndex(0); // Reset index when category changes
            }}
            className={cn(
              "px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border",
              selectedCategory === cat 
                ? "bg-blue-primary text-white border-blue-primary shadow-xl shadow-blue-primary/20" 
                : "bg-bg-2 text-text-muted border-border hover:bg-bg-3"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {isFlashcardMode ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-12">
          {filteredVocab.length === 0 ? (
            <div className="text-center py-20 bg-bg-2 rounded-[3rem] border border-border w-full max-w-xl flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-bg-3 flex items-center justify-center text-text-muted">
                <Search size={32} />
              </div>
              <p className="text-text-muted font-black uppercase tracking-widest text-xs">No words found in this category</p>
            </div>
          ) : (
            <>
              <div className="relative w-full max-w-xl aspect-[4/3] perspective-2000">
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
                  className="w-full h-full relative preserve-3d cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden card bg-bg-2 border-border-2 flex flex-col items-center justify-center text-center p-12 shadow-2xl rounded-[3rem]">
                    <div className="recipe-editorial-label text-blue-secondary mb-8">Word</div>
                    <h3 className="recipe-editorial-h1 text-6xl md:text-8xl">{filteredVocab[flashcardIndex]?.w}</h3>
                    <div className="mt-12 text-[10px] font-black text-text-muted uppercase tracking-widest animate-pulse">Click to flip</div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden card bg-bg-2 border-border-2 flex flex-col items-center justify-center text-center p-12 shadow-2xl rounded-[3rem] rotate-y-180">
                    <div className="recipe-editorial-label text-green-accent mb-6">Definition</div>
                    <p className="text-xl text-text-primary leading-relaxed mb-10 font-medium">{filteredVocab[flashcardIndex]?.def}</p>
                    <div className="recipe-editorial-label text-blue-secondary mb-4">Example</div>
                    <p className="text-base text-text-secondary leading-relaxed italic font-medium max-w-md">"{filteredVocab[flashcardIndex]?.ex}"</p>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-10">
                <button 
                  onClick={() => {
                    setFlashcardIndex(prev => (prev > 0 ? prev - 1 : filteredVocab.length - 1));
                    setIsFlipped(false);
                  }}
                  className="w-16 h-16 rounded-full border border-border hover:bg-bg-2 flex items-center justify-center transition-all hover:border-blue-primary group"
                >
                  <ChevronRight size={32} className="rotate-180 text-text-muted group-hover:text-blue-primary transition-colors" />
                </button>
                <div className="text-lg font-black text-text-muted tracking-widest">
                  {flashcardIndex + 1} <span className="opacity-30">/</span> {filteredVocab.length}
                </div>
                <button 
                  onClick={() => {
                    setFlashcardIndex(prev => (prev < filteredVocab.length - 1 ? prev + 1 : 0));
                    setIsFlipped(false);
                  }}
                  className="w-16 h-16 rounded-full border border-border hover:bg-bg-2 flex items-center justify-center transition-all hover:border-blue-primary group"
                >
                  <ChevronRight size={32} className="text-text-muted group-hover:text-blue-primary transition-colors" />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVocab.map((item, i) => {
              const isKnown = progress?.knownWords?.includes(item.w);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedWord(item)}
                  className={cn(
                    "card flex items-center gap-6 text-left hover:border-blue-primary group p-6 rounded-[2.5rem] transition-all hover:shadow-2xl hover:shadow-blue-primary/5",
                    isKnown && "border-green-accent/30 bg-green-accent/5"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-all shadow-inner",
                    isKnown ? "bg-green-accent text-white" : "bg-bg-2 text-blue-secondary group-hover:bg-blue-dim group-hover:scale-110"
                  )}>
                    {item.w[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-width-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-serif text-xl font-bold text-text-primary uppercase tracking-tight group-hover:text-blue-secondary transition-colors">{item.w}</span>
                      <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">{item.pos}</span>
                    </div>
                    <div className="text-sm text-text-muted truncate font-medium">{item.def}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "tag px-3 py-1 text-[10px] font-black",
                      item.band === "8+" ? "tag-violet" : item.band === "7+" ? "tag-blue" : "tag-green"
                    )}>{item.band}</span>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Word Detail Modal */}
          {/* Word Detail Modal */}
          <AnimatePresence>
            {selectedWord && (
              <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  className="w-full max-w-4xl bg-bg-1 border border-border/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative rounded-[2.5rem]"
                >
                  {/* Header Section - Compacted to maximize content space */}
                  <div className="p-6 md:p-8 bg-gradient-to-b from-blue-dim/20 to-transparent border-b border-border/50 flex-shrink-0 relative">
                    <button 
                      onClick={() => { setSelectedWord(null); setAiAnalysis(null); setTestFeedback(null); setTestSentence(""); }} 
                      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-bg-2 hover:bg-bg-3 border border-border flex items-center justify-center transition-all z-10 group"
                    >
                      <X size={20} className="text-text-muted group-hover:text-text-primary transition-colors" />
                    </button>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                          selectedWord.band === "8+" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : 
                          selectedWord.band === "7+" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : 
                          "bg-green-500/10 text-green-400 border border-green-500/20"
                        )}>
                          Band {selectedWord.band}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted italic">
                          {selectedWord.pos} • {selectedCategory}
                        </span>
                      </div>

                      <h3 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-text-primary uppercase leading-none">
                        {selectedWord.w}
                      </h3>
                    </div>
                  </div>

                  {/* Content Section - Maximize this area */}
                  <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                    {/* Definition */}
                    <div className="space-y-4">
                      <div className="recipe-editorial-label">Definition</div>
                      <p className="text-2xl md:text-3xl text-text-primary font-medium leading-tight tracking-tight">
                        {selectedWord.def}
                      </p>
                    </div>

                    {/* Synonyms */}
                    {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                      <div className="space-y-4">
                        <div className="recipe-editorial-label">Synonyms</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedWord.synonyms.map((syn, idx) => (
                            <span key={idx} className="px-4 py-2 bg-bg-2 text-text-secondary rounded-xl text-sm font-medium border border-border hover:border-blue-secondary/50 transition-colors">
                              {syn}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Example */}
                    <div className="space-y-4">
                      <div className="recipe-editorial-label">Example Context</div>
                      <div className="p-8 bg-bg-2/50 rounded-3xl border border-border italic text-xl text-text-secondary leading-relaxed shadow-inner">
                        &quot;{selectedWord.ex}&quot;
                      </div>
                    </div>

                    {/* AI Analysis or Practice */}
                    <div className="pt-12 border-t border-border/50">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-16 bg-blue-primary/5 rounded-3xl border border-dashed border-blue-primary/20">
                          <Loader2 size={32} className="animate-spin text-blue-primary" /> 
                          <span className="recipe-hardware-label text-blue-primary">Aria is synthesizing usage patterns...</span>
                        </div>
                      ) : aiAnalysis ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-blue-dim/10 border border-blue-primary/20 p-8 md:p-10 rounded-3xl"
                        >
                          <div className="flex items-center gap-3 text-blue-secondary font-black text-[11px] uppercase tracking-widest mb-6">
                            <Sparkles size={16} /> AI Deep Analysis
                          </div>
                          <div className="prose prose-invert prose-lg max-w-none markdown-body">
                            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="space-y-8">
                          <div className="recipe-editorial-label">Practice Session</div>
                          <div className="space-y-6">
                            <textarea
                              value={testSentence}
                              onChange={(e) => setTestSentence(e.target.value)}
                              placeholder={`Construct a sentence using "${selectedWord.w}" in an academic context...`}
                              className="w-full bg-bg-2 border border-border rounded-3xl p-8 text-xl text-text-primary focus:border-blue-primary focus:ring-4 focus:ring-blue-primary/10 outline-none min-h-[200px] resize-none transition-all shadow-inner"
                            />
                            <button
                              onClick={checkSentence}
                              disabled={!testSentence.trim() || isTesting}
                              className="btn btn-primary w-full py-6 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-primary/20 rounded-2xl"
                            >
                              {isTesting ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Submit for Evaluation"}
                            </button>
                            
                            <AnimatePresence>
                              {testFeedback && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-bg-2 border border-border p-8 md:p-10 rounded-3xl shadow-inner"
                                >
                                  <div className="text-[11px] font-black text-blue-secondary uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <CheckCircle2 size={18} /> AI Feedback
                                  </div>
                                  <div className="prose prose-invert prose-lg max-w-none markdown-body">
                                    <ReactMarkdown>{testFeedback}</ReactMarkdown>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 md:p-8 flex gap-4 border-t border-border/50 bg-bg-1/80 backdrop-blur-md flex-shrink-0">
                    <button
                      onClick={() => toggleKnown(selectedWord.w)}
                      className={cn(
                        "flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95",
                        progress.knownWords?.includes(selectedWord.w)
                          ? "bg-green-accent text-white shadow-lg shadow-green-accent/20"
                          : "bg-bg-2 border border-border text-text-muted hover:bg-bg-3 hover:text-text-primary"
                      )}
                    >
                      <CheckCircle2 size={18} /> {progress.knownWords?.includes(selectedWord.w) ? "Mastered" : "Mark as Known"}
                    </button>
                    {!aiAnalysis && !isAnalyzing && (
                      <button
                        onClick={() => getAiAnalysis(selectedWord.w)}
                        className="w-20 py-5 bg-blue-primary hover:bg-blue-secondary text-white rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-primary/20"
                        title="AI Analysis"
                      >
                        <Sparkles size={20} />
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
      
      {!isFlashcardMode && (
        <div className="mt-16 p-12 card bg-bg-2 border-dashed border-border-2 text-center rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-primary/30 to-transparent" />
          <h3 className="recipe-editorial-h1 text-3xl mb-4">Ready for a challenge?</h3>
          <p className="text-lg text-text-muted mb-10 max-w-md mx-auto leading-relaxed font-medium">Switch to Flashcard mode to test your memory and master these words.</p>
          <button 
            onClick={() => {
              setIsFlashcardMode(true);
              setFlashcardIndex(0);
              setIsFlipped(false);
            }}
            className="btn btn-primary px-12 py-5 shadow-2xl shadow-blue-primary/30 text-xs font-black uppercase tracking-widest rounded-2xl"
          >
            Start Flashcards
          </button>
        </div>
      )}
    </div>
  );
}
