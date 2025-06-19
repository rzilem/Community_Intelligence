
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
    if (!apiKey.trim()) {
      toast.error('Please enter an OpenAI API key first');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('idle');

    try {
      console.log('Testing OpenAI connection with model:', model);
      
      const { data, error } = await supabase.functions.invoke('test-openai-connection', {
        body: { 
          apiKey: apiKey.trim(), 
          model: model || 'gpt-4o-mini',
          testPrompt: 'Hello! Please respond with "OpenAI connection successful" to confirm the API is working.'
        }
      });

      console.log('Test response:', data, 'Error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to invoke test function');
      }

      if (!data) {
        throw new Error('No response received from test function');
      }

      if (data.success) {
        setConnectionStatus('success');
        setLastTestResult(data.response);
        toast.success(`Connection successful! Model: ${data.model}`);
        console.log('OpenAI test successful:', data);
      } else {
        setConnectionStatus('error');
        setLastTestResult(data.error || 'Unknown error');
        
        // Provide more specific error guidance
        let errorMessage = data.error || 'Connection failed';
        if (errorMessage.includes('401') || errorMessage.includes('API key')) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key.';
        } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
          errorMessage = 'Rate limit or quota exceeded. Check your OpenAI usage limits.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Connection timeout. Please try again.';
        }
        
        toast.error(`Connection failed: ${errorMessage}`);
        console.error('OpenAI test failed:', data);
      }
    } catch (error) {
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setLastTestResult(errorMessage);
      
      // Handle common edge function errors
      if (errorMessage.includes('Failed to send a request to the Edge Function')) {
        toast.error('Edge function not available. The test-openai-connection function may not be deployed.');
      } else if (errorMessage.includes('network')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(`Test failed: ${errorMessage}`);
      }
      
      console.error('Test connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return (
          <Badge variant="success">
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
          disabled={isLoading || !apiKey.trim()}
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
          <p className="text-muted-foreground break-words">{lastTestResult}</p>
        </div>
      )}
      
      {!apiKey.trim() && (
        <p className="text-xs text-muted-foreground">
          Enter your OpenAI API key above to test the connection.
        </p>
      )}
    </div>
  );
}
