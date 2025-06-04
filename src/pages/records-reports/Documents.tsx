
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Plus } from 'lucide-react';
import { useResponsive } from '@/hooks/use-responsive';
import DocumentContent from '@/components/documents/DocumentContent';
import { useAuth } from '@/contexts/auth';
import { useDocuments } from '@/hooks/documents';
import { useDocumentOperations } from '@/hooks/documents/useDocumentOperations';
import { useDocumentCategories } from '@/hooks/documents/useDocumentCategories';
import { useDocumentColumns } from '@/hooks/documents/useDocumentColumns';
import { toast } from 'sonner';
import { Document } from '@/types/document-types';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';
import DocumentDialogs from '@/components/documents/DocumentDialogs';
import DocumentHeader from '@/components/documents/DocumentHeader';
import DocumentColumnSelector from '@/components/documents/DocumentColumnSelector';
import { DocumentTab } from '@/types/document-types';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Documents = () => {
  const { isMobile } = useResponsive();
  const { currentAssociation } = useAuth();
  const [category, setCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DocumentTab>('documents');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { documents, isLoading, refetch } = useDocuments({
    associationId: currentAssociation?.id,
    category: category,
    enabled: !!currentAssociation?.id
  });
  
  const { categories } = useDocumentCategories({
    associationId: currentAssociation?.id,
    enabled: !!currentAssociation?.id
  });
  
  const { 
    columns, 
    visibleColumnIds, 
    updateVisibleColumns, 
    reorderColumns, 
    resetToDefaults 
  } = useDocumentColumns();
  
  const { uploadDocument, deleteDocument, createCategory } = useDocumentOperations();
  
  const onViewDocument = (doc: Document) => {
    window.open(doc.url, '_blank');
  };
  
  const onDownloadDocument = (doc: Document) => {
    try {
      saveAs(doc.url, doc.name);
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };
  
  const onDeleteDocument = (doc: Document) => {
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      deleteDocument.mutate(doc, {
        onSuccess: () => {
          toast.success('Document deleted successfully');
          refetch();
        },
        onError: (error) => {
          toast.error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }
  };

  const handleUploadDocument = (file: File, category: string, description: string) => {
    if (!currentAssociation?.id) {
      toast.error('Please select an association first');
      return;
    }
    
    setUploadError(null);
    
    uploadDocument.mutate({
      file,
      category: category === 'none' ? undefined : category,
      description,
      associationId: currentAssociation.id
    }, {
      onSuccess: () => {
        setIsUploadDialogOpen(false);
        refetch();
      },
      onError: (error: any) => {
        console.error("Upload error:", error);
        setUploadError(error.message || "Upload failed");
        toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    });
  };

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
  const filteredDocuments = searchTerm 
    ? documents?.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : documents || [];
  
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

          {!currentAssociation && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please select an association to view and manage documents</AlertDescription>
            </Alert>
          )}

          <DocumentContent 
            isLoading={isLoading}
            documents={filteredDocuments}
            onViewDocument={onViewDocument}
            onDownloadDocument={onDownloadDocument}
            onDeleteDocument={onDeleteDocument}
            visibleColumns={visibleColumnIds}
          />

          <DocumentDialogs 
            isUploadDialogOpen={isUploadDialogOpen}
            isCategoryDialogOpen={isCategoryDialogOpen}
            onCloseUploadDialog={() => {
              setIsUploadDialogOpen(false);
              setUploadError(null);
            }}
            onCloseCategoryDialog={() => setIsCategoryDialogOpen(false)}
            onUpload={handleUploadDocument}
            onCreateCategory={handleCreateCategory}
            categories={categories || []}
            isUploading={uploadDocument.isPending}
            isCreatingCategory={createCategory.isPending}
            uploadError={uploadError}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default Documents;
