
import React from 'react';
import { Document } from '@/types/document-types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Eye, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/format-utils';
import { formatDate } from '@/lib/date-utils';
import { useResponsive } from '@/hooks/use-responsive';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentContentProps {
  documents: Document[];
  isLoading: boolean;
  onViewDocument: (doc: Document) => void;
  onDownloadDocument: (doc: Document) => void;
  onDeleteDocument: (doc: Document) => void;
  visibleColumns?: string[];
}

const DocumentContent: React.FC<DocumentContentProps> = ({ 
  documents, 
  isLoading, 
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument,
  visibleColumns = ['name', 'category', 'created_at', 'description', 'file_size']
}) => {
  const { isMobile } = useResponsive();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-muted-foreground">Upload documents to see them here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-2">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes('name') && <TableHead>Name</TableHead>}
                {visibleColumns.includes('category') && <TableHead>Category</TableHead>}
                {visibleColumns.includes('created_at') && <TableHead>Upload Date</TableHead>}
                {visibleColumns.includes('description') && <TableHead>Description</TableHead>}
                {visibleColumns.includes('file_size') && <TableHead>Size</TableHead>}
                {visibleColumns.includes('file_type') && <TableHead>Type</TableHead>}
                {visibleColumns.includes('uploaded_by') && <TableHead>Uploaded By</TableHead>}
                {visibleColumns.includes('last_accessed') && <TableHead>Last Accessed</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  {visibleColumns.includes('name') && (
                    <TableCell>
                      <div className="font-medium hover:underline hover:cursor-pointer" onClick={() => onViewDocument(doc)}>
                        {doc.name}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('category') && (
                    <TableCell>{doc.category || 'Uncategorized'}</TableCell>
                  )}
                  {visibleColumns.includes('created_at') && (
                    <TableCell>{formatDate(doc.created_at)}</TableCell>
                  )}
                  {visibleColumns.includes('description') && (
                    <TableCell className="max-w-xs truncate">
                      {doc.description || '-'}
                    </TableCell>
                  )}
                  {visibleColumns.includes('file_size') && (
                    <TableCell>{formatFileSize(doc.size || 0)}</TableCell>
                  )}
                  {visibleColumns.includes('file_type') && (
                    <TableCell>{doc.type || '-'}</TableCell>
                  )}
                  {visibleColumns.includes('uploaded_by') && (
                    <TableCell>{doc.uploaded_by || '-'}</TableCell>
                  )}
                  {visibleColumns.includes('last_accessed') && (
                    <TableCell>{doc.last_accessed ? formatDate(doc.last_accessed) : '-'}</TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => onViewDocument(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDownloadDocument(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onDeleteDocument(doc)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentContent;
