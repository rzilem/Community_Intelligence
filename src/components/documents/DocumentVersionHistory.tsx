import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentVersion } from '@/types/document-versioning-types';
import { useDocumentVersions } from '@/hooks/documents/useDocumentVersions';
import { File, UploadCloud, Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface DocumentVersionHistoryProps {
  documentId: string;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({ documentId }) => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const {
    versions,
    isLoading,
    isUploading,
    addVersion,
    refetchVersions
  } = useDocumentVersions(documentId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitVersion = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      await addVersion(file, notes);
      toast.success('New version uploaded successfully');
      setOpenUploadDialog(false);
      setFile(null);
      setNotes('');
    } catch (error) {
      console.error('Error uploading new version:', error);
      toast.error('Failed to upload new version');
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Version History</CardTitle>
        
        <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload New Version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Version Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Describe the changes in this version..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <Button 
                onClick={handleSubmitVersion} 
                disabled={!file || isUploading}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : 'Upload Version'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No version history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version) => (
              <div key={version.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                <div className="bg-primary/10 p-2 rounded-full">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Version {version.version_number}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 
                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(version.file_size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  {version.notes && (
                    <p className="mt-2 text-sm">{version.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentVersionHistory;
