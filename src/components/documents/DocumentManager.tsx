
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Upload, FolderPlus } from 'lucide-react';
import { useDocuments } from '@/hooks/documents/useDocuments';
import { useDocumentCategories } from '@/hooks/documents/useDocumentCategories';
import { useDocumentOperations } from '@/hooks/documents/useDocumentOperations';
import DocumentDialogs from './DocumentDialogs';
import DocumentTable from './DocumentTable';
import DocumentCategories from './DocumentCategories';

interface DocumentManagerProps {
  associationId: string;
}

export default function DocumentManager({ associationId }: DocumentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');

  const { documents, isLoading, refetch } = useDocuments({ 
    associationId, 
    category: selectedCategory 
  });
  
  const { data: categories = [], isLoading: categoriesLoading } = useDocumentCategories({ 
    associationId 
  });
  
  const { uploadDocument, deleteDocument, createCategory } = useDocumentOperations();

  const filteredDocuments = documents?.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleUpload = async (file: File, category: string, description: string) => {
    try {
      await uploadDocument.mutateAsync({
        file,
        category: category || undefined,
        description,
        associationId
      });
      setIsUploadDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (doc: any) => {
    await deleteDocument.mutateAsync(doc);
    refetch();
  };

  const handleCreateCategory = async (name: string) => {
    try {
      await createCategory.mutateAsync({ name, associationId });
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Category creation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-muted-foreground">
            Organize and manage association documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsCategoryDialogOpen(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Category
          </Button>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge
              variant={selectedCategory === null ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">Loading documents...</div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {!isLoading && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <DocumentTable
              documents={filteredDocuments}
              onDelete={handleDelete}
              onRefresh={refetch}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <DocumentCategories
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onCreateCategory={() => setIsCategoryDialogOpen(true)}
              isLoading={categoriesLoading}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Dialogs */}
      <DocumentDialogs
        isUploadDialogOpen={isUploadDialogOpen}
        isCategoryDialogOpen={isCategoryDialogOpen}
        onCloseUploadDialog={() => setIsUploadDialogOpen(false)}
        onCloseCategoryDialog={() => setIsCategoryDialogOpen(false)}
        onUpload={handleUpload}
        onCreateCategory={handleCreateCategory}
        categories={categories}
        isUploading={uploadDocument.isPending}
        isCreatingCategory={createCategory.isPending}
      />
    </div>
  );
}
