
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

export interface ImportError {
  type: 'rls_violation' | 'validation_error' | 'database_error' | 'file_error' | 'network_error';
  message: string;
  details?: any;
  recovery?: string;
  canRetry?: boolean;
}

export class EnhancedErrorHandler {
  static categorizeError(error: any): ImportError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    // RLS violation detection
    if (errorMessage.includes('row-level security') || 
        errorMessage.includes('RLS') ||
        errorMessage.includes('violates row-level security policy')) {
      return {
        type: 'rls_violation',
        message: 'Authentication or permission error during import',
        details: errorMessage,
        recovery: 'Please ensure you are logged in and have proper permissions for this association',
        canRetry: true
      };
    }
    
    // Database constraint violations
    if (errorMessage.includes('duplicate key') || 
        errorMessage.includes('unique constraint') ||
        errorMessage.includes('foreign key')) {
      return {
        type: 'database_error',
        message: 'Database constraint violation',
        details: errorMessage,
        recovery: 'Check for duplicate data or invalid references',
        canRetry: false
      };
    }
    
    // Validation errors
    if (errorMessage.includes('validation') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('required field')) {
      return {
        type: 'validation_error',
        message: 'Data validation failed',
        details: errorMessage,
        recovery: 'Please check your data format and required fields',
        canRetry: true
      };
    }
    
    // File processing errors
    if (errorMessage.includes('file') ||
        errorMessage.includes('parse') ||
        errorMessage.includes('format')) {
      return {
        type: 'file_error',
        message: 'File processing error',
        details: errorMessage,
        recovery: 'Please check your file format and try again',
        canRetry: true
      };
    }
    
    // Network errors
    if (errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection')) {
      return {
        type: 'network_error',
        message: 'Network connection error',
        details: errorMessage,
        recovery: 'Please check your internet connection and try again',
        canRetry: true
      };
    }
    
    // Default case
    return {
      type: 'database_error',
      message: 'An unexpected error occurred',
      details: errorMessage,
      recovery: 'Please try again or contact support if the issue persists',
      canRetry: true
    };
  }

  static handleError(error: any, context?: string): ImportError {
    const categorizedError = this.categorizeError(error);
    
    devLog.error(`[EnhancedErrorHandler] ${context || 'Import'} error:`, {
      type: categorizedError.type,
      message: categorizedError.message,
      details: categorizedError.details,
      originalError: error
    });

    // Show user-friendly toast based on error type
    switch (categorizedError.type) {
      case 'rls_violation':
        toast.error('Permission Error', {
          description: 'You may need to log in again or contact your administrator'
        });
        break;
        
      case 'validation_error':
        toast.error('Data Validation Error', {
          description: categorizedError.recovery
        });
        break;
        
      case 'file_error':
        toast.error('File Processing Error', {
          description: categorizedError.recovery
        });
        break;
        
      case 'network_error':
        toast.error('Connection Error', {
          description: categorizedError.recovery
        });
        break;
        
      default:
        toast.error('Import Error', {
          description: categorizedError.recovery
        });
    }

    return categorizedError;
  }

  static createDetailedErrorReport(errors: ImportError[]): string {
    const errorSummary = errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let report = 'Import Error Summary:\n';
    Object.entries(errorSummary).forEach(([type, count]) => {
      report += `- ${type}: ${count} error(s)\n`;
    });

    report += '\nDetailed Errors:\n';
    errors.forEach((error, index) => {
      report += `${index + 1}. ${error.type}: ${error.message}\n`;
      if (error.recovery) {
        report += `   Recovery: ${error.recovery}\n`;
      }
    });

    return report;
  }
}
