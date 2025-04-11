
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FileText, Search, Link, Link2, ExternalLink } from 'lucide-react';
import { Document } from '@/types/document-types';
import { ResaleDocumentLink } from '@/types/resale-types';
import { Input } from '@/components/ui/input';
import { formatBytes } from '@/lib/utils';

interface DocumentLinkingTableProps {
  documents: Document[];
  linkedDocuments: ResaleDocumentLink[];
  isLoading?: boolean;
  onLinkDocument: (documentId: string, isIncluded: boolean) => void;
  onViewDocument: (document: Document) => void;
}

const DocumentLinkingTable: React.FC<DocumentLinkingTableProps> = ({
  documents,
  linkedDocuments,
  isLoading = false,
  onLinkDocument,
  onViewDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => {
    return (
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Check if a document is already linked
  const isDocumentLinked = (documentId: string) => {
    return linkedDocuments.some(link => link.document_id === documentId && link.is_included);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Include</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className={isDocumentLinked(doc.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={isDocumentLinked(doc.id)}
                      onCheckedChange={(checked) => onLinkDocument(doc.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.name}
                        {isDocumentLinked(doc.id) && <Link2 className="h-3 w-3 text-primary" />}
                      </p>
                      {doc.description && <p className="text-sm text-muted-foreground">{doc.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>{doc.category || 'general'}</TableCell>
                  <TableCell>{formatBytes(doc.file_size)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onViewDocument(doc)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DocumentLinkingTable;
