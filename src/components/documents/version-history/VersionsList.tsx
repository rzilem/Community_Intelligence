
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentVersion, DocumentWithVersions } from '@/types/document-versioning-types';
import VersionItem from './VersionItem';

interface VersionsListProps {
  versions: DocumentVersion[];
  currentDocument?: DocumentWithVersions;
  versionsLoading: boolean;
  onDownloadVersion: (url: string, fileName: string) => void;
  onRevertVersion: (versionId: string, versionNumber: number) => void;
}

const VersionsList: React.FC<VersionsListProps> = ({
  versions,
  currentDocument,
  versionsLoading,
  onDownloadVersion,
  onRevertVersion
}) => {
  return (
    <ScrollArea className="flex-1 pr-4">
      {versionsLoading ? (
        <p className="text-center text-muted-foreground py-8">Loading versions...</p>
      ) : versions && versions.length > 0 ? (
        <div className="space-y-4">
          {versions.map((version) => (
            <VersionItem 
              key={version.id} 
              version={version}
              isCurrentVersion={currentDocument?.current_version === version.version_number}
              onDownload={() => onDownloadVersion(
                version.url, 
                `${currentDocument?.name}_v${version.version_number}`
              )}
              onRevert={() => onRevertVersion(version.id, version.version_number)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No version history available</p>
      )}
    </ScrollArea>
  );
};

export default VersionsList;
