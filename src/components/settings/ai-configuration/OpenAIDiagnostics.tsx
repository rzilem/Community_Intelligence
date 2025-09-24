
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle, Zap, Activity, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mockRPCCall } from '@/hooks/supabase/supabase-utils';

interface DiagnosticStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

interface LogEntry {
  id: string;
  request_id: string;
  function_name: string;
  timestamp: string;
  level: string;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export function OpenAIDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<DiagnosticStep[]>([
    { id: 'secret-check', name: 'Check Secret Storage', status: 'pending' },
    { id: 'connection-test', name: 'Test OpenAI Connection', status: 'pending' },
    { id: 'function-test', name: 'Test Edge Function', status: 'pending' },
    { id: 'ai-feature-test', name: 'Test AI Feature Usage', status: 'pending' }
  ]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [logWarning, setLogWarning] = useState<string | null>(null);

  const updateStep = (id: string, updates: Partial<DiagnosticStep>) => {
    setSteps(prev => prev.map(step =>
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('view-logs?limit=20', { method: 'GET' });
      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }

      const openaiLogs = (data?.logs || []).filter((log: LogEntry) => log.function_name.startsWith('openai-')) as LogEntry[];
      setLogEntries(openaiLogs);

      const errorLogs = openaiLogs.filter(log => log.level === 'error');
      if (errorLogs.length > 0) {
        setLogWarning(`${errorLogs.length} OpenAI error logs detected`);
      } else if (openaiLogs.length === 0) {
        setLogWarning('No recent OpenAI logs found - usage may be zero');
      } else {
        setLogWarning(null);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }, []);

  const runPeriodicCheck = useCallback(async () => {
    try {
      await supabase.functions.invoke('test-openai', {});
      await supabase.functions.invoke('openai-extractor', {
        body: {
          content: 'Diagnostics ping',
          contentType: 'invoice',
          metadata: { periodic: true }
        }
      });
    } catch (err) {
      console.error('Periodic OpenAI check failed:', err);
    }
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Check Secret Storage
      updateStep('secret-check', { status: 'running' });
      
      const secretData = await mockRPCCall('get_secret', {
        secret_name: 'OPENAI_API_KEY'
      });
      const secretError = null;
      
      if (secretError) {
        updateStep('secret-check', { 
          status: 'error', 
          message: `Secret retrieval failed: ${secretError.message}` 
        });
      } else if (!secretData) {
        updateStep('secret-check', { 
          status: 'error', 
          message: 'OPENAI_API_KEY secret not found' 
        });
      } else {
        const keyPreview = secretData.substring(0, 8) + '...';
        updateStep('secret-check', { 
          status: 'success', 
          message: `Secret found: ${keyPreview}`,
          details: { keyLength: secretData.length }
        });
      }

      // Step 2: Test OpenAI Connection
      updateStep('connection-test', { status: 'running' });
      
      const { data: connectionData, error: connectionError } = await supabase.functions.invoke('test-openai', {});
      
      if (connectionError) {
        updateStep('connection-test', { 
          status: 'error', 
          message: `Connection test failed: ${connectionError.message}` 
        });
      } else if (!connectionData?.success) {
        updateStep('connection-test', { 
          status: 'error', 
          message: connectionData?.error || 'Connection test failed' 
        });
      } else {
        updateStep('connection-test', { 
          status: 'success', 
          message: `Connection successful: ${connectionData.response}`,
          details: { model: connectionData.model }
        });
      }

      // Step 3: Test Edge Function
      updateStep('function-test', { status: 'running' });
      
      const { data: functionData, error: functionError } = await supabase.functions.invoke('test-openai-connection', {
        body: {
          apiKey: secretData,
          model: 'gpt-4o-mini',
          testPrompt: 'Respond with "API Key Usage Test Successful" to confirm this test worked.'
        }
      });
      
      if (functionError) {
        updateStep('function-test', { 
          status: 'error', 
          message: `Function test failed: ${functionError.message}` 
        });
      } else if (!functionData?.success) {
        updateStep('function-test', { 
          status: 'error', 
          message: functionData?.error || 'Function test failed' 
        });
      } else {
        updateStep('function-test', { 
          status: 'success', 
          message: `Function test successful: ${functionData.response}`,
          details: { usage: functionData.usage }
        });
      }

      // Step 4: Test AI Feature Usage (simulate invoice processing)
      updateStep('ai-feature-test', { status: 'running' });
      
      const testInvoiceContent = `
        INVOICE
        Invoice #: INV-2024-001
        Date: 2024-01-15
        From: Test Vendor LLC
        Amount: $250.00
        Description: Test service for diagnostics
      `;
      
      const { data: aiData, error: aiError } = await supabase.functions.invoke('openai-extractor', {
        body: {
          content: testInvoiceContent,
          contentType: 'invoice',
          metadata: { test: true },
          apiKey: secretData
        }
      });
      
      if (aiError) {
        updateStep('ai-feature-test', { 
          status: 'error', 
          message: `AI feature test failed: ${aiError.message}` 
        });
      } else if (!aiData?.success) {
        updateStep('ai-feature-test', { 
          status: 'error', 
          message: aiData?.error || 'AI feature test failed' 
        });
      } else {
        updateStep('ai-feature-test', { 
          status: 'success', 
          message: 'AI feature test successful - invoice data extracted',
          details: { extractedData: aiData.extractedData }
        });
      }

      toast.success('Diagnostics completed! Check OpenAI dashboard for usage.');
      
    } catch (error) {
      toast.error(`Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    runPeriodicCheck();
    const interval = setInterval(() => {
      runPeriodicCheck();
      fetchLogs();
    }, 600000); // every 10 minutes
    return () => clearInterval(interval);
  }, [fetchLogs, runPeriodicCheck]);

  const getStepIcon = (status: DiagnosticStep['status']) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepBadge = (status: DiagnosticStep['status']) => {
    switch (status) {
      case 'running': return <Badge variant="secondary">Running</Badge>;
      case 'success': return <Badge variant="success">Success</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          OpenAI API Key Diagnostics
        </CardTitle>
        <CardDescription>
          Run comprehensive diagnostics to identify why your OpenAI API key shows as unused
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>Diagnostic Plan</AlertTitle>
          <AlertDescription>
            This will test secret storage, connection, edge functions, and AI feature usage to trigger actual API calls.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getStepIcon(step.status)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{step.name}</span>
                    {getStepBadge(step.status)}
                  </div>
                  {step.message && (
                    <p className="text-sm text-muted-foreground">{step.message}</p>
                  )}
                  {step.details && (
                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(step.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run Full Diagnostics
              </>
            )}
          </Button>
        </div>

        {!isRunning && steps.some(s => s.status === 'success') && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Next Steps</AlertTitle>
            <AlertDescription>
              Check your OpenAI dashboard at{' '}
              <a
                href="https://platform.openai.com/usage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                platform.openai.com/usage
              </a>{' '}
              to see if the API key usage has been updated.
            </AlertDescription>
          </Alert>
        )}

        {logWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{logWarning}</AlertDescription>
          </Alert>
        )}

        {logEntries.length > 0 && (
          <div className="space-y-2">
            <div className="font-medium">Recent OpenAI Logs</div>
            {logEntries.map((log) => (
              <div key={log.id} className="text-sm border rounded p-2">
                <div className="flex justify-between">
                  <span>{log.function_name}</span>
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>{log.message}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
