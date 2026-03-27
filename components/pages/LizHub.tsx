"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  ExternalLink, 
  Youtube, 
  Globe, 
  FileText, 
  Star,
  ChevronRight,
  Search,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIZ_RESOURCES = [
  {
    category: "Writing Task 2",
    items: [
      { title: "How to write an Introduction", type: "video", url: "https://ieltsliz.com/ielts-writing-task-2-how-to-write-an-introduction/", desc: "Step-by-step guide to paraphrasing and thesis statements." },
      { title: "Opinion Essay Structure", type: "article", url: "https://ieltsliz.com/ielts-opinion-essay-structure/", desc: "The most common essay type explained with a model answer." },
      { title: "Vocabulary for Task 2", type: "pdf", url: "https://ieltsliz.com/ielts-writing-task-2-vocabulary/", desc: "Topic-specific vocabulary lists for high band scores." }
    ]
  },
  {
    category: "Speaking",
    items: [
      { title: "Part 1 Topics & Answers", type: "article", url: "https://ieltsliz.com/ielts-speaking-part-1-topics-questions/", desc: "Current topics being asked in the exam right now." },
      { title: "Part 2 Cue Card Tips", type: "video", url: "https://ieltsliz.com/ielts-speaking-part-2-tips/", desc: "How to speak for 2 minutes without running out of ideas." },
      { title: "Idioms for Speaking", type: "article", url: "https://ieltsliz.com/ielts-speaking-idioms/", desc: "Natural-sounding idioms to boost your Lexical Resource score." }
    ]
  },
  {
    category: "Reading & Listening",
    items: [
      { title: "Reading: True/False/Not Given", type: "video", url: "https://ieltsliz.com/ielts-reading-true-false-not-given-tips/", desc: "The ultimate strategy for the hardest question type." },
      { title: "Listening: Section 4 Tips", type: "article", url: "https://ieltsliz.com/ielts-listening-section-4-tips/", desc: "How to handle the fast-paced academic lecture section." }
    ]
  }
];

export default function LizHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResources = LIZ_RESOURCES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!selectedCategory || cat.category === selectedCategory)
    )
  })).filter(cat => cat.items.length > 0);

  const categories = Array.from(new Set(LIZ_RESOURCES.map(cat => cat.category)));

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 text-blue-secondary font-black text-[11px] uppercase tracking-[0.3em] mb-4">
            <Star size={16} className="fill-blue-secondary" /> Expert Resources
          </div>
          <h2 className="recipe-editorial-h1 text-5xl md:text-7xl mb-4">Liz Hub</h2>
          <p className="text-lg text-text-muted max-w-xl leading-relaxed font-medium">Curated IELTS tips and lessons from IELTS Liz, the world&apos;s most trusted IELTS teacher.</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-secondary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Liz's tips..."
            className="w-full bg-bg-2 border border-border rounded-[2rem] pl-14 pr-6 py-5 text-base text-text-primary focus:border-blue-primary focus:ring-8 focus:ring-blue-primary/5 outline-none transition-all shadow-inner group-hover:bg-bg-3"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
            !selectedCategory ? "bg-blue-primary text-white border-blue-primary shadow-xl shadow-blue-primary/20" : "bg-bg-2 text-text-muted border-border hover:bg-bg-3"
          )}
        >
          All Resources
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              selectedCategory === cat ? "bg-blue-primary text-white border-blue-primary shadow-xl shadow-blue-primary/20" : "bg-bg-2 text-text-muted border-border hover:bg-bg-3"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Section */}
      {!searchQuery && !selectedCategory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card recipe-atmospheric-bg border-blue-primary/20 p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-blue-primary/20 transition-all duration-1000" />
            <div className="w-32 h-32 rounded-[2.5rem] bg-white text-blue-primary flex items-center justify-center font-serif text-7xl font-black shadow-2xl shadow-blue-primary/40 flex-shrink-0 relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              L
            </div>
            <div className="relative z-10 text-center md:text-left space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={14} className="text-blue-secondary" /> Featured Expert
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">Why IELTS Liz?</h3>
              <p className="text-lg text-white/80 leading-relaxed max-w-xl font-medium">
                Liz is one of the most trusted IELTS teachers globally. Her methods are simple, effective, and have helped millions of students reach Band 7, 8, and 9. This hub brings her best materials directly to you.
              </p>
            </div>
          </div>
          <div className="card bg-violet-accent/5 border-violet-accent/20 p-10 flex flex-col justify-center text-center group hover:bg-violet-accent/10 transition-all relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-accent/5 rounded-full blur-2xl" />
            <div className="w-16 h-16 rounded-3xl bg-violet-accent/10 text-violet-accent flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-violet-accent/5">
              <Star size={32} className="fill-violet-accent" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-text-primary mb-4">Liz&apos;s Top Tip</h4>
            <p className="text-base text-text-secondary leading-relaxed italic font-medium">
              &quot;Don&apos;t just practice tests. Practice the skills needed for the tests. Accuracy is more important than speed in the beginning.&quot;
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredResources.map((cat, i) => (
          <div key={i} className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h4 className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">
                {cat.category}
              </h4>
              <span className="text-[10px] font-black text-blue-secondary bg-blue-primary/10 px-3 py-1 rounded-full border border-blue-primary/20">
                {cat.items.length} Lessons
              </span>
            </div>
            <div className="space-y-6">
              {cat.items.map((item, j) => (
                <a 
                  key={j} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block card bg-bg-2 border-border hover:border-blue-primary hover:bg-bg-3 transition-all p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-primary/5 active:scale-[0.99] rounded-[2.5rem]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-inner",
                          item.type === "video" ? "bg-red-accent/10 text-red-accent border border-red-accent/20" : 
                          item.type === "pdf" ? "bg-blue-primary/10 text-blue-primary border border-blue-primary/20" : 
                          "bg-emerald-accent/10 text-emerald-accent border border-emerald-accent/20"
                        )}>
                          {item.type === "video" ? <Youtube size={20} /> : 
                           item.type === "pdf" ? <FileText size={20} /> : 
                           <Globe size={20} />}
                        </div>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.type}</span>
                      </div>
                      <h5 className="font-serif text-xl font-bold text-text-primary group-hover:text-blue-secondary transition-colors mb-3 leading-tight">{item.title}</h5>
                      <p className="text-sm text-text-muted leading-relaxed line-clamp-2 font-medium">{item.desc}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-bg-3 flex items-center justify-center text-text-muted group-hover:bg-blue-primary group-hover:text-white transition-all flex-shrink-0 mt-1 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-primary/20">
                      <ExternalLink size={20} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-bg-2 border-dashed border-border-2 text-center py-20 relative overflow-hidden rounded-[3rem]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-primary/30 to-transparent" />
        <div className="w-20 h-20 rounded-[2rem] bg-blue-primary/5 text-blue-secondary flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Sparkles size={40} className="opacity-50" />
        </div>
        <h4 className="recipe-editorial-h1 text-3xl mb-4">Need a specific lesson?</h4>
        <p className="text-lg text-text-muted mb-10 max-w-md mx-auto leading-relaxed font-medium">Ask our AI Tutor to find the best Liz Hub resource for your current weakness.</p>
        <button className="btn btn-primary px-12 py-5 shadow-2xl shadow-blue-primary/30 text-xs font-black uppercase tracking-widest rounded-2xl">Ask AI Tutor</button>
      </div>
    </div>
  );
}
