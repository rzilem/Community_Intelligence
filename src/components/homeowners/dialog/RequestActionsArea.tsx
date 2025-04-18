
import React from 'react';
import { toast } from 'sonner';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import AIResponseArea from './actions/AIResponseArea';
import ActionButtons from './actions/ActionButtons';

interface RequestActionsAreaProps {
  request: HomeownerRequest;
  onSubmit: (values: any) => void;
  isPending: boolean;
}

const RequestActionsArea: React.FC<RequestActionsAreaProps> = ({
  request,
  onSubmit,
  isPending
}) => {
  const [showSpamDialog, setShowSpamDialog] = React.useState(false);
  const [aiResponse, setAiResponse] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateAIResponse = async () => {
    setIsGenerating(true);
    try {
      // Construct a prompt based on the request details
      const prompt = `Please create a professional response to a homeowner request with the following details:
      Title: ${request.title}
      Description: ${request.description?.substring(0, 500) || 'No description provided'}
      Type: ${request.type}
      Priority: ${request.priority}
      
      The response should be courteous, address the homeowner's concerns directly, and provide next steps or a timeline if applicable.`;
      
      // Call the Supabase edge function to generate a response
      const response = await fetch('https://your-project-id.supabase.co/functions/v1/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestData: request, prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }
      
      const data = await response.json();
      setAiResponse(data.generatedText || 'We have received your request and are working to address it promptly. A team member will reach out to you with more information soon.');
      toast.success('AI response generated successfully');
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response');
      // Provide a fallback response
      setAiResponse("Thank you for reaching out. We've received your request and are working to address it promptly. A team member will contact you with more information soon.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpamConfirm = () => {
    toast.success('Request marked as spam and blocked successfully');
    onSubmit({ status: 'spam' });
    setShowSpamDialog(false);
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-md border shadow-sm dark:from-slate-800 dark:to-slate-900/90">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Request Actions</h3>
        
        <ActionButtons 
          onSubmit={onSubmit}
          onSpamClick={() => setShowSpamDialog(true)}
        />

        <AIResponseArea 
          aiResponse={aiResponse}
          setAiResponse={setAiResponse}
          generateAIResponse={generateAIResponse}
          onSubmit={onSubmit}
          isGenerating={isGenerating}
          isPending={isPending}
        />
      </div>

      <AlertDialog open={showSpamDialog} onOpenChange={setShowSpamDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Spam Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this as spam? The sender's details will be blocked from future communications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSpamConfirm} className="bg-destructive text-destructive-foreground">
              Block & Mark as Spam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RequestActionsArea;
