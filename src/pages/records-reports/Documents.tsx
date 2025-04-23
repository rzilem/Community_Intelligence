
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { FileText, Plus, Sparkles } from 'lucide-react';
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
import DocumentAnalysisDialog from '@/components/documents/DocumentAnalysisDialog';

const Documents = () => {
  const { isMobile } = useResponsive();
  const { currentAssociation } = useAuth();
  const [category, setCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DocumentTab>('documents');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const { documents, isLoading } = useDocuments({
    associationId: currentAssociation?.id,
    category: category
  });
  
  const { categories } = useDocumentCategories({
    associationId: currentAssociation?.id
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
    saveAs(doc.url, doc.name);
    toast.success('Document downloaded successfully');
  };
  
  const onDeleteDocument = (doc: Document) => {
    deleteDocument.mutate(doc);
  };

  const onAnalyzeDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsAnalysisDialogOpen(true);
  };

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
      }
    });
  };

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
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={() => setIsUploadDialogOpen(true)}
            disabled={!currentAssociation}
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
          <Button 
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              if (filteredDocuments.length === 0) {
                toast.warning("Please upload a document first");
                return;
              }
              toast.info("Select a document to analyze");
            }}
            disabled={!currentAssociation || filteredDocuments.length === 0}
          >
            <Sparkles className="h-4 w-4" />
            AI Analysis
          </Button>
        </div>
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
            onAnalyzeDocument={onAnalyzeDocument}
            visibleColumns={visibleColumnIds}
          />

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
          
          <DocumentAnalysisDialog 
            isOpen={isAnalysisDialogOpen}
            onClose={() => setIsAnalysisDialogOpen(false)}
            document={selectedDocument}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default Documents;
