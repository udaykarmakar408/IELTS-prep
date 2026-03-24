import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <motion.svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.1, rotate: 5 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0d7af6" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Modern Hexagonal Background */}
    <motion.path 
      d="M50 5L89.5 27.5V72.5L50 95L10.5 72.5V27.5L50 5Z" 
      fill="url(#logo-grad)" 
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    
    {/* Stylized 'U' / Education Symbol */}
    <motion.path 
      d="M35 48V62C35 70.2843 41.7157 77 50 77C58.2843 77 65 70.2843 65 62V48" 
      stroke="white" 
      strokeWidth="8" 
      strokeLinecap="round" 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    />
    
    {/* Graduation Cap Top - Floating Style */}
    <motion.path 
      d="M25 48L50 32L75 48L50 64L25 48Z" 
      fill="white" 
      fillOpacity="0.95"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.8 }}
    />
    
    {/* AI / Success Accent - Integrated into the cap */}
    <motion.circle 
      cx="75" cy="48" r="6" 
      fill="#009966" 
      filter="url(#logo-glow)" 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, delay: 1.2 }}
    />
    <motion.path 
      d="M75 48L68 55" 
      stroke="white" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 1.4 }}
    />
  </motion.svg>
);

export const LogoText = ({ className = "" }: { className?: string }) => (
  <motion.div 
    className={`flex flex-col ${className}`}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <span className="font-serif text-xl font-black leading-none tracking-tight text-text-primary">
      Uday&apos;s <span className="text-blue-primary">IELTS</span>
    </span>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">
      AI Personal Tutor
    </span>
  </motion.div>
);
