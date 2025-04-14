
import React, { useState } from 'react';
import { Document, DocumentTab } from '@/types/document-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, History, Eye, Trash2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DocumentWithVersions, VersionHistoryState } from '@/types/document-versioning-types';
import { LoadingSpinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentVersionHistory from './DocumentVersionHistory';
import { useIsMobile } from '@/hooks/use-mobile';

interface DocumentContentProps {
  isLoading: boolean;
  documents: Document[];
  onViewDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
}

const DocumentContent: React.FC<DocumentContentProps> = ({
  isLoading,
  documents,
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument
}) => {
  const [versionHistory, setVersionHistory] = useState<VersionHistoryState>({
    isOpen: false,
    document: undefined
  });
  const isMobile = useIsMobile();
  
  // Function to handle opening version history
  const handleOpenVersionHistory = (doc: Document) => {
    setVersionHistory({
      isOpen: true,
      document: doc as DocumentWithVersions
    });
  };
  
  // Function to handle closing version history
  const handleCloseVersionHistory = () => {
    setVersionHistory({
      isOpen: false,
      document: undefined
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No documents found</p>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge variant="outline">{doc.file_type.toUpperCase()}</Badge>
              </div>
              
              <div className="text-sm">
                {doc.description && <p>{doc.description}</p>}
                <p className="text-xs text-muted-foreground">
                  {(doc.file_size / 1024).toFixed(2)} KB 
                  {doc.current_version ? ` • Version ${doc.current_version}` : ''}
                </p>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDocument(doc)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownloadDocument(doc)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenVersionHistory(doc)}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  History
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDeleteDocument(doc)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{doc.file_type.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>{(doc.file_size / 1024).toFixed(2)} KB</TableCell>
                <TableCell>{format(new Date(doc.uploaded_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {doc.current_version ? (
                    <Badge variant="secondary" className="font-mono">v{doc.current_version}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenVersionHistory(doc)}
                    >
                      <History className="h-4 w-4" />
                      <span className="sr-only">Version History</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDeleteDocument(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <DocumentVersionHistory 
        isOpen={versionHistory.isOpen}
        onClose={handleCloseVersionHistory}
        document={versionHistory.document}
      />
    </>
  );
};

export default DocumentContent;
