
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = "*",
  label = "Upload a file",
  className = ""
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="flex items-center w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {selectedFile ? selectedFile.name : label}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      {selectedFile && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </p>
      )}
    </div>
  );
};
