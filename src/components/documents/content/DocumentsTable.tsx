
import React from 'react';
import { Document } from '@/types/document-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Download, History, Eye, Trash2 } from 'lucide-react';

interface DocumentsTableProps {
  documents: Document[];
  onViewDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
  onOpenVersionHistory: (doc: Document) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument,
  onOpenVersionHistory
}) => {
  return (
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
                  onClick={() => onOpenVersionHistory(doc)}
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
  );
};

export default DocumentsTable;
