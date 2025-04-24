
import React from 'react';
import { formatDate, formatRelativeTime } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { DocumentVersion, DocumentWithVersions } from '@/types/document-versioning-types';
import { Download, RotateCcw, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onRevertVersion,
}) => {
  const [isReverting, setIsReverting] = React.useState<string | null>(null);

  const handleRevert = async (versionId: string, versionNumber: number) => {
    setIsReverting(versionId);
    try {
      await onRevertVersion(versionId, versionNumber);
    } finally {
      setIsReverting(null);
    }
  };

  if (versionsLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No version history available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      <div className="space-y-2">
        {versions.map((version) => {
          const isCurrent = currentDocument?.current_version === version.version_number;
          return (
            <div
              key={version.id}
              className={cn(
                "border rounded-md p-4",
                isCurrent && "border-primary/50 bg-primary/5"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Version {version.version_number}</h4>
                      {isCurrent && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span title={formatDate(version.created_at)}>
                        {formatRelativeTime(version.created_at)}
                      </span>
                      <span className="mx-1">•</span>
                      <span>{(version.file_size / 1024).toFixed(1)} KB</span>
                    </div>
                    {version.notes && (
                      <p className="text-sm mt-2">{version.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onDownloadVersion(
                        version.url,
                        `${currentDocument?.name || 'document'}_v${version.version_number}`
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevert(version.id, version.version_number)}
                      disabled={isReverting === version.id}
                    >
                      {isReverting === version.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" /> Revert
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VersionsList;
