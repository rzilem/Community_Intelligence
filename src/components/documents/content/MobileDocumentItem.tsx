
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download, Clock, Trash2 } from 'lucide-react';
import { Document } from '@/types/document-types';

interface MobileDocumentItemProps {
  doc: Document;
  onViewDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
  onOpenVersionHistory: (doc: Document) => void;
}

const MobileDocumentItem: React.FC<MobileDocumentItemProps> = ({
  doc,
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument,
  onOpenVersionHistory
}) => {
  return (
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
          onClick={() => onOpenVersionHistory(doc)}
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
  );
};

export default MobileDocumentItem;
