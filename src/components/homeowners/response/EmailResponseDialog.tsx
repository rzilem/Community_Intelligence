
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EmailInputField } from './EmailInputField';
import { extractPrimarySenderEmail } from '@/utils/email-utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { Send, ChevronDown, ChevronUp, Sparkles, RefreshCw, Loader2 } from 'lucide-react';

interface EmailResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: HomeownerRequest | null;
  onSuccess?: () => void;
}

interface EmailRecipients {
  to: string[];
  cc: string[];
  bcc: string[];
}

export const EmailResponseDialog: React.FC<EmailResponseDialogProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<EmailRecipients>({
    to: [],
    cc: [],
    bcc: []
  });
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Auto-populate fields when request changes
  useEffect(() => {
    if (request) {
      setSubject(`Re: ${request.title}`);
      
      // Extract sender email from original request
      const senderEmail = extractPrimarySenderEmail(request.html_content);
      if (senderEmail) {
        setRecipients(prev => ({
          ...prev,
          to: [senderEmail]
        }));
      }
    }
  }, [request]);

  const generateAIResponse = async () => {
    if (!request) return;
    
    setIsGeneratingAI(true);
    try {
      console.log('Generating AI response for request:', request.id);
      
      const { data, error } = await supabase.functions.invoke('generate-response', {
        body: { requestData: request },
      });
      
      if (error) {
        console.error('Error invoking generate-response function:', error);
        throw new Error(error.message || 'Failed to generate AI response');
      }
      
      console.log('AI response received:', data);
      
      setMessage(data.generatedText);
      toast.success('AI response generated successfully');
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSend = async () => {
    if (!request || recipients.to.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-homeowner-response', {
        body: {
          requestId: request.id,
          recipientEmail: recipients.to[0], // Keep for backward compatibility
          additionalRecipients: recipients,
          subject: subject,
          htmlContent: message.replace(/\n/g, '<br>'),
          plainTextContent: message
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send email');
      }

      console.log('Email sent successfully:', data);
      toast.success(`Email sent successfully to ${recipients.to.length + recipients.cc.length + recipients.bcc.length} recipients`);
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setSubject('');
      setMessage('');
      setRecipients({ to: [], cc: [], bcc: [] });
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form state
    setSubject('');
    setMessage('');
    setRecipients({ to: [], cc: [], bcc: [] });
    setShowAdvancedOptions(false);
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email Response</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* To Recipients */}
          <EmailInputField
            label="To"
            emails={recipients.to}
            onChange={(emails) => setRecipients(prev => ({ ...prev, to: emails }))}
            placeholder="Enter recipient email addresses..."
            disabled={isSending}
          />

          {/* Advanced Options */}
          <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto justify-start">
                {showAdvancedOptions ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                Advanced Options (CC/BCC)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <EmailInputField
                label="CC"
                emails={recipients.cc}
                onChange={(emails) => setRecipients(prev => ({ ...prev, cc: emails }))}
                placeholder="Enter CC email addresses..."
                disabled={isSending}
              />
              
              <EmailInputField
                label="BCC"
                emails={recipients.bcc}
                onChange={(emails) => setRecipients(prev => ({ ...prev, bcc: emails }))}
                placeholder="Enter BCC email addresses..."
                disabled={isSending}
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              disabled={isSending}
            />
          </div>

          {/* AI Response Generation */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={generateAIResponse}
              disabled={isGeneratingAI || isSending}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Response
                </>
              )}
            </Button>
            
            {message && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMessage('')}
                disabled={isSending}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear & Start Over
              </Button>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your response here or generate one using AI..."
              className="min-h-[200px]"
              disabled={isSending}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={isSending || recipients.to.length === 0 || !subject.trim() || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
