"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020c1b] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
            We encountered an unexpected error. Don&apos;t worry, your progress is safe.
          </p>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-8 w-full max-w-lg overflow-auto max-h-40 text-left">
            <code className="text-xs text-red-400 font-mono">
              {this.state.error?.toString()}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <RotateCcw size={18} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
