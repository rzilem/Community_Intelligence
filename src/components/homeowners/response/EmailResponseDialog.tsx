
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmailInputField } from './EmailInputField';
import { extractPrimarySenderEmail, validateEmail } from '@/utils/email-utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EmailResponseDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResponseSent?: () => void;
}

const EmailResponseDialog: React.FC<EmailResponseDialogProps> = ({
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
  const [isSending, setIsSending] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-populate fields when request changes
  useEffect(() => {
    if (request && open) {
      // Extract original sender email
      const originalSender = extractPrimarySenderEmail(request.html_content);
      if (originalSender) {
        setToEmails([originalSender]);
      } else {
        setToEmails([]);
      }

      // Set subject with "Re:" prefix
      const baseSubject = request.title || 'Request Response';
      setSubject(baseSubject.startsWith('Re:') ? baseSubject : `Re: ${baseSubject}`);

      // Clear other fields
      setCcEmails([]);
      setBccEmails([]);
      setMessage('');
      setShowAdvanced(false);
    }
  }, [request, open]);

  const handleSendResponse = async () => {
    if (!request) return;

    // Validate that we have at least one recipient
    if (toEmails.length === 0) {
      toast.error('Please add at least one recipient email address');
      return;
    }

    // Validate all email addresses
    const allEmails = [...toEmails, ...ccEmails, ...bccEmails];
    const invalidEmails = allEmails.filter(email => !validateEmail(email));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-homeowner-response', {
        body: {
          requestId: request.id,
          recipientEmail: toEmails[0], // Primary recipient for backward compatibility
          additionalRecipients: {
            to: toEmails,
            cc: ccEmails,
            bcc: bccEmails
          },
          subject: subject.trim(),
          htmlContent: `<p>${message.replace(/\n/g, '</p><p>')}</p>`,
          plainTextContent: message.trim()
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Response sent successfully!');
      onOpenChange(false);
      onResponseSent?.();
      
      // Reset form
      setToEmails([]);
      setCcEmails([]);
      setBccEmails([]);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const originalSender = request ? extractPrimarySenderEmail(request.html_content) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email Response</DialogTitle>
          {request && (
            <p className="text-sm text-gray-600">
              Responding to: {request.title}
              {originalSender && (
                <span className="block text-xs text-blue-600 mt-1">
                  Original sender: {originalSender}
                </span>
              )}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* To field */}
          <EmailInputField
            label="To"
            emails={toEmails}
            onChange={setToEmails}
            placeholder="Enter recipient email addresses..."
            disabled={isSending}
          />

          {/* Advanced options (CC/BCC) */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showAdvanced ? 'Hide' : 'Show'} CC/BCC
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 mt-2">
              <EmailInputField
                label="CC"
                emails={ccEmails}
                onChange={setCcEmails}
                placeholder="Enter CC email addresses..."
                disabled={isSending}
              />
              
              <EmailInputField
                label="BCC"
                emails={bccEmails}
                onChange={setBccEmails}
                placeholder="Enter BCC email addresses..."
                disabled={isSending}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              disabled={isSending}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your response message..."
              rows={8}
              disabled={isSending}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendResponse}
              disabled={isSending || toEmails.length === 0}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? 'Sending...' : 'Send Response'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailResponseDialog;
