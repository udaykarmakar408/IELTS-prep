"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Volume2,
  FileText,
  PenTool,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getProgress, saveProgress, UserProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { GoogleGenAI, Modality } from "@google/genai";
import { pcmToWav } from "@/lib/audio";

const LISTENING_SECTIONS = [
  {
    id: "sec1",
    title: "University Accommodation Enquiry",
    type: "Conversation",
    difficulty: "Easy",
    script: "ACCOMMODATION OFFICER: Good morning, Riverside University Student Services, how can I help you? STUDENT: Hello. I am calling about student accommodation for next year. I have just been offered a place on the biology course. OFFICER: Congratulations! Could I take some details? Your full name first, please. STUDENT: David Kamara. That is K-A-M-A-R-A.",
    questions: [
      { q: "Q1. Student surname:", answer: "Kamara" },
      { q: "Q2. Course:", answer: "Biology" },
    ]
  },
  {
    id: "sec2",
    title: "City Museum Audio Tour",
    type: "Monologue",
    difficulty: "Medium",
    script: "Welcome to Hartfield City Museum. I am Sarah and I will be your guide today. The museum has three floors covering over two thousand years of local history. On the ground floor, you will find our collection of Roman artifacts discovered right here in the city center. The first floor is dedicated to the industrial revolution, while the top floor houses our modern art gallery. Please note that the museum cafe on the second floor closes at 4:30 PM, thirty minutes before the museum itself.",
    questions: [
      { q: "Q1. What time does the cafe close?", answer: "4:30" },
      { q: "Q2. Which floor has Roman artifacts?", answer: "Ground" },
    ]
  },
  {
    id: "sec3",
    title: "Environmental Science Lecture",
    type: "Lecture",
    difficulty: "Hard",
    script: "Today we are discussing the impact of microplastics on marine ecosystems. Microplastics, defined as plastic particles smaller than five millimeters, have become a ubiquitous pollutant in our oceans. They originate from various sources, including the breakdown of larger plastic debris and the release of microbeads from personal care products. These tiny particles are often ingested by marine organisms, ranging from tiny zooplankton to large whales, leading to physical harm and the bioaccumulation of toxic chemicals throughout the food web.",
    questions: [
      { q: "Q1. Maximum size of microplastics (mm):", answer: "5" },
      { q: "Q2. One source of microplastics mentioned:", answer: "microbeads" },
    ]
  },
  {
    id: "sec4",
    title: "Library Membership Registration",
    type: "Conversation",
    difficulty: "Easy",
    script: "LIBRARIAN: Good afternoon. How can I help you? CUSTOMER: Hi, I'd like to join the library. LIBRARIAN: Certainly. I'll need some information. Your name? CUSTOMER: It's Peter Thompson. LIBRARIAN: And your address? CUSTOMER: 42 Garden Road, London. LIBRARIAN: Great. And do you have a contact number? CUSTOMER: Yes, it's 07700 900456.",
    questions: [
      { q: "Q1. Customer's full name:", answer: "Peter Thompson" },
      { q: "Q2. Street name:", answer: "Garden Road" },
      { q: "Q3. Phone number:", answer: "07700 900456" },
    ]
  },
  {
    id: "sec5",
    title: "Local Park Renovation Project",
    type: "Monologue",
    difficulty: "Medium",
    script: "Hello everyone, I'm here to talk about the upcoming changes to Central Park. We're planning to add a new children's play area near the North Gate. The old tennis courts will be replaced with a modern skate park. We're also planting fifty new oak trees along the main path to provide more shade during the summer months. The project is expected to take six months to complete, starting this September.",
    questions: [
      { q: "Q1. Where will the new play area be?", answer: "North Gate" },
      { q: "Q2. What will replace the tennis courts?", answer: "skate park" },
      { q: "Q3. How many new trees will be planted?", answer: "50" },
    ]
  },
  {
    id: "sec6",
    title: "Artificial Intelligence in Healthcare",
    type: "Lecture",
    difficulty: "Hard",
    script: "In today's lecture, we'll explore the transformative role of AI in modern medicine. AI algorithms are now being used to analyze medical images with a level of precision that often surpasses human experts. For instance, in oncology, AI can detect early-stage tumors in lung scans that might be missed by radiologists. Furthermore, AI-driven predictive analytics are helping hospitals manage patient flow and resource allocation more efficiently, ultimately improving patient outcomes and reducing costs.",
    questions: [
      { q: "Q1. AI is used to analyze what kind of images?", answer: "medical" },
      { q: "Q2. In which field can AI detect early-stage tumors?", answer: "oncology" },
      { q: "Q3. What can AI help hospitals manage?", answer: "patient flow" },
    ]
  },
  {
    id: "sec7",
    title: "Booking a Travel Tour",
    type: "Conversation",
    difficulty: "Easy",
    script: "AGENT: Welcome to SunTravel. How can I assist you today? TRAVELER: Hi, I'm interested in the European Highlights tour. AGENT: Excellent choice. That tour lasts for 14 days. TRAVELER: And what's the price per person? AGENT: It's £1,200, which includes all accommodation and breakfast. TRAVELER: Does it include the flight? AGENT: No, flights are booked separately.",
    questions: [
      { q: "Q1. Duration of the tour (days):", answer: "14" },
      { q: "Q2. Price per person (£):", answer: "1200" },
      { q: "Q3. What is included besides accommodation?", answer: "breakfast" },
    ]
  },
  {
    id: "sec8",
    title: "The History of Chocolate",
    type: "Monologue",
    difficulty: "Medium",
    script: "Chocolate has a long and fascinating history. It was first consumed as a bitter drink by the ancient Mayans and Aztecs. They believed that cacao seeds were a gift from the gods. It wasn't until the 16th century that chocolate was introduced to Europe, where sugar was added to make it more palatable. The first solid chocolate bar was produced in 1847 by Joseph Fry. Today, chocolate is a multi-billion dollar global industry.",
    questions: [
      { q: "Q1. Who first consumed chocolate as a drink?", answer: "Mayans" },
      { q: "Q2. When was chocolate introduced to Europe?", answer: "16th century" },
      { q: "Q3. Who produced the first solid chocolate bar?", answer: "Joseph Fry" },
    ]
  },
  {
    id: "sec9",
    title: "Renewable Energy Sources",
    type: "Lecture",
    difficulty: "Hard",
    script: "Transitioning to renewable energy is crucial for combating climate change. Solar and wind power are currently the fastest-growing sources of clean energy. Solar panels convert sunlight directly into electricity, while wind turbines harness the kinetic energy of the wind. However, one of the main challenges is intermittency—the sun doesn't always shine, and the wind doesn't always blow. This necessitates the development of advanced battery storage technologies to ensure a stable energy supply.",
    questions: [
      { q: "Q1. What are the two fastest-growing clean energy sources?", answer: "solar and wind" },
      { q: "Q2. What is the main challenge mentioned?", answer: "intermittency" },
      { q: "Q3. What technology is needed for a stable supply?", answer: "battery storage" },
    ]
  },
  {
    id: "sec10",
    title: "Job Interview Preparation",
    type: "Conversation",
    difficulty: "Medium",
    script: "COACH: Okay, let's practice some common interview questions. Why do you want to work for this company? CANDIDATE: Well, I've always admired your commitment to innovation and sustainability. COACH: Good. And what are your greatest strengths? CANDIDATE: I'm a strong communicator and I enjoy working in a team. COACH: Excellent. Remember to give specific examples to back up your claims.",
    questions: [
      { q: "Q1. What two values of the company does the candidate admire?", answer: "innovation and sustainability" },
      { q: "Q2. Name one of the candidate's strengths:", answer: "communicator" },
      { q: "Q3. What should the candidate provide to back up their claims?", answer: "examples" },
    ]
  },
  {
    id: "sec11",
    title: "The Benefits of Regular Exercise",
    type: "Monologue",
    difficulty: "Easy",
    script: "Regular exercise is essential for maintaining good health. It helps to strengthen your heart, improve your mood, and boost your energy levels. You don't need to spend hours at the gym; even a thirty-minute brisk walk every day can make a big difference. Exercise also helps you sleep better and reduces the risk of chronic diseases like diabetes and heart disease. Start small and gradually increase the intensity of your workouts.",
    questions: [
      { q: "Q1. Name one benefit of exercise mentioned:", answer: "strengthen heart" },
      { q: "Q2. How long should a daily walk be?", answer: "30 minutes" },
      { q: "Q3. Exercise reduces the risk of which disease?", answer: "diabetes" },
    ]
  },
  {
    id: "sec12",
    title: "Space Exploration: Mars Mission",
    type: "Lecture",
    difficulty: "Hard",
    script: "The prospect of sending humans to Mars is one of the most ambitious goals in space exploration. Mars is often called the Red Planet due to the iron oxide on its surface. A mission to Mars would take approximately seven to nine months each way. Astronauts would face numerous challenges, including exposure to high levels of radiation and the psychological effects of long-term isolation. Scientists are currently developing life-support systems that can recycle water and oxygen to sustain a crew on the Martian surface.",
    questions: [
      { q: "Q1. Why is Mars called the Red Planet?", answer: "iron oxide" },
      { q: "Q2. How long would a one-way trip to Mars take?", answer: "7 to 9 months" },
      { q: "Q3. What are scientists developing to sustain a crew?", answer: "life-support systems" },
    ]
  },
  {
    id: "sec13",
    title: "Enquiring about a Language Course",
    type: "Conversation",
    difficulty: "Easy",
    script: "RECEPTIONIST: Hello, Language Center. How can I help? STUDENT: Hi, I'm interested in the intensive Spanish course. RECEPTIONIST: That course starts on the 5th of July. STUDENT: How many hours a week is it? RECEPTIONIST: It's 20 hours per week, from Monday to Friday. STUDENT: And what's the total cost? RECEPTIONIST: The fee is £450 for the four-week course.",
    questions: [
      { q: "Q1. When does the course start?", answer: "5th of July" },
      { q: "Q2. Hours per week:", answer: "20" },
      { q: "Q3. Total cost (£):", answer: "450" },
    ]
  },
  {
    id: "sec14",
    title: "The Importance of Bees",
    type: "Monologue",
    difficulty: "Medium",
    script: "Bees play a vital role in our ecosystem as pollinators. They are responsible for pollinating about one-third of the food we eat, including many fruits, vegetables, and nuts. Without bees, our food supply would be significantly impacted. Unfortunately, bee populations are declining due to habitat loss, pesticide use, and climate change. We can help by planting bee-friendly flowers in our gardens and avoiding the use of harmful chemicals.",
    questions: [
      { q: "Q1. Bees pollinate what fraction of our food?", answer: "one-third" },
      { q: "Q2. Name one reason for the decline in bee populations:", answer: "habitat loss" },
      { q: "Q3. How can we help bees in our gardens?", answer: "planting flowers" },
    ]
  },
  {
    id: "sec15",
    title: "The Psychology of Consumer Behavior",
    type: "Lecture",
    difficulty: "Hard",
    script: "Understanding consumer behavior is essential for effective marketing. Consumers are often influenced by psychological factors such as perception, motivation, and social influence. For example, the use of 'scarcity' in advertising—like 'limited time offer'—can create a sense of urgency and drive sales. Additionally, social proof, such as customer reviews and testimonials, can significantly impact a consumer's decision-making process. Marketers use these insights to create more persuasive campaigns.",
    questions: [
      { q: "Q1. Name one psychological factor mentioned:", answer: "perception" },
      { q: "Q2. What does 'limited time offer' create?", answer: "urgency" },
      { q: "Q3. What is an example of social proof?", answer: "customer reviews" },
    ]
  },
  {
    id: "sec16",
    title: "Renting a Car",
    type: "Conversation",
    difficulty: "Easy",
    script: "CLERK: Good morning, CarRentals. How can I help? CUSTOMER: Hi, I'd like to rent a car for three days. CLERK: Certainly. What type of car would you like? CUSTOMER: A small economy car would be fine. CLERK: We have a Ford Fiesta available for £35 a day. CUSTOMER: Does that include insurance? CLERK: Yes, basic insurance is included in the price.",
    questions: [
      { q: "Q1. Duration of rental (days):", answer: "3" },
      { q: "Q2. Daily rate (£):", answer: "35" },
      { q: "Q3. What is included in the price?", answer: "insurance" },
    ]
  },
  {
    id: "sec17",
    title: "The Great Barrier Reef",
    type: "Monologue",
    difficulty: "Medium",
    script: "The Great Barrier Reef is the world's largest coral reef system. It is located in the Coral Sea, off the coast of Queensland, Australia. The reef is home to thousands of species of marine life, including colorful corals, fish, turtles, and sharks. It is a UNESCO World Heritage site and a major tourist destination. However, the reef is under threat from coral bleaching, which is caused by rising ocean temperatures due to climate change.",
    questions: [
      { q: "Q1. Where is the Great Barrier Reef located?", answer: "Australia" },
      { q: "Q2. Name one type of marine life mentioned:", answer: "turtles" },
      { q: "Q3. What is the main threat to the reef?", answer: "coral bleaching" },
    ]
  },
  {
    id: "sec18",
    title: "The Future of Transportation",
    type: "Lecture",
    difficulty: "Hard",
    script: "The future of transportation is being shaped by automation and electrification. Self-driving cars have the potential to reduce accidents caused by human error and improve traffic flow. Electric vehicles are becoming more affordable and have a much lower environmental impact than traditional internal combustion engines. We are also seeing the development of high-speed rail and hyperloop systems that could revolutionize long-distance travel, making it faster and more sustainable.",
    questions: [
      { q: "Q1. What can self-driving cars potentially reduce?", answer: "accidents" },
      { q: "Q2. What is a benefit of electric vehicles?", answer: "lower environmental impact" },
      { q: "Q3. Name one new long-distance travel system:", answer: "hyperloop" },
    ]
  },
  {
    id: "sec19",
    title: "Enquiring about a Gym Membership",
    type: "Conversation",
    difficulty: "Easy",
    script: "STAFF: Hi there, welcome to FitLife. CUSTOMER: Hi, I'm interested in joining the gym. STAFF: We have a monthly membership for £40, or an annual one for £400. CUSTOMER: Are there any joining fees? STAFF: Yes, there's a one-off joining fee of £20. CUSTOMER: What are your opening hours? STAFF: We're open from 6 AM to 10 PM every day.",
    questions: [
      { q: "Q1. Monthly membership fee (£):", answer: "40" },
      { q: "Q2. One-off joining fee (£):", answer: "20" },
      { q: "Q3. Opening time:", answer: "6 AM" },
    ]
  },
  {
    id: "sec20",
    title: "The History of the Printing Press",
    type: "Monologue",
    difficulty: "Medium",
    script: "The invention of the printing press by Johannes Gutenberg in the 15th century was a turning point in human history. Before the printing press, books were copied by hand, which was a slow and expensive process. Gutenberg's invention made it possible to produce books quickly and affordably, leading to a massive increase in literacy and the spread of knowledge. The first book printed using the new technology was the Gutenberg Bible.",
    questions: [
      { q: "Q1. Who invented the printing press?", answer: "Johannes Gutenberg" },
      { q: "Q2. What was the first book printed?", answer: "Gutenberg Bible" },
      { q: "Q3. What was a major result of the printing press?", answer: "increase in literacy" },
    ]
  },
  {
    id: "sec21",
    title: "The Impact of Social Media on Mental Health",
    type: "Lecture",
    difficulty: "Hard",
    script: "The widespread use of social media has raised concerns about its impact on mental health, particularly among young people. Studies have shown a correlation between heavy social media use and increased rates of anxiety, depression, and loneliness. Factors such as cyberbullying, the pressure to maintain a perfect online image, and the constant comparison with others can all contribute to these negative outcomes. It is important to promote digital well-being and encourage healthy social media habits.",
    questions: [
      { q: "Q1. Heavy social media use is linked to which condition?", answer: "anxiety" },
      { q: "Q2. Name one factor contributing to negative outcomes:", answer: "cyberbullying" },
      { q: "Q3. What should be promoted to address these issues?", answer: "digital well-being" },
    ]
  }
];

export default function Listening() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeSection, setActiveSection] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = async () => {
      const p = await getProgress();
      setProgress(p);
    };
    load();
  }, []);

  const generateAudio = useCallback(async (text: string) => {
    setIsGeneratingAudio(true);
    setAudioError(null);
    try {
      if (!text) throw new Error("No script provided for audio generation");
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read the following IELTS listening script in its entirety, clearly and at a natural pace. Ensure you read every single word from start to finish without stopping early: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          maxOutputTokens: 4096, // Increased to ensure longer scripts are not cut off
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        // Gemini TTS returns raw PCM 16-bit mono at 24kHz
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        // Ensure even length for 16-bit samples to avoid Int16Array alignment issues
        const evenLen = len % 2 === 0 ? len : len - 1;
        const bytes = new Uint8Array(evenLen);
        for (let i = 0; i < evenLen; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pcmData = new Int16Array(bytes.buffer);
        const wavBlob = pcmToWav(pcmData, 24000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } else {
        throw new Error("Failed to generate audio data");
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      setAudioError("Could not generate audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection && !audioUrl && !isGeneratingAudio) {
      generateAudio(activeSection.script);
    }
  }, [activeSection, audioUrl, isGeneratingAudio, generateAudio]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        setPlaybackProgress(pct);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(100);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (playbackProgress >= 100) audio.currentTime = 0;
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleCheck = () => {
    setShowResults(true);
    if (progress) {
      const updated = { ...progress, studyMinutes: (progress.studyMinutes || 0) + 15 };
      saveProgress(updated);
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setPlaybackProgress(0);
      if (isPlaying) audioRef.current.play();
    }
  };

  if (!progress) return null;

  if (activeSection) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => { 
            setActiveSection(null); 
            setIsPlaying(false); 
            setPlaybackProgress(0); 
            setShowResults(false); 
            setAudioUrl(null);
            setAudioError(null);
          }} 
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Sections
        </button>

        <div className="card bg-gradient-to-br from-blue-dim/20 to-bg-1 border-blue-dim/30 p-5 md:p-6">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-primary flex items-center justify-center text-white shadow-lg shadow-blue-primary/20">
              <Volume2 size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base md:text-lg leading-tight">{activeSection.title}</h3>
              <div className="text-[9px] md:text-xs text-text-muted font-medium uppercase tracking-wider">{activeSection.type} · {activeSection.difficulty}</div>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="h-1 md:h-1.5 bg-bg-3 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${playbackProgress}%` }} className="h-full bg-blue-primary" />
            </div>
            
            {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={handlePlay} 
                disabled={isGeneratingAudio || !!audioError}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-primary text-white flex items-center justify-center hover:bg-blue-secondary transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {isGeneratingAudio ? <Loader2 size={20} className="animate-spin" /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5 md:ml-1" />}
              </button>
              
              <div className="text-[9px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest text-center flex-1">
                {isGeneratingAudio ? "Generating Audio..." : audioError ? "Audio Error" : isPlaying ? "🔊 Playing Audio..." : playbackProgress >= 100 ? "✅ Audio Complete" : "Ready to Play"}
              </div>

              <button onClick={resetAudio} className="p-2 text-text-muted hover:text-text-primary transition-colors flex-shrink-0">
                <RotateCcw size={18} />
              </button>
            </div>

            {audioError && (
              <div className="flex items-center gap-2 text-red-accent text-[10px] font-bold uppercase mt-2">
                <AlertCircle size={14} /> {audioError}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="font-bold text-sm flex items-center gap-2 px-1">
            <PenTool size={16} className="text-blue-secondary" /> Practice Questions
          </div>
          {activeSection.questions.map((q: any, i: number) => (
            <div key={i} className="card border-border">
              <div className="text-xs font-bold text-text-primary mb-3">{q.q}</div>
              <input
                type="text"
                value={userAnswers[i] || ""}
                onChange={(e) => setUserAnswers({ ...userAnswers, [i]: e.target.value })}
                placeholder="Your answer..."
                disabled={showResults}
                className={cn(
                  "w-full bg-bg-2 border border-border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all",
                  showResults && userAnswers[i]?.toLowerCase() === q.answer.toLowerCase() && "border-green-accent bg-green-accent/5 text-green-accent",
                  showResults && userAnswers[i]?.toLowerCase() !== q.answer.toLowerCase() && "border-red-accent bg-red-accent/5 text-red-accent"
                )}
              />
              {showResults && (
                <div className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                  {userAnswers[i]?.toLowerCase() === q.answer.toLowerCase() 
                    ? <span className="text-green-accent">Correct!</span> 
                    : <span className="text-red-accent">Incorrect. Answer: {q.answer}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {!showResults ? (
          <button onClick={handleCheck} className="btn btn-primary w-full py-4">Check Answers</button>
        ) : (
          <div className="space-y-3">
            <button onClick={() => setShowResults(false)} className="btn btn-ghost w-full py-4">Try Again</button>
            <div className="card bg-bg-2 border-border-2">
              <div className="flex items-center gap-2 text-text-muted font-bold text-[10px] uppercase tracking-widest mb-3">
                <FileText size={14} /> Transcript
              </div>
              <p className="text-xs text-text-secondary leading-relaxed italic whitespace-pre-wrap">{activeSection.script}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-1">🎧 Listening Practice</h2>
        <p className="text-sm text-text-muted">IELTS-style audio with real-time player and questions</p>
      </div>

      <div className="space-y-4">
        {LISTENING_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec)}
            className="card w-full text-left hover:border-blue-primary group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-bg-2 flex items-center justify-center text-blue-secondary group-hover:scale-110 transition-transform">
              <Headphones size={24} />
            </div>
            <div className="flex-1 min-width-0">
              <div className="font-bold text-sm text-text-primary mb-1 truncate">{sec.title}</div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "tag",
                  sec.difficulty === "Easy" ? "tag-green" : "tag-amber"
                )}>{sec.difficulty}</span>
                <span className="tag tag-gray">{sec.type}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-blue-primary group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
