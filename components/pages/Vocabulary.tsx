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
import { callGemini } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

interface Word {
  w: string;
  pos: string;
  def: string;
  ex: string;
  band: string;
}

const VOCAB_DATA: Word[] = [
  { w: "analyse", pos: "v", def: "to examine in detail", ex: "Researchers analysed the data collected over five years.", band: "6+" },
  { w: "approach", pos: "n/v", def: "a method of dealing with something", ex: "A new approach to tackling climate change has been proposed.", band: "6+" },
  { w: "assess", pos: "v", def: "to evaluate or judge", ex: "It is difficult to assess the long-term impact of such policies.", band: "6+" },
  { w: "concept", pos: "n", def: "an abstract idea", ex: "The concept of sustainability has gained global attention.", band: "6+" },
  { w: "constitute", pos: "v", def: "to form or make up", ex: "Women constitute 52% of the university population.", band: "7+" },
  { w: "exacerbate", pos: "v", def: "to make a bad situation worse", ex: "Rapid urbanisation can exacerbate existing social inequalities.", band: "8+" },
  { w: "facilitate", pos: "v", def: "to make an action or process easier", ex: "Technology can facilitate greater access to education.", band: "7+" },
  { w: "ubiquitous", pos: "adj", def: "present, appearing, or found everywhere", ex: "Smartphones have become ubiquitous in modern society.", band: "8+" },
  { w: "mitigate", pos: "v", def: "to make something less severe or painful", ex: "Drainage systems were installed to mitigate the risk of flooding.", band: "7+" },
  { w: "paradigm", pos: "n", def: "a typical example or pattern of something", ex: "The shift towards remote work represents a new paradigm in employment.", band: "8+" },
  { w: "pragmatic", pos: "adj", def: "dealing with things sensibly and realistically", ex: "We need a pragmatic solution to the housing crisis.", band: "7+" },
  { w: "redundant", pos: "adj", def: "no longer needed or useful", ex: "Many manual jobs have become redundant due to automation.", band: "7+" },
  { w: "scrutinise", pos: "v", def: "to examine very carefully", ex: "The government's spending plans will be closely scrutinised.", band: "8+" },
  { w: "unprecedented", pos: "adj", def: "never done or known before", ex: "The country is facing an unprecedented economic challenge.", band: "8+" },
  { w: "viable", pos: "adj", def: "capable of working successfully", ex: "The committee is looking for a viable alternative to the current plan.", band: "7+" },
  { w: "widespread", pos: "adj", def: "found or distributed over a large area", ex: "There is widespread concern about the impact of social media.", band: "6+" },
];

export default function Vocabulary() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

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
      const result = await callGemini(`Word: ${word}`, systemPrompt);
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

  const [newWord, setNewWord] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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
      const result = await callGemini(`Word: ${newWord}`, systemPrompt);
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

  const filteredVocab = VOCAB_DATA.filter(v => 
    v.w.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.def.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">🔤 Vocabulary Builder</h2>
          <p className="text-sm text-text-muted">Master the Academic Word List and high-band vocabulary</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            className="w-full bg-bg-2 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:border-blue-primary outline-none"
          />
        </div>
      </div>

      {/* Custom Word Adder */}
      <div className="card bg-bg-2 border-border-2 p-4">
        <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
          <Plus size={14} /> Add Custom Word
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Enter a new word..."
            className="flex-1 bg-bg-1 border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:border-blue-primary outline-none"
          />
          <button
            onClick={addCustomWord}
            disabled={!newWord.trim() || isAdding}
            className="btn btn-primary px-6 py-2 text-sm disabled:opacity-50"
          >
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : "Add"}
          </button>
        </div>
      </div>

      {/* Daily Word Card */}
      <div className="card bg-gradient-to-br from-violet-accent/20 to-bg-1 border-violet-accent/30 p-6">
        <div className="flex items-center gap-2 text-violet-accent font-bold text-xs uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Word of the Day
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h3 className="font-serif text-4xl font-black text-text-primary uppercase tracking-tighter mb-1">UNPRECEDENTED</h3>
            <p className="text-sm text-text-muted italic mb-4">adjective · Band 8+</p>
            <p className="text-text-secondary leading-relaxed max-w-xl">Never done or known before; something that has no previous example or parallel in history.</p>
          </div>
          <button 
            onClick={() => setSelectedWord(VOCAB_DATA.find(v => v.w === "unprecedented"))}
            className="btn btn-primary bg-violet-accent hover:bg-violet-accent/80 shadow-violet-accent/20"
          >
            Learn More <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVocab.map((item, i) => {
          const isKnown = progress.knownWords?.includes(item.w);
          return (
            <button
              key={i}
              onClick={() => setSelectedWord(item)}
              className={cn(
                "card flex items-center gap-4 text-left hover:border-blue-primary group",
                isKnown && "border-green-accent/30 bg-green-accent/5"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors",
                isKnown ? "bg-green-accent text-white" : "bg-bg-2 text-blue-secondary group-hover:bg-blue-dim"
              )}>
                {item.w[0].toUpperCase()}
              </div>
              <div className="flex-1 min-width-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm text-text-primary uppercase tracking-tight">{item.w}</span>
                  <span className="text-[10px] text-text-muted font-medium italic">{item.pos}</span>
                </div>
                <div className="text-xs text-text-muted truncate">{item.def}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "tag",
                  item.band === "8+" ? "tag-violet" : item.band === "7+" ? "tag-blue" : "tag-green"
                )}>{item.band}</span>
                <ChevronRight size={14} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Word Detail Modal */}
      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card w-full max-w-md bg-bg-1 border-border-2 shadow-2xl p-0 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-blue-dim/30 to-bg-1 border-b border-border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-serif text-3xl font-black text-text-primary uppercase tracking-tighter">{selectedWord.w}</h3>
                    <span className="text-sm text-text-muted italic">{selectedWord.pos}</span>
                  </div>
                  <button onClick={() => { setSelectedWord(null); setAiAnalysis(null); }} className="p-2 hover:bg-bg-2 rounded-full transition-colors">
                    <X size={20} className="text-text-muted" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "tag",
                    selectedWord.band === "8+" ? "tag-violet" : selectedWord.band === "7+" ? "tag-blue" : "tag-green"
                  )}>Band {selectedWord.band}</span>
                  <span className="tag tag-gray">Academic Word List</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Definition</div>
                  <p className="text-text-primary leading-relaxed">{selectedWord.def}</p>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Example Sentence</div>
                  <div className="p-4 bg-bg-2 rounded-xl border-l-4 border-blue-primary italic text-sm text-text-secondary leading-relaxed">
                    &quot;{selectedWord.ex}&quot;
                  </div>
                </div>

                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2 text-blue-secondary text-xs animate-pulse py-4">
                    <Loader2 size={16} className="animate-spin" /> AI is analyzing usage...
                  </div>
                ) : aiAnalysis ? (
                  <div className="card bg-blue-dim/10 border-blue-primary/20 text-left">
                    <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-3">
                      <Sparkles size={14} /> AI Usage Analysis
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none markdown-body">
                      <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => toggleKnown(selectedWord.w)}
                    className={cn(
                      "btn flex-1 py-3.5",
                      progress.knownWords?.includes(selectedWord.w) 
                        ? "bg-green-accent text-white" 
                        : "btn-ghost border-border-2"
                    )}
                  >
                    {progress.knownWords?.includes(selectedWord.w) ? <><CheckCircle2 size={18} /> Known</> : <><Bookmark size={18} /> Mark as Known</>}
                  </button>
                  {!aiAnalysis && !isAnalyzing && (
                    <button 
                      onClick={() => getAiAnalysis(selectedWord.w)}
                      className="btn btn-primary px-4"
                      title="Get AI Analysis"
                    >
                      <Sparkles size={18} />
                    </button>
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
