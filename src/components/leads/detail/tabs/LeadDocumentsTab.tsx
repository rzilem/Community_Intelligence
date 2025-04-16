
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileIcon, DownloadIcon, TrashIcon, PlusIcon, FileTextIcon } from 'lucide-react';

const LeadDocumentsTab: React.FC = () => {
  // This is a placeholder component that would be connected to real data
  const documents = [
    { 
      id: 1, 
      name: 'Proposal_Draft.pdf', 
      size: '2.4 MB',
      type: 'application/pdf',
      uploadedAt: '2025-04-15T14:30:00Z',
      uploadedBy: 'John Doe'
    },
    { 
      id: 2, 
      name: 'Agreement_Template.docx', 
      size: '1.8 MB',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: '2025-04-16T10:15:00Z',
      uploadedBy: 'Emily Smith'
    }
  ];

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileTextIcon className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('docx')) {
      return <FileTextIcon className="h-10 w-10 text-blue-500" />;
    } else {
      return <FileIcon className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Lead Documents</h3>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
        
        {documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center p-4 border rounded-md hover:bg-muted/30 transition-colors">
                <div className="mr-4">
                  {getFileIcon(doc.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{doc.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{doc.size}</span>
                    <span className="mx-2">•</span>
                    <span>Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>By {doc.uploadedBy}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md bg-muted/10">
            <FileIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No documents available for this lead.</p>
            <Button variant="outline" className="mt-4">
              <PlusIcon className="h-4 w-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadDocumentsTab;
