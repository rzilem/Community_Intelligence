
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { DocumentVersion } from '@/types/document-versioning-types';
import { cn } from '@/lib/utils';

interface VersionItemProps {
  version: DocumentVersion;
  isCurrentVersion: boolean;
  onDownload: () => void;
  onRevert: () => void;
}

const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isCurrentVersion,
  onDownload,
  onRevert
}) => {
  return (
    <div 
      className={cn(
        "border rounded-md p-4",
        isCurrentVersion && "border-primary bg-primary/5"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Version {version.version_number}</h3>
            {isCurrentVersion && (
              <Badge variant="outline" className="bg-primary/10">Current</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
          {!isCurrentVersion && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRevert}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Revert</span>
            </Button>
          )}
        </div>
      </div>
      
      {version.notes && (
        <div className="mt-2 text-sm">
          <p>{version.notes}</p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        File size: {(version.file_size / 1024).toFixed(2)} KB
      </div>
    </div>
  );
};

export default VersionItem;
