
import React, { useState } from 'react';
import { FileText, Plus, Upload, Search } from 'lucide-react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import DocumentCategories from '@/components/documents/DocumentCategories';
import DocumentTable from '@/components/documents/DocumentTable';
import { useDocumentCategories } from '@/hooks/documents/useDocumentCategories';
import { useDocuments } from '@/hooks/documents/useDocuments';
import { useDocumentOperations } from '@/hooks/documents/useDocumentOperations';
import DocumentDialogs from '@/components/documents/DocumentDialogs';
import { Document } from '@/types/document-types';
import AssociationSelector from '@/components/associations/AssociationSelector';

const DocumentsPage: React.FC = () => {
  const { currentAssociation } = useAuth();
  const [associationId, setAssociationId] = useState<string>(currentAssociation?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  const { 
    categories, 
    isLoading: categoriesLoading, 
    isCreating,
    createCategory
  } = useDocumentCategories({ 
    associationId,
    enabled: !!associationId
  });
  
  const { 
    documents, 
    isLoading: documentsLoading, 
    isUploading,
    uploadDocument,
    deleteDocument
  } = useDocuments({ 
    associationId,
    category: selectedCategory,
    enabled: !!associationId
  });
  
  const {
    downloadDocument,
    viewDocument
  } = useDocumentOperations();

  const filteredDocuments = documents.filter(
    doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssociationChange = (id: string) => {
    setAssociationId(id);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleUpload = async (file: File, category: string, description: string) => {
    await uploadDocument(file, category, description);
    setIsUploadDialogOpen(false);
  };

  const handleCreateCategory = async (name: string) => {
    await createCategory(name);
    setIsCategoryDialogOpen(false);
  };

  const handleViewDocument = (doc: Document) => {
    viewDocument(doc);
  };

  const handleDownloadDocument = (doc: Document) => {
    downloadDocument(doc);
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      await deleteDocument(doc.id);
    }
  };

  return (
    <PageTemplate 
      title="Documents" 
      icon={<FileText className="h-8 w-8" />}
      description="Manage, upload, and share document files"
    >
      <div className="mb-6">
        <AssociationSelector 
          onAssociationChange={handleAssociationChange}
          initialAssociationId={associationId}
          label="Select Association"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <DocumentCategories
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              onCreateCategory={() => setIsCategoryDialogOpen(true)}
              isLoading={categoriesLoading}
            />
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                disabled={!associationId}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(true)}
                disabled={!associationId}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </div>
          </div>
          
          {!associationId ? (
            <div className="text-center p-12 border rounded-md">
              <p className="text-muted-foreground">Please select an association to view documents</p>
            </div>
          ) : documentsLoading ? (
            <div className="text-center p-12 border rounded-md">
              <p className="text-muted-foreground">Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center p-12 border rounded-md">
              <p className="text-muted-foreground">No documents found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New Document
              </Button>
            </div>
          ) : (
            <Card>
              <DocumentTable
                documents={filteredDocuments}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
                onDelete={handleDeleteDocument}
              />
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
        isUploading={isUploading}
        isCreatingCategory={isCreating}
      />
    </PageTemplate>
  );
};

export default DocumentsPage;
