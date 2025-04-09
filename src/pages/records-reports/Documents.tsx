
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { File, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import DocumentCategories from '@/components/documents/DocumentCategories';
import DocumentTable from '@/components/documents/DocumentTable';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import CategoryDialog from '@/components/documents/CategoryDialog';
import DocumentsLoading from '@/components/documents/DocumentsLoading';
import { Document, DocumentTab } from '@/types/document-types';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { useDocumentCategories } from '@/hooks/documents/useDocumentCategories';
import { useDocuments } from '@/hooks/documents/useDocuments';
import { useDocumentOperations } from '@/hooks/documents/useDocumentOperations';
import { useAuth } from '@/contexts/auth';

const Documents = () => {
  const [activeTab, setActiveTab] = useState<DocumentTab>('documents');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState<boolean>(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const { user } = useAuth();

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
          <Card>
            <CardContent className="p-6">
              <AssociationSelector
                onAssociationChange={handleAssociationChange}
              />
              
              <div className="mt-6">
                <DocumentCategories
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onCreateCategory={() => setIsCategoryDialogOpen(true)}
                  isLoading={categoriesLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area with tabs, search, and document table */}
        <div className="md:col-span-3">
          {isLoading && !selectedAssociationId ? (
            <DocumentsLoading />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  {/* Tabs */}
                  <Tabs defaultValue="documents" onValueChange={(value) => setActiveTab(value as DocumentTab)}>
                    <TabsList>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="templates">HTML Templates</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search and upload */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="sm:max-w-sm"
                    />
                    <Button 
                      onClick={() => setIsUploadDialogOpen(true)}
                      disabled={!selectedAssociationId}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Upload
                    </Button>
                  </div>

                  {/* Document table */}
                  {documentsLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <DocumentTable
                      documents={filteredDocuments}
                      onView={handleViewDocument}
                      onDownload={handleDownloadDocument}
                      onDelete={handleDeleteDocument}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upload dialog */}
      <DocumentUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUpload}
        categories={categories}
        isUploading={uploadDocument.isPending}
      />

      {/* Category dialog */}
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        onClose={() => setIsCategoryDialogOpen(false)}
        onSubmit={handleCreateCategory}
      />
    </PageTemplate>
  );
};

export default Documents;
