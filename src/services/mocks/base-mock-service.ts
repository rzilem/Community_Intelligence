// Base class for mock services with common functionality

import { MockServiceConfig, ServiceResponse } from './common-types';

export class BaseMockService {
  protected config: MockServiceConfig;
  private static DEBUG = process.env.NODE_ENV === 'development';

  constructor(config: MockServiceConfig = {}) {
    this.config = {
      shouldFail: false,
      delay: 200,
      debugMode: BaseMockService.DEBUG,
      ...config
    };
  }

  protected async simulateDelay(customDelay?: number): Promise<void> {
    const delay = customDelay ?? this.config.delay ?? 200;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  protected logCall(serviceName: string, methodName: string, params?: any): void {
    if (this.config.debugMode) {
      console.log(`[Mock ${serviceName}] ${methodName} called with:`, params);
    }
  }

  protected createResponse<T>(
    data: T, 
    success: boolean = true, 
    error?: string,
    message?: string
  ): ServiceResponse<T> {
    if (this.config.shouldFail && success) {
      return {
        success: false,
        error: error || 'Simulated service error',
        message: 'Mock service in failure mode'
      };
    }

    return {
      success,
      data: success ? data : undefined,
      error: success ? undefined : error,
      message
    };
  }

  public setFailureMode(shouldFail: boolean): void {
    this.config.shouldFail = shouldFail;
  }

  public setDelay(delay: number): void {
    this.config.delay = delay;
  }
}