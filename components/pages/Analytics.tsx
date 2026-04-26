"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart2, 
  TrendingUp, 
  Target, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Trophy,
  Sparkles,
  LineChart as LineChartIcon
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { UserProgress, getProgress } from "@/lib/store";
import { cn, getBandColor } from "@/lib/utils";

export default function Analytics() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  if (!progress) return null;

  const avgBand = (progress && progress.bands) ? Object.values(progress.bands).filter(v => v > 0).reduce((a, b, _, arr) => a + b / arr.length, 0).toFixed(1) : "0.0";
  const quizAvg = (progress.quizHistory && progress.quizHistory.length > 0) 
    ? Math.round(progress.quizHistory.reduce((a, b) => a + b.score, 0) / progress.quizHistory.length) 
    : null;

  const skills = [
    { key: "reading", label: "Reading", color: "#0d7af6", icon: "📖" },
    { key: "writing", label: "Writing", color: "#3b82f6", icon: "✍️" },
    { key: "speaking", label: "Speaking", color: "#0d7af6", icon: "🎤" },
    { key: "listening", label: "Listening", color: "#009966", icon: "🎧" },
  ];

  // Radar Data
  const radarData = skills.map(s => ({
    subject: s.label,
    A: (progress.bands?.[s.key as keyof typeof progress.bands] || 0),
    fullMark: 9,
  }));

  // Prepare chart data
  const chartData = (progress.bandHistory || []).slice(-10).map(h => ({
    date: h.date,
    band: h.band,
    skill: h.skill
  }));

  // Prepare study time data
  const studyTimeData = Object.entries(progress.studyLog || {}).slice(-7).map(([date, mins]) => ({
    date,
    mins
  }));

  return (
    <motion.div 
      className="space-y-8 pb-20"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* Analytics Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <BarChart2 size={200} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
            <TrendingUp size={14} className="animate-pulse" /> Performance Insights
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              ESTIMATED BAND: {avgBand}
            </h3>
            <p className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
              Your current performance across all modules indicates a strong Band {avgBand} capability. Keep practicing to reach your target!
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Target Band</span>
                <span className="text-xl font-black">{progress.target || "9.0"}</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Gap</span>
                <span className="text-xl font-black text-blue-primary">
                  {Math.max(0, (progress.target || 9.0) - parseFloat(avgBand)).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Band Score Hero */}
      <motion.div 
        className="card-blue p-8 md:p-12 relative overflow-hidden"
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          <div className="text-center md:text-left space-y-4">
            <div className="text-[10px] text-blue-secondary font-black uppercase tracking-[0.2em]">Overall Predicted Band</div>
            <motion.div 
              className="font-serif text-8xl md:text-9xl font-black text-blue-secondary leading-none tracking-tighter drop-shadow-2xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {avgBand === "0.0" ? "—" : avgBand}
            </motion.div>
            <div className="text-xs text-text-muted font-bold uppercase tracking-widest">Target Band: <span className="text-text-primary">{progress.target}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <motion.div 
              className="text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 min-w-[120px] shadow-xl"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="text-3xl font-black text-green-accent">{progress.studyDays.length}</div>
              <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-2">Study Days</div>
            </motion.div>
            <motion.div 
              className="text-center bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 min-w-[120px] shadow-xl"
              whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <div className="text-3xl font-black text-violet-accent">{progress.courseXP || 0}</div>
              <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-2">Total XP</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Band History Chart */}
        <motion.div 
          className="card"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-bold uppercase tracking-widest text-text-muted">Band Score History</div>
            <div className="text-[10px] font-bold text-blue-secondary uppercase tracking-widest flex items-center gap-1">
              <LineChartIcon size={12} /> Last 10 Tests
            </div>
          </div>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d7af6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d7af6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 9]}
                  ticks={[0, 2, 4, 6, 8, 9]}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(7, 20, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#0d7af6', fontWeight: 'bold' }}
                  cursor={{ stroke: '#0d7af6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="band" 
                  stroke="#0d7af6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBand)" 
                  animationDuration={2000}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0d7af6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Study Time Chart */}
        <motion.div 
          className="card"
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-bold uppercase tracking-widest text-text-muted">Study Time (Mins)</div>
            <div className="text-[10px] font-bold text-green-accent uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} /> Last 7 Days
            </div>
          </div>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyTimeData}>
                <defs>
                  <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009966" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#009966" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val.split('-').slice(2).join('/')}
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(7, 20, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                  itemStyle={{ color: '#009966', fontWeight: 'bold' }}
                  cursor={{ stroke: '#009966', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="mins" 
                  stroke="#009966" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorMins)" 
                  animationDuration={2000}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#009966' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.div 
          className="card flex flex-col items-center justify-center text-center p-6"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -5 }}
        >
          <div className="p-2 rounded-xl bg-blue-dim text-blue-secondary mb-2"><TrendingUp size={20} /></div>
          <div className="font-serif text-2xl font-black text-text-primary">{quizAvg !== null ? `${quizAvg}%` : "—"}</div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Quiz Avg</div>
        </motion.div>
        <motion.div 
          className="card flex flex-col items-center justify-center text-center p-6"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -5 }}
        >
          <div className="p-2 rounded-xl bg-violet-accent/10 text-violet-accent mb-2"><FileTextIcon size={20} /></div>
          <div className="font-serif text-2xl font-black text-text-primary">{(progress.mockHistory || []).length}</div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Mock Tests</div>
        </motion.div>
        <motion.div 
          className="card flex flex-col items-center justify-center text-center p-6"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -5 }}
        >
          <div className="p-2 rounded-xl bg-green-accent/10 text-green-accent mb-2"><CheckCircle2 size={20} /></div>
          <div className="font-serif text-2xl font-black text-text-primary">{(progress.completedLessons || []).length}</div>
          <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Lessons</div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div 
          className="card overflow-hidden"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 }
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-bold uppercase tracking-widest text-text-muted">Proficiency Radar</div>
            <div className="text-[10px] font-bold text-amber-accent uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} /> Skill Balance
            </div>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 9]} 
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Current Band"
                  dataKey="A"
                  stroke="#0d7af6"
                  strokeWidth={3}
                  fill="#0d7af6"
                  fillOpacity={0.2}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(7, 20, 39, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', backdropFilter: 'blur(10px)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-bg-2 rounded-2xl text-[10px] text-text-muted font-medium text-center">
            A balanced radar indicates consistent performance across all modules. Focus on the indented areas.
          </div>
        </motion.div>

        {/* Skill Bands */}
        <motion.div 
          className="card"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
        <div className="font-bold text-sm uppercase tracking-widest text-text-muted mb-6">Skill Breakdown</div>
        <div className="space-y-6">
          {skills.map((s) => {
            const val = (progress && progress.bands) ? (progress.bands[s.key as keyof typeof progress.bands] || 0) : 0;
            const pct = (val / 9) * 100;
            const gap = val > 0 ? Math.max(0, progress.target - val) : null;
            return (
              <div key={s.key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold flex items-center gap-2">{s.icon} {s.label}</span>
                  <div className="flex items-center gap-3">
                    {gap !== null && gap > 0 && <span className="text-[10px] text-text-muted font-bold">gap: +{gap.toFixed(1)}</span>}
                    <span className="text-sm font-black" style={{ color: s.color }}>{val || "Not tested"}</span>
                  </div>
                </div>
                <div className="h-2 bg-bg-3 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <motion.div 
                    className="absolute top-0 h-full w-0.5 bg-amber-accent/50 z-10" 
                    style={{ left: `${(progress.target / 9) * 100}%` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div 
        className="card bg-gradient-to-br from-blue-dim/30 to-bg-1 border-blue-dim/50"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
      >
        <div className="flex items-center gap-2 text-blue-secondary font-bold text-xs uppercase tracking-widest mb-6">
          <Trophy size={14} /> Personal Recommendations
        </div>
        <div className="space-y-4">
          {[
            { text: `🎯 Focus on Writing — it&apos;s your biggest gap (+${(progress.target - (progress.bands?.writing || 0)).toFixed(1)}).`, show: (progress.bands?.writing || 0) < progress.target },
            { text: "✏️ Start the Daily Quiz — 20 questions a day is the fastest way to build knowledge.", show: (progress.quizHistory || []).length === 0 },
            { text: "📝 Take a full Mock Test this week to get fresh AI feedback.", show: (progress.mockHistory || []).length < 3 },
          ].filter(r => r.show).map((rec, i) => (
            <motion.div 
              key={i} 
              className="flex items-start gap-3 p-3 bg-bg-2/50 rounded-xl border border-border/50"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + (i * 0.1) }}
              whileHover={{ x: 5 }}
            >
              <ChevronRight size={14} className="text-blue-secondary mt-0.5 flex-shrink-0" />
              <span className="text-xs text-text-secondary leading-relaxed">{rec.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FileTextIcon({ size, className }: { size: number, className?: string }) {
  return <BarChart2 size={size} className={className} />;
}
