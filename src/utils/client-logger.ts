
/**
 * Client-side rotating log utility
 * Captures console logs and stores them in localStorage with rotation
 */

export interface LogEntry {
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export class ClientLogger {
  private readonly storageKey: string;
  private readonly maxEntries: number;
  private isInitialized: boolean = false;

  constructor(storageKey = 'app_logs', maxEntries = 100) {
    this.storageKey = storageKey;
    this.maxEntries = maxEntries;
  }

  /**
   * Initialize the logger and intercept console methods
   */
  init(): void {
    if (this.isInitialized) return;
    
    // Save original console methods
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;

    // Override console.log
    console.log = (...args: any[]) => {
      this.captureLog('log', args);
      originalLog.apply(console, args);
    };

    // Override console.info
    console.info = (...args: any[]) => {
      this.captureLog('info', args);
      originalInfo.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      this.captureLog('warn', args);
      originalWarn.apply(console, args);
    };

    // Override console.error
    console.error = (...args: any[]) => {
      this.captureLog('error', args);
      originalError.apply(console, args);
    };

    this.isInitialized = true;
    console.info('Client logger initialized');
  }

  /**
   * Capture a log entry and store it
   */
  private captureLog(level: LogEntry['level'], args: any[]): void {
    try {
      // Extract message and data
      const message = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }).join(' ');

      // Create log entry
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data: args.length > 1 ? this.safeStringify(args.slice(1)) : undefined
      };

      // Get existing logs
      const logs = this.getLogs();
      
      // Add new entry
      logs.push(entry);
      
      // Rotate logs if needed
      if (logs.length > this.maxEntries) {
        logs.splice(0, logs.length - this.maxEntries);
      }
      
      // Save logs
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      // Do nothing - we don't want to cause an infinite loop
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    try {
      const logsJson = localStorage.getItem(this.storageKey);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  /**
   * Safely stringify an object
   */
  private safeStringify(obj: any): string {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      return '[Object cannot be stringified]';
    }
  }
}

// Create singleton instance
export const logger = new ClientLogger();

// Auto-initialize in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.init();
}

export default logger;
