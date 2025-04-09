
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { File } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Document, DocumentTab } from '@/types/document-types';
import DocumentsLoading from '@/components/documents/DocumentsLoading';
import { useDocumentCategories } from '@/hooks/documents/useDocumentCategories';
import { useDocuments } from '@/hooks/documents/useDocuments';
import { useDocumentOperations } from '@/hooks/documents/useDocumentOperations';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentHeader from '@/components/documents/DocumentHeader';
import DocumentContent from '@/components/documents/DocumentContent';
import DocumentDialogs from '@/components/documents/DocumentDialogs';

const Documents = () => {
  // State
  const [activeTab, setActiveTab] = useState<DocumentTab>('documents');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState<boolean>(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();

  // Fetch categories for selected association
  const { 
    categories, 
    isLoading: categoriesLoading,
    refetch: refetchCategories
  } = useDocumentCategories(selectedAssociationId);

  // Fetch documents for selected association and category
  const { 
    documents, 
    isLoading: documentsLoading,
    refetch: refetchDocuments
  } = useDocuments({
    associationId: selectedAssociationId,
    category: selectedCategory,
    enabled: !!selectedAssociationId
  });

  // Document operations
  const { 
    uploadDocument, 
    deleteDocument,
    createCategory
  } = useDocumentOperations();

  // Filtered documents based on search term
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Reset selected category when association changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedAssociationId]);

  // Handlers
  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  const handleUpload = (file: File, category: string, description: string) => {
    if (!selectedAssociationId) return;
    
    uploadDocument.mutate({
      file,
      category: category || undefined,
      description: description || undefined,
      associationId: selectedAssociationId
    }, {
      onSuccess: () => {
        setIsUploadDialogOpen(false);
        refetchDocuments();
      }
    });
  };

  const handleCreateCategory = (name: string) => {
    if (!selectedAssociationId) return;
    
    createCategory.mutate({
      name,
      associationId: selectedAssociationId
    }, {
      onSuccess: () => {
        setIsCategoryDialogOpen(false);
        refetchCategories();
      }
    });
  };

  const handleViewDocument = (doc: Document) => {
    window.open(doc.url, '_blank');
  };

  const handleDownloadDocument = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.setAttribute('download', doc.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDocument = (doc: Document) => {
    deleteDocument.mutate(doc, {
      onSuccess: () => {
        refetchDocuments();
      }
    });
  };

  const isLoading = documentsLoading || categoriesLoading;

  return (
    <PageTemplate
      title="Association Documents"
      icon={<File className="h-8 w-8" />}
      description="Manage documents and templates for your associations"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left sidebar with association selector and categories */}
        <div className="md:col-span-1">
          <DocumentFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onCreateCategory={() => setIsCategoryDialogOpen(true)}
            categoriesLoading={categoriesLoading}
            onAssociationChange={handleAssociationChange}
          />
        </div>

        {/* Main content area with tabs, search, and document table */}
        <div className="md:col-span-3">
          {isLoading && !selectedAssociationId ? (
            <DocumentsLoading />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <DocumentHeader
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onUploadClick={() => setIsUploadDialogOpen(true)}
                    isUploadDisabled={!selectedAssociationId}
                  />

                  <DocumentContent
                    isLoading={documentsLoading}
                    documents={filteredDocuments}
                    onViewDocument={handleViewDocument}
                    onDownloadDocument={handleDownloadDocument}
                    onDeleteDocument={handleDeleteDocument}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <DocumentDialogs
        isUploadDialogOpen={isUploadDialogOpen}
        isCategoryDialogOpen={isCategoryDialogOpen}
        onCloseUploadDialog={() => setIsUploadDialogOpen(false)}
        onCloseCategoryDialog={() => setIsCategoryDialogOpen(false)}
        onUpload={handleUpload}
        onCreateCategory={handleCreateCategory}
        categories={categories}
        isUploading={uploadDocument.isPending}
      />
    </PageTemplate>
  );
};

export default Documents;
