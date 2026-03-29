"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  ExternalLink, 
  Download, 
  Youtube, 
  BookOpen, 
  Globe, 
  FileText,
  ChevronRight,
  PlayCircle,
  Link as LinkIcon,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const RESOURCE_CATEGORIES = [
  {
    title: "Official IELTS Materials",
    icon: Globe,
    color: "text-blue-secondary",
    bg: "bg-blue-secondary/10",
    links: [
      { name: "IELTS.org Official Practice", url: "https://www.ielts.org/for-test-takers/sample-test-questions", type: "Official" },
      { name: "British Council Free Prep", url: "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests", type: "Official" },
      { name: "IDP IELTS Essentials", url: "https://www.ieltsessentials.com/prepare/free-practice-tests", type: "Official" },
    ]
  },
  {
    title: "YouTube Learning Channels",
    icon: Youtube,
    color: "text-red-accent",
    bg: "bg-red-accent/10",
    links: [
      { name: "IELTS Advantage", url: "https://www.youtube.com/@IELTSAdvantage", type: "Video" },
      { name: "IELTS Liz", url: "https://www.youtube.com/@IELTSLiz", type: "Video" },
      { name: "E2 IELTS", url: "https://www.youtube.com/@E2IELTS", type: "Video" },
      { name: "Fastrack IELTS", url: "https://www.youtube.com/@FastrackIELTS", type: "Video" },
    ]
  },
  {
    title: "PDF Downloads & E-Books",
    icon: FileText,
    color: "text-violet-accent",
    bg: "bg-violet-accent/10",
    links: [
      { name: "Cambridge IELTS 1-19 (Search)", url: "https://www.google.com/search?q=Cambridge+IELTS+19+PDF+Free+Download", type: "PDF" },
      { name: "IELTS Writing Task 2 Guide", url: "https://ieltsadvantage.com/writing-task-2/", type: "Guide" },
      { name: "Common Grammar Mistakes PDF", url: "https://www.britishcouncil.org/sites/default/files/common_grammar_mistakes.pdf", type: "PDF" },
    ]
  },
  {
    title: "Vocabulary & Dictionaries",
    icon: BookOpen,
    color: "text-green-accent",
    bg: "bg-green-accent/10",
    links: [
      { name: "Cambridge Dictionary", url: "https://dictionary.cambridge.org/", type: "Tool" },
      { name: "Oxford Learner's Dictionary", url: "https://www.oxfordlearnersdictionaries.com/", type: "Tool" },
      { name: "Thesaurus.com (Synonyms)", url: "https://www.thesaurus.com/", type: "Tool" },
    ]
  }
];

interface ResourcesProps {
  setActivePage: (page: string) => void;
}

export default function Resources({ setActivePage }: ResourcesProps) {
  return (
    <div className="space-y-8">
      <div className="card-blue p-6 md:p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="text-[10px] text-blue-secondary font-black uppercase tracking-[0.2em]">Curated Library</div>
          <h2 className="font-serif text-4xl md:text-5xl font-black text-text-primary leading-tight tracking-tight">
            IELTS <span className="text-blue-secondary">Resources</span>
          </h2>
          <p className="text-sm md:text-base text-text-secondary max-w-md leading-relaxed">
            A hand-picked collection of the best free materials, tools, and channels to help you reach Band 8.0+.
          </p>
          <button 
            onClick={() => setActivePage("lizhub")}
            className="btn btn-primary flex items-center gap-2"
          >
            <Star size={16} className="fill-white" /> Go to Liz Hub
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RESOURCE_CATEGORIES.map((category, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card border-border hover:border-blue-primary/30 transition-all group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", category.bg)}>
                <category.icon size={24} className={category.color} />
              </div>
              <h3 className="font-serif text-xl font-bold text-text-primary">{category.title}</h3>
            </div>

            <div className="space-y-3">
              {category.links.map((link, lIdx) => (
                <a 
                  key={lIdx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-bg-2 hover:bg-bg-3 rounded-xl border border-border transition-colors group/link"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted group-hover/link:text-blue-secondary">
                      {link.type === "Video" ? <PlayCircle size={16} /> : 
                       link.type === "PDF" ? <Download size={16} /> : 
                       <LinkIcon size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-primary group-hover/link:text-blue-secondary transition-colors">{link.name}</div>
                      <div className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{link.type}</div>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-text-muted opacity-0 group-hover/link:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Video Section */}
      <div className="card bg-gradient-to-br from-red-accent/10 to-bg-1 border-red-accent/20">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 aspect-video bg-bg-3 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <img 
              src="https://picsum.photos/seed/ielts/800/450" 
              alt="IELTS Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="relative z-10 w-16 h-16 bg-red-accent rounded-full flex items-center justify-center text-white shadow-xl shadow-red-accent/40 group-hover:scale-110 transition-transform">
              <PlayCircle size={32} />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="text-[10px] text-red-accent font-black uppercase tracking-[0.2em]">Featured Video</div>
            <h3 className="font-serif text-2xl font-black text-text-primary">Mastering IELTS Writing Task 2</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Learn the exact structure used by Band 9 candidates to answer any essay question. This 20-minute masterclass covers planning, introductions, and body paragraphs.
            </p>
            <a 
              href="https://www.youtube.com/results?search_query=ielts+writing+task+2+band+9+structure" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary bg-red-accent hover:bg-red-accent/80 border-none inline-flex items-center gap-2"
            >
              Watch on YouTube <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Study Groups & Community */}
      <div className="card bg-gradient-to-br from-blue-primary/10 to-bg-1 border-blue-primary/20">
        <div className="flex items-center gap-2 text-blue-primary font-bold text-xs uppercase tracking-widest mb-4">
          <Globe size={14} /> Community & Forums
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "Reddit r/IELTS", desc: "Active community of 100k+ learners", url: "https://www.reddit.com/r/IELTS/" },
            { name: "IELTS Network", desc: "Forum for sharing tips and feedback", url: "https://www.ieltsnetwork.com/" },
            { name: "Discord Study Group", desc: "Live practice with other students", url: "https://discord.gg/ielts" },
          ].map((item, i) => (
            <a 
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-primary/50 transition-all group"
            >
              <div className="font-bold text-sm text-text-primary mb-1 group-hover:text-blue-primary transition-colors">{item.name}</div>
              <div className="text-[10px] text-text-muted leading-tight">{item.desc}</div>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-blue-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                Join Now <ChevronRight size={10} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
