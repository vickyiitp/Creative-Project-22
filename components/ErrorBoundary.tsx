import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("System Failure (ErrorBoundary):", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4 font-sans">
          <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center animate-fade-in">
            <AlertTriangle className="mx-auto text-red-500 mb-6 h-16 w-16 animate-pulse" />
            <h1 className="text-2xl font-bold font-mono mb-2 text-white">SYSTEM CRITICAL</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              An unexpected runtime error has occurred in the application mainframe. 
              Infrastructure integrity compromised.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-red-500/40 font-mono tracking-wide"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              INITIATE_REBOOT()
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}