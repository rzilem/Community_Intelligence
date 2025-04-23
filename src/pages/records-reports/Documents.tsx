
import React, { useState, useEffect } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { File, Filter, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import DocumentHeader from '@/components/documents/DocumentHeader';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentContent from '@/components/documents/DocumentContent';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import DocumentColumnSelector from '@/components/documents/DocumentColumnSelector';
import DocumentCategories from '@/components/documents/DocumentCategories';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/types/document-types';
import { useQuery } from '@tanstack/react-query';
import { useResponsive } from '@/hooks/use-responsive';

const Documents = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(['name', 'category', 'uploaded_at', 'file_type', 'file_size']);
  const { isMobile } = useResponsive();
  
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
      
      const { data, error } = await query.order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data as Document[];
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
    const a = document.createElement('a');
    a.href = link;
    a.download = document.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        <DocumentHeader 
          onAssociationChange={(id) => setSelectedAssociationId(id)}
          onSearch={(term) => setSearchTerm(term)}
          onUploadClick={() => setIsUploadOpen(true)}
        />
        
        <Tabs defaultValue="all">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <DocumentColumnSelector
                columns={[
                  { id: 'name', label: 'Name' },
                  { id: 'category', label: 'Category' },
                  { id: 'description', label: 'Description' },
                  { id: 'uploaded_at', label: 'Date Uploaded' },
                  { id: 'file_type', label: 'File Type' },
                  { id: 'file_size', label: 'File Size' },
                  { id: 'uploaded_by', label: 'Uploaded By' },
                  { id: 'last_accessed', label: 'Last Accessed' },
                ]}
                visibleColumns={visibleColumns}
                onColumnsChange={setVisibleColumns}
              />
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <TabsContent value="all" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <DocumentCategories
                    associationId={selectedAssociationId}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                  />
                </div>
                <div className="md:col-span-3">
                  <DocumentContent
                    isLoading={isLoading}
                    documents={filteredDocuments}
                    visibleColumns={visibleColumns}
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
            
            <TabsContent value="shared">
              <div className="p-8 text-center">
                <h3 className="text-lg font-medium">Shared Documents</h3>
                <p className="text-muted-foreground">Shared documents functionality coming soon.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <DocumentUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen}
        associationId={selectedAssociationId || ''} 
      />
    </PageTemplate>
  );
};

export default Documents;
