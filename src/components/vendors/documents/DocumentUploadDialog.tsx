
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/ui/file-uploader";
import { useToast } from "@/components/ui/use-toast";
import { VendorDocumentFormData } from "@/types/vendor-extended-types";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: VendorDocumentFormData) => void;
  editingDocument?: any;
  isLoading: boolean;
}

const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  editingDocument,
  isLoading
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!selectedFile && !editingDocument) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    const data: VendorDocumentFormData = {
      document_name: formData.get('document_name') as string,
      document_type: formData.get('document_type') as any,
      file_url: selectedFile ? URL.createObjectURL(selectedFile) : editingDocument?.file_url,
      expiry_date: formData.get('expiry_date') as string || undefined,
    };

    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingDocument ? 'Edit Document' : 'Add Document'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="document_name">Document Name</Label>
            <Input 
              id="document_name" 
              name="document_name" 
              defaultValue={editingDocument?.document_name}
              required 
            />
          </div>
          <div>
            <Label htmlFor="document_type">Document Type</Label>
            <Select name="document_type" defaultValue={editingDocument?.document_type || 'other'} required>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="license">License</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
            <Input 
              id="expiry_date" 
              name="expiry_date" 
              type="date"
              defaultValue={editingDocument?.expiry_date}
            />
          </div>
          {!editingDocument && (
            <div>
              <Label>File Upload</Label>
              <FileUploader
                onFileSelect={setSelectedFile}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                label="Select document file"
              />
            </div>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading 
              ? (editingDocument ? 'Updating...' : 'Adding...') 
              : (editingDocument ? 'Update Document' : 'Add Document')
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
