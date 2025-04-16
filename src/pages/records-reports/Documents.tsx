
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Plus } from 'lucide-react';
import { useResponsive } from '@/hooks/use-responsive';
import DocumentContent from '@/components/documents/DocumentContent';
import { useAuth } from '@/contexts/auth';
import { useDocuments, useDocumentOperations, useDocumentCategories } from '@/hooks/documents';
import { useDocumentColumns } from '@/hooks/documents/useDocumentColumns';
import { toast } from 'sonner';
import { Document } from '@/types/document-types';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import DocumentDialogs from '@/components/documents/DocumentDialogs';
import DocumentHeader from '@/components/documents/DocumentHeader';
import DocumentColumnSelector from '@/components/documents/DocumentColumnSelector';
import { DocumentTab } from '@/types/document-types';

const Documents = () => {
  const { isMobile } = useResponsive();
  const { currentAssociation } = useAuth();
  const [category, setCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DocumentTab>('documents');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  // Fetch documents and categories
  const { documents, isLoading } = useDocuments({
    associationId: currentAssociation?.id,
    category: category
  });
  
  const { categories } = useDocumentCategories({
    associationId: currentAssociation?.id
  });
  
  // Get document columns configuration
  const { 
    columns, 
    visibleColumnIds, 
    updateVisibleColumns, 
    reorderColumns, 
    resetToDefaults 
  } = useDocumentColumns();
  
  const { uploadDocument, deleteDocument, createCategory } = useDocumentOperations();
  
  // Implement document handling functions
  const onViewDocument = (doc: Document) => {
    window.open(doc.url, '_blank');
  };
  
  const onDownloadDocument = (doc: Document) => {
    // Use file-saver to download the document
    saveAs(doc.url, doc.name);
    toast.success('Document downloaded successfully');
  };
  
  const onDeleteDocument = (doc: Document) => {
    deleteDocument.mutate(doc, {
      onSuccess: () => {
        toast.success('Document deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete document: ${error.message}`);
      }
    });
  };

  // Handle document upload
  const handleUploadDocument = (file: File, category: string, description: string) => {
    if (!currentAssociation?.id) {
      toast.error('Please select an association first');
      return;
    }
    
    uploadDocument.mutate({
      file,
      category: category === 'none' ? undefined : category,
      description,
      associationId: currentAssociation.id
    }, {
      onSuccess: () => {
        setIsUploadDialogOpen(false);
      },
      onError: (error) => {
        toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  // Handle category creation
  const handleCreateCategory = (name: string) => {
    if (!currentAssociation?.id) {
      toast.error('Please select an association first');
      return;
    }
    
    createCategory.mutate({
      name,
      associationId: currentAssociation.id
    }, {
      onSuccess: () => {
        setIsCategoryDialogOpen(false);
        toast.success(`Category "${name}" created successfully`);
      }
    });
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <PageTemplate 
      title="Documents" 
      icon={<FileText className="h-8 w-8" />}
      description="Access and manage community documents and files."
      actions={
        <Button 
          size="sm"
          onClick={() => setIsUploadDialogOpen(true)}
          disabled={!currentAssociation}
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      }
    >
      <div className={isMobile ? 'p-0' : ''}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <DocumentHeader 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUploadClick={() => setIsUploadDialogOpen(true)}
              isUploadDisabled={!currentAssociation}
            />
            
            <DocumentColumnSelector
              columns={columns}
              selectedColumns={visibleColumnIds}
              onChange={updateVisibleColumns}
              onReorder={reorderColumns}
              resetToDefaults={resetToDefaults}
              className="ml-2"
            />
          </div>

          <DocumentContent 
            isLoading={isLoading}
            documents={filteredDocuments}
            onViewDocument={onViewDocument}
            onDownloadDocument={onDownloadDocument}
            onDeleteDocument={onDeleteDocument}
            visibleColumns={visibleColumnIds}
          />

          {/* Document dialogs for upload and category creation */}
          <DocumentDialogs 
            isUploadDialogOpen={isUploadDialogOpen}
            isCategoryDialogOpen={isCategoryDialogOpen}
            onCloseUploadDialog={() => setIsUploadDialogOpen(false)}
            onCloseCategoryDialog={() => setIsCategoryDialogOpen(false)}
            onUpload={handleUploadDocument}
            onCreateCategory={handleCreateCategory}
            categories={categories || []}
            isUploading={uploadDocument.isPending}
            isCreatingCategory={createCategory.isPending}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default Documents;
