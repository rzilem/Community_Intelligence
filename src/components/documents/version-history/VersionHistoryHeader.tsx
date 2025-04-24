
import React from 'react';
import { DocumentWithVersions } from '@/types/document-versioning-types';
import { FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VersionHistoryHeaderProps {
  document?: DocumentWithVersions;
}

const VersionHistoryHeader: React.FC<VersionHistoryHeaderProps> = ({
  document
}) => {
  if (!document) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-muted/20 rounded-md">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <span>No document selected</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">{document.name}</h2>
          <p className="text-sm text-muted-foreground">
            Version History ({document.current_version || 1})
          </p>
        </div>
      </div>
      <Badge variant="outline" className="px-2 py-1">
        {document.file_type}
      </Badge>
    </div>
  );
};

export default VersionHistoryHeader;
