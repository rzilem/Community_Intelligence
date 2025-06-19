
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TestOpenAIConnectionProps {
  apiKey: string;
  model: string;
}

export function TestOpenAIConnection({ apiKey, model }: TestOpenAIConnectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastTestResult, setLastTestResult] = useState<string | null>(null);

  const testConnection = async () => {
    if (!apiKey) {
      toast.error('Please enter an OpenAI API key first');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('idle');

    try {
      const { data, error } = await supabase.functions.invoke('test-openai-connection', {
        body: { 
          apiKey, 
          model: model || 'gpt-4o-mini',
          testPrompt: 'Hello! Please respond with "OpenAI connection successful" to confirm the API is working.'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setConnectionStatus('success');
        setLastTestResult(data.response);
        toast.success(`Connection successful! Model: ${data.model}`);
      } else {
        setConnectionStatus('error');
        setLastTestResult(data.error);
        toast.error(`Connection failed: ${data.error}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLastTestResult(errorMessage);
      toast.error(`Test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Zap className="h-3 w-3 mr-1" />
            Not Tested
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Connection Status</p>
          {getStatusBadge()}
        </div>
        
        <Button
          onClick={testConnection}
          disabled={isLoading || !apiKey}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>
      </div>

      {lastTestResult && (
        <div className="text-xs p-2 bg-muted rounded border">
          <p className="font-medium mb-1">Last Test Result:</p>
          <p className="text-muted-foreground">{lastTestResult}</p>
        </div>
      )}
    </div>
  );
}
