
interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: any;
}

class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private activeOperations = new Map<string, PerformanceMetric>();

  startOperation(operation: string, metadata?: any): string {
    const operationId = `${operation}_${Date.now()}_${Math.random()}`;
    const metric: PerformanceMetric = {
      operation,
      startTime: performance.now(),
      metadata
    };
    
    this.activeOperations.set(operationId, metric);
    return operationId;
  }

  endOperation(operationId: string): number | null {
    const metric = this.activeOperations.get(operationId);
    if (!metric) return null;

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    this.metrics.push(metric);
    this.activeOperations.delete(operationId);
    
    console.log(`Performance: ${metric.operation} took ${metric.duration.toFixed(2)}ms`);
    return metric.duration;
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageTime(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation && m.duration);
    if (operationMetrics.length === 0) return 0;
    
    const total = operationMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / operationMetrics.length;
  }

  clear(): void {
    this.metrics = [];
    this.activeOperations.clear();
  }
}

export const performanceMonitor = new PerformanceMonitorService();
