
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
        toast.error(`Connection failed: ${data.error || 'Unknown error'}`);
      }
      
    } catch (err) {
      console.error("Error testing OpenAI connection:", err);
      toast.error(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="secondary" 
      size="sm" 
      onClick={handleTestConnection}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Testing...
        </>
      ) : (
        'Test Connection'
      )}
    </Button>
  );
};

export default TestOpenAIButton;
