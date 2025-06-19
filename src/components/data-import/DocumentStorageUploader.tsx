
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Loader2, RefreshCw } from 'lucide-react';
import { useDocumentStorageImport } from '@/hooks/import-export/useDocumentStorageImport';
import DocumentProgressDisplay from './DocumentProgressDisplay';
import DocumentImportResults from './DocumentImportResults';
import { SmartImportErrorBoundary } from './SmartImportErrorBoundary';

const DocumentStorageUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    isProcessing, 
    progress, 
    result, 
    canResume,
    processDocumentZip, 
    resumeImport,
    cancelImport, 
    resetImport 
  } = useDocumentStorageImport();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    await processDocumentZip(selectedFile);
  };

  const handleResumeImport = async () => {
    if (!selectedFile) return;
    await resumeImport(selectedFile);
  };

  const handleReset = () => {
    resetImport();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Check if there's saved progress on component mount
  React.useEffect(() => {
    const savedProgress = localStorage.getItem('documentImportProgress');
    if (savedProgress && !selectedFile) {
      // Show resume option if there's saved progress but no file selected
    }
  }, [selectedFile]);

  return (
    <SmartImportErrorBoundary fallbackMessage="Error loading document storage uploader">
      <div className="space-y-4">
        {!result && !progress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileArchive className="h-5 w-5" />
                Document Storage Import
              </CardTitle>
              <CardDescription>
                Upload ZIP files containing organized document collections. 
                Maximum file size: 300 MB per document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileArchive className="h-8 w-8 mx-auto text-primary" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Select a ZIP file to upload</p>
                    <p className="text-xs text-muted-foreground">
                      Expected structure: Association → Units → Documents
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? 'Change File' : 'Select ZIP File'}
                </Button>
                
                {selectedFile && (
                  <Button
                    onClick={handleStartImport}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start Import'
                    )}
                  </Button>
                )}
              </div>

              {canResume && !selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">Resume Previous Import</p>
                      <p className="text-sm text-blue-700">
                        You have an incomplete import that can be resumed.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleUploadClick}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Select File to Resume
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {progress && (
          <DocumentProgressDisplay
            progress={progress}
            onCancel={cancelImport}
            onResume={selectedFile ? handleResumeImport : undefined}
            isProcessing={isProcessing}
            canResume={canResume}
          />
        )}

        {result && (
          <DocumentImportResults
            result={result}
            onImportAnother={handleReset}
            onResume={canResume && selectedFile ? handleResumeImport : undefined}
          />
        )}
      </div>
    </SmartImportErrorBoundary>
  );
};

export default DocumentStorageUploader;
