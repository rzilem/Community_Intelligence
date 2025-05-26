
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Settings } from 'lucide-react';

interface AIConfigValues {
  AI_CONFIDENCE_THRESHOLD: string;
  AI_HIGH_CONFIDENCE_THRESHOLD: string;
  AI_PROCESSING_TIMEOUT: string;
  AI_RETRY_ATTEMPTS: string;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string;
}

const defaultValues: AIConfigValues = {
  AI_CONFIDENCE_THRESHOLD: '0.6',
  AI_HIGH_CONFIDENCE_THRESHOLD: '0.8',
  AI_PROCESSING_TIMEOUT: '300000',
  AI_RETRY_ATTEMPTS: '3',
  MAX_FILE_SIZE: '10485760',
  ALLOWED_FILE_TYPES: 'image/jpeg,image/png,application/pdf'
};

const AIConfigurationSection: React.FC = () => {
  const [configValues, setConfigValues] = useState<AIConfigValues>(defaultValues);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('settings', {
        body: { action: 'get_ai_config' }
      });

      if (error) {
        console.error('Error loading AI configuration:', error);
        return;
      }

      if (data?.config) {
        setConfigValues(prev => ({ ...prev, ...data.config }));
      }
    } catch (error) {
      console.error('Error loading AI configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Save each configuration value as a separate secret
      const secretPromises = Object.entries(configValues).map(([key, value]) =>
        supabase.functions.invoke('update-secret', {
          body: { name: key, value }
        })
      );

      const results = await Promise.all(secretPromises);
      
      // Check if any failed
      const failures = results.filter(result => result.error || !result.data?.success);
      
      if (failures.length > 0) {
        throw new Error(`Failed to save ${failures.length} configuration values`);
      }

      toast({
        title: "Configuration Saved",
        description: "AI configuration values have been saved successfully as Supabase secrets.",
      });
    } catch (error) {
      console.error('Error saving AI configuration:', error);
      toast({
        title: "Save Failed",
        description: `Failed to save AI configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof AIConfigValues, value: string) => {
    setConfigValues(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading AI configuration...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          AI Processing Configuration
        </CardTitle>
        <CardDescription>
          Configure AI processing thresholds and limits. These values are stored securely as Supabase secrets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ai_confidence_threshold">AI Confidence Threshold</Label>
            <Input
              id="ai_confidence_threshold"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={configValues.AI_CONFIDENCE_THRESHOLD}
              onChange={(e) => handleInputChange('AI_CONFIDENCE_THRESHOLD', e.target.value)}
              placeholder="0.6"
            />
            <p className="text-sm text-muted-foreground">
              Minimum confidence level for AI processing (0.0 - 1.0)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_high_confidence_threshold">High Confidence Threshold</Label>
            <Input
              id="ai_high_confidence_threshold"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={configValues.AI_HIGH_CONFIDENCE_THRESHOLD}
              onChange={(e) => handleInputChange('AI_HIGH_CONFIDENCE_THRESHOLD', e.target.value)}
              placeholder="0.8"
            />
            <p className="text-sm text-muted-foreground">
              Threshold for high confidence AI results (0.0 - 1.0)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_processing_timeout">Processing Timeout (ms)</Label>
            <Input
              id="ai_processing_timeout"
              type="number"
              min="1000"
              value={configValues.AI_PROCESSING_TIMEOUT}
              onChange={(e) => handleInputChange('AI_PROCESSING_TIMEOUT', e.target.value)}
              placeholder="300000"
            />
            <p className="text-sm text-muted-foreground">
              Maximum time for AI processing in milliseconds (default: 5 minutes)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_retry_attempts">Retry Attempts</Label>
            <Input
              id="ai_retry_attempts"
              type="number"
              min="0"
              max="10"
              value={configValues.AI_RETRY_ATTEMPTS}
              onChange={(e) => handleInputChange('AI_RETRY_ATTEMPTS', e.target.value)}
              placeholder="3"
            />
            <p className="text-sm text-muted-foreground">
              Number of retry attempts for failed AI processing
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_file_size">Max File Size (bytes)</Label>
            <Input
              id="max_file_size"
              type="number"
              min="1"
              value={configValues.MAX_FILE_SIZE}
              onChange={(e) => handleInputChange('MAX_FILE_SIZE', e.target.value)}
              placeholder="10485760"
            />
            <p className="text-sm text-muted-foreground">
              Maximum file size for uploads (default: 10MB = 10,485,760 bytes)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowed_file_types">Allowed File Types</Label>
            <Input
              id="allowed_file_types"
              value={configValues.ALLOWED_FILE_TYPES}
              onChange={(e) => handleInputChange('ALLOWED_FILE_TYPES', e.target.value)}
              placeholder="image/jpeg,image/png,application/pdf"
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated list of allowed MIME types
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={saveConfiguration} 
            disabled={isSaving}
            className="min-w-[140px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConfigurationSection;
