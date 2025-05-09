
import React from 'react';
import { Button } from '@/components/ui/button';
import TooltipButton from '@/components/ui/tooltip-button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { PauseCircle, ArrowUpCircle, MailX, Send, Edit, RefreshCw } from 'lucide-react';

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
      const response = await fetch('https://your-project-id.supabase.co/functions/v1/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestData: request }),
      });
      
      const data = await response.json();
      setAiResponse(data.generatedText);
      toast.success('AI response generated successfully');
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpamConfirm = () => {
    // Here we would implement the spam blocking logic
    toast.success(`Email address blocked successfully`);
    setShowSpamDialog(false);
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-md border shadow-sm dark:from-slate-800 dark:to-slate-900/90">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 mb-4">
          <TooltipButton
            tooltip="Generate AI Response"
            onClick={generateAIResponse}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <RefreshCw className={`${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate AI Response'}
          </TooltipButton>
          
          <TooltipButton
            tooltip="Place request on hold"
            variant="outline"
            onClick={() => onSubmit({ status: 'hold' })}
          >
            <PauseCircle />
            Hold
          </TooltipButton>

          <TooltipButton
            tooltip="Send to board for review"
            variant="outline"
            onClick={() => onSubmit({ status: 'board-review' })}
          >
            <ArrowUpCircle />
            Board Review
          </TooltipButton>

          <TooltipButton
            tooltip="Mark as spam"
            variant="destructive"
            onClick={() => setShowSpamDialog(true)}
          >
            <MailX />
            Mark as Spam
          </TooltipButton>
        </div>

        <Textarea
          className="min-h-[120px] mb-4"
          placeholder="AI-generated response will appear here..."
          value={aiResponse}
          onChange={(e) => setAiResponse(e.target.value)}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setAiResponse('')}>
            <Edit className="mr-2" />
            Edit Manually
          </Button>
          <Button 
            className="bg-blue-500 hover:bg-blue-600" 
            disabled={!aiResponse || isPending}
            onClick={() => onSubmit({ response: aiResponse, status: 'responded' })}
          >
            <Send className="mr-2" />
            {isPending ? 'Sending...' : 'Approve & Send'}
          </Button>
        </div>
      </div>

      <AlertDialog open={showSpamDialog} onOpenChange={setShowSpamDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Spam Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this as spam? The sender's email address will be blocked from future communications.
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
