import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Uday's IELTS — AI Personal Tutor",
  description: 'AI-powered IELTS preparation platform with personalized coaching, mock tests, and structured courses.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2224%22 fill=%22%232563eb%22/><path d=%22M35 35V55C35 63.2843 41.7157 70 50 70C58.2843 70 65 63.2843 65 55V35%22 stroke=%22white%22 stroke-width=%228%22 stroke-linecap=%22round%22/><path d=%22M25 35L50 20L75 35L50 50L25 35Z%22 fill=%22white%22 fill-opacity=%220.9%22/><circle cx=%2275%22 cy=%2235%22 r=%226%22 fill=%22%2310b981%22/></svg>',
  },
};

import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} ${playfair.variable}`}>
      <body className="bg-[#020c1b] text-[#e2e8f0] font-sans" suppressHydrationWarning>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
