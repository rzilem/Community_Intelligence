
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, History, Download, RotateCcw } from 'lucide-react';
import { useDocumentVersions } from '@/hooks/documents/useDocumentVersions';
import { Document } from '@/types/document-types';
import { formatDistanceToNow } from 'date-fns';

interface DocumentVersionManagerProps {
  document: Document;
  onClose: () => void;
}

export default function DocumentVersionManager({ document, onClose }: DocumentVersionManagerProps) {
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [versionNotes, setVersionNotes] = useState('');

  const {
    versions,
    versionsLoading,
    uploadNewVersion,
    revertToVersion,
    refetchVersions
  } = useDocumentVersions(document.id);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewVersionFile(file);
    }
  };

  const handleUploadVersion = async () => {
    if (!newVersionFile) return;

    setIsUploadingVersion(true);
    try {
      await uploadNewVersion(newVersionFile, document.id, versionNotes);
      setNewVersionFile(null);
      setVersionNotes('');
      refetchVersions();
    } catch (error) {
      console.error('Failed to upload version:', error);
    } finally {
      setIsUploadingVersion(false);
    }
  };

  const handleRevertToVersion = async (versionId: string, versionNumber: number) => {
    try {
      await revertToVersion(document.id, versionId, versionNumber);
      refetchVersions();
    } catch (error) {
      console.error('Failed to revert to version:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version History</h3>
          <p className="text-sm text-muted-foreground">{document.name}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Upload New Version */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Version
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="version-file">Select File</Label>
            <Input
              id="version-file"
              type="file"
              onChange={handleFileSelect}
              accept={`.${document.file_type}`}
            />
          </div>
          
          <div>
            <Label htmlFor="version-notes">Version Notes</Label>
            <Textarea
              id="version-notes"
              placeholder="Describe the changes in this version..."
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
            />
          </div>

          <Button
            onClick={handleUploadVersion}
            disabled={!newVersionFile || isUploadingVersion}
            className="w-full"
          >
            {isUploadingVersion ? 'Uploading...' : 'Upload New Version'}
          </Button>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versionsLoading ? (
            <div className="text-center py-4">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No versions found
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={version.version_number === document.current_version ? "default" : "secondary"}>
                        Version {version.version_number}
                      </Badge>
                      {version.version_number === document.current_version && (
                        <Badge variant="outline">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {version.notes || `Version ${version.version_number}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(version.file_size)} • 
                      {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(version.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {version.version_number !== document.current_version && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToVersion(version.id, version.version_number)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
