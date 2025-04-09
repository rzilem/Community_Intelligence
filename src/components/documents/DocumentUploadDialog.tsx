
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { DocumentCategory } from '@/types/document-types';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, category: string, description: string) => void;
  categories: DocumentCategory[];
  isUploading?: boolean;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  isOpen,
  onClose,
  onUpload,
  categories,
  isUploading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    onUpload(selectedFile, category, description);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCategory('');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isUploading && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                disabled={isUploading}
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={category} onValueChange={setCategory} disabled={isUploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
