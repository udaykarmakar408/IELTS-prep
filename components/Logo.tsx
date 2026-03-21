import React from 'react';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Shape */}
    <rect x="10" y="10" width="80" height="80" rx="24" fill="url(#logo-grad)" />
    
    {/* Stylized 'U' */}
    <path 
      d="M35 35V55C35 63.2843 41.7157 70 50 70C58.2843 70 65 63.2843 65 55V35" 
      stroke="white" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    
    {/* Graduation Cap Tassel/Top */}
    <path 
      d="M25 35L50 20L75 35L50 50L25 35Z" 
      fill="white" 
      fillOpacity="0.9"
    />
    
    {/* AI Node */}
    <circle cx="75" cy="35" r="6" fill="#10b981" filter="url(#logo-glow)" />
    <path d="M75 35L65 45" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
  </svg>
);

export const LogoText = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="font-serif text-xl font-black leading-none tracking-tight text-text-primary">
      Uday&apos;s <span className="text-blue-secondary">IELTS</span>
    </span>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">
      AI Personal Tutor
    </span>
  </div>
);
