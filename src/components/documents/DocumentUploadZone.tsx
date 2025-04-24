
import React, { useState } from 'react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DocumentCategory } from '@/types/document-types';
import { Loader2 } from 'lucide-react';

interface DocumentUploadZoneProps {
  onUpload: (file: File, category: string, description: string) => void;
  categories: DocumentCategory[];
  isUploading?: boolean;
  onCancel?: () => void;
}

const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onUpload,
  categories,
  isUploading = false,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile, category, description);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DragDropUpload
        onFileSelect={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
        label="Upload Document"
        className="mb-4"
      />
      
      <div className="space-y-2">
        <Label htmlFor="category">Category (Optional)</Label>
        <Select value={category} onValueChange={setCategory} disabled={isUploading}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description for this document"
          rows={3}
          disabled={isUploading}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            'Upload Document'
          )}
        </Button>
      </div>
    </form>
  );
};

export default DocumentUploadZone;
