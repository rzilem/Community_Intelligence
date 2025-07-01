
import React, { useState, useEffect } from 'react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { extractPrimarySenderEmail } from '@/utils/email-utils';
import { EmailInputField } from './EmailInputField';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailResponseDialogProps {
  request: HomeownerRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResponseSent: () => void;
}

export const EmailResponseDialog: React.FC<EmailResponseDialogProps> = ({
  request,
  open,
  onOpenChange,
  onResponseSent
}) => {
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Auto-populate fields when dialog opens
  useEffect(() => {
    if (open && request) {
      // Extract sender email and populate TO field
      const senderEmail = extractPrimarySenderEmail(request.html_content);
      if (senderEmail) {
        setToEmails([senderEmail]);
      }
      
      // Set subject with RE: prefix
      const subjectPrefix = request.title?.startsWith('RE:') ? '' : 'RE: ';
      setSubject(`${subjectPrefix}${request.title || 'Response to your request'}`);
      
      // Clear message when opening
      setMessage('');
    }
  }, [open, request]);

  const handleGenerateAIResponse = async () => {
    if (!request) return;

    setIsGeneratingAI(true);
    try {
      console.log('Generating AI response for request:', request.id);
      
      const { data, error } = await supabase.functions.invoke('generate-response', {
        body: {
          requestId: request.id,
          requestContent: request.description || request.html_content,
          requestType: request.type || 'general'
        }
      });

      if (error) {
        console.error('Error generating AI response:', error);
        toast.error('Failed to generate AI response');
        return;
      }

      if (data?.response) {
        setMessage(data.response);
        toast.success('AI response generated successfully');
      } else {
        toast.error('No response generated');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendResponse = async () => {
    if (!toEmails.length || !message.trim()) {
      toast.error('Please provide recipient email and message content');
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending response for request:', request.id);
      
      const { data, error } = await supabase.functions.invoke('send-homeowner-response', {
        body: {
          requestId: request.id,
          recipientEmail: toEmails[0], // Primary recipient for backward compatibility
          additionalRecipients: {
            to: toEmails,
            cc: ccEmails,
            bcc: bccEmails
          },
          subject: subject,
          htmlContent: `<p>${message.replace(/\n/g, '</p><p>')}</p>`,
          plainTextContent: message
        }
      });

      if (error) {
        console.error('Error sending response:', error);
        toast.error('Failed to send response');
        return;
      }

      toast.success('Response sent successfully');
      onResponseSent();
      onOpenChange(false);
      
      // Reset form
      setToEmails([]);
      setCcEmails([]);
      setBccEmails([]);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email Response</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* TO field */}
          <EmailInputField
            label="To"
            emails={toEmails}
            onChange={setToEmails}
            placeholder="Enter recipient email addresses..."
          />

          {/* Advanced options (CC/BCC) */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                {showAdvanced ? 'Hide' : 'Show'} CC/BCC
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              <EmailInputField
                label="CC"
                emails={ccEmails}
                onChange={setCcEmails}
                placeholder="Enter CC email addresses..."
              />
              <EmailInputField
                label="BCC"
                emails={bccEmails}
                onChange={setBccEmails}
                placeholder="Enter BCC email addresses..."
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Subject field */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Message field with AI generation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAIResponse}
                disabled={isGeneratingAI}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isGeneratingAI ? 'Generating...' : 'Generate AI Response'}
              </Button>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your response here or generate one with AI..."
              rows={8}
              className="resize-vertical"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendResponse}
              disabled={isSending || !toEmails.length || !message.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Sending...' : 'Send Response'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
