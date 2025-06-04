interface PerformanceOperation {
  id: string;
  startTime: number;
  endTime?: number;
  operation: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitorService {
  private operations = new Map<string, PerformanceOperation>();
  private completedOperations: PerformanceOperation[] = [];
  private maxCompletedOperations = 100; // Keep last 100 operations for analysis

  startOperation(operation: string, metadata?: Record<string, any>): string {
    const id = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const operationData: PerformanceOperation = {
      id,
      startTime: performance.now(),
      operation,
      metadata
    };

    this.operations.set(id, operationData);
    
    // Log start if in development
    if (import.meta.env.DEV) {
      console.log(`🚀 Started operation: ${operation}`, metadata);
    }

    return id;
  }

  endOperation(operationId: string): void {
    const operation = this.operations.get(operationId);
    
    if (!operation) {
      console.warn(`Operation ${operationId} not found`);
      return;
    }

    operation.endTime = performance.now();
    const duration = operation.endTime - operation.startTime;

    // Move to completed operations
    this.operations.delete(operationId);
    this.completedOperations.unshift(operation);

    // Keep only recent operations
    if (this.completedOperations.length > this.maxCompletedOperations) {
      this.completedOperations = this.completedOperations.slice(0, this.maxCompletedOperations);
    }

    // Log completion if in development
    if (import.meta.env.DEV) {
      console.log(`✅ Completed operation: ${operation.operation} in ${duration.toFixed(2)}ms`, operation.metadata);
    }

    // Warn about slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${operation.operation} took ${duration.toFixed(2)}ms`);
    }
  }

  getOperationStats(operation?: string) {
    const relevantOps = operation 
      ? this.completedOperations.filter(op => op.operation === operation)
      : this.completedOperations;

    if (relevantOps.length === 0) {
      return null;
    }

    const durations = relevantOps
      .filter(op => op.endTime)
      .map(op => op.endTime! - op.startTime);

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    return {
      operation: operation || 'all',
      count: durations.length,
      avgDuration: Math.round(avgDuration),
      maxDuration: Math.round(maxDuration),
      minDuration: Math.round(minDuration),
      recentOperations: relevantOps.slice(0, 10)
    };
  }

  getActiveOperations() {
    return Array.from(this.operations.values());
  }

  clearStats() {
    this.completedOperations = [];
  }

  // Method to log current performance state
  logPerformanceReport() {
    const activeOps = this.getActiveOperations();
    const recentStats = this.getOperationStats();

    console.group('📊 Performance Report');
    console.log('Active Operations:', activeOps.length);
    console.log('Recent Operations Stats:', recentStats);
    
    if (activeOps.length > 0) {
      console.log('Currently Running:', activeOps.map(op => ({
        operation: op.operation,
        runningFor: `${Math.round(performance.now() - op.startTime)}ms`
      })));
    }
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitorService();

// Export for debugging in development
if (import.meta.env.DEV) {
  (window as any).performanceMonitor = performanceMonitor;
}
