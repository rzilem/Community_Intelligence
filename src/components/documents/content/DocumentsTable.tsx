
import React from 'react';
import { Document } from '@/types/document-types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Download, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { formatFileSize } from '@/lib/format-utils';

interface DocumentsTableProps {
  documents: Document[];
  visibleColumns: string[];
  onViewDocument: (document: Document) => void;
  onDownloadDocument: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
  onAnalyzeDocument?: (document: Document) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  visibleColumns,
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument,
  onAnalyzeDocument
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.includes('name') && <TableHead>Name</TableHead>}
            {visibleColumns.includes('category') && <TableHead>Category</TableHead>}
            {visibleColumns.includes('description') && <TableHead>Description</TableHead>}
            {visibleColumns.includes('uploaded_at') && <TableHead>Uploaded</TableHead>}
            {visibleColumns.includes('file_type') && <TableHead>Type</TableHead>}
            {visibleColumns.includes('file_size') && <TableHead>Size</TableHead>}
            {visibleColumns.includes('uploaded_by') && <TableHead>Uploaded By</TableHead>}
            {visibleColumns.includes('last_accessed') && <TableHead>Last Accessed</TableHead>}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map(doc => (
            <TableRow key={doc.id}>
              {visibleColumns.includes('name') && (
                <TableCell className="font-medium">{doc.name}</TableCell>
              )}
              {visibleColumns.includes('category') && (
                <TableCell>{doc.category || 'Uncategorized'}</TableCell>
              )}
              {visibleColumns.includes('description') && (
                <TableCell>{doc.description || 'No description'}</TableCell>
              )}
              {visibleColumns.includes('uploaded_at') && (
                <TableCell>{formatDate(doc.uploaded_at)}</TableCell>
              )}
              {visibleColumns.includes('file_type') && (
                <TableCell>{doc.file_type?.toUpperCase() || 'Unknown'}</TableCell>
              )}
              {visibleColumns.includes('file_size') && (
                <TableCell>{formatFileSize(doc.file_size)}</TableCell>
              )}
              {visibleColumns.includes('uploaded_by') && (
                <TableCell>{doc.uploaded_by || 'Unknown'}</TableCell>
              )}
              {visibleColumns.includes('last_accessed') && (
                <TableCell>{doc.last_accessed ? formatDate(doc.last_accessed) : 'Never'}</TableCell>
              )}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDocument(doc)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownloadDocument(doc)}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </DropdownMenuItem>
                    {onAnalyzeDocument && (
                      <DropdownMenuItem onClick={() => onAnalyzeDocument(doc)}>
                        <Sparkles className="mr-2 h-4 w-4" /> AI Analysis
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive" 
                      onClick={() => onDeleteDocument(doc)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTable;
