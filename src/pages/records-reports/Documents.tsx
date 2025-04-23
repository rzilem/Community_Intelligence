
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { File, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DocumentHeader from '@/components/documents/DocumentHeader';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentContent from '@/components/documents/DocumentContent';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import DocumentColumnSelector from '@/components/documents/DocumentColumnSelector';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory } from '@/types/document-types';
import { useQuery } from '@tanstack/react-query';
import { useResponsive } from '@/hooks/use-responsive';
import { useDocumentCategories } from '@/hooks/documents/useDocumentCategories';
import { useDocumentColumns } from '@/hooks/documents/useDocumentColumns';

const Documents = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'documents' | 'templates'>('documents');
  const { isMobile } = useResponsive();
  
  // Use hook for document columns
  const { 
    columns, 
    visibleColumnIds, 
    updateVisibleColumns 
  } = useDocumentColumns();
  
  // Use hook for document categories
  const { 
    categories, 
    isLoading: categoriesLoading 
  } = useDocumentCategories({ 
    associationId: selectedAssociationId || undefined 
  });
  
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', selectedAssociationId, selectedCategory],
    queryFn: async () => {
      let query = supabase.from('documents').select('*');
      
      if (selectedAssociationId) {
        query = query.eq('association_id', selectedAssociationId);
      }
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      const { data, error } = await query.order('uploaded_date', { ascending: false });
      if (error) throw error;
      
      // Map the database fields to match our Document type
      return (data || []).map(doc => ({
        ...doc,
        uploaded_at: doc.uploaded_date || doc.created_at // Ensure uploaded_at is populated
      })) as Document[];
    }
  });

  const filteredDocuments = documents?.filter(doc => {
    if (!searchTerm) return true;
    return doc.name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleViewDocument = (document: Document) => {
    window.open(document.url, '_blank');
  };

  const handleDownloadDocument = (document: Document) => {
    const link = document.url;
    const a = window.document.createElement('a');
    a.href = link;
    a.download = document.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleDeleteDocument = (document: Document) => {
    // This will be implemented with a proper confirmation dialog
    console.log('Delete document:', document);
  };

  const handleAnalyzeDocument = async (document: Document): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: {
          documentUrl: document.url,
          documentName: document.name,
          documentType: document.file_type,
          associationId: document.association_id
        }
      });
      
      if (error) {
        console.error('Error analyzing document:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error calling analyze-document function:', error);
      return null;
    }
  };

  return (
    <PageTemplate
      title="Documents"
      icon={<File className="h-8 w-8" />}
      description="Manage and organize your association documents."
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'documents' | 'templates')}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <DocumentHeader 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onUploadClick={() => setIsUploadOpen(true)}
              isUploadDisabled={!selectedAssociationId}
            />
            
            <div className="flex items-center space-x-2">
              <DocumentColumnSelector
                columns={columns}
                selectedColumns={visibleColumnIds}
                onChange={updateVisibleColumns}
              />
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <TabsContent value="documents" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <DocumentFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onCreateCategory={() => console.log('Create category')}
                    categoriesLoading={categoriesLoading}
                    onAssociationChange={(id) => setSelectedAssociationId(id)}
                  />
                </div>
                <div className="md:col-span-3">
                  <DocumentContent
                    isLoading={isLoading}
                    documents={filteredDocuments}
                    visibleColumns={visibleColumnIds}
                    onViewDocument={handleViewDocument}
                    onDownloadDocument={handleDownloadDocument}
                    onDeleteDocument={handleDeleteDocument}
                    onAnalyzeDocument={handleAnalyzeDocument}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium">Document Templates</h3>
                <p className="text-muted-foreground">Templates functionality coming soon.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <DocumentUploadDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)}
        onUpload={(file, category, description) => {
          console.log('Upload file:', file, category, description);
          setIsUploadOpen(false);
        }}
        categories={categories}
        isUploading={false}
      />
    </PageTemplate>
  );
};

export default Documents;
