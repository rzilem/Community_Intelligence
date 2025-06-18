
import React, { useRef, useState } from 'react';
import { Upload, FileArchive, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ZipFileUploaderProps {
  onZipSelected: (file: File) => void;
  selectedFile: File | null;
  onSmartImport?: () => void;
  isProcessing?: boolean;
}

const ZipFileUploader: React.FC<ZipFileUploaderProps> = ({ 
  onZipSelected, 
  selectedFile,
  onSmartImport,
  isProcessing = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        onZipSelected(file);
      } else {
        toast.error('Please select a ZIP file');
      }
    }
  };

  const handleBrowseButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip')) {
        onZipSelected(file);
      } else {
        toast.error('Please select a ZIP file');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Smart Zip Import
        </CardTitle>
        <CardDescription>
          Upload a ZIP file containing your data files. AI will automatically analyze, map, and import everything for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center transition-all ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-blue-500/10 p-3">
              <FileArchive className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : 'Drag and drop a ZIP file or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports ZIP files with CSV and Excel files inside
              </p>
            </div>
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleBrowseButtonClick}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse ZIP Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".zip"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {selectedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <FileArchive className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Badge variant="secondary" className="text-xs">ZIP</Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => onZipSelected(null as any)}
                disabled={isProcessing}
              >
                Remove
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={onSmartImport}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Smart Import
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">What happens during Smart Import:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• AI extracts and analyzes all files in your ZIP</li>
            <li>• Automatically detects data types (properties, owners, financials, etc.)</li>
            <li>• Smart column mapping with 85%+ accuracy</li>
            <li>• Batch validation and import of all files</li>
            <li>• Complete in minutes instead of hours</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZipFileUploader;
