
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Save, Eye, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HomeownerRequest } from '@/types/homeowner-request-types';

interface EmailResponseDialogProps {
  request: HomeownerRequest | null;
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
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');
  const [aiResponse, setAiResponse] = useState('');

  useEffect(() => {
    if (request && open) {
      setSubject(`Re: ${request.title}`);
      setRecipientEmail(''); // This should be populated from the request data
      setContent('');
      setAiResponse('');
    }
  }, [request, open]);

  const handleGenerateAI = async () => {
    if (!request) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-response', {
        body: { requestData: request }
      });

      if (error) {
        toast.error(`Failed to generate response: ${error.message}`);
        return;
      }

      setAiResponse(data.generatedText);
      setActiveTab('ai-generated');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate AI response');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertAI = () => {
    setContent(aiResponse);
    setActiveTab('compose');
    toast.success('AI response inserted into email');
  };

  const handleSendEmail = async () => {
    if (!request || !recipientEmail || !subject || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-homeowner-response', {
        body: {
          requestId: request.id,
          recipientEmail,
          subject,
          htmlContent: content.replace(/\n/g, '<br>'),
          plainTextContent: content
        }
      });

      if (error) {
        toast.error(`Failed to send email: ${error.message}`);
        return;
      }

      toast.success('Email sent successfully!');
      onResponseSent();
      onOpenChange(false);
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving
    toast.success('Draft saved (feature coming soon)');
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Respond to Request
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="ai-generated">AI Generated</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipient">To</Label>
                      <Input
                        id="recipient"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Email subject"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Type your response here..."
                      className="min-h-[300px]"
                    />
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Original Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{request.type}</Badge>
                          <Badge variant="secondary">{request.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai-generated" className="flex-1 min-h-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <Button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate AI Response
                      </>
                    )}
                  </Button>
                </div>

                {aiResponse && (
                  <div className="flex-1 p-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center justify-between">
                          AI Generated Response
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleInsertAI}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Insert into Email
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[300px]">
                          <div className="whitespace-pre-wrap text-sm">
                            {aiResponse}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="flex-1 min-h-0">
              <div className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Templates</CardTitle>
                    <CardDescription>
                      Pre-written responses for common situations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContent("Thank you for your request. We have received it and will respond within 24-48 hours.")}
                        className="w-full justify-start"
                      >
                        Acknowledgment Template
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContent("We need additional information to process your request. Please provide more details about your concern.")}
                        className="w-full justify-start"
                      >
                        More Information Needed
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContent("Your request has been resolved. Please let us know if you need any further assistance.")}
                        className="w-full justify-start"
                      >
                        Resolution Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailResponseDialog;
