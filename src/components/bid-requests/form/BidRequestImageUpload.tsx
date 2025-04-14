
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X, Image } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface BidRequestImageUploadProps {
  onFileSelect: (file: File | null) => void;
  currentImageUrl?: string;
}

const BidRequestImageUpload: React.FC<BidRequestImageUploadProps> = ({ 
  onFileSelect,
  currentImageUrl
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Project Image</Label>
      
      {previewUrl ? (
        <div className="relative w-full rounded-md overflow-hidden border border-border">
          <img 
            src={previewUrl} 
            alt="Project preview" 
            className="w-full h-48 object-cover"
          />
          <Button 
            type="button" 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-md p-8 text-center">
          <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop an image, or click to browse
          </p>
          <div className="flex justify-center">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidRequestImageUpload;
