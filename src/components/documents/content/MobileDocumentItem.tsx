
import React from 'react';
import { Document } from '@/types/document-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { formatFileSize } from '@/lib/format-utils';

interface MobileDocumentItemProps {
  document: Document;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onAnalyze?: () => void;
}

const MobileDocumentItem: React.FC<MobileDocumentItemProps> = ({
  document,
  onView,
  onDownload,
  onDelete,
  onAnalyze
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium truncate">{document.name}</h3>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
              {document.file_type?.toUpperCase() || 'Unknown'}
            </span>
          </div>
          
          {document.description && (
            <p className="text-sm text-muted-foreground">{document.description}</p>
          )}
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploaded: {formatDate(document.uploaded_at)}</span>
            <span>{formatFileSize(document.file_size)}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <Button size="sm" variant="outline" onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            {onAnalyze && (
              <Button size="sm" variant="outline" onClick={onAnalyze}>
                <Sparkles className="h-4 w-4 mr-1" /> AI Analysis
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDocumentItem;
