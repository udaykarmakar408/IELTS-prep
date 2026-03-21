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
  Star
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

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tutor", label: "AI Tutor", icon: Bot },
    { id: "course", label: "Course", icon: GraduationCap },
    { id: "tests", label: "Mock Tests", icon: FileText },
    { id: "cambridge", label: "Cambridge", icon: Book },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "lizhub", label: "Liz Hub", icon: Star },
    { id: "quiz", label: "Daily Quiz", icon: PenTool },
    { id: "roadmap", label: "Roadmap", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "listening", label: "Listening", icon: Headphones },
    { id: "reading", label: "Reading", icon: BookOpen },
    { id: "writing", label: "Writing", icon: PenTool },
    { id: "vocab", label: "Vocabulary", icon: Type },
    { id: "grammar", label: "Grammar", icon: Book },
    { id: "speaking-lab", label: "Speaking Lab", icon: Mic },
    { id: "drills", label: "Drills", icon: Target },
    { id: "speaking", label: "Speaking", icon: Mic },
    { id: "timer", label: "Study Timer", icon: Timer },
    { id: "errorlog", label: "Error Log", icon: ClipboardList },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const avgBand = (progress && progress.bands) ? Object.values(progress.bands).filter(v => v > 0).reduce((a, b, _, arr) => a + b / arr.length, 0).toFixed(1) : "—";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass-nav border-b border-white/5 flex items-center px-4 gap-3 z-50">
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

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 text-left group relative overflow-hidden",
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
                size={20} 
                className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  activePage === item.id ? "text-blue-secondary" : "text-text-muted group-hover:text-blue-secondary"
                )} 
              />
              <span className={cn(
                "text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                activePage === item.id ? "text-blue-secondary" : "text-text-muted group-hover:text-text-primary"
              )}>
                {item.label}
              </span>
            </button>
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
            {navItems.find(i => i.id === activePage)?.label || activePage}
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 glass-nav flex items-center justify-around px-2 z-50 pb-4">
          {navItems.slice(0, 5).map((item) => (
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
            className="flex flex-col items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-text-muted active:bg-white/5"
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 bg-bg-1 border-t border-border-2 rounded-t-3xl z-[70] p-4 pb-8 md:hidden"
              >
                <div className="w-12 h-1.5 bg-border-2 rounded-full mx-auto mb-6" />
                <div className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4 px-2">All Modules</div>
                <div className="grid grid-cols-4 gap-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setIsDrawerOpen(false);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-colors",
                        activePage === item.id ? "bg-blue-dim" : "bg-transparent active:bg-bg-3"
                      )}
                    >
                      <item.icon 
                        size={24} 
                        className={activePage === item.id ? "text-blue-secondary" : "text-text-muted"} 
                      />
                      <span className={cn(
                        "text-[10px] font-bold text-center leading-tight",
                        activePage === item.id ? "text-blue-secondary" : "text-text-muted"
                      )}>
                        {item.label}
                      </span>
                    </button>
                  ))}
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
