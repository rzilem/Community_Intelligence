
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
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
    } else if (file) {
      alert('Please select a ZIP file containing your document structure.');
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

  // Show results if we have them
  if (result) {
    return (
      <SmartImportErrorBoundary fallbackMessage="Error displaying import results">
        <DocumentImportResults
          result={result}
          onImportAnother={handleReset}
          onResume={canResume && selectedFile ? handleResumeImport : undefined}
        />
      </SmartImportErrorBoundary>
    );
  }

  // Show progress if processing
  if (progress) {
    return (
      <SmartImportErrorBoundary fallbackMessage="Error displaying import progress">
        <DocumentProgressDisplay
          progress={progress}
          onCancel={cancelImport}
          onResume={selectedFile ? handleResumeImport : undefined}
          isProcessing={isProcessing}
          canResume={canResume}
        />
      </SmartImportErrorBoundary>
    );
  }

  // Show file selection interface
  return (
    <SmartImportErrorBoundary fallbackMessage="Error loading document storage uploader">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Document Storage Import
          </CardTitle>
          <CardDescription>
            Upload ZIP files with organized document collections to automatically create properties and import documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expected Structure Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Expected ZIP Structure:</h4>
            <div className="text-sm text-blue-800 space-y-1 font-mono">
              <div>📁 Association Name/</div>
              <div className="ml-4">📁 Unit 101/</div>
              <div className="ml-8">📄 lease.pdf</div>
              <div className="ml-8">📄 inspection_report.pdf</div>
              <div className="ml-4">📁 Unit 102/</div>
              <div className="ml-8">📄 insurance_policy.pdf</div>
              <div className="ml-4">📁 General/</div>
              <div className="ml-8">📄 bylaws.pdf</div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-3">
                <FileArchive className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <p className="font-medium text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Ready to process - this will create properties and import documents</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground">Select a ZIP file to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Maximum file size: 300 MB per document
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
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

          {/* Resume Option */}
          {canResume && !selectedFile && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-amber-900">Resume Previous Import</p>
                  <p className="text-sm text-amber-700">
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

          {/* Feature Highlights */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">What this import will do:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automatically create association if it doesn't exist</li>
              <li>• Create property records for each unit found in the ZIP</li>
              <li>• Import and categorize documents by type</li>
              <li>• Associate documents with their respective properties</li>
              <li>• Provide detailed progress and results reporting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </SmartImportErrorBoundary>
  );
};

export default DocumentStorageUploader;
