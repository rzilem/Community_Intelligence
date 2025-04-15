
import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onSubmit?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelected, 
  selectedFile,
  onSubmit 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
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
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Upload File</h3>
      <div
        className={`border-2 border-dashed rounded-md p-6 text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {selectedFile ? selectedFile.name : 'Drag and drop or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports CSV and Excel (.xlsx) files
            </p>
          </div>
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleBrowseButtonClick}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>
      </div>
      {selectedFile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border rounded-md p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => onFileSelected(null as any)}
            >
              Remove
            </Button>
          </div>
          
          {/* Added submit button when a file is selected */}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onSubmit}
              className="flex items-center gap-2"
            >
              Proceed with Import
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
