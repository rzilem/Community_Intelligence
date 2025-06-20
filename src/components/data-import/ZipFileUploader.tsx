
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Loader2 } from 'lucide-react';
import { SmartImportErrorBoundary } from './SmartImportErrorBoundary';

const ZipFileUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSmartImport = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    // TODO: Implement smart import logic
    setTimeout(() => {
      setIsProcessing(false);
      alert('Smart import feature coming soon!');
    }, 2000);
  };

  return (
    <SmartImportErrorBoundary fallbackMessage="Error loading ZIP file uploader">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Smart ZIP Import
          </CardTitle>
          <CardDescription>
            Upload a ZIP file containing multiple data files. AI will analyze and import them automatically.
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
                onClick={handleSmartImport}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Smart Import'
                )}
              </Button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Coming Soon:</strong> AI-powered analysis of mixed data files, automatic format detection, and intelligent import routing.
            </p>
          </div>
        </CardContent>
      </Card>
    </SmartImportErrorBoundary>
  );
};

export default ZipFileUploader;
