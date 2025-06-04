
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/client-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Initialize logger if not already initialized
    try {
      logger.init();
    } catch (e) {
      console.error('Failed to initialize logger:', e);
    }
    
    // Log error details to help with debugging
    console.error('ErrorBoundary caught an error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      route: window.location.pathname
    });
    
    // Store error info in state for display
    this.setState({
      errorInfo
    });
    
    // Track in localStorage for debugging purposes
    try {
      const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
      errorLog.push({
        timestamp: new Date().toISOString(),
        route: window.location.pathname,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
      
      // Keep only last 10 errors to prevent localStorage from filling up
      if (errorLog.length > 10) {
        errorLog.shift();
      }
      
      localStorage.setItem('error_log', JSON.stringify(errorLog));
    } catch (e) {
      console.error('Failed to log error to localStorage', e);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="mb-4 text-gray-700">
            The application encountered an error on route: {window.location.pathname}
          </p>
          <div className="space-y-2 mb-6">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              onClick={() => window.location.href = '/'}
            >
              Go to Home
            </button>
          </div>
          
          {this.state.error && (
            <details className="mt-6 p-4 bg-gray-100 rounded text-left">
              <summary className="cursor-pointer font-bold mb-2">Error Details</summary>
              <div className="overflow-auto max-h-40">
                <p className="font-mono text-sm mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.error.stack && (
                  <pre className="font-mono text-xs text-gray-600 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
