
import React from 'react';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Clock } from 'lucide-react';
import { DocumentWithVersions } from '@/types/document-versioning-types';

interface VersionHistoryHeaderProps {
  document?: DocumentWithVersions;
}

const VersionHistoryHeader: React.FC<VersionHistoryHeaderProps> = ({ document }) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Version History
      </DialogTitle>
      <DialogDescription>
        {document?.name} ({document?.versions?.length || 0} versions)
      </DialogDescription>
    </DialogHeader>
  );
};

export default VersionHistoryHeader;
