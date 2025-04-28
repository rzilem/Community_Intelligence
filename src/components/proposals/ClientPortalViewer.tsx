
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Proposal } from '@/types/proposal-types';
import { CheckCircle, XCircle, MessageSquare, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import SignatureComponent from './SignatureCanvas';
import { DocumentViewer } from '@/components/invoices/preview/DocumentViewer';

interface ClientPortalViewerProps {
  proposal: Proposal;
  clientName: string;
  companyName: string;
  onAccept: () => void;
  onReject: () => void;
  onComment: (comment: string) => void;
}

const ClientPortalViewer: React.FC<ClientPortalViewerProps> = ({
  proposal,
  clientName,
  companyName,
  onAccept,
  onReject,
  onComment
}) => {
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  const handleAccept = () => {
    if (proposal.signature_required && !signatureData) {
      setShowSignature(true);
    } else {
      onAccept();
    }
  };
  
  const handleSignatureSave = (data: string) => {
    setSignatureData(data);
    setShowSignature(false);
    onAccept();
  };
  
  const handleSignatureCancel = () => {
    setShowSignature(false);
  };
  
  const handleCommentSubmit = () => {
    if (comment.trim()) {
      onComment(comment);
      setComment('');
      setShowCommentForm(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {proposal.name}
          </h1>
          <p className="text-sm text-gray-500">
            Prepared for {clientName} | {companyName}
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle>Proposal Document</CardTitle>
              </CardHeader>
              <div className="h-[70vh]">
                <DocumentViewer 
                  pdfUrl={proposal.attachments && proposal.attachments.length > 0 ? 
                    proposal.attachments[0].url : ''}
                  isPdf={true}
                  htmlContent={proposal.content}
                />
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-xl font-bold">${proposal.amount.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p>{new Date(proposal.created_at).toLocaleDateString()}</p>
                </div>
                
                {proposal.sent_date && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sent</p>
                    <p>{new Date(proposal.sent_date).toLocaleDateString()}</p>
                  </div>
                )}
                
                <Separator />
                
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-500">Decision Required</p>
                  {showSignature ? (
                    <SignatureComponent 
                      onSave={handleSignatureSave}
                      onCancel={handleSignatureCancel}
                    />
                  ) : (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleAccept}
                        variant="default"
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Accept
                      </Button>
                      <Button 
                        onClick={onReject}
                        variant="outline"
                        className="w-full"
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Questions or Comments?</CardTitle>
              </CardHeader>
              <CardContent>
                {showCommentForm ? (
                  <div className="space-y-3">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCommentForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCommentSubmit}>
                        Send
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCommentForm(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Add Comment
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {proposal.attachments && proposal.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {proposal.attachments.map((attachment) => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{attachment.name}</p>
                        <p className="text-sm text-gray-500">
                          {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : ''}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(attachment.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortalViewer;
