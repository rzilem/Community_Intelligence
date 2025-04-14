
import React, { useState } from 'react';
import { FormItem, FormLabel } from '@/components/ui/form';
import { FileUploader } from '@/components/ui/file-uploader';
import { Card } from '@/components/ui/card';

interface BidRequestImageUploadProps {
  onFileSelect: (file: File) => void;
}

const BidRequestImageUpload: React.FC<BidRequestImageUploadProps> = ({ onFileSelect }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    onFileSelect(file);
    
    // Create a preview URL for the selected image
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Clean up the URL when component unmounts
    return () => URL.revokeObjectURL(url);
  };

  return (
    <FormItem>
      <FormLabel>Project Image</FormLabel>
      <Card className="p-4">
        {previewUrl ? (
          <div className="mb-4">
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Image preview will appear here</p>
          </div>
        )}
        
        <FileUploader 
          onFileSelect={handleFileSelect}
          accept="image/*"
        />
      </Card>
    </FormItem>
  );
};

export default BidRequestImageUpload;
