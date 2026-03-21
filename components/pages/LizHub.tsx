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

  const filteredResources = LIZ_RESOURCES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-1">
            <Star size={14} className="fill-blue-secondary" /> Expert Resources
          </div>
          <h2 className="font-serif text-3xl font-bold mb-1">Liz Hub</h2>
          <p className="text-sm text-text-muted">Curated IELTS tips and lessons from IELTS Liz</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Liz's tips..."
            className="w-full bg-bg-2 border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-text-primary focus:border-blue-primary outline-none"
          />
        </div>
      </div>

      <div className="card bg-gradient-to-br from-blue-dim to-bg-1 border-blue-primary/20 p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-primary flex items-center justify-center text-white font-serif text-4xl font-black shadow-xl shadow-blue-primary/30 flex-shrink-0">
          L
        </div>
        <div>
          <h3 className="text-xl font-serif font-bold mb-2">Why IELTS Liz?</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Liz is one of the most trusted IELTS teachers globally. Her methods are simple, effective, and have helped millions of students reach Band 7, 8, and 9. This hub brings her best materials directly to you.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredResources.map((cat, i) => (
          <div key={i} className="space-y-4">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] border-b border-border pb-2">
              {cat.category}
            </h4>
            <div className="space-y-3">
              {cat.items.map((item, j) => (
                <a 
                  key={j} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block card bg-bg-2 hover:border-blue-primary transition-all p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.type === "video" ? <Youtube size={14} className="text-red-accent" /> : 
                         item.type === "pdf" ? <FileText size={14} className="text-blue-secondary" /> : 
                         <Globe size={14} className="text-emerald-accent" />}
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.type}</span>
                      </div>
                      <h5 className="font-bold text-text-primary group-hover:text-blue-secondary transition-colors mb-1">{item.title}</h5>
                      <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                    </div>
                    <ExternalLink size={16} className="text-text-muted group-hover:text-blue-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-bg-2 border-dashed border-border-2 text-center py-10">
        <Sparkles size={32} className="mx-auto mb-4 text-blue-secondary opacity-50" />
        <h4 className="text-sm font-bold text-text-primary mb-2">Need a specific lesson?</h4>
        <p className="text-xs text-text-muted mb-6">Ask our AI Tutor to find the best Liz Hub resource for your current weakness.</p>
        <button className="btn btn-ghost border border-border px-8">Ask AI Tutor</button>
      </div>
    </div>
  );
}
