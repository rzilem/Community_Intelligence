
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/hooks/documents/useDocuments';
import { useDocumentOperations } from '@/hooks/documents/useDocumentOperations';
import { formatBytes } from '@/utils/format';

interface PropertyDocumentsProps {
  propertyId: string;
  associationId: string;
  propertyAddress: string;
}

const PropertyDocuments: React.FC<PropertyDocumentsProps> = ({
  propertyId,
  associationId,
  propertyAddress
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  const { documents, isLoading, refetch } = useDocuments({
    propertyId,
    associationId,
    enabled: true
  });

  const { uploadDocument } = useDocumentOperations();

  // Filter documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.document_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique document types for filter
  const documentTypes = [...new Set(documents.map(doc => doc.document_type || 'general'))];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadDocument.mutateAsync({
        file,
        associationId,
        description: `Document for property ${propertyAddress}`
      });
      refetch();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      lease: 'bg-blue-100 text-blue-800',
      insurance: 'bg-green-100 text-green-800',
      maintenance: 'bg-orange-100 text-orange-800',
      inspection: 'bg-purple-100 text-purple-800',
      contract: 'bg-red-100 text-red-800',
      invoice: 'bg-yellow-100 text-yellow-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <CardDescription>Loading property documents...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Property Documents
            </CardTitle>
            <CardDescription>
              Documents for {propertyAddress} ({documents.length} total)
            </CardDescription>
          </div>
          <div className="relative">
            <input
              type="file"
              id="document-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <Button
              onClick={() => document.getElementById('document-upload')?.click()}
              disabled={isUploading}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {documents.length === 0 ? (
              <div>
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents found for this property.</p>
                <p className="text-sm mt-1">Upload documents using the button above.</p>
              </div>
            ) : (
              <p>No documents match your search criteria.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium">{document.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{format


(document.file_size)}</span>
                          <span>Uploaded {formatDate(document.uploaded_at)}</span>
                          {document.folder_path && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {document.folder_path}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {document.description && (
                      <p className="text-sm text-gray-600 mt-2">{document.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getDocumentTypeColor(document.document_type || 'general')}>
                      {document.document_type || 'general'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(document.url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyDocuments;
