
import React from 'react';
import { AIConfigField } from './AIConfigField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TestOpenAIConnection } from './TestOpenAIConnection';
import { OpenAIDiagnostics } from './OpenAIDiagnostics';
import { CloudMailinSetup } from './CloudMailinSetup';
import { WebhookSecretSetup } from './WebhookSecretSetup';
import { InvoiceProcessingTest } from './InvoiceProcessingTest';
import { Sparkles } from 'lucide-react';

interface AIConfigFormFieldsProps {
  values: {
    aiConfidenceThreshold: string;
    highConfidenceThreshold: string;
    processingTimeout: string;
    retryAttempts: string;
    maxFileSize: string;
    allowedFileTypes: string;
    openaiApiKey: string;
    openaiModel: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

export function AIConfigFormFields({ values, onFieldChange }: AIConfigFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* OpenAI Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            OpenAI Integration
          </CardTitle>
          <CardDescription>
            Configure your OpenAI API key and model preferences for AI-powered features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-api-key">OpenAI API Key</Label>
            <Input
              id="openai-api-key"
              type="password"
              value={values.openaiApiKey}
              onChange={(e) => onFieldChange('openaiApiKey', e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-sm text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-model">OpenAI Model</Label>
            <Select value={values.openaiModel} onValueChange={(value) => onFieldChange('openaiModel', value)}>
              <SelectTrigger id="openai-model">
                <SelectValue placeholder="Select OpenAI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Cost-effective)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (Most Capable)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              GPT-4o Mini is recommended for most use cases. GPT-4o provides enhanced capabilities for complex tasks.
            </p>
          </div>

          <TestOpenAIConnection apiKey={values.openaiApiKey} model={values.openaiModel} />
        </CardContent>
      </Card>

      {/* OpenAI Diagnostics Section */}
      <OpenAIDiagnostics />

      {/* Webhook Secret Configuration */}
      <WebhookSecretSetup />

      {/* CloudMailin Integration Section */}
      <CloudMailinSetup />

      {/* Invoice Processing Test Section */}
      <InvoiceProcessingTest />

      {/* AI Processing Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Processing Configuration</CardTitle>
          <CardDescription>
            Fine-tune AI processing parameters for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AIConfigField
              id="ai-confidence-threshold"
              label="AI Confidence Threshold"
              value={values.aiConfidenceThreshold}
              onChange={(value) => onFieldChange('aiConfidenceThreshold', value)}
              type="number"
              placeholder="0.6"
              min="0"
              max="1"
              step="0.1"
              description="Minimum confidence level required for AI processing (0.0 - 1.0)"
            />
            
            <AIConfigField
              id="high-confidence-threshold"
              label="High Confidence Threshold"
              value={values.highConfidenceThreshold}
              onChange={(value) => onFieldChange('highConfidenceThreshold', value)}
              type="number"
              placeholder="0.8"
              min="0"
              max="1"
              step="0.1"
              description="Threshold for high confidence AI results (0.0 - 1.0)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AIConfigField
              id="processing-timeout"
              label="Processing Timeout (ms)"
              value={values.processingTimeout}
              onChange={(value) => onFieldChange('processingTimeout', value)}
              type="number"
              placeholder="300000"
              min="1000"
              description="Maximum time allowed for AI processing operations"
            />
            
            <AIConfigField
              id="retry-attempts"
              label="Retry Attempts"
              value={values.retryAttempts}
              onChange={(value) => onFieldChange('retryAttempts', value)}
              type="number"
              placeholder="3"
              min="0"
              max="10"
              description="Number of retry attempts for failed AI operations"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AIConfigField
              id="max-file-size"
              label="Max File Size (bytes)"
              value={values.maxFileSize}
              onChange={(value) => onFieldChange('maxFileSize', value)}
              type="number"
              placeholder="10485760"
              min="1024"
              description="Maximum file size for AI processing (10MB = 10485760 bytes)"
            />
            
            <AIConfigField
              id="allowed-file-types"
              label="Allowed File Types"
              value={values.allowedFileTypes}
              onChange={(value) => onFieldChange('allowedFileTypes', value)}
              placeholder="image/jpeg,image/png,application/pdf"
              description="Comma-separated list of allowed MIME types"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
