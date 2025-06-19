
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/hooks/documents/useDocuments';
import { useDocumentOperations } from '@/hooks/documents/useDocumentOperations';
import { formatBytes, formatDate } from '@/utils/format';

interface AssociationDocumentsProps {
  associationId: string;
  associationName: string;
}

const AssociationDocuments: React.FC<AssociationDocumentsProps> = ({
  associationId,
  associationName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  // Get documents that belong to the association but not to any specific property
  const { documents, isLoading, refetch } = useDocuments({
    associationId,
    enabled: true
  });

  const { uploadDocument } = useDocumentOperations();

  // Filter to only show association-level documents (no property_id)
  const associationDocuments = documents.filter(doc => !doc.property_id);

  // Filter documents based on search and category
  const filteredDocuments = associationDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.document_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique document types for filter
  const documentTypes = [...new Set(associationDocuments.map(doc => doc.document_type || 'general'))];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadDocument.mutateAsync({
        file,
        associationId,
        description: `Association document for ${associationName}`
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
      governance: 'bg-blue-100 text-blue-800',
      financial: 'bg-green-100 text-green-800',
      insurance: 'bg-purple-100 text-purple-800',
      contract: 'bg-red-100 text-red-800',
      legal: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Association Documents
          </CardTitle>
          <CardDescription>Loading association documents...</CardDescription>
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
              Association Documents
            </CardTitle>
            <CardDescription>
              Documents for {associationName} ({associationDocuments.length} total)
            </CardDescription>
          </div>
          <div className="relative">
            <input
              type="file"
              id="association-document-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <Button
              onClick={() => document.getElementById('association-document-upload')?.click()}
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
            {associationDocuments.length === 0 ? (
              <div>
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents found for this association.</p>
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
                          <span>{formatBytes(document.file_size)}</span>
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

export default AssociationDocuments;
