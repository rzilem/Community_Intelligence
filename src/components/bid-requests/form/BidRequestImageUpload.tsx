
import React from 'react';
import { FormItem, FormLabel } from '@/components/ui/form';
import { FileUploader } from '@/components/ui/file-uploader';

interface BidRequestImageUploadProps {
  onFileSelect: (file: File) => void;
}

const BidRequestImageUpload: React.FC<BidRequestImageUploadProps> = ({ onFileSelect }) => {
  return (
    <FormItem>
      <FormLabel>Bid Request Image</FormLabel>
      <FileUploader 
        onFileSelect={onFileSelect}
        accept="image/*"
      />
    </FormItem>
  );
};

export default BidRequestImageUpload;
