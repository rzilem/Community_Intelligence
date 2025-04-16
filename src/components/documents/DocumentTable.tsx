
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Eye, Download, Trash2 } from 'lucide-react';
import { Document } from '@/types/document-types';
import { formatBytes } from '@/lib/utils';
import TooltipButton from '@/components/ui/tooltip-button';

interface DocumentTableProps {
  documents: Document[];
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({ 
  documents, 
  onView, 
  onDownload, 
  onDelete 
}) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No documents found.
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
                  </div>
                </TableCell>
                <TableCell>{doc.category || 'general'}</TableCell>
                <TableCell>{formatBytes(doc.file_size)}</TableCell>
                <TableCell>{doc.uploaded_at}</TableCell>
                <TableCell className="text-right space-x-2">
                  <TooltipButton variant="ghost" size="sm" onClick={() => onView(doc)} tooltip="View document">
                    <Eye className="h-4 w-4" />
                  </TooltipButton>
                  <TooltipButton variant="ghost" size="sm" onClick={() => onDownload(doc)} tooltip="Download document">
                    <Download className="h-4 w-4" />
                  </TooltipButton>
                  <TooltipButton variant="ghost" size="sm" onClick={() => onDelete(doc)} tooltip="Delete document">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </TooltipButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentTable;
