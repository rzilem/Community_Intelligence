
import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface GlobalError {
  message: string;
  stack?: string;
  timestamp: number;
}

const GlobalErrorHandler: React.FC = () => {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const errorMessage = event.reason?.message || 'An unexpected error occurred';
      toast.error(`Error: ${errorMessage}`, {
        description: 'Please try again or refresh the page',
        duration: 5000,
      });
      
      // Log to localStorage
      const error: GlobalError = {
        message: errorMessage,
        stack: event.reason?.stack,
        timestamp: Date.now()
      };
      
      try {
        const errors = JSON.parse(localStorage.getItem('global_errors') || '[]');
        errors.push(error);
        if (errors.length > 20) errors.shift(); // Keep last 20 errors
        localStorage.setItem('global_errors', JSON.stringify(errors));
      } catch (e) {
        console.error('Failed to log global error:', e);
      }
      
      event.preventDefault();
    };

    // Handle general JavaScript errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      const errorMessage = event.message || 'An unexpected error occurred';
      toast.error(`Error: ${errorMessage}`, {
        description: 'Please try again or refresh the page',
        duration: 5000,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
};

export default GlobalErrorHandler;
