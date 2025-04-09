
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { File, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import DocumentCategories from '@/components/documents/DocumentCategories';
import DocumentTable from '@/components/documents/DocumentTable';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import { Document, DocumentCategory, DocumentTab } from '@/types/document-types';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { toast } from 'sonner';

// Mock data for document categories
const mockCategories: DocumentCategory[] = [
  { id: 'financial', name: 'Financial', association_id: '1' },
  { id: 'legal', name: 'Legal', association_id: '1' },
  { id: 'meeting', name: 'Meeting', association_id: '1' },
  { id: 'maintenance', name: 'Maintenance', association_id: '1' },
  { id: 'communication', name: 'Communication', association_id: '1' },
  { id: 'templates', name: 'Templates', association_id: '1' }
];

// Mock data for documents
const mockDocuments: Document[] = [
  {
    id: '1',
    association_id: '1',
    name: 'Condo Management Certificate - Lot 1 (070324).pdf',
    url: '/documents/1',
    file_type: 'pdf',
    file_size: 134860, // 134.86 KB
    category: 'general',
    uploaded_at: '4/2/2025'
  },
  {
    id: '2',
    association_id: '1',
    name: 'Trio at Menchaca Mgmt Cert.pdf',
    url: '/documents/2',
    file_type: 'pdf',
    file_size: 111710, // 111.71 KB
    description: 'asdfasdf',
    category: 'general',
    uploaded_at: '4/1/2025'
  },
  {
    id: '3',
    association_id: '1',
    name: '4th Notice.docx',
    url: '/documents/3',
    file_type: 'docx',
    file_size: 68830, // 68.83 KB
    description: 'Ph yeah',
    category: 'general',
    uploaded_at: '4/1/2025'
  },
  {
    id: '4',
    association_id: '1',
    name: 'IMG_1156.jpg',
    url: '/documents/4',
    file_type: 'jpg',
    file_size: 2500000, // 2.5 MB
    category: 'general',
    uploaded_at: '4/1/2025'
  },
  {
    id: '5',
    association_id: '1',
    name: 'Slider Test - PS Property Management.pdf',
    url: '/documents/5',
    file_type: 'pdf',
    file_size: 3560000, // 3.56 MB
    category: 'governing',
    uploaded_at: '3/30/2025'
  },
  {
    id: '6',
    association_id: '1',
    name: 'rime below.png',
    url: '/documents/6',
    file_type: 'png',
    file_size: 28590, // 28.59 KB
    description: 'test',
    category: 'maintenance',
    uploaded_at: '3/30/2025'
  }
];

const Documents = () => {
  const [activeTab, setActiveTab] = useState<DocumentTab>('documents');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();

  // Filtered documents based on selected category and search term
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesCategory = selectedCategory ? doc.category === selectedCategory : true;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed:', associationId);
    setSelectedAssociationId(associationId);
    // In a real app, we would fetch documents for this association
  };

  const handleUpload = (formData: FormData) => {
    console.log('Uploading file:', formData.get('file'));
    console.log('Category:', formData.get('category'));
    console.log('Description:', formData.get('description'));
    
    // In a real app, we would upload the file to storage and create a database record
    toast.success('Document uploaded successfully');
    setIsUploadDialogOpen(false);
  };

  const handleViewDocument = (doc: Document) => {
    console.log('Viewing document:', doc);
    // In a real app, we would open the document in a new tab or modal
    window.open(doc.url, '_blank');
  };

  const handleDownloadDocument = (doc: Document) => {
    console.log('Downloading document:', doc);
    // In a real app, we would initiate a download
    toast.success(`Downloading ${doc.name}`);
  };

  const handleDeleteDocument = (doc: Document) => {
    console.log('Deleting document:', doc);
    // In a real app, we would delete the document from storage and database
    toast.success(`${doc.name} has been deleted`);
  };

  const handleCreateCategory = () => {
    console.log('Creating new category');
    // In a real app, we would show a dialog to create a new category
    toast.success('This feature is coming soon!');
  };

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
                  categories={mockCategories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onCreateCategory={handleCreateCategory}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area with tabs, search, and document table */}
        <div className="md:col-span-3">
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
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Upload
                  </Button>
                </div>

                {/* Document table */}
                <DocumentTable
                  documents={filteredDocuments}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onDelete={handleDeleteDocument}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload dialog */}
      <DocumentUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUpload}
        categories={mockCategories}
      />
    </PageTemplate>
  );
};

export default Documents;
