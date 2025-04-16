
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Trash } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

// Define document type
interface LeadDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

const LeadDocumentsTab: React.FC<{ leadId: string }> = ({ leadId }) => {
  // Mock documents data
  const [documents, setDocuments] = useState<LeadDocument[]>([
    {
      id: '1',
      name: 'Initial Proposal.pdf',
      size: 1240000,
      type: 'application/pdf',
      uploadedAt: '2025-01-15T10:30:00Z',
      url: '#'
    },
    {
      id: '2',
      name: 'Requirements Document.docx',
      size: 856000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: '2025-01-18T14:45:00Z',
      url: '#'
    },
    {
      id: '3',
      name: 'Meeting Notes.txt',
      size: 12400,
      type: 'text/plain',
      uploadedAt: '2025-01-20T16:15:00Z',
      url: '#'
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const handleUploadDocument = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      // Add a new document
      const newDoc: LeadDocument = {
        id: `${documents.length + 1}`,
        name: `New Document ${documents.length + 1}.pdf`,
        size: 1024000,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        url: '#'
      };
      setDocuments([...documents, newDoc]);
    }, 1500);
  };

  const handleDownloadDocument = (document: LeadDocument) => {
    console.log(`Downloading document: ${document.name}`);
    // In a real app, this would trigger a download
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="text-muted-foreground mb-4">No documents have been uploaded for this lead.</div>
          <Button onClick={handleUploadDocument} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents ({documents.length})</h3>
        <Button onClick={handleUploadDocument} disabled={isUploading}>
          <Plus className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Size</th>
                <th className="text-left p-4">Uploaded</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(document => (
                <tr key={document.id} className="border-b last:border-b-0 hover:bg-muted/50">
                  <td className="p-4">{document.name}</td>
                  <td className="p-4">{formatFileSize(document.size)}</td>
                  <td className="p-4">{formatDate(document.uploadedAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadDocumentsTab;
