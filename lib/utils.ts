import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getBandColor(band: number): string {
  if (!band || band === 0) return 'var(--color-text-muted)';
  if (band >= 8) return 'var(--color-green-accent)';
  if (band >= 7) return 'var(--color-blue-primary)';
  if (band >= 6) return 'var(--color-amber-accent)';
  return 'var(--color-red-accent)';
}

export function escHtml(text: string): string {
  if (typeof text !== 'string') return String(text || '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}
