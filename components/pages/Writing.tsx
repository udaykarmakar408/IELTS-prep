"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  PenTool, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Trophy,
  MessageSquare
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callGemini } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import { ChartDisplay } from "@/components/ChartDisplay";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const WRITING_TASKS = [
  {
    id: "t1-1",
    type: "Task 1",
    title: "Academic Writing: Consumer Durables",
    difficulty: "Medium",
    mins: 20,
    prompt: "The chart below shows the percentage of households in a particular country that owned various consumer durables between 1972 and 1983. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartType: "line",
    chartData: [
      { year: '1972', 'Washing Machine': 65, 'Refrigerator': 70, 'TV': 90, 'Vacuum Cleaner': 85 },
      { year: '1975', 'Washing Machine': 70, 'Refrigerator': 80, 'TV': 95, 'Vacuum Cleaner': 88 },
      { year: '1978', 'Washing Machine': 75, 'Refrigerator': 90, 'TV': 98, 'Vacuum Cleaner': 92 },
      { year: '1981', 'Washing Machine': 80, 'Refrigerator': 95, 'TV': 99, 'Vacuum Cleaner': 95 },
      { year: '1983', 'Washing Machine': 82, 'Refrigerator': 98, 'TV': 100, 'Vacuum Cleaner': 98 },
    ],
    wordCount: 150
  },
  {
    id: "t2-1",
    type: "Task 2",
    title: "Academic Writing: Essay on Technology",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people believe that the rapid development of technology has made our lives more complicated and stressful. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
    wordCount: 250
  },
  {
    id: "t1-2",
    type: "Task 1",
    title: "Academic Writing: Global Water Consumption",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the amount of water used for different purposes in six areas of the world. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartType: "bar",
    chartData: [
      { area: 'Africa', Industrial: 7, Agricultural: 84, Domestic: 9 },
      { area: 'Central Asia', Industrial: 5, Agricultural: 88, Domestic: 7 },
      { area: 'South East Asia', Industrial: 12, Agricultural: 81, Domestic: 7 },
      { area: 'Europe', Industrial: 53, Agricultural: 32, Domestic: 15 },
      { area: 'North America', Industrial: 48, Agricultural: 39, Domestic: 13 },
      { area: 'South America', Industrial: 10, Agricultural: 71, Domestic: 19 },
    ],
    wordCount: 150
  },
  {
    id: "t2-2",
    type: "Task 2",
    title: "Academic Writing: Education and Employment",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. Discuss both these views and give your own opinion.",
    wordCount: 250
  },
  {
    id: "t1-3",
    type: "Task 1",
    title: "Academic Writing: Energy Production",
    difficulty: "Medium",
    mins: 20,
    prompt: "The pie charts show the sources of energy production in a particular country in 1995 and 2005. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    chartType: "pie",
    chartData: [
      { name: 'Coal', value: 29.8 },
      { name: 'Gas', value: 29.6 },
      { name: 'Petro', value: 29.2 },
      { name: 'Nuclear', value: 6.4 },
      { name: 'Other', value: 5.0 },
    ],
    wordCount: 150
  },
  {
    id: "t2-3",
    type: "Task 2",
    title: "Academic Writing: Environmental Protection",
    difficulty: "Hard",
    mins: 40,
    prompt: "The best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?",
    wordCount: 250
  },
  {
    id: "t1-4",
    type: "Task 1",
    title: "Academic Writing: Population Growth",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the population of three different countries from 1950 to 2050 (projected).",
    chartType: "line",
    chartData: [
      { year: '1950', CountryA: 50, CountryB: 30, CountryC: 10 },
      { year: '1975', CountryA: 70, CountryB: 45, CountryC: 25 },
      { year: '2000', CountryA: 90, CountryB: 65, CountryC: 50 },
      { year: '2025', CountryA: 110, CountryB: 80, CountryC: 80 },
      { year: '2050', CountryA: 130, CountryB: 90, CountryC: 120 },
    ],
    wordCount: 150
  },
  {
    id: "t2-4",
    type: "Task 2",
    title: "Academic Writing: Health and Lifestyle",
    difficulty: "Hard",
    mins: 40,
    prompt: "In many countries, people are moving away from traditional foods and towards fast food. This has a negative impact on families, individuals and society. To what extent do you agree or disagree?",
    wordCount: 250
  },
  {
    id: "t1-5",
    type: "Task 1",
    title: "Academic Writing: Leisure Activities",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the percentage of boys and girls who participated in different sports in a UK school in 2010.",
    chartType: "bar",
    chartData: [
      { sport: 'Football', Boys: 80, Girls: 20 },
      { sport: 'Swimming', Boys: 45, Girls: 55 },
      { sport: 'Tennis', Boys: 30, Girls: 40 },
      { sport: 'Basketball', Boys: 60, Girls: 30 },
      { sport: 'Cycling', Boys: 50, Girls: 45 },
    ],
    wordCount: 150
  },
  {
    id: "t2-5",
    type: "Task 2",
    title: "Academic Writing: Work-Life Balance",
    difficulty: "Hard",
    mins: 40,
    prompt: "In some countries, a few people earn extremely high salaries. Some people think that this is good for a country, while others believe that the government should control salaries and limit the amount people can earn. Discuss both views and give your opinion.",
    wordCount: 250
  },
  {
    id: "t1-6",
    type: "Task 1",
    title: "Academic Writing: Internet Users",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the percentage of the population using the Internet in three countries from 1999 to 2009.",
    chartType: "line",
    chartData: [
      { year: '1999', USA: 40, Canada: 35, Mexico: 5 },
      { year: '2002', USA: 55, Canada: 50, Mexico: 12 },
      { year: '2005', USA: 75, Canada: 70, Mexico: 25 },
      { year: '2008', USA: 85, Canada: 82, Mexico: 35 },
      { year: '2009', USA: 88, Canada: 85, Mexico: 40 },
    ],
    wordCount: 150
  },
  {
    id: "t2-6",
    type: "Task 2",
    title: "Academic Writing: Travel and Culture",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people think that it is necessary to travel to other countries to learn about different cultures. Others say that we can learn about other cultures through books, films and the Internet. Discuss both views and give your opinion.",
    wordCount: 250
  },
  {
    id: "t1-7",
    type: "Task 1",
    title: "Academic Writing: Export Earnings",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the export earnings of a country across five categories in 2015 and 2016.",
    chartType: "bar",
    chartData: [
      { category: 'Petroleum', '2015': 60, '2016': 63 },
      { category: 'Engineered Goods', '2015': 55, '2016': 58 },
      { category: 'Gems & Jewelry', '2015': 42, '2016': 40 },
      { category: 'Agricultural Products', '2015': 30, '2016': 32 },
      { category: 'Textiles', '2015': 25, '2016': 31 },
    ],
    wordCount: 150
  },
  {
    id: "t2-7",
    type: "Task 2",
    title: "Academic Writing: Crime and Punishment",
    difficulty: "Hard",
    mins: 40,
    prompt: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better ways to help reduce crime. Discuss both views and give your opinion.",
    wordCount: 250
  },
  {
    id: "t1-8",
    type: "Task 1",
    title: "Academic Writing: Library Visitors",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the number of visitors to a local library over a period of 6 months.",
    chartType: "line",
    chartData: [
      { month: 'Jan', Visitors: 1200 },
      { month: 'Feb', Visitors: 1500 },
      { month: 'Mar', Visitors: 1100 },
      { month: 'Apr', Visitors: 1800 },
      { month: 'May', Visitors: 2100 },
      { month: 'Jun', Visitors: 1900 },
    ],
    wordCount: 150
  },
  {
    id: "t2-8",
    type: "Task 2",
    title: "Academic Writing: Urbanization",
    difficulty: "Hard",
    mins: 40,
    prompt: "In many cities, there is a shortage of housing and a lack of space for new buildings. Some people think that the government should build new towns in the countryside. To what extent do you agree or disagree?",
    wordCount: 250
  },
  {
    id: "t1-9",
    type: "Task 1",
    title: "Academic Writing: Student Enrollment",
    difficulty: "Medium",
    mins: 20,
    prompt: "The pie chart shows the distribution of international students in a university by continent of origin.",
    chartType: "pie",
    chartData: [
      { name: 'Asia', value: 45 },
      { name: 'Europe', value: 25 },
      { name: 'Africa', value: 15 },
      { name: 'Americas', value: 10 },
      { name: 'Oceania', value: 5 },
    ],
    wordCount: 150
  },
  {
    id: "t2-9",
    type: "Task 2",
    title: "Academic Writing: Social Media",
    difficulty: "Hard",
    mins: 40,
    prompt: "Social media has a significant impact on the way people communicate and build relationships. Is this a positive or negative development?",
    wordCount: 250
  },
  {
    id: "t1-10",
    type: "Task 1",
    title: "Academic Writing: Average Monthly Temperatures",
    difficulty: "Medium",
    mins: 20,
    prompt: "The line graph shows the average monthly temperatures in two cities, London and Dubai, over a year.",
    chartType: "line",
    chartData: [
      { month: 'Jan', London: 5, Dubai: 18 },
      { month: 'Mar', London: 8, Dubai: 23 },
      { month: 'May', London: 14, Dubai: 30 },
      { month: 'Jul', London: 19, Dubai: 35 },
      { month: 'Sep', London: 15, Dubai: 32 },
      { month: 'Nov', London: 9, Dubai: 24 },
    ],
    wordCount: 150
  },
  {
    id: "t2-10",
    type: "Task 2",
    title: "Academic Writing: Global Warming",
    difficulty: "Hard",
    mins: 40,
    prompt: "Global warming is one of the most serious issues the world is facing today. What are the causes of global warming and what measures can governments and individuals take to address it?",
    wordCount: 250
  },
  {
    id: "t1-11",
    type: "Task 1",
    title: "Academic Writing: Coffee Consumption",
    difficulty: "Medium",
    mins: 20,
    prompt: "The bar chart shows the average amount of coffee consumed per person in five different countries in 2020.",
    chartType: "bar",
    chartData: [
      { country: 'Finland', kg: 12 },
      { country: 'Norway', kg: 9.9 },
      { country: 'Iceland', kg: 9 },
      { country: 'Denmark', kg: 8.7 },
      { country: 'Netherlands', kg: 8.4 },
    ],
    wordCount: 150
  },
  {
    id: "t2-11",
    type: "Task 2",
    title: "Academic Writing: Remote Work",
    difficulty: "Hard",
    mins: 40,
    prompt: "More and more people are working from home. What are the advantages and disadvantages of this trend?",
    wordCount: 250
  },
  {
    id: "t1-12",
    type: "Task 1",
    title: "Academic Writing: Rail Travel Statistics",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table below shows the number of rail passengers in four countries in 2014 and 2015.",
    chartType: "table",
    chartData: [
      { Country: 'UK', '2014 (Millions)': 1650, '2015 (Millions)': 1710 },
      { Country: 'France', '2014 (Millions)': 1200, '2015 (Millions)': 1250 },
      { Country: 'Germany', '2014 (Millions)': 2100, '2015 (Millions)': 2180 },
      { Country: 'Italy', '2014 (Millions)': 850, '2015 (Millions)': 890 },
    ],
    wordCount: 150
  },
  {
    id: "t1-13",
    type: "Task 1",
    title: "Academic Writing: Brick Manufacturing Process",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the process of brick manufacturing for the building industry.",
    chartType: "diagram",
    chartData: [
      { label: "1. Digging Clay" },
      { label: "2. Crushing & Mixing" },
      { label: "3. Shaping Bricks" },
      { label: "4. Drying in Kiln" },
      { label: "5. Cooling" },
      { label: "6. Packaging & Delivery" },
    ],
    wordCount: 150
  },
  {
    id: "t1-14",
    type: "Task 1",
    title: "Academic Writing: World Population Distribution",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the distribution of the world population by region in 1900 and 2000.",
    chartType: "table",
    chartData: [
      { Region: 'Asia', '1900 (%)': 57, '2000 (%)': 60 },
      { Region: 'Europe', '1900 (%)': 25, '2000 (%)': 12 },
      { Region: 'Africa', '1900 (%)': 8, '2000 (%)': 13 },
      { Region: 'Americas', '1900 (%)': 9, '2000 (%)': 14 },
      { Region: 'Oceania', '1900 (%)': 1, '2000 (%)': 1 },
    ],
    wordCount: 150
  },
  {
    id: "t1-15",
    type: "Task 1",
    title: "Academic Writing: Water Cycle",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the natural water cycle.",
    chartType: "diagram",
    chartData: [
      { label: "1. Evaporation" },
      { label: "2. Condensation" },
      { label: "3. Precipitation" },
      { label: "4. Collection" },
      { label: "5. Infiltration" },
    ],
    wordCount: 150
  },
  {
    id: "t1-16",
    type: "Task 1",
    title: "Academic Writing: Average House Prices",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the average house prices in five cities in 2010 and 2015.",
    chartType: "table",
    chartData: [
      { City: 'London', '2010 ($)': 450000, '2015 ($)': 580000 },
      { City: 'New York', '2010 ($)': 520000, '2015 ($)': 610000 },
      { City: 'Tokyo', '2010 ($)': 480000, '2015 ($)': 490000 },
      { City: 'Sydney', '2010 ($)': 410000, '2015 ($)': 550000 },
      { City: 'Paris', '2010 ($)': 390000, '2015 ($)': 420000 },
    ],
    wordCount: 150
  },
  {
    id: "t1-17",
    type: "Task 1",
    title: "Academic Writing: Recycling Process",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the process of recycling glass bottles.",
    chartType: "diagram",
    chartData: [
      { label: "1. Collection" },
      { label: "2. Sorting" },
      { label: "3. Cleaning" },
      { label: "4. Crushing" },
      { label: "5. Melting" },
      { label: "6. Molding" },
    ],
    wordCount: 150
  },
  {
    id: "t1-18",
    type: "Task 1",
    title: "Academic Writing: Mobile Phone Sales",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the number of mobile phones sold by four major brands in 2018 and 2019.",
    chartType: "table",
    chartData: [
      { Brand: 'Samsung', '2018 (M)': 290, '2019 (M)': 300 },
      { Brand: 'Apple', '2018 (M)': 210, '2019 (M)': 195 },
      { Brand: 'Huawei', '2018 (M)': 200, '2019 (M)': 240 },
      { Brand: 'Xiaomi', '2018 (M)': 120, '2019 (M)': 125 },
    ],
    wordCount: 150
  },
  {
    id: "t1-19",
    type: "Task 1",
    title: "Academic Writing: Paper Production",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows how paper is produced from wood.",
    chartType: "diagram",
    chartData: [
      { label: "1. Logging" },
      { label: "2. Debarking" },
      { label: "3. Chipping" },
      { label: "4. Pulping" },
      { label: "5. Bleaching" },
      { label: "6. Pressing" },
      { label: "7. Rolling" },
    ],
    wordCount: 150
  },
  {
    id: "t1-20",
    type: "Task 1",
    title: "Academic Writing: Global Literacy Rates",
    difficulty: "Medium",
    mins: 20,
    prompt: "The table shows the literacy rates in different regions of the world in 2000 and 2015.",
    chartType: "table",
    chartData: [
      { Region: 'World', '2000 (%)': 81, '2015 (%)': 86 },
      { Region: 'Sub-Saharan Africa', '2000 (%)': 57, '2015 (%)': 64 },
      { Region: 'South Asia', '2000 (%)': 59, '2015 (%)': 70 },
      { Region: 'Latin America', '2000 (%)': 90, '2015 (%)': 93 },
      { Region: 'East Asia', '2000 (%)': 92, '2015 (%)': 96 },
    ],
    wordCount: 150
  },
  {
    id: "t1-21",
    type: "Task 1",
    title: "Academic Writing: Solar Power Installation",
    difficulty: "Medium",
    mins: 20,
    prompt: "The diagram shows the steps involved in installing solar panels on a house roof.",
    chartType: "diagram",
    chartData: [
      { label: "1. Site Assessment" },
      { label: "2. Mounting Brackets" },
      { label: "3. Installing Panels" },
      { label: "4. Wiring" },
      { label: "5. Connecting to Inverter" },
      { label: "6. Grid Connection" },
    ],
    wordCount: 150
  }
];

export default function Writing() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [userText, setUserText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTask && timeLeft > 0 && !feedback) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTask, timeLeft, feedback]);

  const startTask = (task: any) => {
    setActiveTask(task);
    setUserText("");
    setFeedback(null);
    setTimeLeft(task.mins * 60);
  };

  const handleAnalyze = async () => {
    if (userText.trim().length < 50) return;
    setIsAnalyzing(true);
    
    const systemPrompt = `You are an IELTS Writing examiner. Analyze the student's response for a ${activeTask.type} task.
    Prompt: ${activeTask.prompt}
    Provide a detailed feedback including:
    1. Estimated Band Score (0-9)
    2. Task Achievement/Response
    3. Coherence and Cohesion
    4. Lexical Resource
    5. Grammatical Range and Accuracy
    6. Specific suggestions for improvement.
    Use markdown for formatting. Keep it professional and constructive.`;

    try {
      const result = await callGemini(userText, systemPrompt);
      setFeedback(result);
      
      if (progress) {
        const updated = { 
          ...progress, 
          studyMinutes: (progress.studyMinutes || 0) + activeTask.mins,
          courseXP: progress.courseXP + 100
        };
        saveProgress(updated);
        setProgress(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!progress) return null;

  if (activeTask) {
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveTask(null)} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className={cn(
            "flex items-center gap-2 font-mono text-sm",
            timeLeft < 300 ? "text-red-accent animate-pulse" : "text-blue-secondary"
          )}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
          <div className="space-y-4 flex flex-col h-[30vh] lg:h-full">
            <div className="card bg-bg-2 border-border-2 flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="tag tag-blue">{activeTask.type}</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Min. {activeTask.wordCount} Words</span>
              </div>
              <h3 className="font-serif font-bold text-lg mb-4">{activeTask.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 italic">
                {activeTask.prompt}
              </p>
              {activeTask.chartData && (
                <div className="mb-4">
                  <ChartDisplay type={activeTask.chartType} data={activeTask.chartData} />
                </div>
              )}
              {activeTask.image && !activeTask.chartData && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border-2 mb-4">
                  <Image 
                    src={activeTask.image} 
                    alt="Writing Task Chart" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 flex flex-col h-[50vh] lg:h-full">
            <div className="card border-border-2 p-0 overflow-hidden flex flex-col flex-1">
              <div className="bg-bg-3 px-4 py-2 border-b border-border-2 flex items-center justify-between shrink-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Writing Area</div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  wordCount < activeTask.wordCount ? "text-amber-accent" : "text-green-accent"
                )}>
                  {wordCount} Words
                </div>
              </div>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Start writing your response here..."
                disabled={isAnalyzing || !!feedback}
                className="w-full flex-1 bg-bg-1 p-6 text-sm outline-none resize-none leading-relaxed custom-scrollbar"
              />
            </div>

            {!feedback ? (
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || userText.trim().length < 50}
                className="btn btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isAnalyzing ? "AI Examiner is checking..." : "Get AI Feedback"}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="card bg-blue-dim/10 border-blue-primary/20">
                  <div className="flex items-center gap-2 text-blue-secondary font-bold text-[10px] uppercase tracking-widest mb-4">
                    <MessageSquare size={14} /> AI Examiner Feedback
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none markdown-body h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </div>
                </div>
                <button onClick={() => setActiveTask(null)} className="btn btn-ghost w-full">Try Another Task</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-1">✍️ Writing Lab</h2>
          <p className="text-sm text-text-muted">Practice Task 1 & 2 with instant AI band score and analysis</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-primary/10 text-blue-primary flex items-center justify-center">
          <PenTool size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WRITING_TASKS.map((task) => (
          <button
            key={task.id}
            onClick={() => startTask(task)}
            className="card w-full text-left hover:border-blue-primary group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                "tag",
                task.type === "Task 1" ? "tag-blue" : "tag-purple"
              )}>{task.type}</span>
              <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                <Clock size={10} /> {task.mins} Mins
              </span>
            </div>
            <h3 className="font-bold text-text-primary mb-2 group-hover:text-blue-primary transition-colors">{task.title}</h3>
            <p className="text-xs text-text-muted line-clamp-2 mb-4">
              {task.prompt}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{task.wordCount}+ Words</span>
              <ChevronRight size={16} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
