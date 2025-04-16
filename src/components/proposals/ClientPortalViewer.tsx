
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Proposal } from '@/types/proposal-types';
import { 
  FileText, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Pencil, 
  Send, 
  MessageSquare, 
  Check 
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ClientPortalViewerProps {
  proposal: Proposal;
  clientName: string;
  companyName?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onComment?: (comment: string) => void;
}

const ClientPortalViewer: React.FC<ClientPortalViewerProps> = ({
  proposal,
  clientName,
  companyName,
  onAccept,
  onReject,
  onComment
}) => {
  const [comment, setComment] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState('');
  const [activeTab, setActiveTab] = useState('proposal');
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolled = target.scrollTop;
    const maxHeight = target.scrollHeight - target.clientHeight;
    const progress = (scrolled / maxHeight) * 100;
    setScrollProgress(progress);
  };
  
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignature(e.target.value);
  };
  
  const handleSendComment = () => {
    if (!comment.trim()) return;
    
    if (onComment) {
      onComment(comment);
    }
    setComment('');
  };
  
  const handleAccept = () => {
    if (proposal.signature_required && !signature) {
      setShowSignature(true);
      return;
    }
    
    if (onAccept) {
      onAccept();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{proposal.name}</h1>
            <p className="text-muted-foreground">Prepared for {clientName} {companyName && `at ${companyName}`}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Secure Portal
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>
      
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100">
        <div 
          className="h-full bg-blue-500 transition-all" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="proposal">
                  <FileText className="h-4 w-4 mr-2" />
                  Proposal
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Pencil className="h-4 w-4 mr-2" />
                  Attachments
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent 
              value="proposal" 
              className="flex-1 overflow-hidden px-6 pt-4 pb-6"
            >
              <Card className="flex flex-col h-full">
                <ScrollArea className="flex-1" onScroll={handleScroll}>
                  <div 
                    className="p-8"
                    dangerouslySetInnerHTML={{ __html: proposal.content }}
                  />
                </ScrollArea>
              </Card>
            </TabsContent>
            
            <TabsContent 
              value="attachments" 
              className="flex-1 overflow-auto px-6 pt-4 pb-6"
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                  <CardDescription>
                    Documents and files related to this proposal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {proposal.attachments && proposal.attachments.length > 0 ? (
                    <div className="space-y-4">
                      {proposal.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <div className="mr-3">
                              {attachment.type === 'image' && <img src={attachment.url} alt={attachment.name} className="w-12 h-12 object-cover rounded" />}
                              {attachment.type === 'pdf' && <FileText className="h-12 w-12 text-red-500" />}
                              {attachment.type === 'document' && <FileText className="h-12 w-12 text-blue-500" />}
                              {attachment.type === 'video' && <FileText className="h-12 w-12 text-purple-500" />}
                            </div>
                            <div>
                              <p className="font-medium">{attachment.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(attachment.size && attachment.size > 1024 * 1024) 
                                  ? `${(attachment.size / (1024 * 1024)).toFixed(1)} MB` 
                                  : (attachment.size ? `${(attachment.size / 1024).toFixed(0)} KB` : 'Unknown size')}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No attachments added to this proposal</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Action footer */}
          <div className="bg-white border-t p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Take action on this proposal
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onReject}>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button onClick={handleAccept}>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Accept Proposal
                </Button>
              </div>
            </div>
            
            {showSignature && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium mb-2">Please sign to accept this proposal</h3>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={signature} 
                    onChange={handleSignatureChange} 
                    placeholder="Type your full name to sign" 
                    className="w-full p-2 border rounded-md"
                  />
                  <Button 
                    onClick={onAccept} 
                    disabled={!signature}
                    className="w-full"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Sign & Accept
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-80 border-l bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-medium">Comments & Questions</h2>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Sample comments - in a real app these would come from an API */}
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">Support Team</span>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-sm">
                  Thank you for reviewing our proposal. Please let us know if you have any questions!
                </p>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t mt-auto">
            <Textarea 
              placeholder="Add a comment or question..." 
              className="mb-2 resize-none"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button 
              className="w-full" 
              onClick={handleSendComment}
              disabled={!comment.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalViewer;
