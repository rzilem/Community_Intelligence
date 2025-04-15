
import React from 'react';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import CategoryDialog from '@/components/documents/CategoryDialog';
import { DocumentCategory } from '@/types/document-types';

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
  isCreatingCategory = false
}) => {
  return (
    <>
      {/* Upload dialog */}
      <DocumentUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={onCloseUploadDialog}
        onUpload={onUpload}
        categories={categories}
        isUploading={isUploading}
      />

      {/* Category dialog */}
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={onCloseCategoryDialog}
        onSubmit={onCreateCategory}
        isLoading={isCreatingCategory}
      />
    </>
  );
};

export default DocumentDialogs;
