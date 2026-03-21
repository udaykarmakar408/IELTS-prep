"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Dashboard from "@/components/pages/Dashboard";
import Tutor from "@/components/pages/Tutor";
import Course from "@/components/pages/Course";
import MockTests from "@/components/pages/MockTests";
import Resources from "@/components/pages/Resources";
import DailyQuiz from "@/components/pages/DailyQuiz";
import Roadmap from "@/components/pages/Roadmap";
import Analytics from "@/components/pages/Analytics";
import Listening from "@/components/pages/Listening";
import Reading from "@/components/pages/Reading";
import Writing from "@/components/pages/Writing";
import Vocabulary from "@/components/pages/Vocabulary";
import Grammar from "@/components/pages/Grammar";
import Speaking from "@/components/pages/Speaking";
import Drills from "@/components/pages/Drills";
import StudyTimer from "@/components/pages/StudyTimer";
import ErrorLog from "@/components/pages/ErrorLog";
import Settings from "@/components/pages/Settings";
import Setup from "@/components/pages/Setup";
import LizHub from "@/components/pages/LizHub";
import Cambridge from "@/components/pages/Cambridge";
import { getProgress, UserProgress } from "@/lib/store";

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
      setIsInitialized(true);
    };
    load();
  }, []);

  if (!isInitialized) return null;

  // If user hasn't set their name, show setup
  if (progress?.name === "Learner" && progress.studyDays.length === 0) {
    return <Setup onComplete={async () => setProgress(await getProgress())} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard setActivePage={setActivePage} />;
      case "tutor": return <Tutor />;
      case "course": return <Course />;
      case "tests": return <MockTests />;
      case "cambridge": return <Cambridge />;
      case "resources": return <Resources setActivePage={setActivePage} />;
      case "lizhub": return <LizHub />;
      case "quiz": return <DailyQuiz />;
      case "roadmap": return <Roadmap />;
      case "analytics": return <Analytics />;
      case "listening": return <Listening />;
      case "reading": return <Reading />;
      case "writing": return <Writing />;
      case "vocab": return <Vocabulary />;
      case "grammar": return <Grammar />;
      case "speaking": return <Speaking />;
      case "drills": return <Drills />;
      case "timer": return <StudyTimer />;
      case "errorlog": return <ErrorLog />;
      case "settings": return <Settings onUpdate={async () => setProgress(await getProgress())} />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <AppShell activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </AppShell>
  );
}
