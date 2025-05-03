
import React from 'react';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import CategoryDialog from '@/components/documents/CategoryDialog';
import { DocumentCategory } from '@/types/document-types';
import { useToast } from '@/hooks/use-toast';

interface DocumentDialogsProps {
  isUploadDialogOpen: boolean;
  isCategoryDialogOpen: boolean;
  onCloseUploadDialog: () => void;
  onCloseCategoryDialog: () => void;
  onUpload: (file: File, category: string, description: string) => void;
  onCreateCategory: (name: string) => void;
  categories: DocumentCategory[];
  isUploading: boolean;
  isCreatingCategory?: boolean;
  uploadError?: string | null;
}

const DocumentDialogs: React.FC<DocumentDialogsProps> = ({
  isUploadDialogOpen,
  isCategoryDialogOpen,
  onCloseUploadDialog,
  onCloseCategoryDialog,
  onUpload,
  onCreateCategory,
  categories,
  isUploading,
  isCreatingCategory = false,
  uploadError = null
}) => {
  const { toast } = useToast();
  
  // Enhanced upload handler with error notifications
  const handleUpload = (file: File, category: string, description: string) => {
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      toast.error("File size exceeds 20MB limit");
      return;
    }
    
    // Check file type if needed
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'];
    
    if (fileExt && !allowedTypes.includes(fileExt)) {
      toast.error(`File type .${fileExt} is not supported`);
      return;
    }
    
    toast.info(`Uploading ${file.name}...`);
    onUpload(file, category, description);
  };
  
  // Enhanced category creation handler
  const handleCreateCategory = (name: string) => {
    toast.info(`Creating category: ${name}`);
    onCreateCategory(name);
  };

  return (
    <>
      {/* Upload dialog */}
      <DocumentUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={onCloseUploadDialog}
        onUpload={handleUpload}
        categories={categories}
        isUploading={isUploading}
        error={uploadError}
      />

      {/* Category dialog */}
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={onCloseCategoryDialog}
        onSubmit={handleCreateCategory}
        isLoading={isCreatingCategory}
      />
    </>
  );
};

export default DocumentDialogs;
