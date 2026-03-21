"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Bot, 
  GraduationCap, 
  FileText, 
  BookOpen, 
  PenTool, 
  Calendar, 
  BarChart2, 
  Headphones, 
  Type, 
  Book, 
  Mic, 
  Timer, 
  ClipboardList, 
  Target,
  Settings,
  Menu,
  X,
  ChevronRight,
  Flame,
  Star,
  Sparkles
} from "lucide-react";
import { Logo, LogoText } from "@/components/Logo";
import { UserProgress, getProgress, saveProgress, updateStreak } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export default function AppShell({ children, activePage, setActivePage }: AppShellProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      const updated = updateStreak(p);
      setProgress(updated);
      await saveProgress(updated);
    };
    load();
  }, []);

  useEffect(() => {
    if (progress) {
      saveProgress(progress);
    }
  }, [progress]);

  useEffect(() => {
    const handleNavigation = (e: any) => {
      if (e.detail) setActivePage(e.detail);
    };
    window.addEventListener('navigate-to-page', handleNavigation);
    return () => window.removeEventListener('navigate-to-page', handleNavigation);
  }, [setActivePage]);

  const navCategories = [
    {
      label: "Main",
      items: [
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "course", label: "Course", icon: GraduationCap },
        { id: "tutor", label: "AI Tutor", icon: Bot },
      ]
    },
    {
      label: "Skills Practice",
      items: [
        { id: "listening", label: "Listening", icon: Headphones },
        { id: "reading", label: "Reading", icon: BookOpen },
        { id: "writing", label: "Writing", icon: PenTool },
        { id: "speaking", label: "Speaking", icon: Mic },
      ]
    },
    {
      label: "Foundations",
      items: [
        { id: "vocab", label: "Vocabulary", icon: Type },
        { id: "grammar", label: "Grammar", icon: Book },
        { id: "drills", label: "Daily Drills", icon: Target },
      ]
    },
    {
      label: "Assessment",
      items: [
        { id: "cambridge", label: "Cambridge", icon: Book },
        { id: "tests", label: "Mock Tests", icon: FileText },
        { id: "quiz", label: "Daily Quiz", icon: PenTool },
      ]
    },
    {
      label: "More",
      items: [
        { id: "speaking-lab", label: "Speaking Lab", icon: Sparkles },
        { id: "lizhub", label: "Liz Hub", icon: Star },
        { id: "roadmap", label: "Roadmap", icon: Calendar },
        { id: "resources", label: "Resources", icon: BookOpen },
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  const allNavItems = navCategories.flatMap(cat => cat.items);

  const avgBand = (progress && progress.bands) ? Object.values(progress.bands).filter(v => v > 0).reduce((a, b, _, arr) => a + b / arr.length, 0).toFixed(1) : "—";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass-nav border-b border-white/5 flex items-center px-4 gap-3 z-[60]">
        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setActivePage("dashboard")}>
          <Logo className="w-10 h-10" />
          <LogoText />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-bg-2 border border-border rounded-full px-3 py-1 text-xs font-bold text-amber-accent flex items-center gap-1">
            <Flame size={12} /> {progress?.streak || 0}d
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 glass-sidebar overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActivePage("dashboard")}>
            <Logo className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
            <LogoText />
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
          <div className="text-sm font-bold text-text-primary truncate">{progress?.name || "Learner"}</div>
          <div className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Flame size={12} className="text-amber-accent" /> {progress?.streak || 0}d streak · Target {progress?.target || 7.5}
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          {navCategories.map((category) => (
            <div key={category.label} className="space-y-1">
              <div className="px-4 text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">
                {category.label}
              </div>
              {category.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 text-left group relative overflow-hidden",
                    activePage === item.id 
                      ? "bg-blue-primary/10 text-blue-secondary shadow-sm" 
                      : "text-text-muted hover:bg-white/5 hover:text-text-primary"
                  )}
                >
                  {activePage === item.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-primary"
                    />
                  )}
                  <item.icon 
                    size={18} 
                    className={cn(
                      "transition-transform duration-300 group-hover:scale-110",
                      activePage === item.id ? "text-blue-secondary" : "text-text-muted group-hover:text-blue-secondary"
                    )} 
                  />
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-widest transition-colors duration-300",
                    activePage === item.id ? "text-blue-secondary" : "text-text-muted group-hover:text-text-primary"
                  )}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="bg-bg-2 rounded-xl p-2.5">
            <div className="text-[10px] text-text-muted mb-1 font-semibold uppercase tracking-wider">Current Avg Band</div>
            <div className="font-serif font-black text-2xl text-blue-secondary leading-none">{avgBand === "0.0" ? "—" : avgBand}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-h-0 overflow-hidden pt-14 md:pt-0">
        {/* Page Header (Desktop) */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 bg-bg-1 border-b border-border flex-shrink-0">
          <h2 className="font-serif text-xl font-bold text-text-primary capitalize">
            {allNavItems.find(i => i.id === activePage)?.label || activePage}
          </h2>
          <div className="flex items-center gap-3">
            <div className="bg-bg-2 border border-border rounded-full px-4 py-1.5 text-sm font-bold text-amber-accent flex items-center gap-1.5 shadow-sm">
              <Flame size={16} /> {progress?.streak || 0}d
            </div>
            <div className="bg-blue-dim border border-border-2 rounded-full px-4 py-1.5 text-sm font-bold text-blue-secondary shadow-sm">
              Band {avgBand === "0.0" ? "—" : avgBand}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-gradient-to-b from-bg to-bg-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          {/* Bottom Padding for Mobile Nav */}
          <div className="h-20 md:hidden" />
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass-nav flex items-center justify-around px-2 z-50 pb-4 border-t border-white/5">
          {navCategories[0].items.concat(navCategories[1].items.slice(0, 1)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl transition-all duration-300",
                activePage === item.id ? "bg-blue-primary/10 text-blue-secondary shadow-inner" : "text-text-muted"
              )}
            >
              <item.icon 
                size={22} 
                className={cn(
                  "transition-all duration-300",
                  activePage === item.id ? "text-blue-secondary scale-110" : "text-text-muted"
                )} 
              />
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                activePage === item.id ? "text-blue-secondary" : "text-text-muted"
              )}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          ))}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl transition-all duration-300",
              isDrawerOpen ? "bg-blue-primary/10 text-blue-secondary" : "text-text-muted"
            )}
          >
            <Menu size={22} />
            <span className="text-[9px] font-black uppercase tracking-widest">More</span>
          </button>
        </nav>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {isDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-bg-1 border-t border-white/10 rounded-t-[2.5rem] z-[110] flex flex-col max-h-[85vh] md:hidden shadow-2xl"
              >
                <div className="p-4 flex flex-col items-center">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mb-6" />
                  <div className="w-full flex items-center justify-between mb-6 px-2">
                    <div className="text-sm font-black text-text-primary uppercase tracking-widest">All Modules</div>
                    <button 
                      onClick={() => setIsDrawerOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-text-primary"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="w-full overflow-y-auto custom-scrollbar pb-12">
                    <div className="grid grid-cols-3 gap-3 px-2">
                      {allNavItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActivePage(item.id);
                            setIsDrawerOpen(false);
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center gap-3 p-4 rounded-3xl transition-all duration-300 border",
                            activePage === item.id 
                              ? "bg-blue-primary/10 border-blue-primary/30 text-blue-secondary shadow-lg shadow-blue-primary/5" 
                              : "bg-white/5 border-transparent active:bg-white/10 text-text-muted"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300",
                            activePage === item.id ? "bg-blue-primary text-white scale-110" : "bg-bg-2 text-text-muted"
                          )}>
                            <item.icon size={24} />
                          </div>
                          <span className={cn(
                            "text-[10px] font-black text-center leading-tight uppercase tracking-widest",
                            activePage === item.id ? "text-blue-secondary" : "text-text-muted"
                          )}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a2f52;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #243d66;
        }
      `}</style>
    </div>
  );
}
