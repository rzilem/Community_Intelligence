
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
  private originalLog: typeof console.log;
  private originalInfo: typeof console.info;
  private originalWarn: typeof console.warn;
  private originalError: typeof console.error;

  constructor(storageKey = 'app_logs', maxEntries = 100) {
    this.storageKey = storageKey;
    this.maxEntries = maxEntries;
    
    // Save references to original console methods
    this.originalLog = console.log;
    this.originalInfo = console.info;
    this.originalWarn = console.warn;
    this.originalError = console.error;
  }

  /**
   * Initialize the logger and intercept console methods
   */
  init(): void {
    if (this.isInitialized) return;
    
    try {
      // Override console.log
      console.log = (...args: any[]) => {
        this.captureLog('log', args);
        this.originalLog.apply(console, args);
      };

      // Override console.info
      console.info = (...args: any[]) => {
        this.captureLog('info', args);
        this.originalInfo.apply(console, args);
      };

      // Override console.warn
      console.warn = (...args: any[]) => {
        this.captureLog('warn', args);
        this.originalWarn.apply(console, args);
      };

      // Override console.error
      console.error = (...args: any[]) => {
        this.captureLog('error', args);
        this.originalError.apply(console, args);
      };

      this.isInitialized = true;
      this.originalInfo.call(console, 'Client logger initialized');
    } catch (error) {
      // Use the original console methods to log any initialization errors
      this.originalError.call(console, 'Failed to initialize logger:', error);
    }
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
      // Use original console to avoid infinite recursion
      this.originalError.call(console, 'Error capturing log:', error);
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
      this.originalError.call(console, 'Error getting logs:', error);
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
  
  /**
   * Restore the original console methods
   */
  restore(): void {
    if (!this.isInitialized) return;
    
    console.log = this.originalLog;
    console.info = this.originalInfo;
    console.warn = this.originalWarn;
    console.error = this.originalError;
    
    this.isInitialized = false;
    console.info('Client logger restored');
  }
}

// Create singleton instance
export const logger = new ClientLogger();

// Auto-initialize in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.init();
}

export default logger;
