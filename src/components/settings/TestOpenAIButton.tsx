
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import TooltipButton from '@/components/ui/tooltip-button';

const TestOpenAIButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      toast.info("Testing OpenAI connection...");
      
      console.log("Invoking test-openai function");
      const { data, error } = await supabase.functions.invoke('test-openai');
      
      console.log("Test OpenAI response:", data);
      
      if (error) {
        console.error("Error invoking test-openai function:", error);
        throw new Error(error.message || 'Error connecting to OpenAI test service');
      }
      
      if (!data) {
        throw new Error('No response received from OpenAI test function');
      }
      
      if (data.success) {
        toast.success(`Connection successful! Response: "${data.response}" using model ${data.model}`);
      } else {
        console.error("OpenAI connection failed:", data.error, data);
        
        // Provide more detailed error messages for common issues
        let errorMessage = data.error || 'Unknown error';
        
        if (errorMessage.includes('API key')) {
          errorMessage = `API key error: ${errorMessage}. Please check your OpenAI API key configuration.`;
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          errorMessage = `Rate limit exceeded: ${errorMessage}. Please check your OpenAI API usage and limits.`;
        } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
          errorMessage = `Network error: ${errorMessage}. Please check your internet connection and try again.`;
        }
        
        toast.error(`Connection failed: ${errorMessage}`);
      }
      
    } catch (err: any) {
      console.error("Error testing OpenAI connection:", err);
      toast.error(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipButton 
      variant="secondary" 
      size="sm" 
      onClick={handleTestConnection}
      disabled={isLoading}
      tooltip="Test the OpenAI API connection using your current API key"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Testing...
        </>
      ) : (
        'Test Connection'
      )}
    </TooltipButton>
  );
};

export default TestOpenAIButton;
