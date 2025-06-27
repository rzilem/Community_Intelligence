
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailResponseDialogProps {
  request: HomeownerRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResponseSent: () => void;
}

const EmailResponseDialog: React.FC<EmailResponseDialogProps> = ({
  request,
  open,
  onOpenChange,
  onResponseSent
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    subject: `Re: ${request.title} - Request #${request.tracking_number || 'N/A'}`,
    message: ''
  });

  const handleGenerateAIResponse = async () => {
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-homeowner-response', {
        body: {
          requestId: request.id,
          requestTitle: request.title,
          requestDescription: request.description,
          requestType: request.type,
          requestPriority: request.priority
        }
      });

      if (error) {
        toast.error('Failed to generate AI response');
        return;
      }

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          message: data.response
        }));
        toast.success('AI response generated successfully');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate AI response');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendResponse = async () => {
    if (!formData.recipientEmail || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-homeowner-response', {
        body: {
          requestId: request.id,
          recipientEmail: formData.recipientEmail,
          subject: formData.subject,
          htmlContent: formatEmailContent(formData.message),
          plainTextContent: formData.message
        }
      });

      if (error) {
        toast.error(`Failed to send response: ${error.message}`);
        return;
      }

      if (data.success) {
        toast.success('Response sent successfully');
        onResponseSent();
        onOpenChange(false);
        // Reset form
        setFormData({
          recipientEmail: '',
          subject: `Re: ${request.title} - Request #${request.tracking_number || 'N/A'}`,
          message: ''
        });
      }
    } catch (error) {
      console.error('Send response error:', error);
      toast.error('Failed to send response');
    } finally {
      setIsSending(false);
    }
  };

  const formatEmailContent = (message: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Response to Your Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f8f9fa; padding: 20px; border-bottom: 2px solid #dee2e6; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }
            .request-info { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Response to Your Request</h2>
          </div>
          <div class="content">
            <div class="request-info">
              <p><strong>Request:</strong> ${request.title}</p>
              <p><strong>Tracking Number:</strong> ${request.tracking_number || 'N/A'}</p>
              <p><strong>Type:</strong> ${request.type}</p>
              <p><strong>Priority:</strong> ${request.priority}</p>
            </div>
            <div style="white-space: pre-wrap;">${message}</div>
          </div>
          <div class="footer">
            <p>This is an automated response from your HOA management system.</p>
            <p>Please do not reply to this email directly.</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Send Email Response
            <Badge variant="outline">{request.type}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Request Summary</h4>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>Title:</strong> {request.title}
            </p>
            <p className="text-sm text-muted-foreground mb-1">
              <strong>Tracking:</strong> {request.tracking_number || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Priority:</strong> {request.priority}
            </p>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="resident@example.com"
                value={formData.recipientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="message">Message</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAIResponse}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-2"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Generate AI Response
                </Button>
              </div>
              <Textarea
                id="message"
                rows={12}
                placeholder="Type your response here..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendResponse}
            disabled={isSending || !formData.recipientEmail || !formData.subject || !formData.message}
            className="flex items-center gap-2"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Response
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailResponseDialog;
