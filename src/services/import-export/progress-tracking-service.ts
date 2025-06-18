
import { devLog } from '@/utils/dev-logger';

export interface ImportProgress {
  stage: 'analyzing' | 'mapping' | 'validating' | 'importing' | 'complete' | 'error';
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  recordsProcessed: number;
  totalRecords: number;
  percentage: number;
  message: string;
  errors: string[];
  warnings: string[];
}

export interface ProgressCallback {
  (progress: ImportProgress): void;
}

export const progressTrackingService = {
  createProgressTracker(totalFiles: number, totalRecords: number): {
    updateProgress: (update: Partial<ImportProgress>) => void;
    getProgress: () => ImportProgress;
    setCallback: (callback: ProgressCallback) => void;
  } {
    let currentProgress: ImportProgress = {
      stage: 'analyzing',
      filesProcessed: 0,
      totalFiles,
      recordsProcessed: 0,
      totalRecords,
      percentage: 0,
      message: 'Starting import analysis...',
      errors: [],
      warnings: []
    };

    let progressCallback: ProgressCallback | null = null;

    const updateProgress = (update: Partial<ImportProgress>) => {
      currentProgress = {
        ...currentProgress,
        ...update
      };

      // Calculate percentage based on stage and progress
      currentProgress.percentage = this.calculatePercentage(currentProgress);

      devLog.info('Import progress updated:', currentProgress);

      if (progressCallback) {
        progressCallback(currentProgress);
      }
    };

    const getProgress = () => currentProgress;

    const setCallback = (callback: ProgressCallback) => {
      progressCallback = callback;
    };

    return { updateProgress, getProgress, setCallback };
  },

  calculatePercentage(progress: ImportProgress): number {
    const stageWeights = {
      analyzing: 0.15,
      mapping: 0.10,
      validating: 0.15,
      importing: 0.60,
      complete: 1.0,
      error: progress.percentage || 0
    };

    const stageProgress = {
      analyzing: Math.min(progress.filesProcessed / progress.totalFiles, 1),
      mapping: Math.min(progress.filesProcessed / progress.totalFiles, 1),
      validating: Math.min(progress.filesProcessed / progress.totalFiles, 1),
      importing: Math.min(progress.recordsProcessed / progress.totalRecords, 1),
      complete: 1,
      error: 0
    };

    const baseProgress = Object.entries(stageWeights)
      .filter(([stage]) => this.isStageComplete(stage as ImportProgress['stage'], progress.stage))
      .reduce((sum, [, weight]) => sum + weight, 0);

    const currentStageProgress = stageProgress[progress.stage] * stageWeights[progress.stage];

    return Math.min(Math.round((baseProgress + currentStageProgress) * 100), 100);
  },

  isStageComplete(stage: ImportProgress['stage'], currentStage: ImportProgress['stage']): boolean {
    const stageOrder: ImportProgress['stage'][] = ['analyzing', 'mapping', 'validating', 'importing', 'complete'];
    const stageIndex = stageOrder.indexOf(stage);
    const currentIndex = stageOrder.indexOf(currentStage);
    return stageIndex < currentIndex;
  },

  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        devLog.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, lastError.message);

        if (attempt < maxRetries) {
          await this.sleep(delay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError!;
  },

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  formatTimeRemaining(startTime: number, progress: number): string {
    if (progress <= 0) return 'Calculating...';

    const elapsed = Date.now() - startTime;
    const estimated = elapsed / progress;
    const remaining = estimated - elapsed;

    if (remaining < 60000) {
      return `${Math.round(remaining / 1000)}s remaining`;
    } else if (remaining < 3600000) {
      return `${Math.round(remaining / 60000)}m remaining`;
    } else {
      return `${Math.round(remaining / 3600000)}h remaining`;
    }
  }
};
