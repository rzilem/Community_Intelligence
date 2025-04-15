
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

type AiResponse = {
  response: string;
  model: string;
  error?: string;
};

export const useAiAssistant = () => {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentAssociation, user } = useAuth();
  
  const askAi = async (query: string): Promise<AiResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Sending AI query:", query);
      
      const { data, error: functionError } = await supabase.functions.invoke('community-intelligence-ai', {
        body: { 
          query,
          associationId: currentAssociation?.id, 
          userId: user?.id
        }
      });
      
      if (functionError) {
        console.error("Error invoking AI function:", functionError);
        throw new Error(functionError.message);
      }
      
      if (data.error) {
        console.error("AI function returned error:", data.error);
        throw new Error(data.error);
      }
      
      console.log("AI Response:", data);
      
      setResponse(data.response);
      return data;
    } catch (err: any) {
      console.error("Error processing AI query:", err);
      setError(err.message || "Failed to get a response from AI");
      toast.error(`AI error: ${err.message || "Unknown error"}`);
      return { response: "I encountered an error processing your request. Please try again later.", model: "error", error: err.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    askAi,
    response,
    isLoading,
    error,
    clearResponse: () => setResponse(null)
  };
};
