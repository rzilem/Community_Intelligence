// Common types and interfaces for mock services

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type MockServiceMethod<T = any> = (...args: any[]) => Promise<ServiceResponse<T>>;

export interface MockServiceConfig {
  shouldFail?: boolean;
  delay?: number;
  debugMode?: boolean;
}