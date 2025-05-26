
import React from 'react';
import { AIConfigField } from './AIConfigField';
import { AIConfigValues } from './useAIConfiguration';

interface AIConfigFormFieldsProps {
  values: AIConfigValues;
  onFieldChange: (field: keyof AIConfigValues, value: string) => void;
}

export function AIConfigFormFields({ values, onFieldChange }: AIConfigFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AIConfigField
        id="aiConfidenceThreshold"
        label="AI Confidence Threshold"
        value={values.aiConfidenceThreshold}
        onChange={(value) => onFieldChange('aiConfidenceThreshold', value)}
        type="number"
        step="0.01"
        min="0"
        max="1"
        placeholder="0.6"
        description="Minimum confidence level for AI processing (0.0 - 1.0)"
      />

      <AIConfigField
        id="highConfidenceThreshold"
        label="High Confidence Threshold"
        value={values.highConfidenceThreshold}
        onChange={(value) => onFieldChange('highConfidenceThreshold', value)}
        type="number"
        step="0.01"
        min="0"
        max="1"
        placeholder="0.8"
        description="Threshold for high confidence AI results (0.0 - 1.0)"
      />

      <AIConfigField
        id="processingTimeout"
        label="Processing Timeout (ms)"
        value={values.processingTimeout}
        onChange={(value) => onFieldChange('processingTimeout', value)}
        type="number"
        min="1000"
        placeholder="300000"
        description="Maximum time for AI processing in milliseconds (default: 5 minutes)"
      />

      <AIConfigField
        id="retryAttempts"
        label="Retry Attempts"
        value={values.retryAttempts}
        onChange={(value) => onFieldChange('retryAttempts', value)}
        type="number"
        min="0"
        placeholder="3"
        description="Number of retry attempts for failed AI processing"
      />

      <AIConfigField
        id="maxFileSize"
        label="Max File Size (bytes)"
        value={values.maxFileSize}
        onChange={(value) => onFieldChange('maxFileSize', value)}
        type="number"
        min="1"
        placeholder="10485760"
        description="Maximum file size for uploads (default: 10MB = 10,485,760 bytes)"
      />

      <AIConfigField
        id="allowedFileTypes"
        label="Allowed File Types"
        value={values.allowedFileTypes}
        onChange={(value) => onFieldChange('allowedFileTypes', value)}
        type="text"
        placeholder="image/jpeg,image/png,application/pdf"
        description="Comma-separated list of allowed MIME types"
      />
    </div>
  );
}
