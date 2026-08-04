import React, { Component, ReactNode, ErrorInfo } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    toast.error('An unexpected error occurred', {
      description: error.message || 'Please try refreshing the page.'
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 flex items-center justify-center rounded-full mb-4 mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">System Fault Detected</h1>
          <p className="text-zinc-400 font-medium max-w-md">
            The application encountered a critical error. Our systems have logged the fault.
          </p>
          {this.state.error && (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-left max-w-lg w-full overflow-auto">
              <p className="text-red-400 font-mono text-xs">{this.state.error.message}</p>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-yellow-500 text-zinc-950 font-black uppercase text-[11px] tracking-widest rounded-full hover:bg-yellow-400 transition-all active:scale-95"
          >
            Reboot Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
