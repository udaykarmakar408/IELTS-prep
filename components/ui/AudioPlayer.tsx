"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  FastForward,
  Rewind,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  className?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const AudioPlayer = ({ src, className, onEnded, autoPlay = false }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleCanPlay = () => setIsLoading(false);
    const handleEndedInternal = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEndedInternal);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEndedInternal);
    };
  }, [onEnded]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cycleSpeed = () => {
    const rates = [0.8, 1, 1.2, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const reset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("bg-bg-2 border border-border rounded-2xl p-4 space-y-4 shadow-lg", className)}>
      <audio ref={audioRef} src={src} autoPlay={autoPlay} className="hidden" />
      
      {/* Progress Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-bg-3 rounded-full appearance-none cursor-pointer accent-blue-primary hover:accent-blue-secondary transition-all"
        />
        <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-blue-primary text-white flex items-center justify-center hover:bg-blue-secondary transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-1" />
            )}
          </button>
          
          <button
            onClick={reset}
            className="w-8 h-8 rounded-full bg-bg-3 text-text-muted flex items-center justify-center hover:bg-bg-1 hover:text-text-primary transition-all active:scale-95"
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Speed Control */}
          <button
            onClick={cycleSpeed}
            className="px-3 py-1 bg-bg-3 hover:bg-bg-1 rounded-full text-[10px] font-black text-text-primary transition-all border border-border shadow-sm"
          >
            {playbackRate}x
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-16 h-1 bg-bg-3 rounded-full appearance-none cursor-pointer accent-text-muted group-hover:accent-blue-primary transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
