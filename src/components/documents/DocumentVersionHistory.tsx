
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDocumentVersions } from '@/hooks/documents/useDocumentVersions';
import { DocumentWithVersions } from '@/types/document-versioning-types';

// Import refactored components
import VersionHistoryHeader from './version-history/VersionHistoryHeader';
import AddVersionForm from './version-history/AddVersionForm';
import VersionsList from './version-history/VersionsList';

interface DocumentVersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  document?: DocumentWithVersions;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [isAddingVersion, setIsAddingVersion] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [notes, setNotes] = React.useState('');
  const isMobile = useIsMobile();
  
  const { 
    versions, 
    versionsLoading, 
    isUploadingVersion, 
    uploadNewVersion,
    revertToVersion,
    refetchVersions
  } = useDocumentVersions(document?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleAddVersion = async () => {
    if (!file || !document) return;
    
    await uploadNewVersion({ 
      file, 
      documentId: document.id, 
      notes 
    });
    
    setFile(null);
    setNotes('');
    setIsAddingVersion(false);
  };

  const handleRevertVersion = (versionId: string, versionNumber: number) => {
    if (!document) return;
    
    revertToVersion({
      documentId: document.id,
      versionId,
      versionNumber
    });
  };

  const handleDownloadVersion = (url: string, fileName: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "max-w-4xl h-[80vh] flex flex-col",
        isMobile && "w-[95vw] max-w-none p-4"
      )}>
        <VersionHistoryHeader document={document} />
        
        <div className="flex justify-end mb-4">
          <Button 
            variant={isAddingVersion ? "secondary" : "default"}
            onClick={() => setIsAddingVersion(!isAddingVersion)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isAddingVersion ? 'Cancel' : 'Add New Version'}
          </Button>
        </div>
        
        {isAddingVersion && (
          <AddVersionForm
            file={file}
            notes={notes}
            onFileChange={handleFileChange}
            onNotesChange={handleNotesChange}
            onSave={handleAddVersion}
            isUploading={isUploadingVersion}
          />
        )}
        
        <VersionsList
          versions={versions}
          currentDocument={document}
          versionsLoading={versionsLoading}
          onDownloadVersion={handleDownloadVersion}
          onRevertVersion={handleRevertVersion}
        />
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVersionHistory;
