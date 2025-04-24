
import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  maxSize?: number; // in bytes
  className?: string;
  buttonText?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  accept = "*",
  label = "Drag and drop or click to upload",
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = "",
  buttonText = "Select File"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    
    if (maxSize && file.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    if (accept !== "*") {
      const fileType = file.type;
      const acceptTypes = accept.split(",").map(type => type.trim());
      const isAccepted = acceptTypes.some(type => {
        if (type.startsWith(".")) {
          // Check file extension
          return file.name.endsWith(type);
        } else {
          // Check MIME type
          return fileType === type || (type.endsWith("/*") && fileType.startsWith(type.replace("/*", "/")));
        }
      });

      if (!isAccepted) {
        setError(`File type not accepted. Please upload ${accept} files.`);
        return;
      }
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleClick = () => {
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "cursor-pointer hover:border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="rounded-full bg-primary/10 p-3 mb-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">
            {selectedFile ? selectedFile.name : label}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedFile 
              ? `${(selectedFile.size / 1024).toFixed(1)} KB`
              : `Drop your file here or click to browse`
            }
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {selectedFile && (
        <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-primary" />
            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};
