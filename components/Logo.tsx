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
        <stop offset="0%" stopColor="#0d7af6" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background Shape */}
    <rect x="10" y="10" width="80" height="80" rx="28" fill="url(#logo-grad)" />
    
    {/* Stylized 'U' / Education Symbol */}
    <path 
      d="M32 45V60C32 69.9411 40.0589 78 50 78C59.9411 78 68 69.9411 68 60V45" 
      stroke="white" 
      strokeWidth="10" 
      strokeLinecap="round" 
    />
    
    {/* Graduation Cap Top */}
    <path 
      d="M20 45L50 28L80 45L50 62L20 45Z" 
      fill="white" 
      fillOpacity="0.98"
    />
    
    {/* AI / Success Accent */}
    <circle cx="80" cy="45" r="7" fill="#009966" filter="url(#logo-glow)" />
    <path d="M80 45L70 55" stroke="white" strokeWidth="3" strokeLinecap="round" />
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
