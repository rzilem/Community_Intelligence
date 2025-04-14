
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Download, RotateCcw, Upload } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useDocumentVersions } from '@/hooks/documents/useDocumentVersions';
import { DocumentWithVersions } from '@/types/document-versioning-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "max-w-4xl h-[80vh] flex flex-col",
        isMobile && "w-[95vw] max-w-none p-4"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription>
            {document?.name} ({document?.versions?.length || 0} versions)
          </DialogDescription>
        </DialogHeader>
        
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
          <div className="bg-muted p-4 rounded-md mb-4">
            <h3 className="text-sm font-medium mb-2">Upload New Version</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="version-file">File</Label>
                <Input 
                  id="version-file" 
                  type="file" 
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="version-notes">Version Notes</Label>
                <Textarea 
                  id="version-notes" 
                  placeholder="Describe the changes in this version..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleAddVersion} 
                  disabled={!file || isUploadingVersion}
                >
                  {isUploadingVersion ? 'Uploading...' : 'Save Version'}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1 pr-4">
          {versionsLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading versions...</p>
          ) : versions && versions.length > 0 ? (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div 
                  key={version.id} 
                  className={cn(
                    "border rounded-md p-4",
                    document?.current_version === version.version_number && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Version {version.version_number}</h3>
                        {document?.current_version === version.version_number && (
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
                        onClick={() => handleDownloadVersion(
                          version.url, 
                          `${document?.name}_v${version.version_number}`
                        )}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                      {document?.current_version !== version.version_number && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRevertVersion(version.id, version.version_number)}
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
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No version history available</p>
          )}
        </ScrollArea>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVersionHistory;
