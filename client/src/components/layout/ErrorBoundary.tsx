import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LUMIO Uncaught Runtime Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-canvas flex items-center justify-center p-6 text-brand-text">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-floating text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-navy-900 tracking-tight">
              Virtual Lab Session Interrupted
            </h2>
            <p className="text-xs text-brand-muted mt-2 leading-relaxed">
              An unexpected runtime error occurred in this laboratory view. Your experiment code has been preserved in localStorage.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left font-mono text-[11px] text-rose-700 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Home className="w-3.5 h-3.5" />}
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Go to Landing
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Reload Station
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
