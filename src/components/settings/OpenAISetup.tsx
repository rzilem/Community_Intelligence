
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LogViewer from './LogViewer';

const OpenAISetup = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      toast.error('Please enter your OpenAI API key');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Submitting OpenAI config:", { model, hasApiKey: !!apiKey });
      
      const { data, error: invokeError } = await supabase.functions.invoke('update-openai-config', {
        method: 'POST',
        body: { apiKey, model }
      });

      if (invokeError) {
        console.error('Error invoking function:', invokeError);
        throw new Error(invokeError.message || 'Failed to update OpenAI configuration');
      }

      if (!data.success) {
        console.error('Function returned error:', data);
        throw new Error(data.error || 'Failed to update OpenAI configuration');
      }

      console.log("Configuration updated successfully:", data);
      toast.success('OpenAI API key and configuration updated successfully');
      
      // Try to reload the page after a brief delay to reflect the changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      console.error('Error updating OpenAI configuration:', error);
      setError(errorMessage);
      toast.error(`Failed to update OpenAI configuration: ${errorMessage}`);
      setShowLogs(true); // Show logs automatically when there's an error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Setup OpenAI Integration
          </CardTitle>
          <CardDescription>
            Configure the AI integration for data extraction from invoices, homeowner requests and leads
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  OpenAI API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                  disabled={isLoading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  You can find your API key at{" "}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    platform.openai.com/api-keys
                  </a>
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">
                  Default AI Model
                </label>
                <Select value={model} onValueChange={setModel} disabled={isLoading}>
                  <SelectTrigger id="ai-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Efficient)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o (Powerful)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Configuration...
                  </>
                ) : (
                  'Save OpenAI Configuration'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? 'Hide Logs' : 'Show Logs'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {showLogs && (
        <div className="mt-4">
          <LogViewer initialFunction="update-openai-config" />
        </div>
      )}
    </div>
  );
};

export default OpenAISetup;
